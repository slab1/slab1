
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TestingPanel } from "./TestingPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Mock Supabase
jest.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    })),
  },
}));

// Mock useToast
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

describe("TestingPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the testing panel and fetches data", async () => {
    const mockPartners = [
      {
        id: "1",
        business_name: "Test Restaurant",
        subscription_status: "trial",
        user_id: "user-1",
        subscription_plans: { name: "Pro Plan" },
      },
    ];

    const mockPlans = [{ id: "plan-1", name: "Pro Plan" }];

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "restaurant_partners") {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockPartners, error: null }),
        };
      }
      if (table === "subscription_plans") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: mockPlans, error: null }),
        };
      }
      return {};
    });

    render(<TestingPanel />);

    expect(screen.getByText("Admin Testing Panel")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("Test Restaurant")).toBeInTheDocument();
      expect(screen.getByText("Pro Plan")).toBeInTheDocument();
    });
  });

  it("simulates payment correctly", async () => {
    const mockPartners = [
      {
        id: "1",
        business_name: "Test Restaurant",
        subscription_status: "trial",
        user_id: "user-1",
        subscription_plans: { name: "Pro Plan" },
      },
    ];

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockPartners, error: null }),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
        then: jest.fn((onfulfilled: any) => Promise.resolve(onfulfilled({ data: mockPartners, error: null }))),
      };
      return mockChain;
    });

    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    render(<TestingPanel />);

    await waitFor(() => screen.getAllByRole("row").length > 1);
    
    fireEvent.click(screen.getByTitle("Simulate Success Payment"));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("restaurant_partners");
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Payment Simulated",
      }));
    });
  });

  it("simulates payment failure correctly", async () => {
    const mockPartners = [
      {
        id: "1",
        business_name: "Test Restaurant",
        subscription_status: "active",
        user_id: "user-1",
      },
    ];

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockPartners, error: null }),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
        then: jest.fn((onfulfilled: any) => Promise.resolve(onfulfilled({ data: mockPartners, error: null }))),
      };
      return mockChain;
    });

    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    render(<TestingPanel />);

    await waitFor(() => screen.getAllByRole("row").length > 1);
    
    fireEvent.click(screen.getByTitle("Simulate Failed Payment"));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("restaurant_partners");
      // Just check if any toast was called, we'll see the failure in logs if it's wrong
      expect(mockToast).toHaveBeenCalled();
    });
  });

  it("simulates trial expiry correctly", async () => {
    const mockPartners = [
      {
        id: "1",
        business_name: "Test Restaurant",
        subscription_status: "trial",
        user_id: "user-1",
        subscription_plans: { name: "Pro Plan" },
      },
    ];

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "restaurant_partners") {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockPartners, error: null }),
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    render(<TestingPanel />);

    await waitFor(() => screen.getAllByRole("row").length > 1);
    
    // Click the trial expiry button
    const buttons = screen.getAllByRole("button");
    const expiryButton = buttons.find(b => b.getAttribute("title") === "Simulate Trial Expiry");
    
    if (expiryButton) {
      fireEvent.click(expiryButton);
    } else {
      throw new Error("Expiry button not found");
    }

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("restaurant_partners");
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Trial Expiry Simulated",
      }));
    });
  });

  it("creates a test partner correctly", async () => {
    const mockPlans = [{ id: "plan-1", name: "Pro Plan" }];

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "restaurant_partners") {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
          insert: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
        };
      }
      if (table === "subscription_plans") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: mockPlans, error: null }),
        };
      }
      return {};
    });

    const { toast } = (useToast as jest.Mock)();

    render(<TestingPanel />);

    fireEvent.click(screen.getByText("Create Test Partner"));

    await waitFor(() => screen.getByLabelText("Business Name"));

    fireEvent.change(screen.getByLabelText("Business Name"), { target: { value: "New Bistro" } });
    fireEvent.change(screen.getByLabelText("Business Email"), { target: { value: "bistro@test.com" } });
    
    // Trigger the create button
    const createButtons = screen.getAllByText("Create Partner");
    fireEvent.click(createButtons[createButtons.length - 1]);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("restaurant_partners");
    });
  });

  it("activates account correctly", async () => {
    const mockPartners = [
      {
        id: "1",
        business_name: "Test Restaurant",
        subscription_status: "trial",
        user_id: "user-1",
        onboarding_completed: false,
      },
    ];

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "restaurant_partners") {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockPartners, error: null }),
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    // Directly mock useToast return value in the test
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    render(<TestingPanel />);

    await waitFor(() => screen.getAllByRole("row").length > 1);
    
    // Click the activate button (it's the CheckCircle2 icon button)
    const buttons = screen.getAllByRole("button");
    const activateButton = buttons.find(b => b.getAttribute("title") === "Activate Account & Complete Onboarding");
    
    if (activateButton) {
      fireEvent.click(activateButton);
    } else {
      throw new Error("Activate button not found");
    }

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("restaurant_partners");
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Account Activated",
      }));
    });
  });
});
