import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Reservation } from "@/api/types";

interface ReservationDialogsProps {
  selectedReservation: Reservation | null;
  confirmDialogOpen: boolean;
  cancelDialogOpen: boolean;
  onConfirmDialogOpenChange: (open: boolean) => void;
  onCancelDialogOpenChange: (open: boolean) => void;
  cancellationReason: string;
  onCancellationReasonChange: (reason: string) => void;
  notificationMsg: string;
  onNotificationMsgChange: (msg: string) => void;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReservationDialogs({
  selectedReservation,
  confirmDialogOpen,
  cancelDialogOpen,
  onConfirmDialogOpenChange,
  onCancelDialogOpenChange,
  cancellationReason,
  onCancellationReasonChange,
  notificationMsg,
  onNotificationMsgChange,
  isSubmitting,
  onConfirm,
  onCancel
}: ReservationDialogsProps) {
  return (
    <>
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={onConfirmDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm this reservation? An email notification will be sent to the customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Optional notification message..."
              value={notificationMsg}
              onChange={(e) => onNotificationMsgChange(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onConfirmDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={onCancelDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this reservation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for cancellation..."
              value={cancellationReason}
              onChange={(e) => onCancellationReasonChange(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onCancelDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={onCancel}
              disabled={isSubmitting || !cancellationReason.trim()}
            >
              {isSubmitting ? 'Cancelling...' : 'Cancel Reservation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}