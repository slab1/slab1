
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PartnerRegistrationForm } from "./PartnerRegistrationForm";

describe("PartnerRegistrationForm", () => {
  const mockOnSubmit = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders step 1 (Business Info) initially", () => {
    render(
      <PartnerRegistrationForm 
        selectedPlanId="plan-1" 
        onSubmit={mockOnSubmit} 
        onBack={mockOnBack} 
      />
    );

    expect(screen.getByText("Business Information")).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Email/i)).toBeInTheDocument();
  });

  it("shows validation errors on step 1", async () => {
    render(
      <PartnerRegistrationForm 
        selectedPlanId="plan-1" 
        onSubmit={mockOnSubmit} 
        onBack={mockOnBack} 
      />
    );

    fireEvent.click(screen.getByText(/Next/i));

    await waitFor(() => {
      expect(screen.getByText(/Business name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Valid email is required/i)).toBeInTheDocument();
    });
  });

  it("advances to step 2 after filling step 1", async () => {
    render(
      <PartnerRegistrationForm 
        selectedPlanId="plan-1" 
        onSubmit={mockOnSubmit} 
        onBack={mockOnBack} 
      />
    );

    fireEvent.change(screen.getByLabelText(/Business Name/i), { target: { value: "Test Biz" } });
    fireEvent.change(screen.getByLabelText(/Business Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Business Phone/i), { target: { value: "1234567890" } });
    fireEvent.change(screen.getByLabelText(/Contact Name/i), { target: { value: "John Doe" } });

    fireEvent.click(screen.getByText(/Next/i));

    await waitFor(() => {
      expect(screen.getByText("Business Address")).toBeInTheDocument();
    });
  });

  it("submits the form after completing all steps", async () => {
    render(
      <PartnerRegistrationForm 
        selectedPlanId="plan-1" 
        onSubmit={mockOnSubmit} 
        onBack={mockOnBack} 
      />
    );

    // Step 1
    fireEvent.change(screen.getByLabelText(/Business Name/i), { target: { value: "Test Biz" } });
    fireEvent.change(screen.getByLabelText(/Business Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Business Phone/i), { target: { value: "1234567890" } });
    fireEvent.change(screen.getByLabelText(/Contact Name/i), { target: { value: "John Doe" } });
    fireEvent.click(screen.getByText(/Next/i));

    // Step 2
    await waitFor(() => screen.getByText("Business Address"));
    fireEvent.change(screen.getByLabelText(/Street Address/i), { target: { value: "123 Main St" } });
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: "Test City" } });
    fireEvent.change(screen.getByLabelText(/State/i), { target: { value: "Test State" } });
    fireEvent.change(screen.getByLabelText(/ZIP Code/i), { target: { value: "12345" } });
    fireEvent.click(screen.getByText(/Next/i));

    // Step 3
    await waitFor(() => screen.getByText("Terms and Agreements"));
    
    // Check checkboxes - using findByRole because they might be custom Radix components
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Terms
    fireEvent.click(checkboxes[1]); // Privacy

    fireEvent.click(screen.getByText(/Complete Registration/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        selectedPlanId: "plan-1",
        businessInfo: expect.objectContaining({ businessName: "Test Biz" }),
        address: expect.objectContaining({ city: "Test City" }),
      }));
    });
  });
});
