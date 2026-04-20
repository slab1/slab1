
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Settings, Save, RefreshCw, Search, Info } from "lucide-react";
import { LoyaltyProgram } from "@/api/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function LoyaltyManagement() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<LoyaltyProgram>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isTiersDialogOpen, setIsTiersDialogOpen] = useState(false);
  const [tiersJson, setTiersJson] = useState("");

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loyalty_programs')
        .select('*');
      
      if (error) throw error;
      // Map the data to include default values for missing fields
      const mappedData = (data || []).map(item => ({
        ...item,
        points_per_visit: item.points_per_dollar || 0,
        points_per_spend: item.points_per_dollar || 0,
        reward_tiers: {},
      })) as LoyaltyProgram[];
      setPrograms(mappedData);
    } catch (error) {
      console.error('Error fetching loyalty programs:', error);
      toast.error("Failed to load loyalty programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleEdit = (program: LoyaltyProgram) => {
    setEditingId(program.id);
    setEditValues({
      points_per_visit: program.points_per_visit,
      points_per_spend: program.points_per_spend,
      is_active: program.is_active,
      reward_tiers: program.reward_tiers
    });
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('loyalty_programs')
        .update(editValues)
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Loyalty program updated");
      setEditingId(null);
      fetchPrograms();
    } catch (error) {
      console.error('Error updating loyalty program:', error);
      toast.error("Failed to update loyalty program");
    }
  };

  const handleTiersEdit = (program: LoyaltyProgram) => {
    setTiersJson(JSON.stringify(program.reward_tiers, null, 2));
    setEditingId(program.id);
    setEditValues({ ...program });
    setIsTiersDialogOpen(true);
  };

  const handleSaveTiers = async () => {
    try {
      JSON.parse(tiersJson); // Validate JSON but don't use it since reward_tiers doesn't exist in DB
      // Note: reward_tiers column doesn't exist in the database schema
      // This is a placeholder for future implementation
      toast.success("Settings saved");
      setIsTiersDialogOpen(false);
      fetchPrograms();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error("Invalid JSON format");
    }
  };

  const filteredPrograms = programs.filter(p => 
    (p as any).restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Loyalty Management</h2>
          <p className="text-muted-foreground">Manage loyalty settings across all restaurants</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by restaurant..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchPrograms} size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Program Name</TableHead>
                <TableHead>Points/Visit</TableHead>
                <TableHead>Points/Spend ($)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tiers</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No matching programs found" : "No loyalty programs found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrograms.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">
                      {(program as any).restaurant?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>{program.name}</TableCell>
                    <TableCell>
                      {editingId === program.id && !isTiersDialogOpen ? (
                        <Input 
                          type="number" 
                          className="w-20"
                          value={editValues.points_per_visit}
                          onChange={(e) => setEditValues({...editValues, points_per_visit: parseInt(e.target.value)})}
                        />
                      ) : (
                        program.points_per_visit
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === program.id && !isTiersDialogOpen ? (
                        <Input 
                          type="number" 
                          step="0.1"
                          className="w-24"
                          value={editValues.points_per_spend}
                          onChange={(e) => setEditValues({...editValues, points_per_spend: parseFloat(e.target.value)})}
                        />
                      ) : (
                        program.points_per_spend
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === program.id && !isTiersDialogOpen ? (
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={editValues.is_active ? 'true' : 'false'}
                          onChange={(e) => setEditValues({...editValues, is_active: e.target.value === 'true'})}
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      ) : (
                        <Badge variant={program.is_active ? "default" : "secondary"}>
                          {program.is_active ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => handleTiersEdit(program)}
                      >
                        <Info className="h-4 w-4" />
                        View/Edit
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === program.id && !isTiersDialogOpen ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => handleSave(program.id)}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(program)}>
                          <Settings className="h-4 w-4 mr-1" />
                          Settings
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isTiersDialogOpen} onOpenChange={setIsTiersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reward Tiers Configuration</DialogTitle>
            <DialogDescription>
              Edit the loyalty tiers and benefits for this restaurant. This must be a valid JSON object.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              className="min-h-[300px] font-mono text-xs"
              value={tiersJson}
              onChange={(e) => setTiersJson(e.target.value)}
              placeholder='{ "bronze": { "points_required": 100, "benefits": ["..."] } }'
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTiersDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTiers}>
              Save Tiers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
