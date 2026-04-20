import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/providers/AuthProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { PaymentProvider } from "@/components/payment/PaymentProvider";
import NotificationSystem from '@/components/notifications/NotificationSystem';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { initGA, logPageView } from "@/utils/analytics";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ThemeProvider } from "next-themes";

// Critical pages - eagerly loaded for fast initial render
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Restaurants from "@/pages/EnhancedRestaurants";
import RestaurantDetails from "@/pages/RestaurantDetails";

// Lazy-loaded pages
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Profile = lazy(() => import("@/pages/Profile"));
const Booking = lazy(() => import("@/pages/Booking"));
const BookingConfirmed = lazy(() => import("@/pages/BookingConfirmed"));
const Reservations = lazy(() => import("@/pages/Reservations"));
const ReservationDetails = lazy(() => import("@/pages/ReservationDetails"));
const Admin = lazy(() => import("@/pages/Admin"));
const RestaurantOwner = lazy(() => import("@/pages/RestaurantOwner"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const DatabaseSetup = lazy(() => import("@/pages/DatabaseSetup"));
const FeaturedRestaurants = lazy(() => import("@/pages/FeaturedRestaurants"));
const NearbyRestaurants = lazy(() => import("@/pages/NearbyRestaurants"));
const EnhancedFavorites = lazy(() => import("@/pages/EnhancedFavorites"));
const RestaurantComparison = lazy(() => import("@/pages/RestaurantComparison"));
const Help = lazy(() => import("@/pages/Help"));
const Partner = lazy(() => import("@/pages/Partner"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const CaseStudies = lazy(() => import("@/pages/CaseStudies"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const Accessibility = lazy(() => import("@/pages/Accessibility"));
const ChefBookings = lazy(() => import("@/pages/ChefBookings"));
const ChefBookingDetails = lazy(() => import("@/pages/ChefBookingDetails"));
const ChefsWarehouse = lazy(() => import("@/pages/ChefsWarehouse"));
const StaffPage = lazy(() => import("@/pages/StaffPage"));
const StaffDashboard = lazy(() => import("@/pages/StaffDashboard"));
const StaffSchedule = lazy(() => import("@/components/staff/StaffSchedule"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const Loyalty = lazy(() => import("@/pages/Loyalty"));
const Partnership = lazy(() => import("@/pages/Partnership"));
const MarketingHub = lazy(() => import("@/pages/MarketingHub"));
const PaymentSetup = lazy(() => import("@/pages/PaymentSetup"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const ProductionReady = lazy(() => import("@/pages/ProductionReady"));
const Features = lazy(() => import("@/pages/Features"));
const RestaurantRegistration = lazy(() => import("@/pages/RestaurantRegistration"));
const AuthSetup = lazy(() => import("@/pages/AuthSetup"));
const EnhancedDashboard = lazy(() => import("@/pages/EnhancedDashboard"));
const SeedDemoData = lazy(() => import("@/pages/SeedDemoData"));
const Developer = lazy(() => import("@/pages/Developer"));
const ApiDocs = lazy(() => import("@/pages/ApiDocs"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      retryDelay: 1000,
    },
  },
});

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  );
}

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    logPageView();
  }, [location]);

  const hideHeader = location.pathname.startsWith('/admin') ||
                    location.pathname.startsWith('/restaurant-owner') ||
                    location.pathname.startsWith('/staff-dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!hideHeader && <Header notificationCenter={<NotificationSystem />} />}
      <main className="flex-grow">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Main Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="/profile/loyalty" element={<Loyalty />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<EnhancedFavorites />} />

            {/* Restaurant Routes */}
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/enhanced" element={<Restaurants />} />
            <Route path="/restaurants/featured" element={<FeaturedRestaurants />} />
            <Route path="/restaurants/nearby" element={<NearbyRestaurants />} />
            <Route path="/restaurants/compare" element={<RestaurantComparison />} />
            <Route path="/restaurants/:id" element={<RestaurantDetails />} />

            {/* Booking Routes */}
            <Route path="/booking/:restaurantId" element={<Booking />} />
            <Route path="/booking-confirmed" element={<BookingConfirmed />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/reservation/:id" element={<ReservationDetails />} />
            <Route path="/chef-bookings" element={<ChefBookings />} />
            <Route path="/chef-booking/:id" element={<ChefBookingDetails />} />
            <Route path="/chefs-warehouse" element={<ChefsWarehouse />} />

            {/* Staff Management */}
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/staff/schedule" element={<StaffSchedule />} />
            <Route path="/staff-dashboard" element={<StaffDashboard />} />
            <Route path="/marketing-hub" element={<MarketingHub />} />

            {/* Inventory Management */}
            <Route path="/inventory" element={<Inventory />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/restaurant-owner" element={<RestaurantOwner />} />
            <Route path="/database-setup" element={<DatabaseSetup />} />
            <Route path="/seed-demo-data" element={<SeedDemoData />} />

            {/* Partnership Routes */}
            <Route path="/partnership" element={<Partnership />} />

            {/* Payment Routes */}
            <Route path="/payment-setup" element={<PaymentSetup />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />

            {/* Setup Routes */}
            <Route path="/auth-setup" element={<AuthSetup />} />
            <Route path="/production-ready" element={<ProductionReady />} />
            <Route path="/restaurant-registration" element={<RestaurantRegistration />} />

            {/* Enhanced Features */}
            <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />

            {/* Info Pages */}
            <Route path="/help" element={<Help />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/features" element={<Features />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/developer" element={<Developer />} />
            <Route path="/api-docs" element={<ApiDocs />} />

            {/* Legal Routes */}
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/accessibility" element={<Accessibility />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!hideHeader && <Footer />}
      <PWAInstallPrompt />
      <OfflineIndicator />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <PaymentProvider>
              <Router>
                <AppContent />
                <Toaster />
                <SonnerToaster />
              </Router>
            </PaymentProvider>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
