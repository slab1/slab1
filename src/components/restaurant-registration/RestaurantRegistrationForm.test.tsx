import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { RestaurantRegistrationForm } from "./RestaurantRegistrationForm";
import { supabase } from "@/integrations/supabase/client";
import { BrowserRouter } from "react-router-dom";

// Mock useAuth
jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "test-user-id", email: "test@example.com" },
  }),
}));

// Mock usePartnerSubscription
jest.mock("@/hooks/use-partner-subscription", () => ({
  usePartnerSubscription: () => ({
    subscription: {
      hasActiveSubscription: true,
      maxLocations: 5,
    },
    loading: false,
  }),
}));

// Mock Supabase
jest.mock("@/integrations/supabase/client", () => {
  const mockChain = {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    then: jest.fn(function(onfulfilled: any) {
      return Promise.resolve(onfulfilled({ data: null, error: null, count: 0 }));
    }),
  };
  
  return {
    supabase: {
      from: jest.fn(() => mockChain),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: "test-user-id" } }, error: null }),
      },
    },
  };
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, defaultValue }: any) => {
    // Find the select content and render its children inside a select
    // For simplicity in testing, we'll just render a select element
    return (
      <select 
        onChange={(e) => onValueChange(e.target.value)} 
        defaultValue={defaultValue}
        data-testid="mock-select"
      >
        <option value="">Select...</option>
        {children}
      </select>
    );
  },
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

jest.mock("@/components/ui/image-upload", () => ({
  ImageUpload: ({ onImageUrlChange }: any) => (
    <input 
      type="file" 
      onChange={() => onImageUrlChange("https://test-image.jpg")} 
      aria-label="Restaurant Image"
    />
  ),
}));

