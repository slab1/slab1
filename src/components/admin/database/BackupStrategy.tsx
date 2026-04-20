
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  History, 
  ShieldCheck, 
  Clock, 
  Database, 
  ArrowRight, 
  ExternalLink,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export function BackupStrategy() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Backup Strategy & PITR
              </CardTitle>
              <CardDescription>
                Manage point-in-time recovery and database backup configurations
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              Active Strategy
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Point-in-Time Recovery (PITR)</AlertTitle>
            <AlertDescription>
              PITR allows you to restore your database to any specific second in the past. 
              This is critical for recovering from accidental data deletion or corruption.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Continuous Backups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Retention Period</span>
                    <span className="font-medium">7 Days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recovery Granularity</span>
                    <span className="font-medium">Per-second</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="secondary" className="text-[10px] h-5">Healthy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Daily Snapshots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Retention Period</span>
                    <span className="font-medium">30 Days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="font-medium">Every 24 Hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Snapshot</span>
                    <span className="font-medium text-[10px]">Today, 03:00 AM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">How to Restore</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <div>
                  <p className="text-sm font-medium">Access Supabase Dashboard</p>
                  <p className="text-xs text-muted-foreground">Navigate to Database {`>`} Backups in your project settings.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <div>
                  <p className="text-sm font-medium">Select PITR Restore</p>
                  <p className="text-xs text-muted-foreground">Choose the "Point-in-Time" option to see the timeline of available restore points.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                <div>
                  <p className="text-sm font-medium">Pick a Timestamp</p>
                  <p className="text-xs text-muted-foreground">Select the exact date and time you want to roll back to.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
            <Button className="gap-2" variant="outline" asChild>
              <a href="https://supabase.com/docs/guides/database/backups" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                View Documentation
              </a>
            </Button>
            <Button className="gap-2" variant="destructive">
              <RotateCcw className="h-4 w-4" />
              Initiate Recovery Simulator
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Critical Security Note</AlertTitle>
        <AlertDescription>
          Database restoration is a destructive process for any data created after the restore point. 
          Always ensure you have a manual backup of current state before performing a PITR restore.
        </AlertDescription>
      </Alert>
    </div>
  );
}
