import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Utensils, ShoppingCart, Loader2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useSpecialEventOrders } from "@/hooks/use-special-event-orders";
import { useMenuItems, useAllMenuItemsIngredients } from "@/hooks/use-menu-items";
import { useInventory } from "@/hooks/use-inventory";

interface SpecialEventOrderDialogProps {
  eventId: string;
  restaurantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SpecialEventOrderDialog({ 
  eventId, 
  restaurantId, 
  isOpen, 
  onClose 
}: SpecialEventOrderDialogProps) {
  const { 
    orderItems, 
    isLoading: loadingOrders,
    addItems,
    isAdding,
    removeItem,
    isRemoving
  } = useSpecialEventOrders(eventId);

  const { data: availableMenuItems = [], isLoading: loadingMenu } = useMenuItems(restaurantId);
  const { data: inventory = [], isLoading: loadingInventory } = useInventory(restaurantId);
  const { data: menuItemIngredients = {}, isLoading: loadingIngredients } = useAllMenuItemsIngredients(availableMenuItems);

  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({
    menu_item_id: "",
    quantity: 1
  });

  const loading = loadingOrders || loadingMenu || loadingInventory || loadingIngredients;

  const getStockWarning = (menuItemId: string, quantity: number = 1) => {
    const ingredients = menuItemIngredients[menuItemId] || [];
    if (ingredients.length === 0) return null;

    const warnings: string[] = [];
    ingredients.forEach(ing => {
      const invItem = inventory.find(i => i.id === ing.ingredient_id);
      if (invItem) {
        const totalNeeded = ing.quantity_required * quantity;
        if (invItem.quantity < totalNeeded) {
          warnings.push(`${invItem.name} (Need ${totalNeeded}${invItem.unit}, Have ${invItem.quantity}${invItem.unit})`);
        } else if (invItem.quantity < (invItem.min_stock || 10)) {
          // Low stock warning
          warnings.push(`${invItem.name} is low on stock`);
        }
      }
    });

    return warnings;
  };

  const selectedItemWarnings = newItem.menu_item_id ? getStockWarning(newItem.menu_item_id, newItem.quantity) : [];

  const handleAddItem = async () => {
    if (!newItem.menu_item_id) {
      toast.error("Please select a menu item");
      return;
    }

    const warnings = getStockWarning(newItem.menu_item_id, newItem.quantity);
    if (warnings && warnings.some(w => w.includes('Need'))) {
      if (!confirm(`Warning: Some ingredients are out of stock:\n${warnings.join('\n')}\n\nDo you still want to add this item?`)) {
        return;
      }
    }

    const menuItem = availableMenuItems.find(m => m.id === newItem.menu_item_id);
    if (!menuItem) return;

    setSaving(true);
    try {
      await addItems([{
        special_event_id: eventId,
        menu_item_id: newItem.menu_item_id,
        quantity: newItem.quantity,
        unit_price: menuItem.price,
        notes: ""
      }]);
      setNewItem({ menu_item_id: "", quantity: 1 });
    } catch (error) {
      // Error handled by mutation
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeItem(id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const total = orderItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Special Event Menu & Items
          </DialogTitle>
          <DialogDescription>
            Manage items for this special event. Stock will be automatically depleted when the event is marked as completed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="md:col-span-7 space-y-2">
              <Label>Select Menu Item</Label>
              <Select 
                value={newItem.menu_item_id} 
                onValueChange={(val) => setNewItem(prev => ({ ...prev, menu_item_id: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a dish..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMenuItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {formatCurrency(item.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number" 
                min="1" 
                value={newItem.quantity} 
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button 
                onClick={handleAddItem} 
                className="w-full" 
                disabled={saving || loading}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {selectedItemWarnings && selectedItemWarnings.length > 0 && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-yellow-700 font-medium text-sm">
                <AlertTriangle className="h-4 w-4" />
                Inventory Warnings
              </div>
              <ul className="text-xs text-yellow-600 list-disc list-inside">
                {selectedItemWarnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orderItems.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No items added to this event yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.menu_item?.name || "Unknown Item"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold text-lg">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg text-primary">
                    {formatCurrency(total)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
