import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface ReservationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function ReservationFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}: ReservationFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <Input
        placeholder="Search by customer, email, or date..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-xs"
      />
      
      <div className="flex items-center gap-2">
        <span className="text-sm">Status:</span>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}