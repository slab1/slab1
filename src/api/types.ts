export interface SpecialEvent {
  id: string;
  restaurant_id: string;
  location_id?: string;
  user_id?: string;
  event_type: string;
  event_date: string;
  event_time: string;
  guest_count: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  event_details?: string;
  dietary_requirements?: string;
  special_services: {
    privateSpace: boolean;
    customMenu: boolean;
    audioVisual: boolean;
    decorations: boolean;
    entertainment: boolean;
  };
  deposit_amount: number;
  quote_estimate?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'unpaid' | 'deposit_paid' | 'fully_paid';
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SpecialEventOrderItem {
  id: string;
  special_event_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  created_at: string;
  menu_item?: MenuItem;
}

// Loyalty Programs types
export interface LoyaltyProgram {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  points_per_visit?: number;
  points_per_spend?: number;
  points_per_dollar?: number;
  reward_tiers?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  restaurant?: {
    name: string;
  };
}
// Customer Preferences types
export interface CustomerPreferences {
  id: string;
  user_id: string;
  seating_preference?: string[];
  dietary_restrictions?: string[];
  special_occasions?: Record<string, any>;
  favorite_cuisines?: string[];
  created_at: string;
  updated_at: string;
}
// Table Combinations types
export interface TableCombination {
  id: string;
  restaurant_location_id: string;
  name: string;
  table_ids: string[];
  min_party_size: number;
  max_party_size: number;
  is_active: boolean;
  is_preferred?: boolean;
  priority?: number;
  created_at: string;
  updated_at?: string;
  tables?: Table[];
}
// Availability Rules types
export interface AvailabilityRule {
  id: string;
  restaurant_id: string;
  rule_type: 'blackout' | 'special_hours' | 'capacity_modifier';
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  modification: Record<string, any>;
  created_at: string;
}
// Restaurant Settings types
export interface RestaurantSettings {
  restaurant_id: string;
  booking_window_days: number;
  min_advance_booking_hours: number;
  max_party_size: number;
  default_seating_duration: number;
  auto_confirm_limit?: number;
  auto_confirm_bookings: boolean;
  created_at?: string;
  updated_at?: string;
  require_deposit?: boolean;
  deposit_amount?: number;
  deposit_type?: 'flat' | 'percentage';
  cancellation_policy?: Record<string, any>;
}

export interface WaitlistSettings {
  id: string;
  restaurant_id: string;
  max_party_size: number;
  notify_staff: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface AppearanceSettings {
  id: string;
  restaurant_id: string;
  theme: ThemeSettings;
  created_at?: string;
  updated_at?: string;
}

export type RealtimeNotificationType = 
  | 'reservation_confirmed' 
  | 'reservation_cancelled' 
  | 'table_ready' 
  | 'special_offer' 
  | 'review_response' 
  | 'new_booking' 
  | 'reservation_reminder' 
  | 'system_announcement'
  | 'staff_assigned'
  | 'schedule_update'
  | 'shift_reminder'
  | 'staff_invitation'
  | 'loyalty_points_earned'
  | 'loyalty_tier_upgraded';

export interface Notification {
  id: string;
  user_id: string;
  type: RealtimeNotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  read_at?: string;
  created_at: string;
  expires_at?: string;
}

// Booking Audit Log types
export interface BookingAuditLog {
  id: string;
  booking_id: string;
  changed_by?: string;
  change_type: 'created' | 'updated' | 'cancelled' | 'seated' | 'completed';
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  changed_at: string;
}
// Legacy notification types (keeping for compatibility)
export interface LegacyNotification {
  id: string;
  user_id: string;
  type: 'booking_confirmation' | 'reminder' | 'cancellation' | 'waitlist_update' | 'review_request';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}
// Type definitions for our models
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

// User roles and types - aligned with restaurant booking system
export type UserRole = 
  | 'customer' 
  | 'restaurant_staff' 
  | 'inventory_manager'
  | 'restaurant_manager' 
  | 'restaurant_owner' 
  | 'admin'
  | 'system_admin' 
  | 'superadmin';

export type RoleGroup = 'admin' | 'customer' | 'partners' | 'restaurant_staff';

export type User = 'customer' | 'partner';

// Role group display names aligned with Supabase
export const ROLE_GROUP_DISPLAY: Record<RoleGroup, string> = {
  'admin': 'Administrator',
  'customer': 'Customer',
  'partners': 'Restaurant Owner',
  'restaurant_staff': 'Staff'
};

// Role hierarchy definitions aligned with Supabase role groupings
export const ROLE_HIERARCHY: Record<UserRole, { group: RoleGroup; level: number; description: string }> = {
  'superadmin': { group: 'admin', level: 100, description: 'Full system administrator with all permissions' },
  'system_admin': { group: 'admin', level: 90, description: 'System administrator with elevated permissions' },
  'admin': { group: 'admin', level: 85, description: 'Administrator with general management permissions' },
  'restaurant_owner': { group: 'partners', level: 80, description: 'Restaurant owner with management capabilities' },
  'restaurant_manager': { group: 'restaurant_staff', level: 70, description: 'Restaurant manager with staff oversight' },
  'inventory_manager': { group: 'restaurant_staff', level: 60, description: 'Inventory and supply chain management' },
  'restaurant_staff': { group: 'restaurant_staff', level: 50, description: 'General restaurant staff member' },
  'customer': { group: 'customer', level: 10, description: 'Regular customer with basic access' }
};

/**
 * Get the numeric level for a given role
 */
export const getRoleLevel = (role: UserRole): number => {
  return ROLE_HIERARCHY[role]?.level || 0;
};

/**
 * Map database role values to standardized UserRole types
 */
export const mapDbRoleToUserRole = (dbRole: string | null | undefined, fallback: UserRole = 'customer'): UserRole => {
  if (!dbRole) return fallback;
  
  const normalizedValue = dbRole.toLowerCase().trim();
  
  const roleMap: Record<string, UserRole> = {
    // Standardized values
    'superadmin': 'superadmin',
    'admin': 'superadmin',
    'administrator': 'superadmin',
    'system_admin': 'system_admin',
    'system admin': 'system_admin',
    'restaurant_owner': 'restaurant_owner',
    'restaurant owner': 'restaurant_owner',
    'partner': 'restaurant_owner',
    'restaurant_manager': 'restaurant_manager',
    'restaurant manager': 'restaurant_manager',
    'inventory_manager': 'inventory_manager',
    'inventory manager': 'inventory_manager',
    'restaurant_staff': 'restaurant_staff',
    'restaurant staff': 'restaurant_staff',
    'staff': 'restaurant_staff',
    'customer': 'customer',
  };
  
  return roleMap[normalizedValue] || fallback;
};

export interface RoleHierarchy {
  role: UserRole;
  group: RoleGroup;
  level: number;
  description: string;
}

// Standardized API error response type
export interface ApiErrorResponse {
  error: string;
}

// Updated to return proper error type instead of void
export type HandleApiErrorReturnType<T = null> = ApiErrorResponse;

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  address: string;
  avatar_url?: string;
  staff_role?: string;
  role?: string;
  employment_status?: 'active' | 'inactive' | 'terminated';
  hire_date?: string;
  termination_date?: string;
  created_at: string;
  updated_at: string;
  reservations?: Reservation[];
}

export interface Restaurant {
  id: string;
  name: string;
  slug?: string;
  cuisine: string;
  description?: string;
  price: string;
  image_url?: string;
  rating?: number;
  features?: string;
  opening_hours: Json;
  created_at?: string;
  updated_at: string;
  admin_id: string;
  status?: 'pending' | 'approved' | 'rejected';
  is_active?: boolean;
  chef_bio?: string;
  chef_name?: string;
  history?: string;
  social_links?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    website?: string;
  };
  testimonials?: {
    id: string;
    author: string;
    text: string;
    rating: number;
    date: string;
  }[];
  locations?: RestaurantLocation[];
  restaurant_locations?: RestaurantLocation[];
  menuCategories?: MenuCategory[];
  gallery?: RestaurantGalleryImage[];
  settings?: RestaurantSettings;
}

