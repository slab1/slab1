
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { inventoryApi } from '@/api/inventory';
import { useToast } from '@/hooks/use-toast';

const ingredientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  unit_of_measure: z.string().min(1, 'Unit is required'),
  description: z.string().optional(),
  minimum_stock_level: z.number().min(0).optional(),
  maximum_stock_level: z.number().min(0).optional(),
  cost_per_unit: z.number().min(0).optional(),
  initial_quantity: z.number().min(0).optional(),
});

type IngredientFormData = z.infer<typeof ingredientSchema>;

const CATEGORIES = [
  'Proteins',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Grains',
  'Spices & Herbs',
  'Oils & Fats',
  'Beverages',
  'Condiments',
  'Baking',
  'Other',
];

const UNITS = [
  'kg',
  'lbs',
  'g',
  'oz',
  'L',
  'ml',
  'cups',
  'tbsp',
  'tsp',
  'pieces',
  'dozen',
];

interface IngredientFormProps {
  restaurantId: string;
}

export function IngredientForm({ restaurantId }: IngredientFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      category: '',
      unit_of_measure: '',
      description: '',
      minimum_stock_level: 0,
      maximum_stock_level: 0,
      cost_per_unit: 0,
      initial_quantity: 0,
    },
  });

  const createIngredientMutation = useMutation({
    mutationFn: async (data: IngredientFormData) => {
      const created = await inventoryApi.create({
        name: data.name,
        category: data.category,
        unit: data.unit_of_measure,
        quantity: data.initial_quantity || 0,
        min_stock: data.minimum_stock_level || 0,
        max_stock: data.maximum_stock_level || 0,
        unit_cost: data.cost_per_unit || 0,
        is_active: true,
        restaurant_id: restaurantId,
      });
      if (!created) throw new Error('Failed to create ingredient');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-list', restaurantId] });
      toast({ title: 'Ingredient created successfully' });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating ingredient',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: IngredientFormData) => {
    createIngredientMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Organic Tomatoes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
          name="unit_of_measure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Measurement</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional details about this ingredient..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minimum_stock_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock Level</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost_per_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost per Unit</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={createIngredientMutation.isPending}
        >
          {createIngredientMutation.isPending ? 'Creating...' : 'Create Ingredient'}
        </Button>
      </form>
    </Form>
  );
}
