import { useQuery } from "@tanstack/react-query";
import { reservationApi } from "@/api/reservation";
import { menuItemApi } from "@/api/menuItem";
import { restaurantPaymentApi } from "@/api/restaurant/payment";
import { reviewsApi } from "@/api/reviews";
import { Restaurant, Reservation } from "@/api/types";
import { isApiError } from "@/api/utils";

export function useRestaurantOverview(restaurant: Restaurant | null) {
  return useQuery({
    queryKey: ["restaurant-overview", restaurant?.id],
    queryFn: async () => {
      if (!restaurant) return null;

      const [reservationsResult, menuItems, revenueMetrics, reviews] = await Promise.all([
        reservationApi.getByRestaurantId(restaurant.id),
        menuItemApi.getByRestaurantId(restaurant.id),
        restaurantPaymentApi.getRevenueAnalytics(restaurant.id, "all"),
        reviewsApi.getByRestaurantId(restaurant.id)
      ]);

      // Handle potential API error response
      const reservations: Reservation[] = isApiError(reservationsResult) ? [] : reservationsResult;

      return {
        reservations,
        stats: {
          reservations: reservations.length,
          pendingReservations: reservations.filter(r => r.status === 'pending').length,
          menuItems: menuItems.length,
          revenue: revenueMetrics?.totalRevenue || 0,
          rating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) : null,
          totalLocations: restaurant.locations?.length || 0
        }
      };
    },
    enabled: !!restaurant?.id,
  });
}
