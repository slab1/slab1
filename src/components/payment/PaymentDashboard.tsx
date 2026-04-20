
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RevenueMetrics } from "./RevenueMetrics";
import { TransactionHistory } from "./TransactionHistory";
import { TaxConfiguration } from "../admin/settings/TaxConfiguration";
import { CreditCard, TrendingUp, FileText, Settings, Percent } from "lucide-react";

interface PaymentDashboardProps {
  restaurantId: string;
}

export function PaymentDashboard({ restaurantId }: PaymentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payment Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor revenue, transactions, and payment analytics
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Payment Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Taxes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RevenueMetrics restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionHistory restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Reports</CardTitle>
              <CardDescription>
                Generate detailed payment and revenue reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Daily Revenue Report</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Detailed breakdown of daily revenue and transactions
                  </p>
                  <Button size="sm" className="w-full">Generate Report</Button>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Monthly Summary</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monthly revenue summary and trends analysis
                  </p>
                  <Button size="sm" className="w-full">Generate Report</Button>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Transaction Analysis</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive transaction analysis and insights
                  </p>
                  <Button size="sm" className="w-full">Generate Report</Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-6">
          <TaxConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
