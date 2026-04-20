
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Shield, 
  Globe, 
  TrendingUp, 
  Users, 
  Clock,
  Server,
  Lock
} from "lucide-react";

export const PerformanceScalability: React.FC = () => {
  const performanceFeatures = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "99.9% uptime with sub-second response times",
      metric: "<100ms",
      label: "Average Response"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and security protocols",
      metric: "SOC 2",
      label: "Compliant"
    },
    {
      icon: Globe,
      title: "Global CDN",
      description: "Fast delivery worldwide with edge caching",
      metric: "150+",
      label: "Global Nodes"
    },
    {
      icon: TrendingUp,
      title: "Auto Scaling",
      description: "Automatically handles traffic spikes",
      metric: "10,000+",
      label: "Concurrent Users"
    }
  ];

  const scalabilityStats = [
    {
      icon: Users,
      title: "Growing Network",
      value: "10,000+",
      description: "Restaurant partners worldwide"
    },
    {
      icon: Clock,
      title: "Always Available",
      value: "99.9%",
      description: "Guaranteed uptime SLA"
    },
    {
      icon: Server,
      title: "Data Processing",
      value: "1M+",
      description: "Orders processed daily"
    },
    {
      icon: Lock,
      title: "Security First",
      value: "256-bit",
      description: "AES encryption standard"
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Built for Performance & Scale
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Our enterprise-grade infrastructure ensures your restaurant operations run smoothly, no matter how fast you grow.
          </p>
        </div>

        {/* Performance Features */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {performanceFeatures.map((feature, index) => (
            <Card key={index} className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{feature.metric}</div>
                  <div className="text-sm text-gray-500">{feature.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Scalability Stats */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              Trusted by Industry Leaders
            </h3>
            <p className="mt-2 text-gray-600">
              Our platform handles millions of transactions daily
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {scalabilityStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-lg font-medium text-gray-700 mb-1">
                  {stat.title}
                </div>
                <div className="text-sm text-gray-500">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2">
              ISO 27001 Certified
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              GDPR Compliant
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              PCI DSS Level 1
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              99.9% SLA Guarantee
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
