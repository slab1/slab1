
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface PricingRule {
  id: string;
  name: string;
  type: 'time_based' | 'demand_based' | 'event_based' | 'weather_based';
  enabled: boolean;
  multiplier: number;
  conditions: any;
}

interface DynamicPricingEngineProps {
  restaurantId: string;
}

export function DynamicPricingEngine({ restaurantId }: DynamicPricingEngineProps) {
  const [enabled, setEnabled] = useState(false);
  const [basePrice, setBasePrice] = useState(25);
  const [rules, setRules] = useState<PricingRule[]>([
    {
      id: '1',
      name: 'Peak Hours Premium',
      type: 'time_based',
      enabled: true,
      multiplier: 1.2,
      conditions: { startTime: '18:00', endTime: '21:00', days: ['friday', 'saturday'] }
    },
    {
      id: '2',
      name: 'High Demand Surge',
      type: 'demand_based',
      enabled: true,
      multiplier: 1.5,
      conditions: { occupancyThreshold: 85 }
    },
    {
      id: '3',
      name: 'Special Events',
      type: 'event_based',
      enabled: false,
      multiplier: 1.3,
      conditions: { events: ['valentines', 'new_years', 'mothers_day'] }
    },
    {
      id: '4',
      name: 'Weather Boost',
      type: 'weather_based',
      enabled: false,
      multiplier: 1.1,
      conditions: { weatherTypes: ['rain', 'snow'] }
    }
  ]);
  
  const [currentPricing, setCurrentPricing] = useState({
    currentPrice: 25,
    activeRules: [] as string[],
    projectedRevenue: 0,
    demandLevel: 'medium' as 'low' | 'medium' | 'high'
  });

  const calculateCurrentPricing = useCallback(() => {
    if (!enabled) {
      setCurrentPricing({
        currentPrice: basePrice,
        activeRules: [],
        projectedRevenue: basePrice * 50, // Assume 50 covers average
        demandLevel: 'medium'
      });
      return;
    }

    let finalPrice = basePrice;
    const activeRules: string[] = [];
    
    // Simulate rule evaluation
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    rules.forEach(rule => {
      if (!rule.enabled) return;
      
      let shouldApply = false;
      
      switch (rule.type) {
        case 'time_based': {
          const startHour = parseInt(rule.conditions.startTime.split(':')[0]);
          const endHour = parseInt(rule.conditions.endTime.split(':')[0]);
          const isWeekend = currentDay === 5 || currentDay === 6;
          shouldApply = currentHour >= startHour && currentHour <= endHour && isWeekend;
          break;
        }
          
        case 'demand_based': {
          // Simulate occupancy check
          const occupancy = Math.random() * 100;
          shouldApply = occupancy > rule.conditions.occupancyThreshold;
          break;
        }
          
        case 'event_based':
          // Simulate event detection
          shouldApply = Math.random() > 0.8; // 20% chance for demo
          break;
          
        case 'weather_based':
          // Simulate weather detection
          shouldApply = Math.random() > 0.7; // 30% chance for demo
          break;
      }
      
      if (shouldApply) {
        finalPrice *= rule.multiplier;
        activeRules.push(rule.name);
      }
    });
    
    const demandLevel = finalPrice > basePrice * 1.3 ? 'high' : 
                       finalPrice > basePrice * 1.1 ? 'medium' : 'low';
    
    setCurrentPricing({
      currentPrice: Math.round(finalPrice * 100) / 100,
      activeRules,
      projectedRevenue: Math.round(finalPrice * 45 * 100) / 100, // Assume slight reduction in covers due to higher price
      demandLevel
    });
  }, [basePrice, enabled, rules]);

  useEffect(() => {
    calculateCurrentPricing();
  }, [calculateCurrentPricing]);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const updateRuleMultiplier = (ruleId: string, multiplier: number) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, multiplier: multiplier / 100 } : rule
    ));
  };

  const savePricingSettings = () => {
    // Here you would save to your backend
    toast.success('Pricing settings saved successfully!');
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dynamic Pricing Engine</CardTitle>
              <CardDescription>
                Automatically adjust prices based on demand, time, and market conditions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="pricing-enabled">Enable Dynamic Pricing</Label>
              <Switch
                id="pricing-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label>Base Price ($)</Label>
                <Input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-3">
                <Label>Current Status</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Price:</span>
                    <span className="font-bold text-lg">${currentPricing.currentPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Demand Level:</span>
                    <Badge variant="outline" className={getDemandColor(currentPricing.demandLevel)}>
                      {currentPricing.demandLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Projected Revenue:</span>
                    <span className="font-semibold">${currentPricing.projectedRevenue}</span>
                  </div>
                </div>
              </div>
              
              {currentPricing.activeRules.length > 0 && (
                <div>
                  <Label>Active Rules</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentPricing.activeRules.map(rule => (
                      <Badge key={rule} variant="secondary">
                        {rule}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <Label>Pricing Rules</Label>
              {rules.map(rule => (
                <Card key={rule.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rule.type === 'time_based' && <Clock className="h-4 w-4" />}
                        {rule.type === 'demand_based' && <Users className="h-4 w-4" />}
                        {rule.type === 'event_based' && <Calendar className="h-4 w-4" />}
                        {rule.type === 'weather_based' && <TrendingUp className="h-4 w-4" />}
                        <span className="font-medium text-sm">{rule.name}</span>
                      </div>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Price Multiplier: {rule.multiplier}x</Label>
                      <Slider
                        value={[rule.multiplier * 100]}
                        onValueChange={([value]) => updateRuleMultiplier(rule.id, value)}
                        max={200}
                        min={100}
                        step={5}
                        className="w-full"
                        disabled={!rule.enabled}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1.0x</span>
                        <span>2.0x</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button onClick={savePricingSettings}>
              Save Pricing Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
