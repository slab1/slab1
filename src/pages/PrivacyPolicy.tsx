export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
                Privacy Policy
              </h1>
              <p className="text-lg text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto prose prose-lg">
              <p>
                At Reservatoo, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              
              <h2>1. Information We Collect</h2>
              <p>We collect several types of information from and about users of our Service, including:</p>
              
              <h3>1.1. Personal Data</h3>
              <p>
                When you register for an account or make a reservation, we may collect personally identifiable information such as:
              </p>
              <ul>
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Billing information</li>
                <li>Dining preferences</li>
              </ul>
              
              <h3>1.2. Usage Data</h3>
              <p>
                We may also collect information about how the Service is accessed and used ("Usage Data"). This may include information such as your computer's Internet Protocol address (IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data.
              </p>
              
              <h3>1.3. Cookies and Tracking Data</h3>
              <p>
                We use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
              </p>
              
              <h2>2. How We Use Your Information</h2>
              <p>We use the collected data for various purposes:</p>
              <ul>
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so that we can improve our Service</li>
                <li>To monitor the usage of our Service</li>
                <li>To detect, prevent and address technical issues</li>
                <li>To provide you with news, special offers and general information about other goods, services and events which we offer</li>
              </ul>
              
              <h2>3. Disclosure of Your Information</h2>
              <p>We may disclose your personal information in the following situations:</p>
              
              <h3>3.1. Business Transfers</h3>
              <p>
                If we are involved in a merger, acquisition or asset sale, your personal data may be transferred.
              </p>
              
              <h3>3.2. Disclosure to Restaurants</h3>
              <p>
                When you make a reservation, we share necessary information with the restaurant to facilitate your dining experience.
              </p>
              
              <h3>3.3. Disclosure for Law Enforcement</h3>
              <p>
                Under certain circumstances, we may be required to disclose your personal data if required to do so by law or in response to valid requests by public authorities.
              </p>
              
              <h2>4. Data Security</h2>
              <p>
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
              </p>
              
              <h2>5. Your Data Protection Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, such as:
              </p>
              <ul>
                <li>The right to access, update or delete the information we have on you</li>
                <li>The right of rectification</li>
                <li>The right to object</li>
                <li>The right of restriction</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
              
              <h2>6. Children's Privacy</h2>
              <p>
                Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18.
              </p>
              
              <h2>7. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
              </p>
              
              <h2>8. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@reservatoo.com.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
