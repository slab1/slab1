
import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { menuCategoryApi } from '@/api/menuCategory';
import { MenuCategory } from '@/api/types';
import { toast } from 'sonner';

interface MenuCategoryFormProps {
  open: boolean;
  onClose: () => void;
  category: MenuCategory | null;
  restaurantId: string;
  onSave: () => void;
}

export function MenuCategoryForm({ 
  open, 
  onClose, 
  category,
  restaurantId,
  onSave 
}: MenuCategoryFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setIsActive(category.is_active ?? true);
      setSortOrder(category.sort_order?.toString() || '0');
    } else {
      resetForm();
    }
  }, [category, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsActive(true);
    setSortOrder('0');
  };

  const handleSave = async () => {
    try {
      if (!name) {
        toast.error('Please enter a category name');
        return;
      }
      
      setIsSubmitting(true);
      
      const categoryData = {
        name,
        description,
        is_active: isActive,
        sort_order: parseInt(sortOrder) || 0,
        restaurant_id: restaurantId
      };

      if (category) {
        // Update existing category
        await menuCategoryApi.update(category.id, categoryData);
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await menuCategoryApi.create(categoryData);
        toast.success('Category added successfully');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit' : 'Add'} Category</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Category description (optional)"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is_active">Active (Visible to customers)</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting || !name}
            isLoading={isSubmitting}
          >
            {category ? 'Update Category' : 'Add Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
