
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Check, X, Clock, Eye, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { reservationApi } from '@/api/reservation';
import { useNavigate } from 'react-router-dom';

interface ReservationActionsProps {
  reservationId: string;
  currentStatus: string;
  onStatusChange: (id: string, newStatus: string) => void;
}

export const ReservationActions: React.FC<ReservationActionsProps> = ({ 
  reservationId, 
  currentStatus,
  onStatusChange 
}) => {
  const navigate = useNavigate();
  
  const handleStatusUpdate = async (status: string) => {
    try {
      await reservationApi.updateStatus(reservationId, status);
      onStatusChange(reservationId, status);
      toast.success(`Reservation ${status}`);
    } catch (error) {
      console.error(`Error updating reservation to ${status}:`, error);
      toast.error('Failed to update reservation status');
    }
  };

  const handleViewDetails = () => {
    navigate(`/reservation/${reservationId}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await reservationApi.delete(reservationId);
        toast.success('Reservation deleted successfully');
        onStatusChange(reservationId, 'deleted');
      } catch (error) {
        console.error('Error deleting reservation:', error);
        toast.error('Failed to delete reservation');
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus !== 'confirmed' && (
          <DropdownMenuItem onClick={() => handleStatusUpdate('confirmed')}>
            <Check className="mr-2 h-4 w-4 text-green-500" />
            <span>Confirm</span>
          </DropdownMenuItem>
        )}
        
        {currentStatus !== 'cancelled' && (
          <DropdownMenuItem onClick={() => handleStatusUpdate('cancelled')}>
            <X className="mr-2 h-4 w-4 text-red-500" />
            <span>Cancel</span>
          </DropdownMenuItem>
        )}
        
        {currentStatus !== 'pending' && (
          <DropdownMenuItem onClick={() => handleStatusUpdate('pending')}>
            <Clock className="mr-2 h-4 w-4 text-amber-500" />
            <span>Mark as Pending</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleViewDetails}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
