import { restaurantSearchApi, SearchFilters } from './restaurantSearch';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
jest.mock('@/integrations/supabase/client');

describe('restaurantSearchApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should perform basic search without filters', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            name: 'Test Restaurant',
            cuisine: 'Italian',
            rating: 4.5,
            restaurant_locations: [{
              id: 'loc1',
              address: '123 Main St',
              city: 'Test City',
              state: 'Test State'
            }]
          }
        ],
        error: null,
        count: 1
      };

      const mockQuery = {
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        then: jest.fn((onFulfilled) => Promise.resolve(mockResponse).then(onFulfilled))
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      const filters: SearchFilters = { limit: 20 };
      const result = await restaurantSearchApi.search(filters);

      expect(result.restaurants).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.restaurants[0].name).toBe('Test Restaurant');
    });

    it('should apply cuisine filter', async () => {
      const mockQuery = {
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        then: jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null, count: 0 }).then(onFulfilled))
      };

      const mockIn = mockQuery.in;

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      const filters: SearchFilters = {
        cuisine: ['Italian', 'Chinese'],
        limit: 20
      };

      await restaurantSearchApi.search(filters);

      expect(mockIn).toHaveBeenCalledWith('cuisine', ['Italian', 'Chinese']);
    });

    it('should apply text search', async () => {
      const mockQuery = {
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        then: jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null, count: 0 }).then(onFulfilled))
      };

      const mockOr = mockQuery.or;

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      const filters: SearchFilters = {
        query: 'test',
        limit: 20
      };

      await restaurantSearchApi.search(filters);

      expect(mockOr).toHaveBeenCalledWith(expect.stringContaining('name.ilike.%test%'));
    });

    it('should handle search errors gracefully', async () => {
      const mockRange = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        count: null
      });

      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockReturnThis(),
        range: mockRange
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect
      });

      const filters: SearchFilters = { limit: 20 };
      const result = await restaurantSearchApi.search(filters);

      expect(result.restaurants).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getAvailableFilters', () => {
    it('should return available filter options', async () => {
      const mockCuisines = [
        { cuisine: 'Italian' },
        { cuisine: 'Chinese' }
      ];
      const mockPrices = [
        { price: '$' },
        { price: '$$' },
        { price: '$$$' }
      ];

      const mockQuery = (data: any) => ({
        not: jest.fn().mockResolvedValue({ data, error: null }),
        then: jest.fn((onFulfilled) => Promise.resolve({ data, error: null }).then(onFulfilled))
      });

      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'restaurants') {
          return {
            select: jest.fn().mockImplementation((fields) => {
              if (fields === 'cuisine') return mockQuery(mockCuisines);
              if (fields === 'price') return mockQuery(mockPrices);
              if (fields === 'features') return mockQuery([]);
              return {
                select: jest.fn().mockReturnThis(),
                then: jest.fn((onFulfilled) => Promise.resolve({ count: 25, error: null }).then(onFulfilled))
              };
            })
          };
        }
        return {
          select: jest.fn().mockReturnThis()
        };
      });

      const result = await restaurantSearchApi.getAvailableFilters();

      expect(result.availableCuisines).toEqual(['Italian', 'Chinese']);
      expect(result.availablePriceRanges).toEqual(['$', '$$', '$$$']);
      expect(result.availableFeatures).toEqual([]);
      expect(result.totalResults).toBe(25);
    });
  });

  describe('compareRestaurants', () => {
    it('should compare multiple restaurants', async () => {
      const mockData = [
        {
          id: '1',
          name: 'Restaurant 1',
          cuisine: 'Italian',
          rating: 4.5,
          price: '$$',
          restaurant_locations: [{
            id: 'loc1',
            city: 'City 1',
            state: 'State 1'
          }]
        },
        {
          id: '2',
          name: 'Restaurant 2',
          cuisine: 'Chinese',
          rating: 4.2,
          price: '$$$',
          restaurant_locations: [{
            id: 'loc2',
            city: 'City 2',
            state: 'State 2'
          }]
        }
      ];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user' } }
      });

      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'restaurants') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({ data: mockData, error: null })
          };
        }
        if (table === 'user_favorites') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({ data: [], error: null })
          };
        }
        return {
          select: jest.fn().mockReturnThis()
        };
      });

      const result = await restaurantSearchApi.compareRestaurants(['1', '2']);

      expect(result).toHaveLength(2);
      expect(result[0].restaurant.name).toBe('Restaurant 1');
      expect(result[1].restaurant.name).toBe('Restaurant 2');
    });

    it('should return empty array for invalid restaurant counts', async () => {
      const resultTooMany = await restaurantSearchApi.compareRestaurants(['1', '2', '3', '4', '5']);
      expect(resultTooMany).toEqual([]);
      
      const resultNone = await restaurantSearchApi.compareRestaurants([]);
      expect(resultNone).toEqual([]);
    });
  });

  describe('getNearby', () => {
    it('should find nearby restaurants', async () => {
      const mockData = [
        {
          id: '1',
          name: 'Nearby Restaurant',
          restaurant_locations: [{
            coordinates: '( -74.0060, 40.7128 )' // Lon, Lat format for POINT
          }]
        }
      ];

      const mockLimit = jest.fn().mockResolvedValue({
        data: mockData,
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: mockLimit
      });

      const result = await restaurantSearchApi.getNearby(40.7128, -74.0060, 10, 20);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Nearby Restaurant');
    });
  });
});
