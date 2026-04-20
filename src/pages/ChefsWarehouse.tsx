import { useState, useEffect } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChefHat, MapPin, Star, Clock, DollarSign, Users, Calendar, Phone, Mail, User, Plus } from 'lucide-react';
import { ChefBookingDialog } from '@/components/waitlist/ChefBookingDialog';
import { JoinChefForm } from '@/components/chefs/JoinChefForm';
import { Chef } from '@/api/types';
import { useInputValidation } from '@/hooks/use-input-validation';
import { useInputSanitization } from '@/hooks/use-security';

export default function ChefsWarehouse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const { validateInput } = useInputValidation();
  const { sanitizeInput } = useInputSanitization();

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    try {
      setLoading(true);
      // Fetch all required chef data from the main table
      const { data, error } = await supabase
        .from('chefs')
        .select('id, name, image, specialty, bio, years_experience, location, hourly_rate, signature_dishes, languages')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map data to Chef type - hourly_rate is now included
      const mappedChefs = (data || []).map((chef: any) => ({
        ...chef,
        location: chef.location || 'Location not specified',
        hourly_rate: chef.hourly_rate || 0,
        available_dates: [],
        user_id: '' // Don't expose user_id in public view
      }));
      
      setChefs(mappedChefs);
    } catch (error) {
      console.error('Error fetching chefs:', error);
      toast.error('Failed to load chefs');
    } finally {
      setLoading(false);
    }
  };

  const handleBookChef = (chef: Chef) => {
    if (!user) {
      toast.error('Please sign in to book a chef');
      navigate('/login');
      return;
    }
    setSelectedChef(chef);
    setIsBookingDialogOpen(true);
  };

  const handleJoinAsChef = async (formData: any) => {
    if (!user) {
      toast.error('Please sign in to join as a chef');
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      const chefData = {
        user_id: user.id,
        ...formData
      };

      const { error } = await supabase
        .from('chefs')
        .insert(chefData);

      if (error) throw error;

      toast.success('Successfully joined as a chef!');
      setIsJoinDialogOpen(false);
      fetchChefs();
    } catch (error) {
      console.error('Error joining as chef:', error);
      toast.error('Failed to join as chef');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter chefs based on search and filters
  const filteredChefs = chefs.filter(chef => {
    const matchesSearch = chef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chef.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || chef.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSpecialty = !specialtyFilter || chef.specialty.toLowerCase().includes(specialtyFilter.toLowerCase());
    
    return matchesSearch && matchesLocation && matchesSpecialty;
  });

  // Get unique locations and specialties for filters
  const uniqueLocations = [...new Set(chefs.map(chef => chef.location))];
  const uniqueSpecialties = [...new Set(chefs.map(chef => chef.specialty))];

  if (loading) {
    return (
      <div className="container py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Chef's Warehouse</h1>
          <p className="text-xl text-muted-foreground">Discover and book professional chefs for your next event</p>
        </div>
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Join as Chef
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Join Our Chef Community</DialogTitle>
              <DialogDescription>
                Share your culinary expertise and connect with food lovers
              </DialogDescription>
            </DialogHeader>
            <JoinChefForm 
              onSubmit={handleJoinAsChef} 
              onCancel={() => setIsJoinDialogOpen(false)} 
              isSubmitting={isSubmitting} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search chefs by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-4">
          <Select value={locationFilter || 'all'} onValueChange={(value) => setLocationFilter(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={specialtyFilter || 'all'} onValueChange={(value) => setSpecialtyFilter(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {uniqueSpecialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chefs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChefs.map((chef) => (
          <Card key={chef.id} className="group hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                {chef.image ? (
                  <OptimizedImage
                    src={chef.image} 
                    alt={chef.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                    <ChefHat className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl leading-tight">Chef {chef.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {chef.specialty}
                  </CardDescription>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{chef.location}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{chef.years_experience} years exp.</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">${chef.hourly_rate}/hr</span>
                  </div>
                </div>

                {chef.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {chef.bio}
                  </p>
                )}

                {chef.signature_dishes && chef.signature_dishes.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Signature Dishes:</p>
                    <div className="flex flex-wrap gap-1">
                      {chef.signature_dishes.slice(0, 2).map((dish, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {dish}
                        </Badge>
                      ))}
                      {chef.signature_dishes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{chef.signature_dishes.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {chef.languages && chef.languages.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Languages:</p>
                    <p className="text-xs text-muted-foreground">
                      {chef.languages.slice(0, 3).join(', ')}
                      {chef.languages.length > 3 && ` +${chef.languages.length - 3} more`}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => handleBookChef(chef)}
                  className="w-full group-hover:shadow-md transition-shadow"
                >
                  Book Chef
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChefs.length === 0 && !loading && (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No chefs found</h3>
          <p className="text-muted-foreground">
            {searchTerm || locationFilter || specialtyFilter 
              ? "Try adjusting your search or filters" 
              : "Be the first to join our chef community!"}
          </p>
        </div>
      )}

      {/* Booking Dialog */}
      {selectedChef && (
        <ChefBookingDialog
          isOpen={isBookingDialogOpen}
          onClose={() => {
            setIsBookingDialogOpen(false);
            setSelectedChef(null);
          }}
          chef={selectedChef}
          onSuccess={() => {
            setIsBookingDialogOpen(false);
            setSelectedChef(null);
            toast.success('Booking request submitted successfully!');
          }}
        />
      )}
    </div>
  );
}
