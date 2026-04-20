import { notificationsApi } from './notifications';

describe('notificationsApi integration', () => {
  it('runs notifications integration tests', async () => {
    // 1. Create a notification
    const notification = await notificationsApi.createNotification({
      user_id: 'test-user',
      title: 'Test Notification',
      message: 'This is a test notification',
      read: false,
      type: 'reservation_reminder',
      data: null,
    });
    console.log('CreateNotification:', notification);

    // 2. Get notifications for user
    const all = await notificationsApi.getUserNotifications('test-user');
    console.log('GetUserNotifications:', all);

    // 3. Mark as read
    if (notification?.id) {
      const marked = await notificationsApi.markAsRead(notification.id);
      console.log('MarkAsRead:', marked);
    }
  });
});
