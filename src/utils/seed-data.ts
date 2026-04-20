export const COMMON_DATA = {
  profiles: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      first_name: 'John',
      last_name: 'Admin',
      email: 'admin@reservatoo.com',
      phone: '555-0101',
      address: '123 Admin Way, San Francisco, CA 94102'
    }
  ],
  user_roles: [
    {
      user_id: '00000000-0000-0000-0000-000000000001',
      role: 'admin'
    }
  ]
};

export const DEVELOPMENT_DATA = {
  ...COMMON_DATA,
  profiles: [
    ...COMMON_DATA.profiles,
    {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Chef',
      last_name: 'Master',
      email: 'chef@example.com',
      phone: '555-0102',
      address: '456 Culinary St, Seattle, WA 98101'
    }
  ],
  user_roles: [
    ...COMMON_DATA.user_roles,
    {
      user_id: '00000000-0000-0000-0000-000000000002',
      role: 'chef'
    }
  ],
  restaurants: [
    {
      id: '00000000-0000-0000-0000-000000000011',
      name: 'The Daily Grind Cafe',
      description: 'A cozy neighborhood cafe serving artisanal coffee, fresh pastries, and wholesome breakfast and lunch options.',
      cuisine: 'American',
      cuisine_type: 'Cafe',
      price_range: 2,
      rating: 4.5,
      image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
      opening_hours: { mon: '7:00-18:00', tue: '7:00-18:00', wed: '7:00-18:00', thu: '7:00-18:00', fri: '7:00-20:00', sat: '8:00-20:00', sun: '8:00-16:00' },
      features: 'WiFi, Outdoor Seating, Pet Friendly, Takeout',
      is_active: true
    },
    {
      id: '00000000-0000-0000-0000-000000000012',
      name: 'Spice Garden Restaurant',
      description: 'Experience authentic Indian cuisine with traditional recipes passed down through generations.',
      cuisine: 'Indian',
      cuisine_type: 'Fine Dining',
      price_range: 3,
      rating: 4.8,
      image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      opening_hours: { mon: '11:00-22:00', tue: '11:00-22:00', wed: '11:00-22:00', thu: '11:00-22:00', fri: '11:00-23:00', sat: '12:00-23:00', sun: '12:00-21:00' },
      features: 'Private Dining, Vegan Options, Full Bar, Live Music',
      is_active: true
    }
  ],
  locations: [
    { restaurant_id: '00000000-0000-0000-0000-000000000011', address: { street: '123 Main Street', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' }, contact_info: { phone: '+1 (415) 555-0123', email: 'hello@dailygrind.com' }, is_primary: true, timezone: 'America/Los_Angeles' },
    { restaurant_id: '00000000-0000-0000-0000-000000000012', address: { street: '456 Spice Avenue', city: 'New York', state: 'NY', zip: '10001', country: 'USA' }, contact_info: { phone: '+1 (212) 555-0456', email: 'reservations@spicegarden.com' }, is_primary: true, timezone: 'America/New_York' }
  ],
  tables: [
    { restaurant_id: '00000000-0000-0000-0000-000000000011', table_number: 'W1', capacity: 2, location: 'Window Section', is_available: true },
    { restaurant_id: '00000000-0000-0000-0000-000000000011', table_number: 'M1', capacity: 4, location: 'Main Dining', is_available: true },
    { restaurant_id: '00000000-0000-0000-0000-000000000012', table_number: 'W1', capacity: 2, location: 'Window Section', is_available: true }
  ],
  menuCategories: [
    { id: '00000000-0000-0000-0000-000000000021', restaurant_id: '00000000-0000-0000-0000-000000000011', name: 'Breakfast', description: 'Start your day right', sort_order: 1 },
    { id: '00000000-0000-0000-0000-000000000022', restaurant_id: '00000000-0000-0000-0000-000000000012', name: 'Appetizers', description: 'Traditional starters', sort_order: 1 }
  ],
  menuItems: [
    { restaurant_id: '00000000-0000-0000-0000-000000000011', category_id: '00000000-0000-0000-0000-000000000021', name: 'Classic Eggs Benedict', description: 'Poached eggs, Canadian bacon, hollandaise', price: 14.99, is_available: true },
    { restaurant_id: '00000000-0000-0000-0000-000000000012', category_id: '00000000-0000-0000-0000-000000000022', name: 'Samosa', description: 'Crispy pastry with spiced potatoes', price: 8.99, is_available: true }
  ],
  ingredients: [
    { id: '00000000-0000-0000-0000-000000000031', name: 'Eggs', unit: 'dozen', category: 'Dairy' }
  ],
  stock_levels: [
    { ingredient_id: '00000000-0000-0000-0000-000000000031', current_stock: 50, reorder_point: 10, last_updated: new Date().toISOString() }
  ],
  chefs: [
    {
      id: '00000000-0000-0000-0000-000000000041',
      user_id: '00000000-0000-0000-0000-000000000002',
      name: 'Mario Rossi',
      specialty: 'Italian & Mediterranean',
      location: 'San Francisco, CA',
      years_experience: 15,
      hourly_rate: 85,
      bio: 'Award-winning chef with a passion for authentic Italian flavors and fresh, seasonal ingredients.',
      image: 'https://images.unsplash.com/photo-1583394828560-14300e12bcc1?w=400',
      languages: ['English', 'Italian', 'Spanish'],
      signature_dishes: ['Homemade Tagliatelle with Truffles', 'Grilled Octopus with Gremolata'],
      available_dates: ['2026-01-20', '2026-01-21', '2026-01-22']
    }
  ]
};

export const TESTING_DATA = {
  ...DEVELOPMENT_DATA,
  // Testing data could have more edge cases or smaller datasets
};

export const PRODUCTION_DATA = {
  ...COMMON_DATA,
  // Production seed data usually only includes essential system configurations
  restaurants: [],
  locations: [],
  tables: [],
  menuCategories: [],
  menuItems: [],
  ingredients: [],
  stock_levels: [],
  chefs: []
};

export const ENV_SEED_DATA: Record<string, any> = {
  development: DEVELOPMENT_DATA,
  testing: TESTING_DATA,
  production: PRODUCTION_DATA
};

// For backward compatibility
export const SEED_DATA = DEVELOPMENT_DATA;