export interface RestaurantGalleryImage {
  id: string;
  restaurant_id: string;
  url: string;
  caption?: string;
  category?: 'food' | 'ambiance' | 'special_events' | 'other';
  created_at: string;
}

export interface RestaurantLocationAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface RestaurantLocation {
  id: string;
  restaurant_id: string;
  // Address can be a string or JSONB object
  address: string | RestaurantLocationAddress | Json;
  // These may be null if address is JSONB
  city?: string;
  state?: string;
  zip?: string;
  phone_number?: string;
  email?: string;
  contact_info?: Json;
  latitude?: number;
  longitude?: number;
  coordinates?: string | { latitude?: number; longitude?: number };
  is_primary?: boolean;
  timezone?: string;
  operating_hours?: Json;
  landmarks?: string[];
  parking_info?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  restaurant?: Restaurant;
  tables?: Table[];
  reservations?: Reservation[];
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  capacity: number;
  is_available: boolean;
  section?: string;
  created_at: string;
  updated_at: string;
  location?: RestaurantLocation;
  reservations?: Reservation[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id?: string;
  restaurant_id?: string;
  is_available: boolean;
  sort_order?: number;
  preparation_time?: number;
  dietary_tags?: string[];
  allergens?: string[];
  created_at: string;
  updated_at: string;
  category?: MenuCategory;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  restaurant_id?: string;
  is_active?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
  items?: MenuItem[];
  menu_items?: MenuItem[];
}

export interface Reservation {
  id: string;
  user_id?: string;
  restaurant_location_id?: string;
  restaurant_id?: string;
  table_id?: string;
  combination_id?: string;
  staff_id?: string;
  schedule_id?: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  status: string;
  special_requests?: string;
  contact_info?: Json;
  estimated_duration?: number;
  confirmed_at?: string;
  cancelled_at?: string;
  seated_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
  location?: RestaurantLocation;
  table?: Table;
  combination?: TableCombination;
  restaurant?: Restaurant;
  schedule?: StaffSchedule;
}

export interface ReservationInput {
  user_id?: string;
  restaurant_id?: string;
  restaurant_location_id?: string;
  table_id?: string;
  combination_id?: string;
  staff_id?: string;
  schedule_id?: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  special_requests?: string;
  status?: string;
  contact_info?: Json;
  estimated_duration?: number;
}

// Restaurant deletion log
export interface RestaurantDeletionLog {
  id: string;
  restaurant_id: string;
  reason: string;
  deleted_at: string;
  deleted_by?: string;
}

// Payment related types
export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  created_at: number;
}

