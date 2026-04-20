import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/inventory";

export function useInventory(restaurantId: string) {
  return useQuery({
    queryKey: ["inventory", restaurantId],
    queryFn: () => inventoryApi.getAll(restaurantId),
    enabled: !!restaurantId,
  });
}
