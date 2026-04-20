import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-muted-foreground">
                Choose the plan that's right for your restaurant
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter Plan */}
              <div className="bg-card border rounded-xl p-8 flex flex-col h-full">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Starter</h2>
                  <p className="text-muted-foreground text-sm mb-4">Perfect for small restaurants</p>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold">$49</span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  <PricingFeature>Up to 100 reservations/month</PricingFeature>
                  <PricingFeature>Basic reservation management</PricingFeature>
                  <PricingFeature>Email notifications</PricingFeature>
                  <PricingFeature>Restaurant profile page</PricingFeature>
                  <PricingFeature>Standard support</PricingFeature>
                </ul>
                
                <Button variant="outline" className="w-full">Get Started</Button>
              </div>
              
              {/* Professional Plan */}
              <div className="bg-card border-2 border-primary rounded-xl p-8 flex flex-col h-full relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white text-sm font-medium py-1 px-3 rounded-full">
                  Most Popular
                </div>
                
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Professional</h2>
                  <p className="text-muted-foreground text-sm mb-4">For growing restaurants</p>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  <PricingFeature>Unlimited reservations</PricingFeature>
                  <PricingFeature>Advanced booking management</PricingFeature>
                  <PricingFeature>SMS notifications</PricingFeature>
                  <PricingFeature>Table management</PricingFeature>
                  <PricingFeature>Customer database</PricingFeature>
                  <PricingFeature>Priority support</PricingFeature>
                </ul>
                
                <Button className="w-full">Get Started</Button>
              </div>
              
              {/* Enterprise Plan */}
              <div className="bg-card border rounded-xl p-8 flex flex-col h-full">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Enterprise</h2>
                  <p className="text-muted-foreground text-sm mb-4">For restaurant groups</p>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold">$249</span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  <PricingFeature>Multiple restaurant locations</PricingFeature>
                  <PricingFeature>Custom branding</PricingFeature>
                  <PricingFeature>API access</PricingFeature>
                  <PricingFeature>Advanced analytics</PricingFeature>
                  <PricingFeature>Dedicated account manager</PricingFeature>
                  <PricingFeature>24/7 premium support</PricingFeature>
                </ul>
                
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </div>
            </div>
            
            <div className="mt-16 bg-muted rounded-xl p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Can I switch plans later?</h3>
                  <p className="text-muted-foreground">
                    Yes, you can upgrade or downgrade your plan at any time. Changes will be effective in your next billing cycle.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Is there a setup fee?</h3>
                  <p className="text-muted-foreground">
                    No, there are no setup fees or hidden charges. You only pay the advertised monthly subscription fee.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Do you offer a free trial?</h3>
                  <p className="text-muted-foreground">
                    Yes, all plans come with a 14-day free trial so you can experience the benefits before committing.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">What payment methods do you accept?</h3>
                  <p className="text-muted-foreground">
                    We accept all major credit cards, and can arrange invoicing for annual enterprise contracts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center">
      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
      <span className="text-sm">{children}</span>
    </li>
  );
}