export interface PartnershipPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  is_popular?: boolean;
}

// Loyalty related types - SINGLE DEFINITION (removed duplicate from lines 42-54)

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  points: number;
  lifetime_points: number;
  tier: string;
  created_at: string;
  updated_at: string;
  transaction_history?: LoyaltyTransaction[];
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description?: string;
  points_required: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  points_used: number;
  created_at: string;
  reward?: LoyaltyReward;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  description?: string;
  transaction_type: string;
  restaurant_id?: string;
  program_id?: string;
  created_at: string;
}

// Waitlist types - Updated to match database
export interface WaitlistEntry {
  id: string;
  restaurant_id: string;
  user_id?: string;
  reservation_id?: string;
  name?: string;
  party_size: number;
  status: 'waiting' | 'seated' | 'cancelled' | 'no_show';
  quoted_wait_time?: number;
  estimated_wait_time?: number;
  join_time?: string;
  seated_time?: string;
  notes?: string;
  special_requests?: string;
  phone_number?: string;
  notification_sent?: boolean;
}

// Chef Booking types - Updated to match database schema (uses user_id in DB)
export interface ChefBooking {
  id: string;
  chef_id: string;
  user_id: string;
  booking_date: string;
  booking_time: string;
  duration: number;
  guest_count: number;
  location: string;
  special_requests?: string;
  menu_description?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
  chef_name?: string;
  specialty?: string;
  image?: string;
  hourly_rate?: number;
  user?: Profile;
}

export interface ChefBookingInput {
  chef_id: string;
  booking_date: string;
  booking_time: string;
  duration: number;
  guest_count: number;
  location: string;
  special_requests?: string;
  menu_description?: string;
}

// Chef types
export interface Chef {
  id: string;
  name: string;
  image: string | null;
  specialty: string;
  years_experience: number;
  location: string;
  hourly_rate: number;
  bio: string | null;
  available_dates: string[] | null;
  signature_dishes: string[] | null;
  languages: string[] | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Review types - aligned with database schema
export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  reservation_id?: string;
  rating: number;
  title?: string;
  content?: string;
  created_at: string;
  updated_at: string;
  helpful_count: number;
  is_verified?: boolean;
}

export interface ReviewWithUser extends Review {
  user: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  user_has_liked?: boolean;
}

export type UserType = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone_number?: string;
  address?: string;
  avatar_url?: string;
  reservations?: unknown[];
  createdAt?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    [key: string]: Json;
  };
} | null;

