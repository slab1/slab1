import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { Reservation, Profile } from "@/api/types";
import { formatDisplayDate, formatDisplayTime } from "@/lib/utils";

interface ReservationTableRowProps {
  reservation: Reservation;
  onConfirm: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
  onMarkComplete: (id: string) => void;
}

export function ReservationTableRow({
  reservation,
  onConfirm,
  onCancel,
  onMarkComplete
}: ReservationTableRowProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TableRow key={reservation.id}>
      <TableCell>
        <div>
          <div className="font-medium">
            {typeof reservation.user === 'object' && reservation.user ? 
              `${(reservation.user as Profile).first_name} ${(reservation.user as Profile).last_name}` : 
              "Guest"}
          </div>
          <div className="text-sm text-muted-foreground">
            {typeof reservation.user === 'object' && reservation.user ? 
              (reservation.user as Profile).email : (reservation.contact_info as any)?.email || ""}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">
          {formatDisplayDate(reservation.reservation_date)}
        </div>
        <div className="text-sm text-muted-foreground">{formatDisplayTime(reservation.reservation_time)}</div>
      </TableCell>
      <TableCell>{reservation.guest_count}</TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{reservation.restaurant?.name || "Unknown Restaurant"}</div>
          <div className="text-xs text-muted-foreground">
            {(reservation.location as any)?.city || ""}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(reservation.status)}`}>
          {reservation.status}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {reservation.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="default"
                className="h-8"
                onClick={() => onConfirm(reservation)}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Confirm
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8"
                onClick={() => onCancel(reservation)}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
            </>
          )}
          {reservation.status === 'confirmed' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => onMarkComplete(reservation.id)}
            >
              Mark Complete
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}