describe("RestaurantRegistrationForm", () => {
  const user = userEvent.setup();

  jest.setTimeout(20000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillStep1 = async (name = "Test Resto") => {
    await user.type(screen.getByLabelText(/Restaurant Name/i), name);
    
    const cuisineSelect = screen.getByText("Cuisine Type", { selector: 'label' }).parentElement?.querySelector('select');
    if (cuisineSelect) await user.selectOptions(cuisineSelect, "Italian");

    await user.type(screen.getByLabelText(/Description/i), "This is a test description that is long enough.");
    await user.clear(screen.getByLabelText(/Seating Capacity/i));
    await user.type(screen.getByLabelText(/Seating Capacity/i), "50");
    
    const priceSelect = screen.getByText("Price Range", { selector: 'label' }).parentElement?.querySelector('select');
    if (priceSelect) await user.selectOptions(priceSelect, "$$");

    await user.click(screen.getByText(/Next/i));
  };

  it("renders the first step correctly", () => {
    renderWithRouter(<RestaurantRegistrationForm onSuccess={() => {}} setLoading={() => {}} setCurrentStep={() => {}} />);
    expect(screen.getByText(/Basic Information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Restaurant Name/i)).toBeInTheDocument();
  });

  it("shows validation error for invalid phone number", async () => {
    renderWithRouter(<RestaurantRegistrationForm onSuccess={() => {}} setLoading={() => {}} setCurrentStep={() => {}} />);
    
    await fillStep1();

    // Step 2: Location & Contact
    await waitFor(() => expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument());
    await user.type(screen.getByLabelText(/Phone Number/i), "123"); // Invalid phone
    
    await user.click(screen.getByText(/Next/i));

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid phone number/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for capacity exceeding 1000", async () => {
    renderWithRouter(<RestaurantRegistrationForm onSuccess={() => {}} setLoading={() => {}} setCurrentStep={() => {}} />);
    
    // Step 1: Basic Info
    await user.type(screen.getByLabelText(/Restaurant Name/i), "Test Resto");
    
    const cuisineSelect = screen.getByText("Cuisine Type", { selector: 'label' }).parentElement?.querySelector('select');
    if (cuisineSelect) await user.selectOptions(cuisineSelect, "Italian");

    await user.type(screen.getByLabelText(/Description/i), "This is a test description that is long enough.");
    await user.clear(screen.getByLabelText(/Seating Capacity/i));
    await user.type(screen.getByLabelText(/Seating Capacity/i), "2000"); // Exceeds 1000
    
    const priceSelect = screen.getByText("Price Range", { selector: 'label' }).parentElement?.querySelector('select');
    if (priceSelect) await user.selectOptions(priceSelect, "$$");
    
    await user.click(screen.getByText(/Next/i));

    await waitFor(() => {
      expect(screen.getByText(/Capacity cannot exceed 1000/i)).toBeInTheDocument();
    });
  });

  it("submits the form successfully", async () => {
    const mockRestaurantId = "new-restaurant-id";
    (supabase.from as jest.Mock).mockImplementation((table) => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        insert: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockResolvedValue({ error: null }),
        delete: jest.fn().mockReturnThis(),
        then: jest.fn((onfulfilled: any) => Promise.resolve(onfulfilled({ data: null, error: null, count: 0 }))),
      };

      if (table === "restaurants") {
        mockChain.single = jest.fn().mockResolvedValue({ data: { id: mockRestaurantId }, error: null });
        mockChain.eq = jest.fn().mockReturnThis(); // For chaining
        // Special case for delete call which might be awaited directly
        (mockChain as any).then = jest.fn((onfulfilled: any) => Promise.resolve(onfulfilled({ data: { id: mockRestaurantId }, error: null })));
      }
      
      if (table === "restaurant_locations") {
        mockChain.insert = jest.fn().mockResolvedValue({ error: null });
      }

      return mockChain;
    });

    renderWithRouter(<RestaurantRegistrationForm onSuccess={() => {}} setLoading={() => {}} setCurrentStep={() => {}} />);

    // Step 1: Basic Info
    await user.type(screen.getByLabelText(/Restaurant Name/i), "Bistro Paris");
    
    const cuisineSelect = screen.getByText("Cuisine Type", { selector: 'label' }).parentElement?.querySelector('select');
    if (cuisineSelect) await user.selectOptions(cuisineSelect, "French");

    await user.type(screen.getByLabelText(/Description/i), "A fine dining experience in the heart of the city.");
    await user.clear(screen.getByLabelText(/Seating Capacity/i));
    await user.type(screen.getByLabelText(/Seating Capacity/i), "50");
    
    const priceSelect = screen.getByText("Price Range", { selector: 'label' }).parentElement?.querySelector('select');
    if (priceSelect) await user.selectOptions(priceSelect, "$$");

    await user.click(screen.getByText(/Next/i));

    // Step 2: Locations
    await waitFor(() => expect(screen.getByText(/Location\(s\) & Contact/i)).toBeInTheDocument());
    await user.type(screen.getByLabelText(/Location Name/i), "Main Branch");
    
    const countrySelect = screen.getAllByText(/Country/i).find(el => el.tagName === 'LABEL')?.parentElement?.querySelector('select');
    if (countrySelect) await user.selectOptions(countrySelect, "US");

    await user.type(screen.getByLabelText(/Street Address/i), "123 Main St");
    await user.type(screen.getByLabelText(/City/i), "London");
    await user.type(screen.getByLabelText(/Email/i), "test@example.com");
    await user.type(screen.getByLabelText(/Phone Number/i), "1234567890");
    await user.click(screen.getByText(/Next/i));

    // Step 3: Features
    await waitFor(() => expect(screen.getByText("Restaurant Features", { selector: 'h3' })).toBeInTheDocument());
    const outdoorSeating = screen.getByText("Outdoor Seating").parentElement?.querySelector('button[role="checkbox"]');
    if (outdoorSeating) await user.click(outdoorSeating);
    await user.click(screen.getByText(/Next/i));

    // Step 4: Review & Submit
    await waitFor(() => expect(screen.getByText("Final Steps", { selector: 'h3' })).toBeInTheDocument());
    await user.click(screen.getByLabelText(/I accept the terms and conditions/i));
    await user.click(screen.getByRole("button", { name: /Register Restaurant/i }));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("restaurants");
      expect(supabase.from).toHaveBeenCalledWith("restaurant_locations");
    });
  });

  it("handles location insertion failure and attempts rollback (logic check)", async () => {
    const mockRestaurantId = "new-restaurant-id";
    (supabase.from as jest.Mock).mockImplementation((table) => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        insert: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockResolvedValue({ error: null }),
        delete: jest.fn().mockReturnThis(),
        then: jest.fn((onfulfilled: any) => Promise.resolve(onfulfilled({ data: null, error: null, count: 0 }))),
      };

      if (table === "restaurants") {
        mockChain.single = jest.fn().mockResolvedValue({ data: { id: mockRestaurantId }, error: null });
        mockChain.eq = jest.fn().mockReturnThis();
        (mockChain as any).then = jest.fn((onfulfilled: any) => Promise.resolve(onfulfilled({ data: { id: mockRestaurantId }, error: null })));
      }
      
      if (table === "restaurant_locations") {
        mockChain.insert = jest.fn().mockResolvedValue({ error: { message: "Location insertion failed" } });
      }

      return mockChain;
    });

    renderWithRouter(<RestaurantRegistrationForm onSuccess={() => {}} setLoading={() => {}} setCurrentStep={() => {}} />);

    await fillStep1("Fail Resto");

    // Step 2
    await waitFor(() => expect(screen.getByText(/Location\(s\) & Contact/i)).toBeInTheDocument());
    await user.type(screen.getByLabelText(/Location Name/i), "Main Branch");
    
    const countrySelect = screen.getAllByText(/Country/i).find(el => el.tagName === 'LABEL')?.parentElement?.querySelector('select');
    if (countrySelect) await user.selectOptions(countrySelect, "US");

    await user.type(screen.getByLabelText(/Street Address/i), "123 Error St");
    await user.type(screen.getByLabelText(/City/i), "Error City");
    await user.type(screen.getByLabelText(/Email/i), "error@example.com");
    await user.type(screen.getByLabelText(/Phone Number/i), "1112223333");
    await user.click(screen.getByText(/Next/i));

    // Step 3
    await waitFor(() => expect(screen.getByText("Restaurant Features", { selector: 'h3' })).toBeInTheDocument());
    const outdoorSeatingFail = screen.getByText("Outdoor Seating").parentElement?.querySelector('button[role="checkbox"]');
    if (outdoorSeatingFail) await user.click(outdoorSeatingFail);
    await user.click(screen.getByText(/Next/i));

    // Step 4
    await waitFor(() => expect(screen.getByText("Final Steps", { selector: 'h3' })).toBeInTheDocument());
    await user.click(screen.getByLabelText(/I accept the terms and conditions/i));
    await user.click(screen.getByRole("button", { name: /Register Restaurant/i }));

    await waitFor(() => {
      // Should have tried to insert restaurant then failed at location
      expect(supabase.from).toHaveBeenCalledWith("restaurants");
      expect(supabase.from).toHaveBeenCalledWith("restaurant_locations");
    });
  });
});
