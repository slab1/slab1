export default function Accessibility() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
                Accessibility Statement
              </h1>
              <p className="text-lg text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto prose prose-lg">
              <p>
                Reservatoo is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards.
              </p>
              
              <h2>Conformance status</h2>
              <p>
                The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. Reservatoo is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.
              </p>
              
              <h2>Accessibility features</h2>
              <p>Reservatoo strives to ensure that its services are accessible to people with disabilities. Reservatoo has invested a significant amount of resources to help ensure that its website is made easier to use and more accessible for people with disabilities, with the strong belief that website accessibility is essential to help ensure the participation of people with disabilities in an increasingly online society.</p>
              
              <h3>Some of the accessibility features include:</h3>
              <ul>
                <li>Alternative text for images</li>
                <li>Proper heading structure</li>
                <li>ARIA landmarks</li>
                <li>Keyboard accessibility</li>
                <li>Focus management</li>
                <li>Color contrast compliance</li>
                <li>Resizable text</li>
                <li>Form labels and accessible form controls</li>
              </ul>
              
              <h2>Feedback</h2>
              <p>
                We welcome your feedback on the accessibility of Reservatoo. Please let us know if you encounter accessibility barriers on Reservatoo:
              </p>
              <ul>
                <li>Email: accessibility@reservatoo.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Postal address: 123 Reservation Ave, San Francisco, CA 94103</li>
              </ul>
              <p>
                We try to respond to feedback within 2 business days.
              </p>
              
              <h2>Technical specifications</h2>
              <p>
                Accessibility of Reservatoo relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins installed on your computer:
              </p>
              <ul>
                <li>HTML</li>
                <li>WAI-ARIA</li>
                <li>CSS</li>
                <li>JavaScript</li>
              </ul>
              <p>
                These technologies are relied upon for conformance with the accessibility standards used.
              </p>
              
              <h2>Assessment approach</h2>
              <p>
                Reservatoo assessed the accessibility of its website by the following approaches:
              </p>
              <ul>
                <li>Self-evaluation</li>
                <li>External evaluation</li>
                <li>User testing with assistive technologies</li>
              </ul>
              
              <h2>Compatibility with browsers and assistive technology</h2>
              <p>
                Reservatoo is designed to be compatible with the following assistive technologies:
              </p>
              <ul>
                <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
                <li>Screen magnifiers</li>
                <li>Speech recognition software</li>
                <li>Keyboard-only navigation</li>
              </ul>
              <p>
                Reservatoo is compatible with the latest versions of major browsers including Chrome, Firefox, Safari, and Edge.
              </p>
              
              <h2>Limitations and alternatives</h2>
              <p>
                Despite our best efforts to ensure accessibility of Reservatoo, there may be some limitations. Below is a description of known limitations, and potential solutions. Please contact us if you observe an issue not listed below.
              </p>
              <ul>
                <li>Interactive maps: Maps for restaurant locations may not be fully accessible. We provide text addresses and directions as alternatives.</li>
                <li>Third-party content: Some content on our website is provided by third parties and is outside our control. We strive to work with providers who prioritize accessibility.</li>
              </ul>
              
              <h2>Continuous improvement</h2>
              <p>
                We are committed to continuously improving the accessibility of our website. We will prioritize issues and work to resolve them in a timely manner. We are also working on a more comprehensive accessibility statement that conforms to international standards.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
