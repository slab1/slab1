import { useQuery } from "@tanstack/react-query";
import { menuItemApi } from "@/api/menuItem";
import { MenuItem } from "@/api/types";

export function useMenuItems(restaurantId: string) {
  return useQuery({
    queryKey: ["menu-items", restaurantId],
    queryFn: () => menuItemApi.getByRestaurantId(restaurantId),
    enabled: !!restaurantId,
  });
}

export function useMenuItemIngredients(menuItemId: string) {
  return useQuery({
    queryKey: ["menu-item-ingredients", menuItemId],
    queryFn: () => menuItemApi.getIngredients(menuItemId),
    enabled: !!menuItemId,
  });
}

export function useAllMenuItemsIngredients(menuItems: MenuItem[]) {
  return useQuery({
    queryKey: ["all-menu-items-ingredients", menuItems.map(m => m.id)],
    queryFn: async () => {
      const ingredientsMap: Record<string, any[]> = {};
      await Promise.all(menuItems.map(async (item) => {
        const ingredients = await menuItemApi.getIngredients(item.id);
        ingredientsMap[item.id] = ingredients;
      }));
      return ingredientsMap;
    },
    enabled: menuItems.length > 0,
  });
}
