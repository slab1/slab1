import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, RefreshCw, Shield, Bell, Globe, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemConfigApi } from "@/api/systemConfig";
import { Skeleton } from "@/components/ui/skeleton";

export function SystemConfig() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => systemConfigApi.getSettings(),
  });

  const [config, setConfig] = useState({
    siteName: "Reservatoo",
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: true,
    supportEmail: "support@reservatoo.com",
    maxUploadSize: 10,
    retentionPeriod: 90,
  });

  useEffect(() => {
    if (settings) {
      const site = settings.site_config || {};
      const notif = settings.notification_config || {};
      const sec = settings.security_config || {};

      setConfig({
        siteName: site.siteName || "Reservatoo",
        maintenanceMode: site.maintenanceMode ?? false,
        allowRegistration: site.allowRegistration ?? true,
        emailNotifications: notif.emailNotifications ?? true,
        smsNotifications: notif.smsNotifications ?? true,
        supportEmail: site.supportEmail || "support@reservatoo.com",
        maxUploadSize: sec.maxUploadSize || 10,
        retentionPeriod: sec.retentionPeriod || 90,
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      setIsSaving(true);
      try {
        const siteConfig = {
          siteName: config.siteName,
          supportEmail: config.supportEmail,
          maintenanceMode: config.maintenanceMode,
          allowRegistration: config.allowRegistration,
        };

        const notificationConfig = {
          emailNotifications: config.emailNotifications,
          smsNotifications: config.smsNotifications,
          pushNotifications: true,
        };

        const securityConfig = {
          maxUploadSize: config.maxUploadSize,
          retentionPeriod: config.retentionPeriod,
          passwordPolicy: settings?.security_config?.passwordPolicy || {
            minLength: 8,
            requireSpecial: true,
            requireNumbers: true
          }
        };

        const results = await Promise.all([
          systemConfigApi.updateSetting('site_config', siteConfig),
          systemConfigApi.updateSetting('notification_config', notificationConfig),
          systemConfigApi.updateSetting('security_config', securityConfig),
        ]);

        if (results.every(r => r === true)) {
          toast.success("System configuration saved successfully");
          queryClient.invalidateQueries({ queryKey: ['system-settings'] });
        } else {
          toast.error("Some settings failed to save");
        }
      } catch (err) {
        toast.error("Failed to save configuration");
      } finally {
        setIsSaving(false);
      }
    }
  });

  const handleSave = () => {
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading system configuration. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Configuration</h2>
          <p className="text-muted-foreground">Manage global platform settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['system-settings'] })}
            disabled={isSaving}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic platform information and operational controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Platform Name</Label>
                  <Input 
                    id="siteName" 
                    value={config.siteName} 
                    onChange={(e) => setConfig({...config, siteName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input 
                    id="supportEmail" 
                    value={config.supportEmail} 
                    onChange={(e) => setConfig({...config, supportEmail: e.target.value})}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Temporarily disable access for non-admin users</p>
                  </div>
                  <Switch 
                    checked={config.maintenanceMode}
                    onCheckedChange={(checked) => setConfig({...config, maintenanceMode: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow New Registrations</Label>
                    <p className="text-sm text-muted-foreground">Enable or disable public user registration</p>
                  </div>
                  <Switch 
                    checked={config.allowRegistration}
                    onCheckedChange={(checked) => setConfig({...config, allowRegistration: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Data
              </CardTitle>
              <CardDescription>Data retention and security policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
                  <Input 
                    id="maxUploadSize" 
                    type="number"
                    value={config.maxUploadSize} 
                    onChange={(e) => setConfig({...config, maxUploadSize: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Data Retention (Days)</Label>
                  <Input 
                    id="retentionPeriod" 
                    type="number"
                    value={config.retentionPeriod} 
                    onChange={(e) => setConfig({...config, retentionPeriod: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Channels
              </CardTitle>
              <CardDescription>Configure system-wide notification delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send transactional emails to users</p>
                  </div>
                  <Switch 
                    checked={config.emailNotifications}
                    onCheckedChange={(checked) => setConfig({...config, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS alerts (requires credits)</p>
                  </div>
                  <Switch 
                    checked={config.smsNotifications}
                    onCheckedChange={(checked) => setConfig({...config, smsNotifications: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
