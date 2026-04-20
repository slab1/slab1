import { useState } from "react";
import { RestaurantRegistrationForm } from "@/components/restaurant-registration/RestaurantRegistrationForm";

// Add props type (even if empty, for clarity and future extensibility)
type RestaurantRegistrationProps = object;

export default function RestaurantRegistration(props: RestaurantRegistrationProps) {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // SEO/Meta tags (for Vite/React, use react-helmet-async or similar in real app)
  document.title = "Register Your Restaurant | Reservatoo";
  // (In a real app, use Helmet for meta tags)

  // Stepper labels
  const steps = [
    "Basic Info",
    "Locations",
    "Features",
    "Finish"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/70 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
        </div>
      )}

      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Our Restaurant Network
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with more customers, streamline your operations, and grow your business
            with our comprehensive restaurant management platform.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-center mb-8" aria-label="Registration Progress">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center">
              <div
                className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${i + 1 <= currentStep ? "bg-blue-600" : "bg-gray-300"}`}
                aria-current={i + 1 === currentStep ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${label}`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="w-8 h-1 bg-gray-300 mx-2" />}
            </div>
          ))}
        </div>

        {/* Success message */}
        {success ? (
          <div className="max-w-xl mx-auto bg-green-50 border border-green-200 rounded-lg p-8 text-center shadow">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Registration Complete!</h2>
            <p className="mb-4">Thank you for registering your restaurant. We'll review your application and contact you soon.</p>
            <a href="/" className="text-blue-600 underline">Return to Home</a>
          </div>
        ) : (
          <RestaurantRegistrationForm
            onSuccess={() => setSuccess(true)}
            setLoading={setLoading}
            setCurrentStep={setCurrentStep}
          />
        )}

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center transition-transform duration-300 hover:scale-105" tabIndex={0} aria-label="Increase Revenue">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <span className="text-2xl" role="img" aria-label="Chart">📈</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Increase Revenue</h3>
              <p className="text-gray-600">
                Reach more customers and boost your sales with our marketing tools
              </p>
            </div>
            <div className="text-center transition-transform duration-300 hover:scale-105" tabIndex={0} aria-label="Streamline Operations">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <span className="text-2xl" role="img" aria-label="Lightning">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Streamline Operations</h3>
              <p className="text-gray-600">
                Manage reservations, inventory, and staff all in one place
              </p>
            </div>
            <div className="text-center transition-transform duration-300 hover:scale-105" tabIndex={0} aria-label="Smart Analytics">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <span className="text-2xl" role="img" aria-label="Target">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-600">
                Make data-driven decisions with detailed insights and reports
              </p>
            </div>
          </div>
          <div className="mt-12">
            <a href="/faq" className="text-blue-600 underline mr-4">Read our FAQ</a>
            <a href="/support" className="text-blue-600 underline">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
