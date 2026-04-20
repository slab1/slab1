
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../utils";

interface RevenueAnalytics {
  totalRevenue: number;
  reservationRevenue: number;
  averageTransaction: number;
  transactionCount: number;
  refunds: number;
  dailyRevenue: { name: string; value: number }[];
  monthlyRevenue: { name: string; value: number }[];
  transactionsByType: { name: string; value: number }[];
}

interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  type: "reservation" | "deposit" | "refund";
  customer: string;
}

export const restaurantPaymentApi = {
  getRevenueAnalytics: async (restaurantId: string, period: string): Promise<RevenueAnalytics> => {
    try {
      // Query real payment data from Supabase
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'succeeded');

      if (error) throw error;

      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const transactionCount = payments.length;
      const averageTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0;
      
      // Calculate daily revenue for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });

      const dailyRevenue = last7Days.map(date => {
        const dayRevenue = payments
          .filter(p => p.completed_at?.startsWith(date))
          .reduce((sum, p) => sum + Number(p.amount), 0);
        
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        return { name: dayName, value: dayRevenue };
      });

      return {
        totalRevenue,
        reservationRevenue: totalRevenue, // Assuming all payments are for reservations for now
        averageTransaction,
        transactionCount,
        refunds: 0, // Need to query refunds table if implemented
        dailyRevenue,
        monthlyRevenue: [], // Could be implemented similarly
        transactionsByType: [
          { name: "Reservations", value: transactionCount },
        ]
      };
    } catch (error) {
      handleApiError(error);
      return {
        totalRevenue: 0,
        reservationRevenue: 0,
        averageTransaction: 0,
        transactionCount: 0,
        refunds: 0,
        dailyRevenue: [],
        monthlyRevenue: [],
        transactionsByType: []
      };
    }
  },

  getTransactionHistory: async (
    restaurantId: string,
    startDate?: string,
    endDate?: string,
    status?: string,
    type?: string
  ): Promise<Transaction[]> => {
    try {
      let query = supabase
        .from('payments')
        .select(`
          id,
          amount,
          completed_at,
          status,
          description,
          user_id
        `)
        .eq('restaurant_id', restaurantId)
        .order('completed_at', { ascending: false });

      if (startDate) query = query.gte('completed_at', startDate);
      if (endDate) query = query.lte('completed_at', endDate);
      if (status) query = query.eq('status', status);

      const { data: payments, error } = await query;

      if (error) throw error;

      // In a real app, you'd join with profiles to get customer names
      return (payments || []).map((p: any) => ({
        id: p.id,
        amount: Number(p.amount),
        date: p.completed_at || new Date().toISOString(),
        status: p.status === 'succeeded' ? 'completed' : (p.status === 'failed' ? 'failed' : 'pending'),
        type: 'reservation',
        customer: `Customer ${(p.user_id || '').slice(0, 5)}`
      }));
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  exportTransactionReport: async (
    restaurantId: string,
    format: "csv" | "pdf" | "excel",
    filters?: {
      startDate?: string;
      endDate?: string;
      types?: string[];
      statuses?: string[];
    }
  ): Promise<{ success: boolean; downloadUrl?: string; message: string }> => {
    try {
      // Mock implementation
      return {
        success: true,
        downloadUrl: "/mock-download-url",
        message: "Report exported successfully"
      };
    } catch (error) {
      handleApiError(error);
      return {
        success: false,
        message: "Failed to export report"
      };
    }
  },

  // Process a real payment via Stripe Edge Function
  createDemoPayment: async (restaurantId: string, amount: number, description: string): Promise<{ clientSecret: string; paymentIntentId: string } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(amount * 100),
          currency: 'usd',
          restaurant_id: restaurantId,
          description: description,
          metadata: { type: 'demo' }
        }
      });

      if (error) throw error;
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId
      };
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  createMemoPayment: async (restaurantId: string, amount: number, description: string, memo: string): Promise<{ clientSecret: string; paymentIntentId: string } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(amount * 100),
          currency: 'usd',
          restaurant_id: restaurantId,
          description: description,
          metadata: { type: 'memo', memo: memo }
        }
      });

      if (error) throw error;
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId
      };
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  processReservationPayment: async (
    reservationId: string, 
    amount: number, 
    currency: string
  ): Promise<{ clientSecret: string; paymentIntentId: string } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(amount * 100),
          currency,
          reservation_id: reservationId
        }
      });

      if (error) throw error;
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId
      };
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  confirmReservationPayment: async (
    reservationId: string,
    paymentIntentId: string
  ): Promise<{ success: boolean; message: string } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('complete-payment', {
        body: { paymentIntentId, reservationId }
      });

      if (error) throw error;
      return {
        success: data.success,
        message: data.success ? "Payment confirmed successfully" : "Payment confirmation pending"
      };
    } catch (error) {
      handleApiError(error);
      return null;
    }
  }
};
