import { useState } from 'react';
import { databaseSeeder, SeederOptions } from '@/utils/database-seeder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Database, AlertCircle, Info, Trash2, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AVAILABLE_TABLES = [
  { id: 'profiles', label: 'Profiles & Users' },
  { id: 'user_roles', label: 'User Roles' },
  { id: 'restaurants', label: 'Restaurants' },
  { id: 'restaurant_locations', label: 'Locations' },
  { id: 'tables', label: 'Dining Tables' },
  { id: 'menu_categories', label: 'Menu Categories' },
  { id: 'menu_items', label: 'Menu Items' },
  { id: 'ingredients', label: 'Inventory Ingredients' },
  { id: 'stock_levels', label: 'Stock Levels' },
  { id: 'chefs', label: 'Chef Profiles' }
];

export default function SeedDemoData() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [dryRun, setDryRun] = useState(false);
  const [environment, setEnvironment] = useState<'development' | 'testing' | 'production'>('development');
  const [selectedTables, setSelectedTables] = useState<string[]>(AVAILABLE_TABLES.map(t => t.id));

  const toggleTable = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const seedData = async () => {
    if (selectedTables.length === 0) {
      toast.error('Please select at least one table to seed');
      return;
    }

    setIsLoading(true);
    setProgress([]);

    const options: SeederOptions = {
      dryRun,
      environment,
      selectiveTables: selectedTables,
      onProgress: (message) => {
        setProgress(prev => [...prev, message]);
      }
    };

    try {
      const result = await databaseSeeder.seedDatabase(options);
      
      if (result.success) {
        toast.success(dryRun ? 'Dry run completed successfully!' : 'Database seeded successfully!');
      } else {
        toast.error('Seeding failed. Check logs for details.');
      }
    } catch (error: any) {
      console.error('Seed error:', error);
      setProgress(prev => [...prev, `❌ Error: ${error.message}`]);
      toast.error('Failed to seed demo data');
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = async () => {
    if (!confirm('Are you sure you want to clear the database? This cannot be undone.')) return;
    
    setIsLoading(true);
    setProgress(['Starting database cleanup...']);
    
    try {
      await databaseSeeder.clearExistingData(selectedTables);
      setProgress(prev => [...prev, '✓ Database cleanup complete!']);
      toast.success('Database cleared successfully!');
    } catch (error: any) {
      setProgress(prev => [...prev, `❌ Error: ${error.message}`]);
      toast.error('Failed to clear database');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Database Seeder</h1>
          <p className="text-muted-foreground">
            Manage demo data and system initialization for administrators across different environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Seeding Configuration
              </CardTitle>
              <CardDescription>
                Select target environment and modules to initialize or update.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Target Environment</Label>
                  <Select value={environment} onValueChange={(val: any) => setEnvironment(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development (Full Dataset)</SelectItem>
                      <SelectItem value="testing">Testing (Edge Cases)</SelectItem>
                      <SelectItem value="production">Production (Minimal Config)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground italic">
                    Affects which data subsets are used during insertion.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Module Selection</Label>
                  <div className="grid grid-cols-1 gap-2 border rounded-md p-3 bg-muted/20">
                    {AVAILABLE_TABLES.map((table) => (
                      <div key={table.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={table.id} 
                          checked={selectedTables.includes(table.id)}
                          onCheckedChange={() => toggleTable(table.id)}
                        />
                        <Label 
                          htmlFor={table.id}
                          className="text-xs font-medium leading-none cursor-pointer"
                        >
                          {table.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="dry-run">Dry Run Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Preview changes without modifying the database.
                  </p>
                </div>
                <Switch 
                  id="dry-run" 
                  checked={dryRun}
                  onCheckedChange={setDryRun}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  onClick={seedData} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    dryRun ? 'Preview Changes' : 'Execute Seeding'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearData}
                  disabled={isLoading}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Selected
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Environment Info
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-green-600">Connected</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="font-semibold capitalize">{environment}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Audit Log:</span>
                  <span className="font-semibold">Enabled</span>
                </div>
                
                <div className="pt-2">
                  <Alert variant="default" className="bg-blue-50 border-blue-200 py-2">
                    <AlertCircle className="h-3 w-3 text-blue-600" />
                    <AlertDescription className="text-[10px] text-blue-700">
                      Automated execution available via CLI: <br/>
                      <code className="bg-blue-100 px-1 rounded">npm run seed -- {environment}</code>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full flex flex-col">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Operation Logs</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden pb-4">
                <ScrollArea className="h-[250px] w-full rounded-md border p-3 bg-black/5">
                  {progress.length > 0 ? (
                    <div className="space-y-1">
                      {progress.map((msg, i) => (
                        <p key={i} className="text-[10px] font-mono leading-tight flex items-start gap-2">
                          <span className="text-muted-foreground">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                          <span className={msg.includes('❌') ? 'text-destructive' : msg.includes('✓') || msg.includes('Successfully') ? 'text-green-600' : ''}>
                            {msg}
                          </span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center pt-10">No operations performed yet.</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
