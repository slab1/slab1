
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { reservationApi } from "@/api/reservation";
import { Reservation, Profile } from "@/api/types";
import { handleApiError, isApiError } from "@/api/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ReservationFilters } from "./ReservationFilters";
import { ReservationDialogs } from "./ReservationDialogs";
import { ReservationTableRow } from "./ReservationTableRow";
import { sendReservationConfirmationEmail } from "@/api/reservation/email";
import { ErrorHandler } from "@/utils/error-handling";

export function ReservationsTable() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [notificationMsg, setNotificationMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    data: reservations, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["reservations", user?.id, user?.role],
    queryFn: async () => {
      if (!user) {
        throw new Error("Authentication required");
      }
      // Pass user credentials for server-side authorization
      const result = await reservationApi.getAll(user.id, user.role);
      if (isApiError(result)) {
        throw new Error(result.error);
      }
      return result;
    },
    enabled: !!user,
  });

  useEffect(() => {
    // Set up real-time listener for reservation status changes
    const channel = reservationApi.subscribeToStatusChanges(payload => {
      console.log('Reservation update:', payload);
      toast.info(
        `Reservation for ${payload.new.id.substring(0, 8)} has been updated`,
        {
          description: `Status changed to ${payload.new.status}`,
          action: {
            label: "View",
            onClick: () => refetch(),
          },
        }
      );
      refetch();
    });

    return () => {
      // Clean up the subscription when component unmounts
      channel.unsubscribe();
    };
  }, [refetch]);

  const handleStatusChange = async (id: string, newStatus: string, reason?: string) => {
    return ErrorHandler.withErrorHandling(async () => {
      setIsSubmitting(true);
      const result = await reservationApi.updateStatus(id, newStatus);
      
      if (isApiError(result)) {
        throw new Error(result.error);
      }
      
      if (newStatus === 'confirmed') {
        try {
          await sendReservationConfirmationEmail(id);
          toast.success('Reservation confirmed! The customer has been notified via email.');
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          toast.error("Reservation confirmed, but failed to send email notification.");
        }
      } else if (newStatus === 'cancelled') {
        toast.success(`Reservation cancelled. ${reason ? 'Reason noted.' : ''}`);
      } else if (newStatus === 'completed') {
        toast.success('Reservation marked as completed.');
      } else {
        toast.success(`Reservation status updated to ${newStatus}`);
      }
      
      setSelectedReservation(null);
      setCancellationReason("");
      setNotificationMsg("");
      refetch();
    }, { context: 'reservation_status_update', reservationId: id, newStatus }).finally(() => {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
      setCancelDialogOpen(false);
    });
  };

  const filteredReservations = reservations?.filter(reservation => {
    if (statusFilter !== "all" && reservation.status !== statusFilter) {
      return false;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const userEmail = typeof reservation.user === 'object' && reservation.user !== null 
      ? (reservation.user as Profile).email?.toLowerCase() || ""
      : "";
    const userName = typeof reservation.user === 'object' && reservation.user !== null
      ? `${(reservation.user as Profile).first_name} ${(reservation.user as Profile).last_name}`.toLowerCase()
      : "";
    const dateStr = reservation.reservation_date;
    
    return userEmail.includes(searchLower) || 
           userName.includes(searchLower) || 
           dateStr.includes(searchLower);
  }) || [];

  if (error) {
    return <div>Error loading reservations: {(error as Error).message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reservations</h2>
      </div>

      <ReservationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Customer</TableHead>
                <TableHead className="min-w-[150px]">Date & Time</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[100px]">Party Size</TableHead>
                <TableHead className="hidden md:table-cell min-w-[150px]">Restaurant</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="text-right min-w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No reservations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((reservation) => (
                  <ReservationTableRow
                    key={reservation.id}
                    reservation={reservation}
                    onConfirm={(reservation) => {
                      setSelectedReservation(reservation);
                      setConfirmDialogOpen(true);
                    }}
                    onCancel={(reservation) => {
                      setSelectedReservation(reservation);
                      setCancelDialogOpen(true);
                    }}
                    onMarkComplete={(id) => handleStatusChange(id, 'completed')}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ReservationDialogs
        selectedReservation={selectedReservation}
        confirmDialogOpen={confirmDialogOpen}
        cancelDialogOpen={cancelDialogOpen}
        onConfirmDialogOpenChange={setConfirmDialogOpen}
        onCancelDialogOpenChange={setCancelDialogOpen}
        cancellationReason={cancellationReason}
        onCancellationReasonChange={setCancellationReason}
        notificationMsg={notificationMsg}
        onNotificationMsgChange={setNotificationMsg}
        isSubmitting={isSubmitting}
        onConfirm={() => selectedReservation && handleStatusChange(selectedReservation.id, 'confirmed')}
        onCancel={() => selectedReservation && handleStatusChange(selectedReservation.id, 'cancelled', cancellationReason)}
      />
    </div>
  );
}
