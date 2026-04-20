import { favoritesApi } from './favorites';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
jest.mock('@/integrations/supabase/client');

describe('favoritesApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('should add a restaurant to favorites', async () => {
      // Mock successful auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      });

      // Mock check for existing favorite (none found)
      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null
      });

      // Mock insert operation
      const mockInsert = jest.fn().mockResolvedValue({
        error: null
      });

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) { // Check existing
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: mockMaybeSingle
          };
        } else { // Insert new
          return { insert: mockInsert };
        }
      });

      const result = await favoritesApi.add('restaurant-123');

      expect(result).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        customer_id: 'test-user-id',
        restaurant_id: 'restaurant-123'
      });
    });

    it('should return true if already favorited', async () => {
      // Mock successful auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      });

      // Mock existing favorite found
      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: { id: 'existing-fav' },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle
      });

      const result = await favoritesApi.add('restaurant-123');

      expect(result).toBe(true);
    });

    it('should return false if not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null }
      });

      const result = await favoritesApi.add('restaurant-123');
      expect(result).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove a restaurant from favorites', async () => {
      // Mock successful auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      });

      // Mock delete operation
      const mockEq = jest.fn();
      mockEq
        .mockReturnValueOnce({ eq: mockEq }) // first call returns object with eq
        .mockResolvedValueOnce({ error: null }); // second call returns promise

      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: mockEq
      });

      const result = await favoritesApi.remove('restaurant-123');

      expect(result).toBe(true);
      expect(mockEq).toHaveBeenCalledTimes(2);
    });

    it('should return false if not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null }
      });

      const result = await favoritesApi.remove('restaurant-123');
      expect(result).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle from favorited to not favorited', async () => {
      // Mock successful auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      });

      // Mock existing favorite found
      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: { id: 'existing-fav' },
        error: null
      });

      // Mock delete operation
      const mockDelete = jest.fn().mockResolvedValue({
        error: null
      });

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) { // Check existing
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: mockMaybeSingle
          };
        } else { // Delete
          return {
            delete: mockDelete,
            eq: jest.fn().mockReturnThis()
          };
        }
      });

      const result = await favoritesApi.toggle('restaurant-123');

      expect(result.isFavorite).toBe(false);
      expect(result.success).toBe(true);
    });

    it('should toggle from not favorited to favorited', async () => {
      // Mock successful auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      });

      // Mock no existing favorite
      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null
      });

      // Mock insert operation
      const mockInsert = jest.fn().mockResolvedValue({
        error: null
      });

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) { // Check existing
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: mockMaybeSingle
          };
        } else { // Insert
          return { insert: mockInsert };
        }
      });

      const result = await favoritesApi.toggle('restaurant-123');

      expect(result.isFavorite).toBe(true);
      expect(result.success).toBe(true);
    });
  });

  describe('getUserFavorites', () => {
    it('should return user favorites with restaurant data', async () => {
      // Mock successful auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      });

      const mockFavorites = [
        {
          id: 'fav-1',
          user_id: 'test-user-id',
          restaurant_id: 'rest-1',
          created_at: '2025-01-01T00:00:00Z',
          restaurant: {
            id: 'rest-1',
            name: 'Favorite Restaurant',
            cuisine: 'Italian',
            rating: 4.5
          }
        }
      ];

      const mockOrder = jest.fn().mockResolvedValue({
        data: mockFavorites,
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: mockOrder
      });

      const result = await favoritesApi.getUserFavorites();

      expect(result).toHaveLength(1);
      expect(result[0].restaurant?.name).toBe('Favorite Restaurant');
      expect(result[0].restaurant?.cuisine).toBe('Italian');
    });

    it('should return empty array if not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null }
      });

      const result = await favoritesApi.getUserFavorites();

      expect(result).toEqual([]);
    });
  });

  describe('isFavorite', () => {
    it('should return true if restaurant is favorited', async () => {
      // Mock successful auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      });

      // Mock favorite found
      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: { id: 'fav-1' },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle
      });

      const result = await favoritesApi.isFavorite('restaurant-123');

      expect(result).toBe(true);
    });

    it('should return false if restaurant is not favorited', async () => {
      // Mock successful auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      });

      // Mock no favorite found
      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle
      });

      const result = await favoritesApi.isFavorite('restaurant-123');

      expect(result).toBe(false);
    });

    it('should return false if not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null }
      });

      const result = await favoritesApi.isFavorite('restaurant-123');

      expect(result).toBe(false);
    });
  });

  describe('getFavoriteCount', () => {
    it('should return the favorite count for a restaurant', async () => {
      const mockEq = jest.fn().mockResolvedValue({
        count: 15,
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: mockEq
      });

      const result = await favoritesApi.getFavoriteCount('restaurant-123');

      expect(result).toBe(15);
    });

    it('should return 0 on error', async () => {
      const mockEq = jest.fn().mockResolvedValue({
        count: null,
        error: { message: 'Database error' }
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: mockEq
      });

      const result = await favoritesApi.getFavoriteCount('restaurant-123');

      expect(result).toBe(0);
    });
  });

  describe('getFavoriteCuisines', () => {
    it('should return top favorite cuisines', async () => {
      // Mock successful auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      });

      const mockFavorites = [
        { restaurant: { cuisine: 'Italian' } },
        { restaurant: { cuisine: 'Italian' } },
        { restaurant: { cuisine: 'Chinese' } },
        { restaurant: { cuisine: 'Italian' } },
        { restaurant: { cuisine: 'Mexican' } }
      ];

      const mockEq = jest.fn().mockResolvedValue({
        data: mockFavorites,
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: mockEq
      });

      const result = await favoritesApi.getFavoriteCuisines();

      // Should return top 5 cuisines by frequency, with Italian first
      expect(result).toContain('Italian');
      expect(result).toContain('Chinese');
      expect(result).toContain('Mexican');
      expect(result.indexOf('Italian')).toBeLessThan(result.indexOf('Chinese'));
    });

    it('should return empty array if not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null }
      });

      const result = await favoritesApi.getFavoriteCuisines();

      expect(result).toEqual([]);
    });
  });
});
