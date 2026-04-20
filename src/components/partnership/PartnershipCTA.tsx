
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle } from "lucide-react";

interface PartnershipCTAProps {
  onGetStarted: () => void;
}

export const PartnershipCTA: React.FC<PartnershipCTAProps> = ({ onGetStarted }) => {
  const benefits = [
    "14-day free trial with full access",
    "No setup fees or hidden charges",
    "24/7 customer support",
    "Easy migration from existing systems",
    "Cancel anytime with no penalties"
  ];

  return (
    <div className="bg-blue-600">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Ready to Transform Your Restaurant Business?
            </CardTitle>
            <CardDescription className="text-xl text-gray-600 mt-4">
              Join thousands of successful restaurant owners who have grown their business with our platform.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    🎉 Limited Time Offer
                  </h3>
                  <p className="text-green-700">
                    Get your first month 50% off when you sign up for any annual plan during your trial period.
                  </p>
                </div>
                
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <p className="text-sm text-gray-500 mt-4">
                  No credit card required • Start in less than 5 minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
