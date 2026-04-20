import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationOrderApi, ReservationOrderItem } from "@/api/reservationOrder";
import { toast } from "sonner";

export function useReservationOrders(reservationId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["reservation-orders", reservationId],
    queryFn: () => reservationOrderApi.getByReservationId(reservationId),
    enabled: !!reservationId,
  });

  const addItemsMutation = useMutation({
    mutationFn: (items: Omit<ReservationOrderItem, 'id' | 'created_at' | 'updated_at'>[]) => 
      reservationOrderApi.addItems(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservation-orders", reservationId] });
      toast.success("Items added to order");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add items");
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: string) => reservationOrderApi.removeItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservation-orders", reservationId] });
      toast.success("Item removed from order");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove item");
    }
  });

  return {
    ...query,
    addItems: addItemsMutation.mutateAsync,
    isAdding: addItemsMutation.isPending,
    removeItem: removeItemMutation.mutateAsync,
    isRemoving: removeItemMutation.isPending,
  };
}
