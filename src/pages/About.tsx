
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Award, MapPin, Calendar } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";

export default function About() {
  const stats = [
    { label: "Restaurants", value: "500+", icon: MapPin },
    { label: "Happy Customers", value: "50K+", icon: Users },
    { label: "Cities", value: "25+", icon: MapPin },
    { label: "Years of Service", value: "3+", icon: Award },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616b332c2c2?q=80&w=150",
      bio: "Passionate about connecting people with great dining experiences."
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150",
      bio: "Building the technology that powers seamless reservations."
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150",
      bio: "Ensuring every reservation is a perfect experience."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">About Reservatoo</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Revolutionizing Restaurant Reservations
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're on a mission to make dining out effortless by connecting food lovers 
              with their perfect restaurant experience through innovative technology.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At Reservatoo, we believe that great meals bring people together. Our platform 
                bridges the gap between diners and restaurants, making it easier than ever to 
                discover, book, and enjoy exceptional dining experiences.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                We're committed to supporting local restaurants while providing diners with 
                transparent, real-time booking capabilities that eliminate the frustration of 
                traditional reservation systems.
              </p>
              <Button size="lg">Join Our Community</Button>
            </div>
            <div className="relative">
              <OptimizedImage 
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=600" 
                alt="Restaurant dining" 
                className="rounded-2xl shadow-2xl"
                aspectRatio="16/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate individuals working to transform the dining experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <Card key={member.name}>
                <CardHeader className="text-center">
                  <OptimizedImage
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
