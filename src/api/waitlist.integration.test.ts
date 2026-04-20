import { waitlistApi } from './waitlist';

// NOTE: This is a minimal integration test. In a real project, use a test runner and mock Supabase or use a test DB.

describe('waitlistApi integration', () => {
  it('runs waitlist integration tests', async () => {
    // 1. Create a new waitlist entry
    const entry = await waitlistApi.create({
      restaurant_id: 'test-restaurant',
      party_size: 2,
      status: 'waiting',
      quoted_wait_time: 15,
      notification_sent: false,
      notes: 'Test entry',
    });
    console.log('Create:', entry);

    // 2. Get all waitlist entries for the restaurant
    const all = await waitlistApi.getByRestaurantId('test-restaurant');
    console.log('GetByRestaurantId:', all);

    // 3. Update status
    if (entry?.id) {
      const updated = await waitlistApi.updateStatus(entry.id, 'seated');
      console.log('UpdateStatus:', updated);
    }

    // 4. Delete
    if (entry?.id) {
      const deleted = await waitlistApi.delete(entry.id);
      console.log('Delete:', deleted);
    }
  });
});
