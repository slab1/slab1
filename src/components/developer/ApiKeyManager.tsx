import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Key, Plus, Trash2, Copy, Check, RefreshCw, ShieldCheck, AlertCircle, Loader2, RotateCcw 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
  is_active: boolean;
  request_count: number;
  monthly_quota: number;
  expires_at: string | null;
  scopes?: string[] | null;
}

export const ApiKeyManager: React.FC = () => {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyQuota, setNewKeyQuota] = useState('1000');
  const [newKeyExpiresIn, setNewKeyExpiresIn] = useState('never');
  const [generatedKey, setGeneratedKey] = useState<{ prefix: string; secret: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const isAdmin = user?.role === 'superadmin' || user?.role === 'system_admin';

  const { data: keys, isLoading } = useQuery({
    queryKey: ['api_keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ApiKey[];
    },
    enabled: !!session,
  });

  const createMutation = useMutation({
    mutationFn: async ({ name, quota, expiresIn }: { name: string; quota?: number; expiresIn: string }) => {
      if (!session) throw new Error('You must be logged in to create API keys');
      let expires_at: string | null = null;
      if (expiresIn !== 'never') {
        const days = parseInt(expiresIn);
        const date = new Date();
        date.setDate(date.getDate() + days);
        expires_at = date.toISOString();
      }
      const { data, error } = await supabase.rpc('create_api_key', {
        p_name: name,
        p_monthly_quota: quota,
        p_expires_at: expires_at || undefined,
      });
      if (error) throw error;
      const result = data[0] as unknown as { api_key: string; key_id: string };
      return { id: result.key_id, prefix: result.key_id.substring(0, 8), secret: result.api_key };
    },
    onSuccess: (data) => {
      setGeneratedKey({ prefix: data.prefix, secret: data.secret });
      setNewKeyName('');
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
      toast.success('API Key generated');
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('api_keys').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
      toast.success('Key revoked');
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('api_keys').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
      toast.success('Key updated');
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(`${generatedKey.prefix}${generatedKey.secret}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied');
    }
  };

  const totalKeys = keys?.length || 0;
  const activeKeys = keys?.filter(k => k.is_active)?.length || 0;
  const totalRequests = keys?.reduce((sum, k) => sum + (k.request_count || 0), 0) || 0;

  // Auth guard - rendered after all hooks
  if (!session) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground opacity-40" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Authentication Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You need to be logged in to create and manage API keys.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Sign In to Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Keys', value: totalKeys, icon: Key },
          { label: 'Active Keys', value: activeKeys, icon: ShieldCheck },
          { label: 'Total Requests', value: totalRequests.toLocaleString(), icon: RefreshCw },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create New API Key
          </CardTitle>
          <CardDescription>Generate a key to authenticate your API requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Key Name</label>
              <Input
                placeholder="e.g., Mobile App, Backend"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Monthly Quota
                {!isAdmin && <span className="ml-1 text-[10px] text-muted-foreground">(Plan Limit)</span>}
              </label>
              <Input
                type="number"
                value={newKeyQuota}
                onChange={(e) => setNewKeyQuota(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Expires In</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={newKeyExpiresIn}
                onChange={(e) => setNewKeyExpiresIn(e.target.value)}
              >
                <option value="never">Never</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="365">1 Year</option>
              </select>
            </div>
          </div>
          <Button
            className="w-full md:w-auto"
            disabled={!newKeyName || createMutation.isPending}
            onClick={() =>
              createMutation.mutate({
                name: newKeyName,
                quota: isAdmin ? parseInt(newKeyQuota) : undefined,
                expiresIn: newKeyExpiresIn,
              })
            }
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Generate Key
          </Button>

          {generatedKey && (
            <Alert className="bg-primary/5 border-primary/20 mt-4">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <AlertTitle>Key Generated — Copy Now!</AlertTitle>
              <AlertDescription className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  This key will <strong>never be shown again</strong>.
                </p>
                <div className="flex items-center gap-2 bg-background p-3 rounded-lg border font-mono text-sm break-all">
                  <span className="flex-1">{generatedKey.prefix}{generatedKey.secret}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setGeneratedKey(null)}>
                  I've saved it
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Key List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>Manage active and inactive keys.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : !keys?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No API keys yet. Create one above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => {
                const usagePercent = key.monthly_quota > 0 ? (key.request_count / key.monthly_quota) * 100 : 0;
                const isExpired = key.expires_at && new Date(key.expires_at) < new Date();

                return (
                  <div
                    key={key.id}
                    className={`p-4 rounded-xl border transition-all ${
                      key.is_active && !isExpired
                        ? 'bg-card border-border hover:border-primary/30'
                        : 'bg-muted/50 border-border opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground truncate">{key.name}</span>
                          <Badge variant={key.is_active && !isExpired ? 'default' : 'secondary'} className="text-[10px]">
                            {isExpired ? 'Expired' : key.is_active ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-mono">{key.key_prefix}•••</span>
                          <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                          {key.last_used_at && (
                            <span>Last used {new Date(key.last_used_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Usage bar */}
                        <div className="w-28">
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                            <span>{key.request_count.toLocaleString()}</span>
                            <span>{key.monthly_quota.toLocaleString()}</span>
                          </div>
                          <Progress
                            value={Math.min(100, usagePercent)}
                            className="h-1.5"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={key.is_active ? 'Disable' : 'Enable'}
                            onClick={() =>
                              toggleMutation.mutate({ id: key.id, is_active: !key.is_active })
                            }
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (window.confirm('Revoke this key permanently?')) {
                                revokeMutation.mutate(key.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
