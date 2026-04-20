import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Code,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from 'react-router-dom';

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

import { usePartnerSubscription } from "@/hooks/use-partner-subscription";
import { useAuth } from "@/hooks/use-auth";

export const DeveloperSettings: React.FC = () => {
  const { user } = useAuth();
  const { subscription: partnerSubscription, loading: subLoading } = usePartnerSubscription();
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyQuota, setNewKeyQuota] = useState('1000');
  const [newKeyExpiresIn, setNewKeyExpiresIn] = useState('never');

  const isAdmin = user?.role === 'superadmin' || user?.role === 'system_admin';
  const hasApiAccess = isAdmin || partnerSubscription.features?.includes('api_access');

  // Set default quota based on subscription if not admin
  useEffect(() => {
    if (!isAdmin && partnerSubscription.planName) {
      const quota = partnerSubscription.planName === 'Enterprise' ? '50000' : 
                   partnerSubscription.planName === 'Premium' ? '5000' : '100';
      setNewKeyQuota(quota);
    }
  }, [partnerSubscription.planName, isAdmin]);

  const [generatedKey, setGeneratedKey] = useState<{prefix: string, secret: string} | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch existing keys
  const { data: keys, isLoading } = useQuery({
    queryKey: ['api_keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ApiKey[];
    }
  });

  // Create key mutation
  const createMutation = useMutation({
    mutationFn: async ({ name, quota, expiresIn }: { name: string, quota?: number, expiresIn: string }) => {
      let expires_at: string | null = null;
      if (expiresIn !== 'never') {
        const days = parseInt(expiresIn);
        const date = new Date();
        date.setDate(date.getDate() + days);
        expires_at = date.toISOString();
      }

    const { data, error } = await supabase.rpc('create_api_key', {
  p_name: name,
  p_monthly_quota: isAdmin ? parseInt(newKeyQuota) : Math.min(parseInt(newKeyQuota), 1000),
  p_expires_at: expires_at || null
});

if (error) {
  console.error('RPC Error:', error);
  throw new Error(`Failed to generate API key: ${error.message}`);
}

if (!data || data.length === 0) {
  throw new Error('No data returned from API key generation');
}

const result = data[0] as { key_id: string; api_key: string };
const apiKeyFull = result.api_key;
const prefix = apiKeyFull.substring(0, 5); // e.g., "rt_xx"
const secret = apiKeyFull.substring(5);   // The rest of the key

      return { 
        id: result.key_id, 
        prefix, 
        secret 
      };
    },
    onSuccess: (data) => {
      setGeneratedKey({ prefix: data.prefix, secret: data.secret });
      setNewKeyName('');
      setNewKeyQuota('1000');
      setNewKeyExpiresIn('never');
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
      toast.success('API Key generated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to generate key: ${error.message}`);
    }
  });

  // Revoke key mutation
  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
      toast.success('API Key revoked');
    },
    onError: (error) => {
      toast.error(`Failed to revoke key: ${error.message}`);
    }
  });

  const handleCopy = () => {
    if (generatedKey) {
      const fullKey = `${generatedKey.prefix}${generatedKey.secret}`;
      navigator.clipboard.writeText(fullKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    }
  };

  if (subLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight">Developer Settings</h2>
          <p className="text-muted-foreground">Manage API keys and integration settings.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/developer" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Developer Portal
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Generate API Key
            </CardTitle>
            <CardDescription>
              Create a new key to access the Reservatoo API from external applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasApiAccess ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upgrade Required</AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <p>Your current plan ({partnerSubscription.planName || 'Free'}) does not include API access.</p>
                  <Button variant="outline" size="sm" className="w-fit" asChild>
                    <Link to="/partnership">View Upgrade Options</Link>
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Key Name</label>
                  <Input 
                    placeholder="Key Name (e.g. Mobile App)" 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
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
                    <label className="text-sm font-medium">Expires In</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="w-full"
                    disabled={!newKeyName || createMutation.isPending}
                    onClick={() => createMutation.mutate({ 
                      name: newKeyName, 
                      quota: isAdmin ? parseInt(newKeyQuota) : undefined, 
                      expiresIn: newKeyExpiresIn 
                    })}
                  >
                  {createMutation.isPending ? 'Generating...' : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate API Key
                    </>
                  )}
                </Button>
              </div>
            )}

            {generatedKey && (
              <Alert className="bg-primary/5 border-primary/20">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <AlertTitle>New API Key Generated</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Copy this key now. For security reasons, it will <strong>never be shown again</strong>.
                  </p>
                  <div className="flex items-center gap-2 bg-background p-2 rounded border font-mono text-sm break-all">
                    <span>{generatedKey.prefix}{generatedKey.secret}</span>
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setGeneratedKey(null)}>
                    I've saved it
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              API Documentation
            </CardTitle>
            <CardDescription>
              Learn how to integrate with our platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href="https://reewcfpjlnufktvahtii.supabase.co/functions/v1/external-api/swagger-ui" target="_blank" rel="noreferrer">
                  Interactive Swagger UI
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href="https://reewcfpjlnufktvahtii.supabase.co/functions/v1/external-api/doc" target="_blank" rel="noreferrer">
                  OpenAPI Specification (JSON)
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="rounded-md bg-muted p-3">
              <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Base URL
              </h4>
              <code className="text-xs break-all">
                https://reewcfpjlnufktvahtii.supabase.co/functions/v1/external-api
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Active keys that can be used to access your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
            </div>
          ) : keys?.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No API keys found. Generate one to get started.
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Usage</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Expires</th>
                    <th className="px-4 py-3">Last Used</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {keys?.map((key) => (
                    <tr key={key.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium">{key.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{key.key_prefix}...</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1 w-24">
                          <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                            <span>{key.request_count}</span>
                            <span>{key.monthly_quota}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                (key.request_count / key.monthly_quota) > 0.9 ? 'bg-destructive' : 
                                (key.request_count / key.monthly_quota) > 0.7 ? 'bg-warning' : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min(100, (key.request_count / key.monthly_quota) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {new Date(key.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {key.expires_at ? (
                          <span className={new Date(key.expires_at) < new Date() ? 'text-destructive font-bold' : ''}>
                            {new Date(key.expires_at).toLocaleDateString()}
                          </span>
                        ) : 'Never'}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
                              revokeMutation.mutate(key.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
