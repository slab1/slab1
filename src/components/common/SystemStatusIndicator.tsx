import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SystemStatus = 'operational' | 'degraded' | 'outage';

export const SystemStatusIndicator = () => {
  const [status, setStatus] = useState<SystemStatus>('operational');
  
  // Simulate health check
  useEffect(() => {
    const checkHealth = () => {
      // In a real app, this would fetch from a health check endpoint
      const random = Math.random();
      if (random > 0.98) setStatus('outage');
      else if (random > 0.95) setStatus('degraded');
      else setStatus('operational');
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (s: SystemStatus) => {
    switch (s) {
      case 'operational':
        return { color: "bg-green-500", label: "All Systems Operational", icon: CheckCircle, variant: "outline" as const };
      case 'degraded':
        return { color: "bg-yellow-500", label: "Degraded Performance", icon: AlertTriangle, variant: "secondary" as const };
      case 'outage':
        return { color: "bg-red-500", label: "System Outage", icon: XCircle, variant: "destructive" as const };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-background/50 backdrop-blur-sm text-sm cursor-help hover:bg-accent transition-colors">
            <span className={`relative flex h-2.5 w-2.5`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.color}`}></span>
            </span>
            <span className="hidden sm:inline font-medium text-xs">{config.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">System Status</p>
            <p className="text-xs text-muted-foreground">Updated just now</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
