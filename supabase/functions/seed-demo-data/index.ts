import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // SECURITY FIX: Use proper JWT authentication instead of hardcoded key
    // Initialize Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    // Check if user has admin/superadmin role
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', user.id)
      .single()

    const roleName = (userRole?.roles as any)?.name?.toLowerCase()
    const isAdmin = roleName === 'admin' || roleName === 'superadmin'

    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      })
    }

    // Use service role for data operations (after auth verified)
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, supabaseServiceKey)

    // Get existing restaurant IDs
    const { data: restaurants, error: fetchError } = await supabase
      .from('restaurants')
      .select('id, name')
      .limit(3)

    if (fetchError) throw fetchError

    if (!restaurants || restaurants.length === 0) {
      return new Response(JSON.stringify({ error: 'No restaurants found to update' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    const restaurantIds = restaurants.map(r => r.id)

    // Phase 1: Update restaurants with demo data
    const restaurantUpdates = [
      {
        id: restaurantIds[0],
        name: 'The Daily Grind Cafe',
        description: 'A cozy neighborhood cafe serving artisanal coffee, fresh pastries, and wholesome breakfast and lunch options. Our farm-to-table approach ensures the freshest ingredients in every dish.',
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
        id: restaurantIds[1],
        name: 'Spice Garden Restaurant',
        description: 'Experience authentic Indian cuisine with traditional recipes passed down through generations. Our chefs use hand-ground spices and time-honored cooking techniques to create unforgettable flavors.',
        cuisine: 'Indian',
        cuisine_type: 'Fine Dining',
        price_range: 3,
        rating: 4.8,
        image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        opening_hours: { mon: '11:00-22:00', tue: '11:00-22:00', wed: '11:00-22:00', thu: '11:00-22:00', fri: '11:00-23:00', sat: '12:00-23:00', sun: '12:00-21:00' },
        features: 'Private Dining, Vegan Options, Full Bar, Live Music',
        is_active: true
      },
      {
        id: restaurantIds[2],
        name: 'Lagos Fusion Bistro',
        description: 'A sophisticated fusion of African and international cuisines in an elegant setting. Our award-winning chefs blend traditional Nigerian flavors with contemporary culinary techniques.',
        cuisine: 'African',
        cuisine_type: 'International Fusion',
        price_range: 4,
        rating: 4.7,
        image_url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800',
        opening_hours: { mon: '17:00-23:00', tue: '17:00-23:00', wed: '17:00-23:00', thu: '17:00-23:00', fri: '17:00-00:00', sat: '12:00-00:00', sun: '12:00-22:00' },
        features: 'Valet Parking, Private Events, Sommelier, Dress Code',
        is_active: true
      }
    ]

    for (const update of restaurantUpdates) {
      const { error } = await supabase
        .from('restaurants')
        .update(update)
        .eq('id', update.id)
      if (error) console.error('Restaurant update error:', error)
    }

    // Phase 2: Create restaurant locations
    const locations = [
      {
        restaurant_id: restaurantIds[0],
        address: { street: '123 Main Street', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' },
        contact_info: { phone: '+1 (415) 555-0123', email: 'hello@dailygrind.com' },
        is_primary: true,
        timezone: 'America/Los_Angeles'
      },
      {
        restaurant_id: restaurantIds[1],
        address: { street: '456 Spice Avenue', city: 'New York', state: 'NY', zip: '10001', country: 'USA' },
        contact_info: { phone: '+1 (212) 555-0456', email: 'reservations@spicegarden.com' },
        is_primary: true,
        timezone: 'America/New_York'
      },
      {
        restaurant_id: restaurantIds[2],
        address: { street: '789 Fusion Boulevard', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA' },
        contact_info: { phone: '+1 (310) 555-0789', email: 'info@lagosfusion.com' },
        is_primary: true,
        timezone: 'America/Los_Angeles'
      }
    ]

    const { data: createdLocations, error: locError } = await supabase
      .from('restaurant_locations')
      .upsert(locations, { onConflict: 'restaurant_id' })
      .select('id, restaurant_id')

    if (locError) console.error('Location error:', locError)

    // Phase 3: Create tables for each restaurant
    const tableTemplates = [
      { table_number: 'W1', capacity: 2, location: 'Window Section' },
      { table_number: 'W2', capacity: 2, location: 'Window Section' },
      { table_number: 'W3', capacity: 4, location: 'Window Section' },
      { table_number: 'M1', capacity: 4, location: 'Main Dining' },
      { table_number: 'M2', capacity: 4, location: 'Main Dining' },
      { table_number: 'M3', capacity: 6, location: 'Main Dining' },
      { table_number: 'M4', capacity: 6, location: 'Main Dining' },
      { table_number: 'M5', capacity: 4, location: 'Main Dining' },
      { table_number: 'P1', capacity: 8, location: 'Private Area' },
      { table_number: 'P2', capacity: 6, location: 'Private Area' },
      { table_number: 'T1', capacity: 10, location: 'Terrace' },
      { table_number: 'B1', capacity: 4, location: 'Bar Area' }
    ]

    const allTables = restaurantIds.flatMap(restaurantId =>
      tableTemplates.map(t => ({
        ...t,
        restaurant_id: restaurantId,
        is_available: true
      }))
    )

    const { error: tableError } = await supabase
      .from('tables')
      .upsert(allTables, { onConflict: 'restaurant_id,table_number', ignoreDuplicates: true })

    if (tableError) console.error('Table error:', tableError)

    // Phase 4: Create menu categories
    const categoryTemplates = [
      // Daily Grind
      { restaurant_id: restaurantIds[0], name: 'Breakfast', description: 'Start your day right', sort_order: 1 },
      { restaurant_id: restaurantIds[0], name: 'Lunch', description: 'Midday favorites', sort_order: 2 },
      { restaurant_id: restaurantIds[0], name: 'Beverages', description: 'Coffee and more', sort_order: 3 },
      { restaurant_id: restaurantIds[0], name: 'Desserts', description: 'Sweet treats', sort_order: 4 },
      // Spice Garden
      { restaurant_id: restaurantIds[1], name: 'Appetizers', description: 'Traditional starters', sort_order: 1 },
      { restaurant_id: restaurantIds[1], name: 'Main Course', description: 'Signature dishes', sort_order: 2 },
      { restaurant_id: restaurantIds[1], name: 'Biryani', description: 'Aromatic rice dishes', sort_order: 3 },
      { restaurant_id: restaurantIds[1], name: 'Bread & Rice', description: 'Fresh naan and more', sort_order: 4 },
      { restaurant_id: restaurantIds[1], name: 'Desserts', description: 'Indian sweets', sort_order: 5 },
      // Lagos Fusion
      { restaurant_id: restaurantIds[2], name: 'Starters', description: 'Begin your journey', sort_order: 1 },
      { restaurant_id: restaurantIds[2], name: 'Mains', description: 'Signature entrees', sort_order: 2 },
      { restaurant_id: restaurantIds[2], name: 'Grills', description: 'From our charcoal grill', sort_order: 3 },
      { restaurant_id: restaurantIds[2], name: 'Sides', description: 'Perfect accompaniments', sort_order: 4 },
      { restaurant_id: restaurantIds[2], name: 'Drinks', description: 'Cocktails and beverages', sort_order: 5 }
    ]

    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .upsert(categoryTemplates, { onConflict: 'restaurant_id,name', ignoreDuplicates: true })
      .select('id, restaurant_id, name')

    if (catError) console.error('Category error:', catError)

    // Fetch categories for menu items
    const { data: allCategories } = await supabase
      .from('menu_categories')
      .select('id, restaurant_id, name')

    // Phase 5: Create menu items
    if (allCategories) {
      const getCategoryId = (restaurantId: string, categoryName: string) => 
        allCategories.find(c => c.restaurant_id === restaurantId && c.name === categoryName)?.id

      const menuItems = [
        // Daily Grind - Breakfast
        { restaurant_id: restaurantIds[0], category_id: getCategoryId(restaurantIds[0], 'Breakfast'), name: 'Classic Eggs Benedict', description: 'Poached eggs, Canadian bacon, hollandaise on English muffin', price: 14.99, is_available: true },
        { restaurant_id: restaurantIds[0], category_id: getCategoryId(restaurantIds[0], 'Breakfast'), name: 'Avocado Toast', description: 'Smashed avocado, cherry tomatoes, poached egg on sourdough', price: 12.99, is_available: true },
        { restaurant_id: restaurantIds[0], category_id: getCategoryId(restaurantIds[0], 'Breakfast'), name: 'Buttermilk Pancakes', description: 'Fluffy pancakes with maple syrup and fresh berries', price: 11.99, is_available: true },
        { restaurant_id: restaurantIds[0], category_id: getCategoryId(restaurantIds[0], 'Breakfast'), name: 'Breakfast Burrito', description: 'Scrambled eggs, chorizo, cheese, salsa in flour tortilla', price: 13.99, is_available: true },
        // Daily Grind - Lunch
        { restaurant_id: restaurantIds[0], category_id: getCategoryId(restaurantIds[0], 'Lunch'), name: 'Grilled Chicken Sandwich', description: 'Herb-marinated chicken, lettuce, tomato, aioli', price: 15.99, is_available: true },
        { restaurant_id: restaurantIds[0], category_id: getCategoryId(restaurantIds[0], 'Lunch'), name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, house-made dressing', price: 12.99, is_available: true },
        { restaurant_id: restaurantIds[0], category_id: getCategoryId(restaurantIds[0], 'Lunch'), name: 'Soup of the Day', description: 'Ask your server for today\'s selection', price: 8.99, is_available: true },
        // Daily Grind - Beverages
        { restaurant_id: restaurantIds[0], category_id: getCategoryId(restaurantIds[0], 'Beverages'), name: 'Artisan Latte', description: 'Double espresso with steamed milk', price: 5.50, is_available: true },
        { restaurant_id: restaurantIds[0], category_id: getCategoryId(restaurantIds[0], 'Beverages'), name: 'Cold Brew', description: '24-hour steeped cold brew coffee', price: 4.99, is_available: true },
        { restaurant_id: restaurantIds[0], category_id: getCategoryId(restaurantIds[0], 'Beverages'), name: 'Fresh Squeezed OJ', description: 'Made to order orange juice', price: 4.50, is_available: true },
        // Daily Grind - Desserts
        { restaurant_id: restaurantIds[0], category_id: getCategoryId(restaurantIds[0], 'Desserts'), name: 'New York Cheesecake', description: 'Classic creamy cheesecake with berry compote', price: 8.99, is_available: true },
        { restaurant_id: restaurantIds[0], category_id: getCategoryId(restaurantIds[0], 'Desserts'), name: 'Chocolate Brownie', description: 'Warm brownie with vanilla ice cream', price: 7.99, is_available: true },

        // Spice Garden - Appetizers
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Appetizers'), name: 'Samosa', description: 'Crispy pastry filled with spiced potatoes and peas', price: 8.99, is_available: true },
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Appetizers'), name: 'Chicken Tikka', description: 'Tender chicken marinated in yogurt and spices', price: 12.99, is_available: true },
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Appetizers'), name: 'Paneer Pakora', description: 'Crispy fried cottage cheese fritters', price: 10.99, is_available: true },
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Appetizers'), name: 'Onion Bhaji', description: 'Crispy onion fritters with mint chutney', price: 7.99, is_available: true },
        // Spice Garden - Main Course
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Main Course'), name: 'Butter Chicken', description: 'Tender chicken in creamy tomato sauce', price: 18.99, is_available: true },
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Main Course'), name: 'Lamb Rogan Josh', description: 'Slow-cooked lamb in aromatic Kashmiri spices', price: 22.99, is_available: true },
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Main Course'), name: 'Palak Paneer', description: 'Cottage cheese in creamy spinach sauce', price: 16.99, is_available: true },
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Main Course'), name: 'Chicken Korma', description: 'Mild and creamy chicken curry with almonds', price: 17.99, is_available: true },
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Main Course'), name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter sauce', price: 14.99, is_available: true },
        // Spice Garden - Biryani
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Biryani'), name: 'Hyderabadi Chicken Biryani', description: 'Aromatic basmati rice layered with spiced chicken', price: 19.99, is_available: true },
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Biryani'), name: 'Lamb Biryani', description: 'Premium lamb with saffron-infused rice', price: 24.99, is_available: true },
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Biryani'), name: 'Vegetable Biryani', description: 'Mixed vegetables with fragrant spiced rice', price: 15.99, is_available: true },
        // Spice Garden - Bread
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Bread & Rice'), name: 'Garlic Naan', description: 'Soft bread with garlic and butter', price: 4.99, is_available: true },
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Bread & Rice'), name: 'Plain Naan', description: 'Traditional tandoor-baked bread', price: 3.99, is_available: true },
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Bread & Rice'), name: 'Jeera Rice', description: 'Cumin-flavored basmati rice', price: 4.99, is_available: true },
        // Spice Garden - Desserts
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Desserts'), name: 'Gulab Jamun', description: 'Sweet milk dumplings in rose syrup', price: 6.99, is_available: true },
        { restaurant_id: restaurantIds[1], category_id: getCategoryId(restaurantIds[1], 'Desserts'), name: 'Mango Kulfi', description: 'Traditional Indian ice cream with mango', price: 5.99, is_available: true },

        // Lagos Fusion - Starters
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Starters'), name: 'Suya Skewers', description: 'Spiced beef skewers with peanut sauce', price: 16.99, is_available: true },
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Starters'), name: 'Plantain Chips & Dip', description: 'Crispy plantains with avocado-chili dip', price: 12.99, is_available: true },
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Starters'), name: 'Pepper Soup', description: 'Spicy traditional soup with goat meat', price: 14.99, is_available: true },
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Starters'), name: 'Akara Bites', description: 'Black-eyed pea fritters with sriracha mayo', price: 11.99, is_available: true },
        // Lagos Fusion - Mains
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Mains'), name: 'Jollof Rice Royale', description: 'Signature tomato rice with grilled lobster', price: 42.99, is_available: true },
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Mains'), name: 'Egusi Lamb Shank', description: 'Braised lamb in melon seed sauce', price: 38.99, is_available: true },
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Mains'), name: 'Ofada Risotto', description: 'Nigerian rice risotto with locust bean sauce', price: 28.99, is_available: true },
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Mains'), name: 'Grilled Sea Bass', description: 'With yam puree and palm oil reduction', price: 36.99, is_available: true },
        // Lagos Fusion - Grills
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Grills'), name: 'Tomahawk Steak', description: '32oz prime ribeye with suya spice rub', price: 89.99, is_available: true },
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Grills'), name: 'Grilled Prawns', description: 'Jumbo prawns with garlic-chili butter', price: 34.99, is_available: true },
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Grills'), name: 'Mixed Grill Platter', description: 'Selection of suya, chicken, and lamb', price: 45.99, is_available: true },
        // Lagos Fusion - Sides
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Sides'), name: 'Fried Plantains', description: 'Caramelized sweet plantains', price: 8.99, is_available: true },
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Sides'), name: 'Moi Moi', description: 'Steamed bean pudding', price: 7.99, is_available: true },
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Sides'), name: 'Jollof Rice', description: 'Classic Nigerian tomato rice', price: 9.99, is_available: true },
        // Lagos Fusion - Drinks
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Drinks'), name: 'Lagos Sunset', description: 'Rum, passion fruit, lime, ginger beer', price: 14.99, is_available: true },
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Drinks'), name: 'Hibiscus Mojito', description: 'Zobo-infused rum, mint, lime, soda', price: 13.99, is_available: true },
        { restaurant_id: restaurantIds[2], category_id: getCategoryId(restaurantIds[2], 'Drinks'), name: 'Palm Wine Spritz', description: 'Traditional palm wine with prosecco', price: 15.99, is_available: true }
      ]

      const { error: menuError } = await supabase
        .from('menu_items')
        .upsert(menuItems.filter(i => i.category_id), { onConflict: 'restaurant_id,name', ignoreDuplicates: true })

      if (menuError) console.error('Menu error:', menuError)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Demo data seeded successfully',
      restaurants: restaurantIds.length,
      seededBy: user.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Error seeding demo data:', error)
    return new Response(JSON.stringify({ error: 'Failed to seed demo data' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})