
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { businessInfoSchema, addressSchema } from '@/utils/validation';
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

const registrationSchema = z.object({
  businessInfo: businessInfoSchema,
  address: addressSchema,
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
  privacy: z.boolean().refine(val => val === true, {
    message: "You must accept the privacy policy"
  })
});

type RegistrationData = z.infer<typeof registrationSchema>;

interface PartnerRegistrationFormProps {
  selectedPlanId: string | null;
  onSubmit: (data: RegistrationData & { selectedPlanId: string | null }) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

export function PartnerRegistrationForm({ selectedPlanId, onSubmit, onBack, loading }: PartnerRegistrationFormProps) {
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    setValue,
    watch
  } = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      businessInfo: {
        businessName: '',
        businessEmail: '',
        business_phone_number: '',
        contactName: '',
        businessLicense: '',
        taxId: ''
      },
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      },
      terms: false,
      privacy: false
    }
  });

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = [
        'businessInfo.businessName',
        'businessInfo.businessEmail',
        'businessInfo.business_phone_number',
        'businessInfo.contactName'
      ];
    } else if (step === 2) {
      fieldsToValidate = [
        'address.street',
        'address.city',
        'address.state',
        'address.zipCode'
      ];
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  const onFormSubmit = async (data: RegistrationData) => {
    await onSubmit({ ...data, selectedPlanId });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-blue-600 text-white' : 
                step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <CardTitle>
          {step === 1 && "Business Information"}
          {step === 2 && "Business Address"}
          {step === 3 && "Terms and Agreements"}
        </CardTitle>
        <CardDescription>
          {step === 1 && "Tell us about your restaurant business"}
          {step === 2 && "Where is your business located?"}
          {step === 3 && "Finalize your registration"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input id="businessName" {...register('businessInfo.businessName')} placeholder="The Gourmet Bistro" />
                {errors.businessInfo?.businessName && <p className="text-sm text-red-500">{errors.businessInfo.businessName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email *</Label>
                <Input id="businessEmail" type="email" {...register('businessInfo.businessEmail')} placeholder="contact@gourmetbistro.com" />
                {errors.businessInfo?.businessEmail && <p className="text-sm text-red-500">{errors.businessInfo.businessEmail.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_phone_number">Business Phone *</Label>
                <Input id="business_phone_number" {...register('businessInfo.business_phone_number')} placeholder="+1 (555) 000-0000" />
                {errors.businessInfo?.business_phone_number && <p className="text-sm text-red-500">{errors.businessInfo.business_phone_number.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Person Name *</Label>
                <Input id="contactName" {...register('businessInfo.contactName')} placeholder="John Doe" />
                {errors.businessInfo?.contactName && <p className="text-sm text-red-500">{errors.businessInfo.contactName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessLicense">Business License (Optional)</Label>
                <Input id="businessLicense" {...register('businessInfo.businessLicense')} placeholder="LIC-12345678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / VAT (Optional)</Label>
                <Input id="taxId" {...register('businessInfo.taxId')} placeholder="TX-98765432" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input id="street" {...register('address.street')} placeholder="123 Culinary Ave" />
                {errors.address?.street && <p className="text-sm text-red-500">{errors.address.street.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...register('address.city')} placeholder="Gastronomy City" />
                  {errors.address?.city && <p className="text-sm text-red-500">{errors.address.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province *</Label>
                  <Input id="state" {...register('address.state')} placeholder="Foodie State" />
                  {errors.address?.state && <p className="text-sm text-red-500">{errors.address.state.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP / Postal Code *</Label>
                  <Input id="zipCode" {...register('address.zipCode')} placeholder="12345" />
                  {errors.address?.zipCode && <p className="text-sm text-red-500">{errors.address.zipCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" {...register('address.country')} placeholder="United States" />
                  {errors.address?.country && <p className="text-sm text-red-500">{errors.address.country.message}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 max-h-60 overflow-y-auto">
                <h4 className="font-bold mb-2">Terms of Service</h4>
                <p>By registering as a partner, you agree to our terms of service and partnership agreement. You will be provided with a 14-day free trial of your selected plan. You can cancel at any time during the trial period without being charged.</p>
                <p className="mt-2">Our platform provides restaurant management tools, booking systems, and analytics. We reserve the right to modify or terminate services with notice.</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={watch('terms')} 
                    onCheckedChange={(checked) => setValue('terms', checked === true)} 
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I agree to the Terms of Service and Partnership Agreement *
                    </Label>
                    {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="privacy" 
                    checked={watch('privacy')} 
                    onCheckedChange={(checked) => setValue('privacy', checked === true)} 
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="privacy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I agree to the Privacy Policy *
                    </Label>
                    {errors.privacy && <p className="text-xs text-red-500">{errors.privacy.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={prevStep}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {step < 3 ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
