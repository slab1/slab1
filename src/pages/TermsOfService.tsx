export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
                Terms of Service
              </h1>
              <p className="text-lg text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto prose prose-lg">
              <p>
                Welcome to Reservatoo. These Terms of Service ("Terms") govern your use of our website, services, and applications (collectively, the "Service"). Please read these Terms carefully before using the Service.
              </p>
              
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
              </p>
              
              <h2>2. Description of Service</h2>
              <p>
                Reservatoo provides an online platform that connects diners with restaurants, enabling users to discover restaurants and make dining reservations. The Service may include features such as reservation management, user reviews, and restaurant information.
              </p>
              
              <h2>3. User Accounts</h2>
              <p>
                3.1. To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process.
              </p>
              <p>
                3.2. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
              </p>
              <p>
                3.3. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
              
              <h2>4. User Conduct</h2>
              <p>
                You agree not to use the Service to:
              </p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Submit false or misleading information</li>
                <li>Upload or transmit viruses or malicious code</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Collect or track personal information of other users</li>
              </ul>
              
              <h2>5. Reservations and Cancellations</h2>
              <p>
                5.1. When you make a reservation through the Service, you agree to honor that reservation and arrive at the restaurant at the specified time.
              </p>
              <p>
                5.2. If you need to cancel or modify a reservation, you should do so through the Service according to the cancellation policy specified by each restaurant.
              </p>
              <p>
                5.3. Repeated no-shows or late cancellations may result in restrictions on your ability to use the Service.
              </p>
              
              <h2>6. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive property of Reservatoo and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
              
              <h2>7. Links To Other Web Sites</h2>
              <p>
                Our Service may contain links to third-party websites or services that are not owned or controlled by Reservatoo. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
              </p>
              
              <h2>8. Limitation of Liability</h2>
              <p>
                In no event shall Reservatoo, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
              
              <h2>9. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              
              <h2>10. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at legal@reservatoo.com.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
