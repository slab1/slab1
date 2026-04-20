import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Clock, Info, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MenuCategory, MenuItem, MenuItemIngredient } from '@/api/types';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { MenuItemForm } from './menu/MenuItemForm';
import { MenuCategoryForm } from './menu/MenuCategoryForm';
import { menuCategoryApi } from '@/api/menuCategory';
import { menuItemApi } from '@/api/menuItem';

interface MenuTabProps {
  restaurantId?: string;
}

export function MenuTab({ restaurantId }: MenuTabProps) {
  const queryClient = useQueryClient();

  // State
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);

  // Queries
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['menu-categories', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return data as MenuCategory[];
    },
    enabled: !!restaurantId
  });

  const { data: menuItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['menu-items', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: !!restaurantId
  });

  // Mutations
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await menuItemApi.delete(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', restaurantId] });
      toast.success('Item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete item: ' + error.message);
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      // Check if there are items in this category
      const hasItems = menuItems.some(item => item.category_id === categoryId);
      if (hasItems) {
        throw new Error('Cannot delete category with items. Please move or delete items first.');
      }
      await menuCategoryApi.delete(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories', restaurantId] });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const toggleItemAvailabilityMutation = useMutation({
    mutationFn: async ({ id, is_available }: { id: string, is_available: boolean }) => {
      await menuItemApi.update(id, { is_available });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', restaurantId] });
    }
  });

  const toggleCategoryActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      await menuCategoryApi.update(id, { is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories', restaurantId] });
    }
  });

  // Handlers
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsAddItemDialogOpen(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setIsAddCategoryDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  // Derived
  const groupedItems = categories.reduce((acc, category) => {
    acc[category.id] = menuItems.filter(item => item.category_id === category.id);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const uncategorizedItems = menuItems.filter(item => !item.category_id);

  // Early return
  if (!restaurantId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Menu Management</CardTitle>
          <CardDescription>No restaurant selected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select a restaurant to manage menu items.</p>
        </CardContent>
      </Card>
    );
  }

  const isLoading = isLoadingCategories || isLoadingItems;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => {
          setEditingCategory(null);
          setIsAddCategoryDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>

        <Button onClick={() => {
          setEditingItem(null);
          setIsAddItemDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Forms */}
      <MenuCategoryForm
        open={isAddCategoryDialogOpen}
        onClose={() => setIsAddCategoryDialogOpen(false)}
        category={editingCategory}
        restaurantId={restaurantId}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ['menu-categories', restaurantId] });
          setIsAddCategoryDialogOpen(false);
        }}
      />

      <MenuItemForm
        open={isAddItemDialogOpen}
        onClose={() => setIsAddItemDialogOpen(false)}
        menuItem={editingItem}
        restaurantId={restaurantId}
        categories={categories}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ['menu-items', restaurantId] });
          setIsAddItemDialogOpen(false);
        }}
      />

      {/* Menu Content */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center">Loading menu...</CardContent>
        </Card>
      ) : categories.length === 0 && uncategorizedItems.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No menu categories or items found</p>
            <p className="text-sm mt-1">Start by adding a category or a menu item</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Categorized Items */}
          {categories.map((category) => (
            <Card key={category.id} className={!category.is_active ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{category.name}</CardTitle>
                    {!category.is_active && <Badge variant="outline">Inactive</Badge>}
                  </div>
                  {category.description && (
                    <CardDescription className="mt-1">{category.description}</CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => toggleCategoryActiveMutation.mutate({ id: category.id, is_active: !category.is_active })}
                  >
                    {category.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 mt-4">
                  {groupedItems[category.id]?.length > 0 ? (
                    groupedItems[category.id].map((item) => (
                      <MenuItemRow 
                        key={item.id} 
                        item={item} 
                        onEdit={handleEditItem} 
                        onDelete={handleDeleteItem}
                        onToggleAvailability={(is_available) => toggleItemAvailabilityMutation.mutate({ id: item.id, is_available })}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No items in this category</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Uncategorized Items */}
          {uncategorizedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uncategorized</CardTitle>
                <CardDescription>Items without a category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {uncategorizedItems.map((item) => (
                    <MenuItemRow 
                      key={item.id} 
                      item={item} 
                      onEdit={handleEditItem} 
                      onDelete={handleDeleteItem}
                      onToggleAvailability={(is_available) => toggleItemAvailabilityMutation.mutate({ id: item.id, is_available })}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItemRow({ item, onEdit, onDelete, onToggleAvailability }: { 
  item: MenuItem, 
  onEdit: (item: MenuItem) => void, 
  onDelete: (id: string) => void,
  onToggleAvailability: (is_available: boolean) => void
}) {
  const { data: ingredients = [] } = useQuery({
    queryKey: ['menu-item-ingredients', item.id],
    queryFn: () => menuItemApi.getIngredients(item.id),
  });

  const lowStockIngredients = ingredients.filter((ing: MenuItemIngredient) => {
    const currentStock = ing.current_stock || 0;
    const required = ing.quantity_required || 0;
    const threshold = ing.ingredient?.reorder_threshold || 10;
    return currentStock < required || currentStock <= threshold;
  });

  const outOfStockIngredients = ingredients.filter((ing: MenuItemIngredient) => {
    const currentStock = ing.current_stock || 0;
    const required = ing.quantity_required || 0;
    return currentStock < required;
  });

  return (
    <div className={`flex items-center gap-4 p-4 border rounded-lg bg-card transition-colors ${!item.is_available ? "bg-muted/50" : ""}`}>
      {item.image_url ? (
        <OptimizedImage
          src={item.image_url}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-md flex-shrink-0"
        />
      ) : (
        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
          <Info className="h-8 w-8 text-muted-foreground/30" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h4 className="font-semibold truncate">{item.name}</h4>
          <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
          {!item.is_available && <Badge variant="secondary">Unavailable</Badge>}
          {outOfStockIngredients.length > 0 ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Out of Stock
            </Badge>
          ) : lowStockIngredients.length > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Low Stock
            </Badge>
          )}
          {item.preparation_time && (
            <div className="flex items-center text-xs text-muted-foreground ml-2">
              <Clock className="h-3 w-3 mr-1" />
              {item.preparation_time} min
            </div>
          )}
        </div>
        
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
        )}
        
        <div className="flex gap-2 flex-wrap items-center">
          {item.dietary_tags?.map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] py-0 h-5">
              {tag}
            </Badge>
          ))}
          {item.allergens && item.allergens.length > 0 && (
            <Badge variant="destructive" className="text-[10px] py-0 h-5 bg-destructive/10 text-destructive border-destructive/20">
              Allergens: {item.allergens.join(', ')}
            </Badge>
          )}
          
          {ingredients.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-dashed">
              <Package className="h-3 w-3" />
              <span>{ingredients.length} ingredients</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-[10px] h-7 px-2"
          onClick={() => onToggleAvailability(!item.is_available)}
        >
          {item.is_available ? 'Set Unavailable' : 'Set Available'}
        </Button>
      </div>
    </div>
  );
}