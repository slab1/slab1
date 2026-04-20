
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";

export const paymentApi = {
  // Create a payment intent for the user
  createPaymentIntent: async (
    amount: number,
    currency: string = "usd",
    metadata: Record<string, string | number | boolean> = {}
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: { amount, currency, metadata },
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Complete a payment
  completePayment: async (paymentIntentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "complete-payment",
        {
          body: { paymentIntentId },
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get payment history for a user
  getPaymentHistory: async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "get-payment-history",
        {
          body: { userId },
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get revenue metrics for a restaurant
  getRevenueMetrics: async (restaurantId: string, period: string = "7d") => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "get-revenue-metrics",
        {
          body: { restaurantId, period },
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get transaction breakdown by type
  getTransactionBreakdown: async (restaurantId: string, period: string = "7d") => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "get-transaction-breakdown",
        {
          body: { restaurantId, period },
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Generate payment report
  generatePaymentReport: async (
    restaurantId: string, 
    startDate: string, 
    endDate: string,
    reportType: "daily" | "weekly" | "monthly" = "daily"
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-payment-report",
        {
          body: { restaurantId, startDate, endDate, reportType },
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get real-time payment updates
  getRealtimePaymentUpdates: async (restaurantId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "get-realtime-payment-updates",
        {
          body: { restaurantId },
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};
