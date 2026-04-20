
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const transactionSchema = z.object({
  ingredient_id: z.string().min(1, 'Ingredient is required'),
  transaction_type: z.enum(['in', 'out']),
  quantity_change: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit_cost: z.number().min(0).optional(),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface Ingredient {
  id: string;
  name: string;
  unit?: string;
}

interface StockTransactionFormProps {
  restaurantId: string;
}

export function StockTransactionForm({ restaurantId }: StockTransactionFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      ingredient_id: '',
      transaction_type: 'in',
      quantity_change: 0,
      unit_cost: 0,
      reason: '',
      notes: '',
    },
  });

  const { data: ingredients } = useQuery({
    queryKey: ['ingredients-for-transaction', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('id, name, unit')
        .eq('restaurant_id', restaurantId)
        .order('name');

      if (error) throw error;
      return (data || []) as Ingredient[];
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      if (!user) throw new Error('User not authenticated');

      const quantityChange = data.transaction_type === 'out' ? -data.quantity_change : data.quantity_change;

      // 1. Get or Create Stock Level
      let stockLevelId: string;
      
      // First, get the current level
      const { data: currentLevels, error: fetchError } = await supabase
        .from('stock_levels')
        .select('id, current_quantity')
        .eq('ingredient_id', data.ingredient_id)
        .eq('restaurant_id', restaurantId);

      if (fetchError) throw fetchError;

      if (currentLevels && currentLevels.length > 0) {
        const currentLevel = currentLevels[0];
        stockLevelId = currentLevel.id;
        const newQuantity = (currentLevel.current_quantity || 0) + quantityChange;
        
        const { error: updateError } = await supabase
          .from('stock_levels')
          .update({ current_quantity: newQuantity })
          .eq('id', stockLevelId);
        
        if (updateError) throw updateError;
      } else {
        // If no stock level entry exists, create one
        const { data: newLevel, error: insertError } = await supabase
          .from('stock_levels')
          .insert([{
            ingredient_id: data.ingredient_id,
            current_quantity: quantityChange,
            restaurant_id: restaurantId,
            location_id: 'default'
          }])
          .select()
          .single();
        
        if (insertError) throw insertError;
        stockLevelId = newLevel.id;
      }

      // 2. Record the transaction
      const { error: txError } = await supabase
        .from('stock_transactions')
        .insert([{
          ingredient_id: data.ingredient_id,
          stock_level_id: stockLevelId,
          transaction_type: data.transaction_type,
          quantity_change: quantityChange,
          unit_cost: data.unit_cost || null,
          reason: data.reason,
          notes: data.notes || null,
          created_by: user.id,
          restaurant_id: restaurantId
        }]);

      if (txError) throw txError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-list', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['stock-transactions', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['recent-stock-transactions', restaurantId] });
      toast({ title: 'Stock transaction recorded successfully' });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error recording transaction',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    createTransactionMutation.mutate(data);
  };

  const transactionType = form.watch('transaction_type');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="ingredient_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingredient</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ingredients?.map((ingredient) => (
                    <SelectItem key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.unit || 'units'})
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
          name="transaction_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in">Stock In (Add)</SelectItem>
                  <SelectItem value="out">Stock Out (Remove)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity_change"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {transactionType === 'in' && (
          <FormField
            control={form.control}
            name="unit_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Cost (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {transactionType === 'in' ? (
                    <>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="return">Return</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="used">Used in kitchen</SelectItem>
                      <SelectItem value="spoiled">Spoiled/Expired</SelectItem>
                      <SelectItem value="transferred">Transferred</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={createTransactionMutation.isPending}
        >
          {createTransactionMutation.isPending ? 'Recording...' : 'Record Transaction'}
        </Button>
      </form>
    </Form>
  );
}
