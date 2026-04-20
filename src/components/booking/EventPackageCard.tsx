import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EventPackage {
  id: string;
  name: string;
  tier: 'essential' | 'premium' | 'luxury';
  pricePerPerson: number;
  description: string;
  features: string[];
  popular?: boolean;
  services: {
    privateSpace: boolean;
    customMenu: boolean;
    audioVisual: boolean;
    decorations: boolean;
    entertainment: boolean;
  };
}

interface EventPackageCardProps {
  pkg: EventPackage;
  selected: boolean;
  onSelect: (pkg: EventPackage) => void;
  guestCount: number;
}

const tierIcons = {
  essential: Star,
  premium: Sparkles,
  luxury: Crown,
};

const tierColors = {
  essential: 'border-primary/30 hover:border-primary/60',
  premium: 'border-amber-400/50 hover:border-amber-400',
  luxury: 'border-violet-400/50 hover:border-violet-400',
};

const tierSelectedColors = {
  essential: 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]',
  premium: 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/30',
  luxury: 'border-violet-400 ring-2 ring-violet-400/20 bg-violet-50/30',
};

const tierBadgeColors = {
  essential: 'bg-primary/10 text-primary border-primary/20',
  premium: 'bg-amber-100 text-amber-800 border-amber-200',
  luxury: 'bg-violet-100 text-violet-800 border-violet-200',
};

export function EventPackageCard({ pkg, selected, onSelect, guestCount }: EventPackageCardProps) {
  const Icon = tierIcons[pkg.tier];
  const total = pkg.pricePerPerson * guestCount;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 relative overflow-hidden',
        selected ? tierSelectedColors[pkg.tier] : tierColors[pkg.tier]
      )}
      onClick={() => onSelect(pkg)}
    >
      {pkg.popular && (
        <div className="absolute top-0 right-0">
          <Badge className="rounded-none rounded-bl-lg bg-amber-500 text-white border-0 text-[10px] px-3 py-1">
            MOST POPULAR
          </Badge>
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className={cn(
            'p-2 rounded-xl',
            pkg.tier === 'essential' && 'bg-primary/10',
            pkg.tier === 'premium' && 'bg-amber-100',
            pkg.tier === 'luxury' && 'bg-violet-100',
          )}>
            <Icon className={cn(
              'h-5 w-5',
              pkg.tier === 'essential' && 'text-primary',
              pkg.tier === 'premium' && 'text-amber-600',
              pkg.tier === 'luxury' && 'text-violet-600',
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-bold text-base">{pkg.name}</h4>
              <Badge variant="outline" className={cn('text-[10px]', tierBadgeColors[pkg.tier])}>
                {pkg.tier.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{pkg.description}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">${pkg.pricePerPerson}</span>
            <span className="text-xs text-muted-foreground">/person</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Est. total: <span className="font-semibold text-foreground">${total.toLocaleString()}</span> for {guestCount} guests
          </p>
        </div>

        <ul className="space-y-1.5">
          {pkg.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <Check className={cn(
                'h-3.5 w-3.5 mt-0.5 flex-shrink-0',
                pkg.tier === 'essential' && 'text-primary',
                pkg.tier === 'premium' && 'text-amber-500',
                pkg.tier === 'luxury' && 'text-violet-500',
              )} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {selected && (
          <div className={cn(
            'mt-4 pt-3 border-t text-center text-xs font-semibold',
            pkg.tier === 'essential' && 'text-primary border-primary/20',
            pkg.tier === 'premium' && 'text-amber-600 border-amber-200',
            pkg.tier === 'luxury' && 'text-violet-600 border-violet-200',
          )}>
            ✓ Selected
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const defaultPackages: EventPackage[] = [
  {
    id: 'essential',
    name: 'Essential',
    tier: 'essential',
    pricePerPerson: 35,
    description: 'Perfect for casual gatherings and simple celebrations',
    features: [
      'Reserved seating area',
      'Standard menu selections',
      'Dedicated server',
      'Basic table setup',
    ],
    services: {
      privateSpace: false,
      customMenu: false,
      audioVisual: false,
      decorations: false,
      entertainment: false,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    tier: 'premium',
    pricePerPerson: 65,
    description: 'Ideal for birthdays, anniversaries, and corporate dinners',
    popular: true,
    features: [
      'Private dining space',
      'Custom prix-fixe menu',
      'A/V equipment included',
      'Elegant table décor',
      'Dedicated event coordinator',
      'Complimentary champagne toast',
    ],
    services: {
      privateSpace: true,
      customMenu: true,
      audioVisual: true,
      decorations: true,
      entertainment: false,
    },
  },
  {
    id: 'luxury',
    name: 'Grand Luxury',
    tier: 'luxury',
    pricePerPerson: 120,
    description: 'The ultimate experience for weddings and galas',
    features: [
      'Exclusive venue buyout',
      'Chef\'s tasting menu',
      'Full A/V & lighting design',
      'Premium floral arrangements',
      'Live entertainment coordination',
      'Sommelier wine pairing',
      'Photography coordination',
      'Valet parking arrangement',
    ],
    services: {
      privateSpace: true,
      customMenu: true,
      audioVisual: true,
      decorations: true,
      entertainment: true,
    },
  },
];
