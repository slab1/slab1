
import { authApi } from './auth';
import { profileApi } from './profile';
import restaurantApi from './restaurant/index';
import { locationApi } from './location';
import { tableApi } from './table';
import { menuCategoryApi } from './menuCategory';
import { menuItemApi } from './menuItem';
import { reservationApi } from './reservation';
import { userRoleApi } from './userRole';
import { roleApi } from './role';
import { paymentApi } from './payment';
import { loyaltyApi } from './loyalty';
import { reviewsApi } from './reviews';
import { waitlistApi } from './waitlist';
import { recurringReservationApi } from './recurringReservation';
import { chefBookingApi } from './chefBooking';
import { stockTransactionsApi, StockTransaction } from './stockTransactions';
import { subscriptionApi } from './subscription';
import { reservationOrderApi } from './reservationOrder';

export * from './types';

export { stockTransactionsApi, subscriptionApi, reservationOrderApi };
export type { StockTransaction };

export default {
  auth: authApi,
  profile: profileApi,
  restaurant: restaurantApi,
  location: locationApi,
  table: tableApi,
  menuCategory: menuCategoryApi,
  menuItem: menuItemApi,
  reservation: reservationApi,
  userRole: userRoleApi,
  role: roleApi,
  payment: paymentApi,
  loyalty: loyaltyApi,
  reviews: reviewsApi,
  waitlist: waitlistApi,
  recurringReservation: recurringReservationApi,
  chefBooking: chefBookingApi,
  subscription: subscriptionApi,
  reservationOrder: reservationOrderApi
};
