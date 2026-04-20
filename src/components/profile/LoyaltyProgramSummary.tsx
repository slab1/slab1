
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { loyaltyApi } from '@/api/loyalty';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Gift, ChevronRight, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

export function LoyaltyProgramSummary() {
  const { user } = useAuth();

  const {
    data: loyaltyData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['loyalty', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await loyaltyApi.getUserPoints(user.id);
    },
    enabled: !!user?.id,
  });

  // Render loading state
  const loadingContent = (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  );

  // Render error or no data state
  const errorContent = (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Loyalty Program</CardTitle>
        <CardDescription>Join our loyalty program to earn rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <Award className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-4">
            Your loyalty information is unavailable
          </p>
          <Button asChild>
            <Link to="/">Explore Restaurants</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) return loadingContent;
  
  // Extra safety check for loyaltyData
  if (isError || !loyaltyData) return errorContent;

  // Render success state with loyalty data
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary" /> 
          Loyalty Program
        </CardTitle>
        <CardDescription>Earn points with every reservation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Current tier</p>
              <p className="font-semibold">{loyaltyData?.tier || 'Bronze'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Points</p>
              <p className="font-semibold text-primary">{loyaltyData?.points ?? 0}</p>
            </div>
          </div>
          
          <Button asChild variant="outline" className="w-full" size="sm">
            <Link to="/profile/loyalty" className="flex items-center justify-between">
              <div className="flex items-center">
                <Gift className="h-4 w-4 mr-2" />
                <span>View Rewards & Details</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
