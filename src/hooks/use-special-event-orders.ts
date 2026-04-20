import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { specialEventApi } from "@/api/specialEvent";
import { toast } from "sonner";
import { SpecialEventOrderItem } from "@/api/types";

export function useSpecialEventOrders(eventId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["special-event-orders", eventId],
    queryFn: () => specialEventApi.getOrderItems(eventId),
    enabled: !!eventId,
  });

  const addItemsMutation = useMutation({
    mutationFn: (items: any[]) => specialEventApi.addOrderItems(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["special-event-orders", eventId] });
      toast.success("Items added to event order");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add items");
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: string) => specialEventApi.removeOrderItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["special-event-orders", eventId] });
      toast.success("Item removed from event order");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove item");
    }
  });

  return {
    ...query,
    orderItems: query.data as unknown as SpecialEventOrderItem[] || [],
    addItems: addItemsMutation.mutateAsync,
    isAdding: addItemsMutation.isPending,
    removeItem: removeItemMutation.mutateAsync,
    isRemoving: removeItemMutation.isPending,
  };
}
