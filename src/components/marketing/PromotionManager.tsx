import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Percent,
  DollarSign,
  Users,
  Copy,
  QrCode
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

type DiscountType = 'percentage' | 'fixed_amount';
type PromotionStatus = 'active' | 'inactive' | 'expired';

interface Promotion {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  promo_code: string | null;
  min_order_value: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  start_date: string;
  end_date: string;
  status: PromotionStatus;
  created_at: string;
  updated_at: string;
}

export function PromotionManager({ restaurantId }: { restaurantId: string }) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount_type: "percentage" as DiscountType,
    discount_value: 0,
    promo_code: "",
    min_order_value: 0,
    usage_limit: 100,
    start_date: new Date(),
    end_date: new Date(),
  });

  const [selectedPromotionForQr, setSelectedPromotionForQr] = useState<Promotion | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Promo code copied to clipboard.",
    });
  };

  const { data: promotions, isLoading } = useQuery({
    queryKey: ["promotions", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Map DB fields to Promotion interface
      return (data || []).map((item: any) => ({
        ...item,
        title: item.code || item.description?.substring(0, 50) || 'Promotion',
        promo_code: item.code,
        min_order_value: item.min_spend || 0,
        max_discount_amount: item.discount_value,
        usage_limit: item.max_uses,
        usage_count: item.current_uses,
        status: item.is_active ? 'active' : 'inactive',
      })) as Promotion[];
    },
  });

  const createPromotionMutation = useMutation({
    mutationFn: async (promotionData: typeof formData) => {
      const { data, error } = await supabase
        .from("promotions")
        .insert([{
          restaurant_id: restaurantId,
          name: promotionData.title,
          code: promotionData.promo_code,
          description: promotionData.description,
          discount_type: promotionData.discount_type,
          discount_value: promotionData.discount_value,
          max_uses: promotionData.usage_limit,
          current_uses: 0,
          start_date: promotionData.start_date.toISOString(),
          end_date: promotionData.end_date.toISOString(),
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", restaurantId] });
      toast({ title: "Promotion created successfully!" });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error creating promotion",
        description: (error as any).message,
        variant: "destructive",
      });
    },
  });

  const updatePromotionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Promotion> }) => {
      const { data, error } = await supabase
        .from("promotions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", restaurantId] });
      toast({ title: "Promotion updated successfully!" });
    },
  });

  const deletePromotionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("promotions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", restaurantId] });
      toast({ title: "Promotion deleted successfully!" });
    },
  });

  const generatePromoCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, promo_code: result }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      promo_code: "",
      min_order_value: 0,
      usage_limit: 100,
      start_date: new Date(),
      end_date: new Date(),
    });
    setEditingPromotion(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPromotion) {
      updatePromotionMutation.mutate({
        id: editingPromotion.id,
        updates: {
          title: formData.title,
          description: formData.description,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          promo_code: formData.promo_code,
          min_order_value: formData.min_order_value,
          usage_limit: formData.usage_limit,
          start_date: formData.start_date.toISOString(),
          end_date: formData.end_date.toISOString(),
        },
      });
    } else {
      createPromotionMutation.mutate(formData);
    }
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Promo code copied to clipboard!" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse h-48 bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Promotions & Discounts
          </h2>
          <p className="text-muted-foreground">
            Create and manage promotional offers to attract customers
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? "Edit Promotion" : "Create New Promotion"}
              </DialogTitle>
              <DialogDescription>
                Set up a promotional offer to boost sales and attract customers
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Promotion Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Summer Special 20% Off"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: DiscountType) => setFormData(prev => ({ ...prev, discount_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Off</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the promotion details..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    Discount Value {formData.discount_type === "percentage" ? "(%)" : "($)"}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                    placeholder={formData.discount_type === "percentage" ? "20" : "5.00"}
                    min="0"
                    step={formData.discount_type === "percentage" ? "1" : "0.01"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="promo_code">Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo_code"
                      value={formData.promo_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, promo_code: e.target.value.toUpperCase() }))}
                      placeholder="SUMMER20"
                    />
                    <Button type="button" variant="outline" onClick={generatePromoCode}>
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_order_value">Minimum Order ($)</Label>
                  <Input
                    id="min_order_value"
                    type="number"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_order_value: parseFloat(e.target.value) || 0 }))}
                    placeholder="25.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Maximum Uses</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: parseInt(e.target.value) || 0 }))}
                    placeholder="100"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <DatePicker
                    date={formData.start_date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <DatePicker
                    date={formData.end_date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, end_date: date }))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPromotionMutation.isPending || updatePromotionMutation.isPending}
                >
                  {editingPromotion ? "Update Promotion" : "Create Promotion"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {promotions?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No promotions yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first promotion to start attracting more customers
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Promotion
              </Button>
            </CardContent>
          </Card>
        ) : (
          promotions?.map((promotion) => (
            <Card key={promotion.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {promotion.discount_type === "percentage" ? (
                        <Percent className="h-5 w-5" />
                      ) : (
                        <DollarSign className="h-5 w-5" />
                      )}
                      {promotion.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {promotion.description}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(promotion.status)}>
                      {promotion.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const promotionToEdit: Promotion = {
                          ...promotion,
                          discount_type: promotion.discount_type as DiscountType,
                          status: promotion.status as PromotionStatus
                        };
                        setEditingPromotion(promotionToEdit);
                        setFormData({
                          title: promotion.title,
                          description: promotion.description || "",
                          discount_type: promotion.discount_type as DiscountType,
                          discount_value: promotion.discount_value,
                          promo_code: promotion.promo_code || "",
                          min_order_value: promotion.min_order_value,
                          usage_limit: promotion.usage_limit || 100,
                          start_date: new Date(promotion.start_date),
                          end_date: new Date(promotion.end_date),
                        });
                        setIsCreateDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePromotionMutation.mutate(promotion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {promotion.discount_type === "percentage" 
                        ? `${promotion.discount_value}%`
                        : `$${promotion.discount_value}`
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">Discount</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {promotion.usage_count || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Used</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {promotion.usage_limit || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Max Uses</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      ${promotion.min_order_value}
                    </div>
                    <div className="text-sm text-muted-foreground">Min Order</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {promotion.promo_code && (
                      <>
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {promotion.promo_code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyPromoCode(promotion.promo_code!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(promotion.start_date), "MMM d")} - {format(new Date(promotion.end_date), "MMM d, yyyy")}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={promotion.status === "active" ? "outline" : "default"}
                    onClick={() => updatePromotionMutation.mutate({
                      id: promotion.id,
                      updates: { status: promotion.status === "active" ? "inactive" : "active" }
                    })}
                  >
                    {promotion.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedPromotionForQr(promotion)}
                  >
                    <QrCode className="h-3 w-3 mr-1" />
                    QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedPromotionForQr} onOpenChange={(open) => !open && setSelectedPromotionForQr(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Promotion QR Code</DialogTitle>
            <DialogDescription>
              Customers can scan this code to redeem the promotion.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              {selectedPromotionForQr && (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedPromotionForQr.promo_code || selectedPromotionForQr.id)}`}
                  alt="Promotion QR Code"
                  className="w-48 h-48"
                />
              )}
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{selectedPromotionForQr?.title}</p>
              <p className="text-sm text-muted-foreground font-mono">
                Code: {selectedPromotionForQr?.promo_code || "N/A"}
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (selectedPromotionForQr) {
                  const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(selectedPromotionForQr.promo_code || selectedPromotionForQr.id)}`;
                  window.open(url, '_blank');
                }
              }}
            >
              Download QR Code
            </Button>
            <Button type="button" variant="outline" onClick={() => setSelectedPromotionForQr(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
