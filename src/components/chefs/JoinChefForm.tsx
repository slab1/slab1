
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChefHat, Briefcase, MapPin, DollarSign, Image as ImageIcon, Utensils, Languages, Info } from 'lucide-react';
import { useInputSanitization } from '@/hooks/use-security';

const joinChefSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialty: z.string().min(2, 'Specialty is required'),
  location: z.string().min(2, 'Location is required'),
  years_experience: z.coerce.number().min(0, 'Years of experience cannot be negative'),
  hourly_rate: z.coerce.number().min(1, 'Hourly rate must be at least $1'),
  bio: z.string().max(1000, 'Bio must be under 1000 characters').optional(),
  signature_dishes: z.string().optional(),
  languages: z.string().optional(),
  image: z.string().url('Please enter a valid image URL').or(z.literal('')).optional(),
});

type JoinChefFormValues = z.infer<typeof joinChefSchema>;

interface JoinChefFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function JoinChefForm({ onSubmit, onCancel, isSubmitting }: JoinChefFormProps) {
  const { sanitizeInput } = useInputSanitization();
  
  const form = useForm<JoinChefFormValues>({
    resolver: zodResolver(joinChefSchema),
    defaultValues: {
      name: '',
      specialty: '',
      location: '',
      years_experience: 0,
      hourly_rate: 0,
      bio: '',
      signature_dishes: '',
      languages: '',
      image: '',
    },
  });

  const handleFormSubmit = async (values: JoinChefFormValues) => {
    const formattedData = {
      ...values,
      name: sanitizeInput(values.name),
      specialty: sanitizeInput(values.specialty),
      location: sanitizeInput(values.location),
      bio: values.bio ? sanitizeInput(values.bio) : '',
      signature_dishes: values.signature_dishes 
        ? values.signature_dishes.split(',').map(d => sanitizeInput(d.trim())).filter(Boolean)
        : [],
      languages: values.languages
        ? values.languages.split(',').map(l => sanitizeInput(l.trim())).filter(Boolean)
        : [],
    };
    await onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  Full Name *
                </FormLabel>
                <FormControl>
                  <Input placeholder="Chef John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Cuisine Specialty *
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. French Fine Dining, Sushi Master" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Primary Location *
                </FormLabel>
                <FormControl>
                  <Input placeholder="City, Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="years_experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Years of Experience *
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hourly_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Hourly Rate ($) *
                </FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Profile Image URL
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormDescription>Link to a professional photo</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Professional Bio
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your culinary journey, training, and philosophy..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="signature_dishes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Signature Dishes
                </FormLabel>
                <FormControl>
                  <Input placeholder="Beef Wellington, Truffle Risotto, Chocolate Soufflé (comma separated)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="languages"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Languages Spoken
                </FormLabel>
                <FormControl>
                  <Input placeholder="English, Spanish, French (comma separated)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Joining...' : 'Join as Chef'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
