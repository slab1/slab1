import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";

export default function CaseStudies() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* For Restaurant Owners CTA */}
        <section className="bg-primary/5 py-8 border-b border-primary/10">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Are you a restaurant owner?
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Join hundreds of successful restaurants using Reservatoo to
                streamline reservations, reduce no-shows, and grow their business.
                See your own success story here!
              </p>
            </div>
            <Button size="lg" asChild>
              <a href="/partner">Get Started</a>
            </Button>
          </div>
        </section>

        <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
                Success Stories
              </h1>
              <p className="text-xl text-muted-foreground">
                See how restaurants like yours are thriving with Reservatoo
              </p>
            </div>

            <div className="space-y-16 max-w-5xl mx-auto">
              <CaseStudy
                title="La Trattoria Increased Bookings by 45%"
                image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              >
                <p className="mb-4">
                  La Trattoria, a family-owned Italian restaurant in Chicago, was
                  struggling with managing reservations through phone calls and a
                  basic contact form on their website.
                </p>
                <p className="mb-4">
                  After joining Reservatoo, they not only streamlined their booking
                  process but also saw a 45% increase in reservations within the
                  first three months. The automated reminder system reduced no-shows
                  by 60%.
                </p>
                <blockquote className="italic text-muted-foreground border-l-4 border-primary pl-4 my-6">
                  "Reservatoo transformed our business. We're now operating at near
                  capacity every weekend, and managing our tables has never been
                  easier. The insights we get from the platform help us better
                  understand our customers."
                </blockquote>
                <p>— Maria Rossi, Owner, La Trattoria</p>
              </CaseStudy>

              <CaseStudy
                title="Sushi Haru Saved 15 Hours Per Week on Administration"
                image="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                imageRight
              >
                <p className="mb-4">
                  Sushi Haru, a high-end Japanese restaurant in San Francisco, had a
                  team member dedicated almost exclusively to managing reservations
                  and dealing with changes and cancellations.
                </p>
                <p className="mb-4">
                  By implementing Reservatoo's reservation system, they automated
                  most of this process, saving approximately 15 hours of staff time
                  per week. These hours were reallocated to improving customer
                  service during dining hours.
                </p>
                <blockquote className="italic text-muted-foreground border-l-4 border-primary pl-4 my-6">
                  "The efficiency we've gained with Reservatoo is remarkable. Our
                  staff can focus on what they do best – providing exceptional dining
                  experiences – instead of being tied up with administrative tasks."
                </blockquote>
                <p>— Ken Tanaka, Manager, Sushi Haru</p>
              </CaseStudy>

              <CaseStudy
                title="Bistro 22 Expanded to Three Locations"
                image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              >
                <p className="mb-4">
                  Bistro 22 started as a single location in Austin but had ambitions
                  to grow. Their main concern was how to maintain consistent service
                  quality and efficient operations across multiple sites.
                </p>
                <p className="mb-4">
                  With Reservatoo's enterprise solution, they were able to manage
                  reservations across all their locations from a centralized dashboard.
                  The data they collected also helped them identify peak hours and
                  optimize staffing at each location.
                </p>
                <p className="mb-4">
                  Within two years of partnering with Reservatoo, Bistro 22
                  successfully opened two additional locations, with plans for further
                  expansion.
                </p>
                <blockquote className="italic text-muted-foreground border-l-4 border-primary pl-4 my-6">
                  "As we grew from one to three locations, Reservatoo scaled with us
                  perfectly. The ability to manage everything from one platform while
                  still giving each location control of their day-to-day operations is
                  invaluable."
                </blockquote>
                <p>— Alex Jordan, Founder, Bistro 22</p>
              </CaseStudy>
            </div>

            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold mb-6">
                Ready to write your success story?
              </h2>
              <Button size="lg" asChild>
                <a href="/partner">Partner With Us</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function CaseStudy({
  title,
  image,
  imageRight = false,
  children,
}: {
  title: string;
  image: string;
  imageRight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
        imageRight ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className={imageRight ? "md:order-2" : ""}>
        <OptimizedImage
          src={image}
          alt={title}
          className="rounded-xl shadow-lg w-full h-auto object-cover aspect-[4/3]"
        />
      </div>

      <div className={imageRight ? "md:order-1" : ""}>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
        <div className="prose prose-lg max-w-none">{children}</div>
      </div>
    </div>
  );
}
