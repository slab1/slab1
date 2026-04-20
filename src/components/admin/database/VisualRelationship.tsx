import React from 'react';
import { Share2, Info, ArrowRight, Table as TableIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function VisualRelationship() {
  const relationships = [
    { from: 'restaurants', to: 'menu_categories', type: '1:N', label: 'has categories' },
    { from: 'menu_categories', to: 'menu_items', type: '1:N', label: 'contains items' },
    { from: 'restaurants', to: 'reservations', type: '1:N', label: 'receives bookings' },
    { from: 'users', to: 'reservations', type: '1:N', label: 'makes bookings' },
    { from: 'restaurants', to: 'audit_logs', type: '1:N', label: 'logs activity' },
    { from: 'users', to: 'audit_logs', type: '1:N', label: 'performs actions' },
  ];

  const tables = ['restaurants', 'menu_categories', 'menu_items', 'users', 'reservations', 'audit_logs'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                Entity Relationship Diagram
              </CardTitle>
              <CardDescription>Visual representation of core database relationships and foreign key constraints.</CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              Interactive Graph
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[600px] border-2 border-dashed rounded-xl bg-muted/20 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-12 p-8">
                {tables.map(table => (
                  <div key={table} className="z-10 bg-card border-2 border-primary/20 rounded-xl p-4 shadow-lg min-w-[180px] hover:border-primary transition-colors cursor-default">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                      <TableIcon className="h-4 w-4 text-primary" />
                      <span className="font-bold text-sm uppercase tracking-tighter">{table}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="font-mono">id (PK)</span>
                        <Badge variant="outline" className="h-4 text-[8px] px-1">uuid</Badge>
                      </div>
                      {table === 'menu_items' && (
                        <div className="flex items-center justify-between text-[10px] text-primary font-semibold">
                          <span className="font-mono">category_id (FK)</span>
                          <Badge className="h-4 text-[8px] px-1">uuid</Badge>
                        </div>
                      )}
                      {table === 'menu_categories' && (
                        <div className="flex items-center justify-between text-[10px] text-primary font-semibold">
                          <span className="font-mono">restaurant_id (FK)</span>
                          <Badge className="h-4 text-[8px] px-1">uuid</Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="font-mono">created_at</span>
                        <Badge variant="outline" className="h-4 text-[8px] px-1">timestamptz</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock relationship lines using SVG overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                  </marker>
                </defs>
                {/* Visual indicators of connections */}
                <path d="M 200 150 Q 400 150 400 300" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 400 450 Q 400 550 600 550" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 700 300 L 500 300" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
              </svg>
            </div>
            
            <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur p-4 rounded-lg border shadow-sm max-w-xs">
              <h4 className="text-xs font-bold mb-2 uppercase tracking-wider">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Primary Table</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 border-b-2 border-primary/40 border-dashed" />
                  <span>Foreign Key Link</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="h-4 text-[8px]">FK</Badge>
                  <span>Foreign Key Reference</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Relationship Mapping</AlertTitle>
        <AlertDescription>
          This diagram is currently using a static map of the core schema. To generate a dynamic diagram, you can use the SQL Editor to query 
          <code className="mx-1 bg-muted px-1 rounded">information_schema.key_column_usage</code>.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relationships.map((rel, i) => (
          <Card key={i} className="bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{rel.type} Relationship</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{rel.from}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-bold text-sm">{rel.to}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">{rel.label}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
