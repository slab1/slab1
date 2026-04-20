
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, TrendingUp, Shield } from "lucide-react";

interface PartnershipHeroProps {
  onGetStarted: () => void;
}

export const PartnershipHero: React.FC<PartnershipHeroProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Partner with Us
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Join thousands of restaurants already growing their business with our comprehensive management platform.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                10,000+ Restaurants
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Join our growing network of successful restaurant partners
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <TrendingUp className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                30% Revenue Growth
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Average revenue increase for our restaurant partners
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Enterprise Security
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Bank-level security protecting your business data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
