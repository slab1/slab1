
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Package, 
  MessageSquare, 
  Calendar,
  CreditCard,
  Settings
} from "lucide-react";

export const BusinessFeatures: React.FC = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Order Management",
      description: "Streamline orders from multiple channels with real-time tracking and automated workflows."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Make data-driven decisions with comprehensive reporting and business intelligence tools."
    },
    {
      icon: Users,
      title: "Staff Management",
      description: "Manage schedules, track performance, and optimize your team's productivity."
    },
    {
      icon: Package,
      title: "Inventory Tracking",
      description: "Real-time inventory management with automated reordering and waste reduction."
    },
    {
      icon: MessageSquare,
      title: "Customer Feedback",
      description: "Collect and analyze customer reviews to continuously improve your service."
    },
    {
      icon: Calendar,
      title: "Reservation System",
      description: "Advanced booking system with table management and customer preferences."
    },
    {
      icon: CreditCard,
      title: "Payment Processing",
      description: "Integrated payment solutions with detailed financial reporting."
    },
    {
      icon: Settings,
      title: "Menu Management",
      description: "Dynamic menu management with pricing optimization and seasonal updates."
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Everything You Need to Grow Your Restaurant
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Our comprehensive platform provides all the tools you need to manage and scale your restaurant business.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex justify-center">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
