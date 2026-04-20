import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ChevronRight, Terminal, Code2, Globe, Key, ArrowRight } from "lucide-react";
import { toast } from 'sonner';

const API_BASE = "https://reewcfpjlnufktvahtii.supabase.co/functions/v1/external-api";

const steps = [
  {
    number: 1,
    title: 'Get Your API Key',
    description: 'Generate an API key from the Keys tab to authenticate all requests.',
    action: 'keys',
  },
  {
    number: 2,
    title: 'Make Your First Request',
    description: 'Test the health endpoint to verify your key works.',
  },
  {
    number: 3,
    title: 'Explore Endpoints',
    description: 'Browse the full API reference with interactive docs.',
    action: 'docs',
  },
];

const codeExamples: Record<string, { label: string; icon: React.ElementType; code: string }> = {
  curl: {
    label: 'cURL',
    icon: Terminal,
    code: `curl -X GET "${API_BASE}/v1/health" \\
  -H "X-API-KEY: rt_your_key_here"`,
  },
  javascript: {
    label: 'JavaScript',
    icon: Code2,
    code: `const response = await fetch("${API_BASE}/v1/health", {
  headers: { "X-API-KEY": "rt_your_key_here" }
});
const data = await response.json();
console.log(data);`,
  },
  python: {
    label: 'Python',
    icon: Code2,
    code: `import requests

response = requests.get(
    "${API_BASE}/v1/health",
    headers={"X-API-KEY": "rt_your_key_here"}
)
print(response.json())`,
  },
};

interface QuickStartWizardProps {
  onNavigate: (tab: string) => void;
}

export const QuickStartWizard: React.FC<QuickStartWizardProps> = ({ onNavigate }) => {
  const [selectedLang, setSelectedLang] = useState('curl');
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(codeExamples[selectedLang].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied');
  };

  return (
    <div className="space-y-8">
      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <Card key={step.number} className="relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {step.number}
                </span>
                <CardTitle className="text-base">{step.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
              {step.action && (
                <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto text-primary" onClick={() => onNavigate(step.action!)}>
                  Go to {step.action === 'keys' ? 'API Keys' : 'Docs'}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Code Samples */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>Code Samples</CardTitle>
              <CardDescription>Get started with your preferred language</CardDescription>
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {Object.entries(codeExamples).map(([key, ex]) => (
                <button
                  key={key}
                  onClick={() => setSelectedLang(key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedLang === key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-foreground text-primary-foreground p-5 rounded-xl overflow-x-auto font-mono text-sm leading-relaxed">
              {codeExamples[selectedLang].code}
            </pre>
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-3 right-3 h-8 w-8"
              onClick={copyCode}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Base URL & Auth Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Base URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 bg-muted p-3 rounded-lg font-mono text-xs break-all">
              <span className="flex-1">{API_BASE}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(API_BASE);
                  toast.success('Copied');
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Include your key in the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">X-API-KEY</code> header.
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-xs">
              X-API-KEY: rt_your_secret_key_here
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rate Limits & Quotas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { plan: 'Starter', limit: '100 req/mo', color: 'bg-muted' },
              { plan: 'Premium', limit: '5,000 req/mo', color: 'bg-primary/10' },
              { plan: 'Enterprise', limit: '50,000 req/mo', color: 'bg-accent' },
            ].map((tier) => (
              <div key={tier.plan} className={`p-4 rounded-xl ${tier.color}`}>
                <p className="text-sm font-semibold text-foreground">{tier.plan}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{tier.limit}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
