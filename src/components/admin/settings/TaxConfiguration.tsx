
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Percent, Globe, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaxRate {
  id: string;
  tax_name: string;
  tax_type: string;
  rate_percent: number;
  is_inclusive: boolean;
  country_code: string;
  region: string | null;
  applies_to: string[];
}

export function TaxConfiguration() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTaxRates();
  }, []);

  const fetchTaxRates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tax_rates')
        .select('*');

      if (error) throw error;
      setTaxRates(data || []);
    } catch (error) {
      console.error('Error fetching tax rates:', error);
      toast.error('Failed to load tax rates');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTaxRate = () => {
    const newRate: TaxRate = {
      id: crypto.randomUUID(),
      tax_name: 'New Tax',
      tax_type: 'sales_tax',
      rate_percent: 0,
      is_inclusive: false,
      country_code: 'US',
      region: null,
      applies_to: ['all']
    };
    setTaxRates([...taxRates, newRate]);
  };

  const handleRemoveTaxRate = (id: string) => {
    setTaxRates(taxRates.filter(rate => rate.id !== id));
  };

  const handleUpdateTaxRate = (id: string, updates: Partial<TaxRate>) => {
    setTaxRates(taxRates.map(rate => rate.id === id ? { ...rate, ...updates } : rate));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Upsert all tax rates to the database
      const { error } = await supabase
        .from('tax_rates')
        .upsert(
          taxRates.map(rate => ({
            id: rate.id,
            tax_name: rate.tax_name,
            tax_type: rate.tax_type,
            rate_percent: rate.rate_percent,
            is_inclusive: rate.is_inclusive,
            country_code: rate.country_code,
            region: rate.region,
            applies_to: rate.applies_to,
            effective_date: new Date().toISOString().split('T')[0]
          }))
        );

      if (error) throw error;
      
      toast.success('Tax configuration saved successfully');
      fetchTaxRates(); // Refresh data from source of truth
    } catch (error) {
      console.error('Error saving tax configuration:', error);
      toast.error('Failed to save tax configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tax settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                Tax Configuration
              </CardTitle>
              <CardDescription>
                Manage tax rates for your restaurant locations and services
              </CardDescription>
            </div>
            <Button onClick={handleAddTaxRate} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Tax Rate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {taxRates.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Info className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Tax Rates Configured</h3>
              <p className="text-muted-foreground mb-4">Add your first tax rate to get started</p>
              <Button onClick={handleAddTaxRate} variant="outline">Add Tax Rate</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {taxRates.map((rate) => (
                <div key={rate.id} className="p-4 border rounded-lg bg-card space-y-4 relative group">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                      <div className="space-y-2">
                        <Label>Tax Name</Label>
                        <Input 
                          value={rate.tax_name} 
                          onChange={(e) => handleUpdateTaxRate(rate.id, { tax_name: e.target.value })}
                          placeholder="e.g. VAT, Sales Tax"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tax Rate (%)</Label>
                        <Input 
                          type="number" 
                          value={rate.rate_percent} 
                          onChange={(e) => handleUpdateTaxRate(rate.id, { rate_percent: parseFloat(e.target.value) })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tax Type</Label>
                        <Select 
                          value={rate.tax_type} 
                          onValueChange={(value) => handleUpdateTaxRate(rate.id, { tax_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sales_tax">Sales Tax</SelectItem>
                            <SelectItem value="vat">VAT</SelectItem>
                            <SelectItem value="service_charge">Service Charge</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Country Code</Label>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            value={rate.country_code} 
                            onChange={(e) => handleUpdateTaxRate(rate.id, { country_code: e.target.value.toUpperCase() })}
                            maxLength={2}
                            placeholder="US"
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveTaxRate(rate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <Switch 
                        id={`inclusive-${rate.id}`}
                        checked={rate.is_inclusive}
                        onCheckedChange={(checked) => handleUpdateTaxRate(rate.id, { is_inclusive: checked })}
                      />
                      <Label htmlFor={`inclusive-${rate.id}`} className="cursor-pointer">
                        Tax is included in price
                      </Label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label>Applies to:</Label>
                      <Badge variant="secondary">All Items</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-muted/50">
        <CardContent className="p-4 flex gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Tax Compliance Tip</p>
            <p className="text-muted-foreground">
              Always ensure your tax rates comply with local laws in your operating region. 
              inclusive taxes are added to the subtotal, while exclusive taxes are calculated on top of it.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
