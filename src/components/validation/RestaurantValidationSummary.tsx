
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { ValidationResult, ValidationIssue } from '@/lib/validation/restaurantValidation';
import { cn } from '@/lib/utils';

interface RestaurantValidationSummaryProps {
  results: {
    core: ValidationResult;
    locations: ValidationResult[];
    menu: ValidationResult;
  };
  className?: string;
}

export function RestaurantValidationSummary({ results, className }: RestaurantValidationSummaryProps) {
  const totalScore = Math.round(
    (results.core.score + 
     (results.locations.reduce((acc, curr) => acc + curr.score, 0) / Math.max(1, results.locations.length)) + 
     results.menu.score) / 3
  );

  const allIssues = [
    ...results.core.issues.map(i => ({ ...i, category: 'Core Info' })),
    ...results.locations.flatMap((l, idx) => l.issues.map(i => ({ ...i, category: `Location ${idx + 1}` }))),
    ...results.menu.issues.map(i => ({ ...i, category: 'Menu' }))
  ];

  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Data Quality Score</CardTitle>
            <CardDescription>Overall health of your restaurant profile</CardDescription>
          </div>
          <div className="text-3xl font-bold text-primary">{totalScore}%</div>
        </div>
        <Progress value={totalScore} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-destructive">{errors.length}</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Errors</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-500">{warnings.length}</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Warnings</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-500">{allIssues.length === 0 ? 'Perfect' : 'Good'}</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Status</div>
          </div>
        </div>

        {allIssues.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Validation Details</h4>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
              {allIssues.sort((a, b) => a.severity === 'error' ? -1 : 1).map((issue, idx) => (
                <div key={idx} className={cn(
                  "flex items-start gap-3 p-3 rounded-md border",
                  issue.severity === 'error' ? "bg-destructive/5 border-destructive/20" : "bg-amber-50/50 border-amber-200/50"
                )}>
                  {issue.severity === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">{issue.category}</span>
                      <Badge variant={issue.severity === 'error' ? 'destructive' : 'secondary'} className="text-[10px] h-4">
                        {issue.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{issue.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-sm font-medium">Your data is in great shape!</p>
            <p className="text-xs text-muted-foreground">All mandatory fields are complete and valid.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
