
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-display font-bold text-foreground flex items-center mb-4">
              <span className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center mr-2">R</span>
              reservatoo
            </Link>
            <p className="text-muted-foreground mb-6 text-sm">
              The easiest way to discover and book restaurants online.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="https://facebook.com/reservatoo" icon={<Facebook size={18} />} label="Facebook" />
              <SocialLink href="https://twitter.com/reservatoo" icon={<Twitter size={18} />} label="Twitter" />
              <SocialLink href="https://instagram.com/reservatoo" icon={<Instagram size={18} />} label="Instagram" />
              <SocialLink href="https://youtube.com/reservatoo" icon={<Youtube size={18} />} label="YouTube" />
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-4">For Diners</h3>
            <ul className="space-y-3">
              <FooterLink href="/restaurants">Find Restaurants</FooterLink>
              <FooterLink href="/loyalty">Loyalty Program</FooterLink>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/login">Sign In</FooterLink>
              <FooterLink href="/signup">Create Account</FooterLink>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-4">For Restaurants</h3>
            <ul className="space-y-3">
              <FooterLink href="/admin">Restaurant Dashboard</FooterLink>
              <FooterLink href="/partnership">Partner With Us</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/case-studies">Success Stories</FooterLink>
              <FooterLink href="/developer">Developer Portal</FooterLink>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail className="w-4 h-4 text-primary mt-1 mr-2" />
                <a 
                  href="mailto:info@reservatoo.com" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  info@reservatoo.com
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="w-4 h-4 text-primary mt-1 mr-2" />
                <a 
                  href="tel:+15551234567" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-4 h-4 text-primary mt-1 mr-2" />
                <span className="text-sm text-muted-foreground">
                  123 Reservation Ave<br />
                  San Francisco, CA 94103
                </span>
              </li>
              <li className="mt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
            <FooterLegalLink href="/terms">Terms of Service</FooterLegalLink>
            <FooterLegalLink href="/privacy">Privacy Policy</FooterLegalLink>
            <FooterLegalLink href="/cookies">Cookie Policy</FooterLegalLink>
            <FooterLegalLink href="/accessibility">Accessibility</FooterLegalLink>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Reservatoo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link 
        to={href} 
        className="text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        {children}
      </Link>
    </li>
  );
}

function FooterLegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      to={href} 
      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </Link>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
    >
      {icon}
    </a>
  );
}
