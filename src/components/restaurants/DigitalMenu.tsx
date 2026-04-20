import { useState, useMemo } from 'react';
import { MenuCategory, MenuItem } from '@/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, Leaf, Wheat, Info, Sparkles, UtensilsCrossed } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface DigitalMenuProps {
  categories: MenuCategory[];
  restaurantName: string;
}

export function DigitalMenu({ categories, restaurantName }: DigitalMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');

  const dietaryIcons: Record<string, { icon: React.ReactNode, label: string, color: string }> = {
    'vegetarian': { icon: <Leaf className="h-3 w-3" />, label: 'Vegetarian', color: 'text-green-600 bg-green-50' },
    'vegan': { icon: <Sparkles className="h-3 w-3" />, label: 'Vegan', color: 'text-emerald-600 bg-emerald-50' },
    'gluten-free': { icon: <Wheat className="h-3 w-3" />, label: 'Gluten-Free', color: 'text-amber-600 bg-amber-50' },
    'spicy': { icon: <Info className="h-3 w-3" />, label: 'Spicy', color: 'text-red-600 bg-red-50' },
  };

  const handleDownloadPDF = () => {
    // In a real app, this would trigger a PDF generation or download a pre-generated file
    window.print();
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-xl">
        <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No menu available yet</h3>
        <p className="text-muted-foreground">Check back soon for our latest offerings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Our Menu</h2>
          <p className="text-muted-foreground">Fresh ingredients, expertly prepared</p>
        </div>
        <Button variant="outline" onClick={handleDownloadPDF} className="w-full sm:w-auto">
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF Menu
        </Button>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <TabsList className="inline-flex w-auto bg-muted/50">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="px-6">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-6 space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
              {category.description && (
                <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                  {category.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(category.menu_items || category.items || []).map((item) => {
                const menuItem = item as any;
                const dietaryInfo = menuItem.dietary_info || menuItem.dietary_tags || [];
                return (
                <Card key={item.id} className="overflow-hidden border-none shadow-none group bg-transparent">
                  <div className="flex gap-4">
                    {item.image_url && (
                      <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden border">
                        <OptimizedImage
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        {menuItem.is_seasonal && (
                          <div className="absolute top-0 left-0 p-1 bg-primary text-[8px] text-white font-bold uppercase tracking-wider">
                            Seasonal
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                          {item.name}
                        </h4>
                        <span className="font-bold text-primary whitespace-nowrap">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 italic">
                          {item.description}
                        </p>
                      )}

                      {dietaryInfo.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <TooltipProvider>
                            {dietaryInfo.map((info: string) => {
                              const config = dietaryIcons[info.toLowerCase()] || { icon: <Info className="h-3 w-3" />, label: info, color: 'text-muted-foreground bg-muted' };
                              return (
                                <Tooltip key={info}>
                                  <TooltipTrigger asChild>
                                    <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium", config.color)}>
                                      {config.icon}
                                      <span className="sr-only md:not-sr-only">{config.label}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{config.label}</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );})}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-12 p-6 bg-muted/30 rounded-xl border border-dashed flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">Allergy Information</h4>
            <p className="text-sm text-muted-foreground max-w-md">
              Please inform your server of any food allergies or dietary restrictions before ordering. 
              Consuming raw or undercooked meats may increase your risk of foodborne illness.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {Object.entries(dietaryIcons).map(([key, value]) => (
            <div key={key} className={cn("flex items-center gap-1 px-2 py-1 rounded text-xs font-medium", value.color)}>
              {value.icon}
              {value.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
