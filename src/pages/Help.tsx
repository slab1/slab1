
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Book, Users, CreditCard, Phone, MessageCircle } from "lucide-react";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Making Reservations",
      icon: Book,
      color: "bg-blue-100 text-blue-600",
      description: "Learn how to book and manage your restaurant reservations"
    },
    {
      title: "Account Management",
      icon: Users,
      color: "bg-green-100 text-green-600",
      description: "Profile settings, preferences, and account security"
    },
    {
      title: "Payments & Billing",
      icon: CreditCard,
      color: "bg-purple-100 text-purple-600",
      description: "Payment methods, billing questions, and refunds"
    },
    {
      title: "Technical Support",
      icon: Phone,
      color: "bg-orange-100 text-orange-600",
      description: "App issues, login problems, and technical difficulties"
    }
  ];

  const faqs = [
    {
      category: "reservations",
      question: "How do I make a reservation?",
      answer: "Simply search for a restaurant, select your preferred date and time, enter your party size, and click 'Book Now'. You'll receive an instant confirmation."
    },
    {
      category: "reservations",
      question: "Can I modify or cancel my reservation?",
      answer: "Yes! Go to 'My Reservations' in your account to modify or cancel. Please note cancellation policies may vary by restaurant."
    },
    {
      category: "reservations",
      question: "What if the restaurant is fully booked?",
      answer: "You can join the waitlist! We'll notify you if a table becomes available or suggest similar restaurants with availability."
    },
    {
      category: "account",
      question: "How do I create an account?",
      answer: "Click 'Sign Up' and enter your email, name, and password. You'll receive a verification email to activate your account."
    },
    {
      category: "account",
      question: "I forgot my password. What should I do?",
      answer: "Click 'Forgot Password' on the login page and enter your email. We'll send you a reset link within minutes."
    },
    {
      category: "payments",
      question: "Do I need to pay when making a reservation?",
      answer: "Most reservations are free to book. Some restaurants may require a deposit for large parties or special events."
    },
    {
      category: "payments",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital payment methods like Apple Pay and Google Pay."
    },
    {
      category: "technical",
      question: "The app isn't working properly. What should I do?",
      answer: "Try refreshing the page or restarting the app. If issues persist, clear your browser cache or contact our support team."
    }
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">Help Center</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How can we help you?
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers to common questions or contact our support team
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.title} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-3 rounded-lg mb-4 ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFAQs.length === 0 && searchQuery && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No results found for "{searchQuery}"</p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-8">
              Can't find what you're looking for? Our support team is here to help you 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Live Chat
              </Button>
              <Button variant="outline" size="lg" className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Call Support
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
