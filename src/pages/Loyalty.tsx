import { LoyaltyCard } from "@/components/loyalty/LoyaltyCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star, Trophy, Gift, Zap, Users, Shield,
  CheckCircle, Award, TrendingUp, Calendar
} from "lucide-react";

export default function Loyalty() {
  const tierBenefits = {
    Bronze: [
      "Earn base points on reservations",
      "Birthday bonus points",
      "Basic loyalty card access"
    ],
    Silver: [
      "5% bonus points on all reservations",
      "Exclusive member-only offers",
      "Priority reservation booking",
      "Monthly newsletter with specials"
    ],
    Gold: [
      "10% bonus points on all reservations",
      "Free appetizer with every reservation",
      "VIP customer service",
      "Priority waitlist access",
      "Quarterly exclusive events"
    ],
    Platinum: [
      "15% bonus points on all reservations",
      "Free dessert with every reservation",
      "Dedicated concierge service",
      "Special events and VIP experiences",
      "Personalized dining recommendations",
      "Complimentary upgrade options"
    ]
  };

  const programFeatures = [
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Easy Earning",
      description: "Earn 10 points for each reservation and 1 point for every $5 spent"
    },
    {
      icon: <Trophy className="h-6 w-6 text-primary" />,
      title: "Tier Progression",
      description: "Advance through Bronze, Silver, Gold, and Platinum tiers with increasing benefits"
    },
    {
      icon: <Gift className="h-6 w-6 text-primary" />,
      title: "Exclusive Rewards",
      description: "Redeem points for dining credits, special experiences, and premium perks"
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Community Access",
      description: "Join a community of food enthusiasts with shared benefits and experiences"
    }
  ];

  const earningOpportunities = [
    { action: "Make a reservation", points: "10 points" },
    { action: "Spend $5 at a restaurant", points: "1 point" },
    { action: "Write a review", points: "5 points" },
    { action: "Refer a friend", points: "25 points" },
    { action: "Celebrate your birthday", points: "50 points" },
    { action: "Complete your profile", points: "10 points" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold">Loyalty Program</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our exclusive dining loyalty program and earn rewards with every reservation.
            Unlock premium benefits and special experiences as you progress through our tiers.
          </p>
        </div>

        {/* Main Loyalty Card */}
        <div className="mb-12">
          <LoyaltyCard />
        </div>

        {/* Program Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {programFeatures.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Earning Opportunities */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-primary" />
              Ways to Earn Points
            </CardTitle>
            <CardDescription>
              Maximize your rewards by taking advantage of these earning opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earningOpportunities.map((opportunity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <span className="font-medium">{opportunity.action}</span>
                  <Badge variant="secondary" className="font-semibold">
                    {opportunity.points}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tier Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(tierBenefits).map(([tier, benefits]) => (
            <Card key={tier} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                tier === 'Bronze' ? 'bg-amber-500' :
                tier === 'Silver' ? 'bg-slate-400' :
                tier === 'Gold' ? 'bg-yellow-500' : 'bg-purple-600'
              }`} />
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className={`h-5 w-5 mr-2 ${
                    tier === 'Bronze' ? 'text-amber-500' :
                    tier === 'Silver' ? 'text-slate-400' :
                    tier === 'Gold' ? 'text-yellow-500' : 'text-purple-600'
                  }`} />
                  {tier} Tier
                </CardTitle>
                <CardDescription>
                  {tier === 'Bronze' && "Starting tier for all members"}
                  {tier === 'Silver' && "200+ points required"}
                  {tier === 'Gold' && "500+ points required"}
                  {tier === 'Platinum' && "1000+ points required"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Program Stats */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Shield className="h-6 w-6 mr-2 text-primary" />
              Program Statistics
            </CardTitle>
            <CardDescription>
              Join thousands of satisfied members in our growing loyalty community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Active Members</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">500K+</div>
                <div className="text-sm text-muted-foreground">Points Earned Monthly</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Partner Restaurants</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