export type StaffRole = 'manager' | 'host' | 'server' | 'waiter' | 'chef' | 'bartender' | 'cleaner' | 'inventory_manager' | 'owner' | 'other';

export interface StaffProfile extends Profile {
  id: string;
  staff_role: StaffRole;
  employment_status: 'active' | 'inactive' | 'terminated';
  hire_date: string;
  termination_date?: string;
  schedule?: StaffSchedule[];
  preferences?: StaffSchedulePreference[];
  time_off_requests?: StaffTimeOffRequest[];
}

export interface StaffSchedule {
  id: string;
  staff_id: string;
  restaurant_id?: string;
  restaurant_location_id?: string;
  schedule_date: string;
  work_date?: string; // Some parts of the app use work_date
  shift_type_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffSchedulePreference {
  id: string;
  staff_id: string;
  day_of_week: string;
  preferred_shift_type_id?: string;
  availability?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffTimeOffRequest {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  updated_at: string;
}

// Notification types - Enhanced notification system
export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  subscription: Record<string, any>; // Web Push API subscription object
  user_agent?: string;
  endpoint: string;
  created_at: string;
  updated_at: string;
}

// Notification interface is already defined at line 150, this extends with additional types

export interface EmailNotification {
  id: string;
  recipient_email: string;
  type: 'booking_confirmation' | 'reservation_reminder' | 'booking_cancellation' | 'special_offer' | 'newsletter' | 'system_notification';
  subject: string;
  template?: string;
  email_data?: Record<string, any>;
  status: 'pending' | 'processing' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  provider_message_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SMSNotification {
  id: string;
  user_id: string;
  phone_number: string;
  type: 'booking_confirmation' | 'reservation_reminder' | 'booking_cancellation' | 'table_ready' | 'system_alert';
  message: string;
  status: 'pending' | 'processing' | 'sent' | 'delivered' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  provider_message_id?: string;
  cost?: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  booking_confirmations: boolean;
  reservation_reminders: boolean;
  special_offers: boolean;
  system_notifications: boolean;
  marketing_emails: boolean;
  created_at: string;
  updated_at: string;
}

// Payment types - Complete payment system
export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'bank_account' | 'digital_wallet';
  provider: string;
  provider_payment_method_id: string;
  last4?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  billing_details: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  reservation_id: string;
  user_id: string;
  restaurant_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded' | 'partial_refund';
  payment_method_id?: string;
  provider: string;
  provider_payment_intent_id?: string;
  provider_charge_id?: string;
  description?: string;
  metadata: Record<string, any>;
  failure_reason?: string;
  refunded_amount: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  payment_method?: PaymentMethod;
  reservation?: Reservation;
  restaurant?: Restaurant;
}

export interface Refund {
  id: string;
  payment_id: string;
  reservation_id: string;
  amount: number;
  reason?: 'customer_request' | 'duplicate' | 'fraudulent' | 'technical_issue' | 'restaurant_cancelled' | 'other';
  description?: string;
  provider_refund_id?: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  processed_by?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface PaymentSettings {
  restaurant_id: string;
  is_enabled: boolean;
  requires_deposit: boolean;
  deposit_percentage: number;
  deposit_amount: number;
  currency: string;
  supported_providers: string[];
  auto_capture: boolean;
  allow_partial_payments: boolean;
  minimum_order_amount: number;
  maximum_order_amount?: number;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentLog {
  id: string;
  payment_id: string;
  event_type: string;
  event_data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  payment_id: string;
  reservation_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  paid_at?: string;
  pdf_url?: string;
  line_items: Array<Record<string, any>>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItemIngredient {
  id: string;
  menu_item_id: string;
  ingredient_id: string;
  quantity_required: number;
  unit: string;
  created_at: string;
  updated_at: string;
  ingredient?: Ingredient;
  current_stock?: number;
}

export interface Ingredient {
  id: string;
  restaurant_id: string;
  name: string;
  unit: string;
  reorder_threshold: number;
  created_at: string;
  updated_at: string;
  stock_levels?: StockLevel[];
}

export interface StockLevel {
  id: string;
  ingredient_id: string;
  current_quantity: number;
  last_updated: string;
}

export interface PartnerSubscription {
  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
  planName: string | null;
  features: string[] | null;
  trialEndDate: string | null;
  subscriptionEndDate: string | null;
  maxLocations: number | null;
  maxStaff: number | null;
}

// Stripe-specific types
export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, string>;
}

export interface StripePaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

// WaitlistEntry is already defined above at line 365
