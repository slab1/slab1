
import { Input } from "@/components/ui/input";

interface UserSearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function UserSearchInput({ searchTerm, onSearchChange }: UserSearchInputProps) {
  return (
    <Input
      placeholder="Search users..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="max-w-sm mb-4"
    />
  );
}
