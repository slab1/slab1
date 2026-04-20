import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          maybeSingle: jest.fn(),
          order: jest.fn(() => ({
            limit: jest.fn()
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn()
            }))
          }))
        })),
        delete: jest.fn(() => ({
          eq: jest.fn()
        }))
      }))
    })),
    rpc: jest.fn(),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => ({
          unsubscribe: jest.fn()
        }))
      }))
    }))
  }
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn()
}));

// Mock navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  },
  writable: true
});

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock HTMLElement.prototype.scrollIntoView
HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock PointerEvent (needed for some UI components)
if (!global.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
    }
  }
  global.PointerEvent = PointerEvent as any;
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
} as Storage;
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
} as Storage;
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Helper function to create mock user
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    first_name: 'John',
    last_name: 'Doe'
  }
};

// Helper function to create mock restaurant
export const mockRestaurant = {
  id: 'test-restaurant-id',
  name: 'Test Restaurant',
  cuisine: 'Italian',
  rating: 4.5,
  price: '$$',
  image_url: 'https://example.com/image.jpg',
  locations: [{
    id: 'test-location-id',
    address: '123 Test St',
    city: 'Test City',
    state: 'Test State'
  }]
};

// Helper function to create mock reservation
export const mockReservation = {
  id: 'test-reservation-id',
  restaurant_id: 'test-restaurant-id',
  customer_id: 'test-user-id',
  reservation_date: '2025-12-25',
  reservation_time: '19:00',
  guest_count: 2,
  status: 'confirmed',
  special_requests: 'Window seat please'
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});
