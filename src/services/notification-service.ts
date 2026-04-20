import { supabase } from '@/integrations/supabase/client';
import { RealtimeNotificationType, Reservation } from '@/api/types';

// Email/SMS notification service
export class NotificationService {

  // Send reservation related email (confirmation, cancellation, etc.)
  static async sendReservationEmail(reservationData: Reservation, userEmail: string, restaurantName: string, type: 'confirmed' | 'cancelled' | 'updated' = 'confirmed') {
    try {
      // Check user preferences for email
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('email_enabled, booking_confirmations')
        .eq('user_id', reservationData.user_id)
        .single();

      if (preferences) {
        if (!preferences.email_enabled) {
          console.log(`Email notifications disabled for user ${reservationData.user_id}. Skipping email.`);
          return { success: true, message: "Email notifications disabled by user" };
        }
        if (!preferences.booking_confirmations) {
          console.log(`Booking confirmations via email disabled for user ${reservationData.user_id}. Skipping email.`);
          return { success: true, message: "Booking confirmations disabled by user" };
        }
      }

      const subjectMap = {
        confirmed: `Reservation Confirmed - ${restaurantName}`,
        cancelled: `Reservation Cancelled - ${restaurantName}`,
        updated: `Reservation Updated - ${restaurantName}`
      };

      const emailData = {
        to: userEmail,
        subject: subjectMap[type],
        template: type === 'cancelled' ? 'booking-cancellation' : 'booking-confirmation',
        data: {
          restaurantName,
          status: type,
          reservationDate: new Date(reservationData.reservation_date).toLocaleDateString(),
          reservationTime: new Date(reservationData.reservation_time).toLocaleTimeString(),
          partySize: reservationData.guest_count,
          reservationId: reservationData.id,
          specialRequests: reservationData.special_requests || 'None'
        }
      };

      console.log(`📧 Would send ${type} email:`, emailData);

      // Store email notification in database
      await (supabase.from('email_notifications') as any).insert({
        user_id: reservationData.user_id,
        type: `booking_${type}`,
        recipient_email: userEmail,
        subject: subjectMap[type],
        email_data: emailData,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error(`Failed to send reservation ${type} email:`, error);
      return { success: false, error };
    }
  }

  // Send reservation related SMS
  static async sendReservationSMS(reservationData: Reservation, userPhone: string, restaurantName: string, type: 'confirmed' | 'cancelled' | 'updated' = 'confirmed') {
    try {
      // Check user preferences for SMS
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('sms_enabled, booking_confirmations')
        .eq('user_id', reservationData.user_id)
        .single();

      if (preferences) {
        if (!preferences.sms_enabled) {
          console.log(`SMS notifications disabled for user ${reservationData.user_id}. Skipping SMS.`);
          return { success: true, message: "SMS notifications disabled by user" };
        }
        if (!preferences.booking_confirmations) {
          console.log(`Booking confirmations via SMS disabled for user ${reservationData.user_id}. Skipping SMS.`);
          return { success: true, message: "Booking confirmations disabled by user" };
        }
      }

      const statusIcon = type === 'confirmed' ? '✅' : type === 'cancelled' ? '❌' : 'ℹ️';
      const statusText = type === 'confirmed' ? 'confirmed' : type === 'cancelled' ? 'cancelled' : 'updated';

      const smsData = {
        to: userPhone,
        message: `${statusIcon} Reservation ${statusText} at ${restaurantName}!\n📅 ${new Date(reservationData.reservation_date).toLocaleDateString()}\n🕐 ${new Date(reservationData.reservation_time).toLocaleTimeString()}\n👥 ${reservationData.guest_count} people\nID: ${reservationData.id.slice(0, 8)}`
      };

      console.log(`📱 Would send ${type} SMS:`, smsData);

      // Store SMS notification in database
      await supabase.from('sms_notifications').insert({
        user_id: reservationData.user_id,
        type: `booking_${type}`,
        phone_number: userPhone,
        message: smsData.message,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error(`Failed to send reservation ${type} SMS:`, error);
      return { success: false, error };
    }
  }

  // Send push notification via Supabase Realtime/Edge Function
  static async sendPushNotification(userId: string, title: string, body: string, data?: Record<string, any>) {
    try {
      // Check user preferences for push
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('push_enabled, booking_confirmations, reservation_reminders, system_notifications, special_offers')
        .eq('user_id', userId)
        .single();

      if (preferences && !preferences.push_enabled) {
        console.log(`Push notifications disabled for user ${userId}. Skipping push.`);
        return { success: true, message: "Push notifications disabled by user" };
      }

      // Check specific notification type preference if provided in data
      if (preferences && data?.type) {
        const type = data.type;
        if ((type === 'new_booking' || type === 'reservation_confirmed' || type === 'reservation_cancelled') && !preferences.booking_confirmations) {
          return { success: true, message: "Booking notifications disabled by user" };
        }
        if (type === 'reservation_reminder' && !preferences.reservation_reminders) {
          return { success: true, message: "Reservation reminders disabled by user" };
        }
        if ((type === 'system_announcement' || type === 'staff_assigned') && !preferences.system_notifications) {
          return { success: true, message: "System notifications disabled by user" };
        }
        if (type === 'special_offer' && !preferences.special_offers) {
          return { success: true, message: "Special offers disabled by user" };
        }
      }

      // Get user's push subscriptions
      const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', userId);

      if (error || !subscriptions?.length) {
        console.log('No push subscriptions found for user:', userId);
        return { success: false, reason: 'no_subscriptions' };
      }

      // In production, this would send to a push service like Firebase Cloud Messaging
      // For now, we'll use the browser Notification API if available
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data
        });

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        return { success: true };
      }

      return { success: false, reason: 'permission_denied' };
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return { success: false, error };
    }
  }

  // Send admin notification for new booking
  static async notifyAdminsOfNewBooking(reservationData: Reservation, restaurantName: string) {
    try {
      // Get all admin users from user_roles table joined with profiles
      const { data: adminRoles, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles:profiles (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .in('role', ['system_admin', 'superadmin', 'restaurant_owner']);

      if (error || !adminRoles?.length) {
        console.log('No admin users found or error:', error);
        return;
      }

      // Filter and map to get unique admin users with profiles
      const adminUsers = adminRoles
        .filter(role => role.profiles)
        .map(role => role.profiles as any);

      if (!adminUsers.length) {
        console.log('No admin profiles found');
        return;
      }

      // Send notifications to all admins
      const notifications = adminUsers.map(admin => ({
        user_id: admin.id,
        type: 'new_booking',
        title: 'New Reservation Received',
        message: `New booking at ${restaurantName} for ${new Date(reservationData.reservation_date).toLocaleDateString()} at ${new Date(reservationData.reservation_time).toLocaleTimeString()}. Party of ${reservationData.guest_count}.`,
        data: reservationData,
        read: false,
        created_at: new Date().toISOString()
      }));

      await (supabase.from('notifications') as any).insert(notifications);

      // Send push notifications to admins
      for (const admin of adminUsers) {
        await this.sendPushNotification(
          admin.id,
          'New Reservation Received',
          `Booking at ${restaurantName} - Party of ${reservationData.guest_count}`,
          reservationData
        );
      }

      return { success: true, notifiedAdmins: adminUsers.length };
    } catch (error) {
      console.error('Failed to notify admins:', error);
      return { success: false, error };
    }
  }

  // Send reminder notifications (for upcoming reservations)
  static async sendReservationReminders() {
    try {
      // Get reservations happening in the next 2 hours
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      const { data: upcomingReservations, error } = await supabase
        .from('reservations')
        .select(`
          *,
          restaurant:restaurants!fk_reservations_restaurant (name),
          user:profiles!fk_reservations_user_profile (email, phone_number)
        `)
        .eq('status', 'confirmed')
        .gte('reservation_date', now.toISOString().split('T')[0])
        .lte('reservation_time', twoHoursFromNow.toISOString())
        .gt('reservation_time', now.toISOString());

      if (error || !upcomingReservations?.length) {
        return { success: true, remindersSent: 0 };
      }

      let remindersSent = 0;

      for (const reservation of upcomingReservations) {
        // Check user preferences for reminders
        const { data: preferences } = await supabase
          .from('notification_preferences')
          .select('reservation_reminders, email_enabled, sms_enabled, push_enabled')
          .eq('user_id', reservation.user_id)
          .single();

        if (preferences && !preferences.reservation_reminders) {
          console.log(`Reservation reminders disabled for user ${reservation.user_id}. Skipping reminder.`);
          continue;
        }

        // Check if reminder already sent (you'd typically have a reminder_sent flag)
        const reminderKey = `reminder_${reservation.id}`;
        const reminderSent = localStorage.getItem(reminderKey);

        if (!reminderSent) {
          // Send in-app notification
          await (supabase.from('notifications') as any).insert([{
            user_id: reservation.user_id,
            type: 'reservation_reminder',
            title: 'Reservation Reminder',
            message: `Your reservation at ${reservation.restaurant?.name} is in 2 hours. Don't forget to arrive on time!`,
            data: reservation as any,
            read: false,
            created_at: new Date().toISOString()
          }]);

          // Send push notification if enabled
          if (!preferences || preferences.push_enabled) {
            await this.sendPushNotification(
              reservation.user_id,
              'Reservation Reminder',
              `Your booking at ${reservation.restaurant?.name} is coming up in 2 hours`,
              { ...reservation, type: 'reservation_reminder' }
            );
          }

          // Mark reminder as sent
          localStorage.setItem(reminderKey, 'sent');
          remindersSent++;
        }
      }

      return { success: true, remindersSent };
    } catch (error) {
      console.error('Failed to send reservation reminders:', error);
      return { success: false, error };
    }
  }

  // Send booking notifications to customer and admins
  static async sendBookingNotifications(reservationData: Reservation, restaurantName: string) {
    try {
      // Get user profile for contact info
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email, phone_number')
        .eq('id', reservationData.user_id)
        .single();

      const results = await Promise.allSettled([
        // Send email confirmation
        userProfile?.email ? this.sendReservationEmail(reservationData, userProfile.email, restaurantName, 'confirmed') : Promise.resolve({ success: false, reason: 'no_email' }),

        // Send SMS confirmation
        userProfile?.phone_number ? this.sendReservationSMS(reservationData, userProfile.phone_number, restaurantName, 'confirmed') : Promise.resolve({ success: false, reason: 'no_phone' }),

        // Send push notification
        this.sendPushNotification(reservationData.user_id, 'Reservation Confirmed!', `Your booking at ${restaurantName} has been confirmed.`, reservationData),

        // Notify admins
        this.notifyAdminsOfNewBooking(reservationData, restaurantName)
      ]);

      const summary = {
        emailSent: results[0].status === 'fulfilled' && results[0].value.success,
        smsSent: results[1].status === 'fulfilled' && results[1].value.success,
        pushSent: results[2].status === 'fulfilled' && results[2].value.success,
        adminsNotified: results[3].status === 'fulfilled' ? results[3].value.notifiedAdmins || 0 : 0
      };

      console.log('📤 Booking notifications summary:', summary);

      return { success: true, summary };
    } catch (error) {
      console.error('Failed to send booking notifications:', error);
      return { success: false, error };
    }
  }

  // Send status update notification
  static async notifyReservationStatusChange(reservationId: string, newStatus: string) {
    try {
      // Get reservation data with restaurant and user info
      const { data: reservation, error } = await supabase
        .from('reservations')
        .select(`
          *,
          restaurant:restaurants!fk_reservations_restaurant (name),
          user:profiles!fk_reservations_user_profile (email, phone_number)
        `)
        .eq('id', reservationId)
        .single();

      if (error || !reservation) {
        console.error('Reservation not found for status update notification:', error);
        return { success: false, error: 'Reservation not found' };
      }

      const restaurantName = reservation.restaurant?.name || 'the restaurant';
      let title = '';
      let message = '';
      let type: RealtimeNotificationType = 'system_announcement';

      switch (newStatus) {
        case 'confirmed':
          title = 'Reservation Confirmed';
          message = `Your reservation at ${restaurantName} has been confirmed.`;
          type = 'reservation_confirmed';
          break;
        case 'cancelled':
          title = 'Reservation Cancelled';
          message = `Your reservation at ${restaurantName} has been cancelled.`;
          type = 'reservation_cancelled';
          break;
        case 'seated':
          title = 'Table Ready';
          message = `Your table is ready at ${restaurantName}. Enjoy your meal!`;
          type = 'table_ready';
          break;
        case 'no_show':
          title = 'Reservation Update';
          message = `You were marked as a no-show for your reservation at ${restaurantName}.`;
          type = 'reservation_cancelled';
          break;
        default:
          return { success: true, message: 'No notification needed for this status' };
      }

      // 1. Send in-app notification
      await (supabase.from('notifications') as any).insert([{
        user_id: reservation.user_id,
        type,
        title,
        message,
        data: reservation as any,
        read: false,
        created_at: new Date().toISOString()
      }]);

      // 2. Send push notification
      await this.sendPushNotification(reservation.user_id, title, message, { ...(reservation as any), type });

      // 3. Send email/SMS for critical updates if enabled
      if (newStatus === 'confirmed' || newStatus === 'cancelled') {
        const emailType = newStatus as 'confirmed' | 'cancelled';
        if (reservation.user?.email) {
          await this.sendReservationEmail(reservation as any, reservation.user.email, restaurantName, emailType);
        }
        if (reservation.user?.phone_number) {
          await this.sendReservationSMS(reservation as any, reservation.user.phone_number, restaurantName, emailType);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to send status update notification:', error);
      return { success: false, error };
    }
  }

  // Send special event status update notification
  static async notifySpecialEventStatusChange(eventId: string, newStatus: string) {
    try {
      // Get event data with restaurant and user info
      const { data: event, error } = await supabase
        .from('special_events')
        .select(`
          *,
          restaurant:restaurants (name)
        `)
        .eq('id', eventId)
        .single();

      if (error || !event) {
        console.error('Special event not found for status update notification:', error);
        return { success: false, error: 'Special event not found' };
      }

      const restaurantName = event.restaurant?.name || 'the restaurant';
      let title = '';
      let message = '';
      let type: RealtimeNotificationType = 'system_announcement';

      switch (newStatus) {
        case 'confirmed':
          title = 'Special Event Confirmed';
          message = `Your special event request at ${restaurantName} has been confirmed.`;
          type = 'reservation_confirmed';
          break;
        case 'cancelled':
          title = 'Special Event Cancelled';
          message = `Your special event request at ${restaurantName} has been cancelled.`;
          type = 'reservation_cancelled';
          break;
        default:
          return { success: true, message: 'No notification needed for this status' };
      }

      // 1. Send in-app notification (to the requester if user_id exists)
      if (event.user_id) {
        await (supabase.from('notifications') as any).insert([{
          user_id: event.user_id,
          type,
          title,
          message,
          data: event as any,
          read: false,
          created_at: new Date().toISOString()
        }]);

        // 2. Send push notification
        await this.sendPushNotification(event.user_id, title, message, { ...(event as any), type });
      }

      // 3. Send email for critical updates
      const eventContactEmail = (event as any).contact_email;
      if (eventContactEmail && (newStatus === 'confirmed' || newStatus === 'cancelled')) {
        console.log(`📧 Would send special event email to ${eventContactEmail}:`, { title, message });
        
        // Store email notification in database
        await (supabase.from('email_notifications') as any).insert([{
          user_id: event.user_id || null,
          type: 'special_event_update',
          recipient_email: eventContactEmail,
          subject: title,
          email_data: { title, message, eventDate: event.event_date, restaurantName },
          status: 'pending',
          created_at: new Date().toISOString()
        }]);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to send special event status update notification:', error);
      return { success: false, error };
    }
  }

  // Send waitlist status update notification
  static async notifyWaitlistStatusChange(entryId: string, newStatus: string) {
    try {
      // Get waitlist entry data with restaurant info (using correct table name)
      const { data: entry, error } = await supabase
        .from('waitlist')
        .select(`
          *,
          restaurant:restaurants (name)
        `)
        .eq('id', entryId)
        .single();

      if (error || !entry) {
        console.error('Waitlist entry not found for status update notification:', error);
        return { success: false, error: 'Waitlist entry not found' };
      }

      const restaurantName = entry.restaurant?.name || 'the restaurant';
      let title = '';
      let message = '';
      let type: RealtimeNotificationType = 'system_announcement';

      switch (newStatus) {
        case 'seated':
          title = 'Table Ready';
          message = `Your table is ready at ${restaurantName}. Please head to the host stand.`;
          type = 'table_ready';
          break;
        case 'cancelled':
          title = 'Waitlist Update';
          message = `Your waitlist entry at ${restaurantName} has been cancelled.`;
          type = 'reservation_cancelled';
          break;
        default:
          return { success: true, message: 'No notification needed for this status' };
      }

      // 1. Send in-app notification (if user_id exists)
      const entryUserId = entry.user_id;
      if (entryUserId) {
        await supabase.from('notifications').insert([{
          user_id: entryUserId,
          type,
          title,
          message,
          data: entry as any,
          read: false,
          created_at: new Date().toISOString()
        }]);

        // 2. Send push notification
        await this.sendPushNotification(entryUserId, title, message, { ...entry, type });
      }

      // 3. Send SMS for waitlist updates (crucial for waitlist)
      if (entry.phone_number) {
        console.log(`📱 Would send waitlist SMS to ${entry.phone_number}:`, { title, message });
        
        // Store SMS notification in database
        await supabase.from('sms_notifications').insert({
          user_id: entryUserId || null,
          type: 'waitlist_update',
          phone_number: entry.phone_number,
          message: `${title}: ${message}`,
          status: 'pending',
          created_at: new Date().toISOString()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to send waitlist status update notification:', error);
      return { success: false, error };
    }
  }

  // Send loyalty points notification
  static async notifyLoyaltyPointsEarned(userId: string, points: number, reason: string) {
    try {
      const title = 'Loyalty Points Earned';
      const message = `You've earned ${points} loyalty points for: ${reason}`;
      const type: RealtimeNotificationType = 'loyalty_points_earned';

      // 1. Send in-app notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type,
        title,
        message,
        data: { points, reason },
        read: false,
        created_at: new Date().toISOString()
      });

      // 2. Send push notification
      await this.sendPushNotification(userId, title, message, { points, reason, type });

      return { success: true };
    } catch (error) {
      console.error('Failed to send loyalty points notification:', error);
      return { success: false, error };
    }
  }

  // Send tier upgrade notification
  static async notifyLoyaltyTierUpgraded(userId: string, newTier: string) {
    try {
      const title = 'Tier Upgraded!';
      const message = `Congratulations! You've been upgraded to the ${newTier} tier. Enjoy your new benefits!`;
      const type: RealtimeNotificationType = 'loyalty_tier_upgraded';

      // 1. Send in-app notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type,
        title,
        message,
        data: { newTier },
        read: false,
        created_at: new Date().toISOString()
      });

      // 2. Send push notification
      await this.sendPushNotification(userId, title, message, { newTier, type });

      return { success: true };
    } catch (error) {
      console.error('Failed to send tier upgrade notification:', error);
      return { success: false, error };
    }
  }
}
