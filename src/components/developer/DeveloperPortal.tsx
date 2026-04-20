import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, BookOpen, BarChart3, Rocket } from "lucide-react";
import { ApiKeyManager } from './ApiKeyManager';
import { ApiDocsPanel } from './ApiDocsPanel';
import { UsageAnalytics } from './UsageAnalytics';
import { QuickStartWizard } from './QuickStartWizard';

const DeveloperPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('quickstart');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative container mx-auto py-12 px-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              API v1.0
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
              Developer Portal
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Build powerful integrations with the Reservatoo API. Manage keys, explore endpoints, 
              and monitor usage — all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="quickstart" className="gap-2">
              <Rocket className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Start</span>
              <span className="sm:hidden">Start</span>
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">API Keys</span>
              <span className="sm:hidden">Keys</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Docs</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart">
            <QuickStartWizard onNavigate={setActiveTab} />
          </TabsContent>

          <TabsContent value="keys">
            <ApiKeyManager />
          </TabsContent>

          <TabsContent value="docs">
            <ApiDocsPanel />
          </TabsContent>

          <TabsContent value="analytics">
            <UsageAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeveloperPortal;
