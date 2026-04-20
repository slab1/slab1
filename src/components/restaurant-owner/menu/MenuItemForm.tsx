import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { menuItemApi } from '@/api/menuItem';
import { MenuCategory, MenuItem, MenuItemIngredient } from '@/api/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { X, Image, Plus, Trash2 } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { inventoryApi, InventoryItem } from '@/api/inventory';
import { Separator } from '@/components/ui/separator';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { useUpload } from '@/hooks/use-upload';
import { menuItemSchema, MenuItemFormValues } from '@/lib/validation/menu-schemas';

interface MenuItemFormProps {
  open: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  restaurantId: string;
  categories: MenuCategory[];
  onSave: () => void;
}

export function MenuItemForm({ 
  open, 
  onClose, 
  menuItem, 
  restaurantId, 
  categories,
  onSave 
}: MenuItemFormProps) {
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState<InventoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, replace, isUploading } = useUpload({
    bucket: 'restaurant-images',
    path: 'menu-items',
    compress: true
  });

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category_id: '',
      is_available: true,
      preparation_time: undefined,
      dietary_tags: '',
      allergens: '',
      sort_order: 0,
      image_url: '',
      ingredients: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  });

  // Fetch available ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      if (restaurantId && open) {
        const ingredients = await inventoryApi.getAll(restaurantId);
        setAvailableIngredients(ingredients);
      }
    };
    fetchIngredients();
  }, [restaurantId, open]);

  // Reset form when menu item changes
  useEffect(() => {
    if (open) {
      if (menuItem) {
        form.reset({
          name: menuItem.name || '',
          description: menuItem.description || '',
          price: menuItem.price || 0,
          category_id: menuItem.category_id || '',
          is_available: menuItem.is_available ?? true,
          preparation_time: menuItem.preparation_time || undefined,
          dietary_tags: menuItem.dietary_tags?.join(', ') || '',
          allergens: menuItem.allergens?.join(', ') || '',
          sort_order: menuItem.sort_order || 0,
          image_url: menuItem.image_url || '',
          ingredients: [],
        });
        setLocalImageUrl(menuItem.image_url || null);

        // Fetch menu item ingredients
        const fetchMenuItemIngredients = async () => {
          const ingredients = await menuItemApi.getIngredients(menuItem.id);
          form.setValue('ingredients', ingredients.map((ing: MenuItemIngredient) => ({
            ingredient_id: ing.ingredient_id,
            quantity_required: ing.quantity_required,
            unit: ing.unit
          })));
        };
        fetchMenuItemIngredients();
      } else {
        form.reset({
          name: '',
          description: '',
          price: 0,
          category_id: '',
          is_available: true,
          preparation_time: undefined,
          dietary_tags: '',
          allergens: '',
          sort_order: 0,
          image_url: '',
          ingredients: [],
        });
        setLocalImageUrl(null);
        setFile(null);
      }
    }
  }, [menuItem, open, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Preview the image
      const objectUrl = URL.createObjectURL(selectedFile);
      setLocalImageUrl(objectUrl);
    }
  };

  const onSubmit = async (values: MenuItemFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Upload image if a file is selected
      let finalImageUrl = values.image_url;
      if (file) {
        const fileName = `${menuItem?.id || crypto.randomUUID()}.${file.name.split('.').pop()}`;
        const filePath = `menu-items/${fileName}`;
        finalImageUrl = await replace(file, values.image_url, filePath) || values.image_url;
      }

      // Convert comma-separated strings to arrays
      const dietary_tags = values.dietary_tags ? values.dietary_tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const allergens = values.allergens ? values.allergens.split(',').map(t => t.trim()).filter(Boolean) : [];

      const menuItemData = {
        name: values.name,
        description: values.description,
        price: values.price,
        image_url: finalImageUrl || null,
        category_id: values.category_id === '_uncategorized_' ? null : values.category_id,
        is_available: values.is_available,
        preparation_time: values.preparation_time,
        dietary_tags,
        allergens,
        sort_order: values.sort_order,
        restaurant_id: restaurantId,
      };

      let savedMenuItem: MenuItem | null = null;
      if (menuItem) {
        savedMenuItem = await menuItemApi.update(menuItem.id, menuItemData);
        toast.success('Menu item updated successfully');
      } else {
        savedMenuItem = await menuItemApi.create(menuItemData);
        toast.success('Menu item added successfully');
      }
      
      if (savedMenuItem && values.ingredients) {
        await menuItemApi.updateIngredients(
          savedMenuItem.id, 
          values.ingredients.map(ing => ({
            ingredient_id: ing.ingredient_id,
            quantity_required: ing.quantity_required,
            unit: ing.unit || ''
          }))
        );
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    setLocalImageUrl(null);
    form.setValue('image_url', '');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{menuItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Item description" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input type="number" step="0.01" className="pl-6" placeholder="0.00" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preparation_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (min)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || '_uncategorized_'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="_uncategorized_">Uncategorized</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dietary_tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Tags (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Vegan, Gluten-free, Spicy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergens (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nuts, Dairy, Shellfish" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-2" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Ingredients & Recipe</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ ingredient_id: '', quantity_required: 0, unit: '' })}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Ingredient
                </Button>
              </div>
              
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.ingredient_id`}
                        render={({ field: subField }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Ingredient</FormLabel>
                            <Select 
                              onValueChange={(val) => {
                                subField.onChange(val);
                                const ing = availableIngredients.find(i => i.id === val);
                                if (ing) {
                                  form.setValue(`ingredients.${index}.unit`, ing.unit);
                                }
                              }} 
                              value={subField.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select ingredient" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableIngredients.map((ing) => {
                                  const isLowStock = ing.quantity <= ing.min_stock;
                                  return (
                                    <SelectItem key={ing.id} value={ing.id}>
                                      <div className="flex items-center justify-between w-full gap-4">
                                        <span>{ing.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                          isLowStock ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                          {ing.quantity} {ing.unit}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="w-24">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.quantity_required`}
                        render={({ field: subField }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Qty</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.001" className="h-9" {...subField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="w-16">
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Unit</FormLabel>
                        <FormControl>
                          <Input value={form.watch(`ingredients.${index}.unit`) || ''} readOnly disabled className="h-9 bg-muted" />
                        </FormControl>
                      </FormItem>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2 italic">
                    No ingredients linked. Add ingredients to track stock auto-depletion.
                  </p>
                )}
              </div>
            </div>

            <Separator className="my-2" />
            
            <FormField
              control={form.control}
              name="is_available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Available for ordering</FormLabel>
                    <FormDescription>
                      If disabled, this item will not be visible to customers.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid gap-2">
              <Label>Item Image</Label>
              {localImageUrl ? (
                <div className="relative rounded-md overflow-hidden aspect-video border">
                  <OptimizedImage 
                    src={localImageUrl} 
                    alt="Menu item" 
                    className="w-full h-full object-cover" 
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                     onClick={() => fileInputRef.current?.click()}>
                  <Image className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click to upload an image
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isUploading}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || isUploading}
                isLoading={isSubmitting || isUploading}
              >
                {isSubmitting || isUploading ? 'Saving...' : 'Save Menu Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
