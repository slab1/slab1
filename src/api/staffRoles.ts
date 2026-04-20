// Staff role types for restaurant staff management
export type StaffRole = 'restaurant_manager' | 'inventory_manager' | 'restaurant_staff' | 'chef' | 'waiter' | 'host' | 'bartender' | 'cleaner' | 'other';

export const STAFF_ROLES: { value: StaffRole; label: string }[] = [
  { value: 'restaurant_manager', label: 'Restaurant Manager' },
  { value: 'inventory_manager', label: 'Inventory Manager' },
  { value: 'restaurant_staff', label: 'General Staff' },
  { value: 'chef', label: 'Chef' },
  { value: 'waiter', label: 'Waiter' },
  { value: 'host', label: 'Host' },
  { value: 'bartender', label: 'Bartender' },
  { value: 'cleaner', label: 'Cleaner' },
  { value: 'other', label: 'Other' },
];

export const getRoleLabel = (role: string): string => {
  return STAFF_ROLES.find(r => r.value === role)?.label || role;
};
