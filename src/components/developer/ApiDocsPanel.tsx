import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, ChevronDown, ChevronRight, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

const API_BASE = "https://reewcfpjlnufktvahtii.supabase.co/functions/v1/external-api";

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  responseExample: string;
}

const endpoints: Record<string, Endpoint[]> = {
  'Health': [
    {
      method: 'GET',
      path: '/v1/health',
      summary: 'Health Check',
      description: 'Returns API status and version info.',
      responseExample: '{\n  "status": "ok",\n  "version": "1.0.0",\n  "timestamp": "2026-04-02T12:00:00Z"\n}',
    },
  ],
  'Restaurants': [
    {
      method: 'GET',
      path: '/v1/restaurants',
      summary: 'List Restaurants',
      description: 'Returns all restaurants associated with your API key.',
      params: [
        { name: 'limit', type: 'number', required: false, description: 'Max results (default: 25)' },
        { name: 'offset', type: 'number', required: false, description: 'Pagination offset' },
      ],
      responseExample: '{\n  "data": [\n    {\n      "id": "uuid",\n      "name": "My Restaurant",\n      "locations": [...]\n    }\n  ],\n  "count": 1\n}',
    },
    {
      method: 'GET',
      path: '/v1/restaurants/:id',
      summary: 'Get Restaurant',
      description: 'Returns a single restaurant by ID.',
      params: [{ name: 'id', type: 'string', required: true, description: 'Restaurant UUID' }],
      responseExample: '{\n  "id": "uuid",\n  "name": "My Restaurant",\n  "locations": [...],\n  "settings": {...}\n}',
    },
  ],
  'Reservations': [
    {
      method: 'GET',
      path: '/v1/reservations',
      summary: 'List Reservations',
      description: 'Returns reservations with optional filters.',
      params: [
        { name: 'restaurant_id', type: 'string', required: false, description: 'Filter by restaurant' },
        { name: 'date', type: 'string', required: false, description: 'Filter by date (YYYY-MM-DD)' },
        { name: 'status', type: 'string', required: false, description: 'Filter by status' },
      ],
      responseExample: '{\n  "data": [\n    {\n      "id": "uuid",\n      "guest_name": "John Doe",\n      "party_size": 4,\n      "date": "2026-04-15",\n      "time": "19:00",\n      "status": "confirmed"\n    }\n  ],\n  "count": 1\n}',
    },
    {
      method: 'POST',
      path: '/v1/reservations',
      summary: 'Create Reservation',
      description: 'Creates a new reservation.',
      params: [
        { name: 'restaurant_id', type: 'string', required: true, description: 'Restaurant UUID' },
        { name: 'guest_name', type: 'string', required: true, description: 'Guest name' },
        { name: 'party_size', type: 'number', required: true, description: 'Number of guests' },
        { name: 'date', type: 'string', required: true, description: 'Date (YYYY-MM-DD)' },
        { name: 'time', type: 'string', required: true, description: 'Time (HH:MM)' },
      ],
      responseExample: '{\n  "id": "uuid",\n  "status": "pending",\n  "confirmation_code": "RES-ABC123"\n}',
    },
  ],
  'Tables': [
    {
      method: 'GET',
      path: '/v1/tables',
      summary: 'List Tables',
      description: 'Returns all tables for a location.',
      params: [
        { name: 'location_id', type: 'string', required: true, description: 'Location UUID' },
      ],
      responseExample: '{\n  "data": [\n    {\n      "id": "uuid",\n      "name": "Table 1",\n      "capacity": 4,\n      "status": "available"\n    }\n  ]\n}',
    },
  ],
};

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  POST: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  PUT: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  DELETE: 'bg-red-500/10 text-red-700 border-red-500/20',
  PATCH: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
};

export const ApiDocsPanel: React.FC = () => {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [tryItKey, setTryItKey] = useState('');
  const [tryItResponse, setTryItResponse] = useState<string | null>(null);
  const [tryItLoading, setTryItLoading] = useState(false);

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoint(expandedEndpoint === id ? null : id);
    setTryItResponse(null);
  };

  const tryEndpoint = async (endpoint: Endpoint) => {
    if (!tryItKey) {
      toast.error('Enter your API key first');
      return;
    }
    setTryItLoading(true);
    setTryItResponse(null);
    try {
      const res = await fetch(`${API_BASE}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'X-API-KEY': tryItKey,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setTryItResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTryItResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setTryItLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Links */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" asChild>
          <a href={`${API_BASE}/doc`} target="_blank" rel="noreferrer" className="gap-2">
            OpenAPI Spec <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="/api-docs" className="gap-2">
            Full Swagger UI <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>

      {/* Try It Key Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Paste your API key to try endpoints..."
              value={tryItKey}
              onChange={(e) => setTryItKey(e.target.value)}
              className="font-mono text-sm"
              type="password"
            />
          </div>
        </CardContent>
      </Card>

      {/* Endpoint Groups */}
      {Object.entries(endpoints).map(([group, eps]) => (
        <Card key={group}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{group}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {eps.map((ep) => {
              const id = `${ep.method}-${ep.path}`;
              const isExpanded = expandedEndpoint === id;

              return (
                <div key={id} className="border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                    onClick={() => toggleEndpoint(id)}
                  >
                    <Badge variant="outline" className={`${methodColors[ep.method]} font-mono text-xs px-2 py-0.5 shrink-0`}>
                      {ep.method}
                    </Badge>
                    <code className="text-sm font-mono text-foreground">{ep.path}</code>
                    <span className="text-sm text-muted-foreground ml-auto mr-2 hidden sm:inline">{ep.summary}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t p-4 space-y-4 bg-muted/20">
                      <p className="text-sm text-muted-foreground">{ep.description}</p>

                      {ep.params && ep.params.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Parameters</h4>
                          <div className="space-y-1">
                            {ep.params.map((p) => (
                              <div key={p.name} className="flex items-center gap-2 text-sm">
                                <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{p.name}</code>
                                <span className="text-[10px] text-muted-foreground uppercase">{p.type}</span>
                                {p.required && <Badge variant="destructive" className="text-[9px] px-1 py-0">required</Badge>}
                                <span className="text-xs text-muted-foreground">{p.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Response Example</h4>
                        <pre className="bg-foreground text-primary-foreground p-4 rounded-lg overflow-x-auto font-mono text-xs leading-relaxed">
                          {ep.responseExample}
                        </pre>
                      </div>

                      {/* Try It */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          disabled={tryItLoading || !tryItKey || ep.method !== 'GET'}
                          onClick={() => tryEndpoint(ep)}
                          className="gap-2"
                        >
                          {tryItLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                          Try It
                        </Button>
                        {ep.method !== 'GET' && (
                          <span className="text-xs text-muted-foreground">Try It available for GET endpoints only</span>
                        )}
                      </div>

                      {tryItResponse && (
                        <div>
                          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Live Response</h4>
                          <pre className="bg-foreground text-primary-foreground p-4 rounded-lg overflow-x-auto font-mono text-xs leading-relaxed max-h-64 overflow-y-auto">
                            {tryItResponse}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
