
import { getReservationsByUserId, getReservationsByRestaurantId, getReservationById, getAllReservations, getReservationsByManagerRestaurants } from './queries';
import { createReservation, updateReservation, cancelReservation, deleteReservation, updateReservationStatus } from './mutations';
import { subscribeToReservationStatusChanges } from './subscriptions';

export const reservationApi = {
  getByUserId: getReservationsByUserId,
  getByRestaurantId: getReservationsByRestaurantId,
  getById: getReservationById,
  getAll: getAllReservations,
  getByManagerRestaurants: getReservationsByManagerRestaurants,
  create: createReservation,
  update: updateReservation,
  cancel: cancelReservation,
  delete: deleteReservation,
  updateStatus: updateReservationStatus,
  subscribeToStatusChanges: subscribeToReservationStatusChanges
};
