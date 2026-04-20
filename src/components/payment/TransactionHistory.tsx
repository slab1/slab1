
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, Filter } from "lucide-react";
import { restaurantPaymentApi } from "@/api/restaurant/payment";
import { toast } from "sonner";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: string;
  type: string;
  customer: string;
}

interface TransactionHistoryProps {
  restaurantId: string;
}

export function TransactionHistory({ restaurantId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await restaurantPaymentApi.getTransactionHistory(
        restaurantId,
        undefined,
        undefined,
        statusFilter === 'all' ? undefined : statusFilter,
        typeFilter === 'all' ? undefined : typeFilter
      );
      
      if (Array.isArray(data)) {
        setTransactions(data);
      } else {
        console.error('Invalid transaction data:', data);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transaction history');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, statusFilter, typeFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportReport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const result = await restaurantPaymentApi.exportTransactionReport(
        restaurantId,
        format,
        {
          statuses: statusFilter === 'all' ? [] : [statusFilter],
          types: typeFilter === 'all' ? [] : [typeFilter]
        }
      );
      
      if (result && result.success) {
        toast.success(result.message);
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      reservation: 'bg-blue-100 text-blue-800',
      deposit: 'bg-green-100 text-green-800',
      refund: 'bg-red-100 text-red-800'
    } as const;
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          View and manage all payment transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="reservation">Reservation</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportReport('csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportReport('pdf')}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {transaction.id}
                    </TableCell>
                    <TableCell>{transaction.customer}</TableCell>
                    <TableCell>
                      <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
