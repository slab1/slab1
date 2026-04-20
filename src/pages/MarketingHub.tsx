
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { MarketingDashboard } from "@/components/marketing/MarketingDashboard";
import restaurantApi from "@/api/restaurant";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Store } from "lucide-react";

export default function MarketingHub() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [userRestaurants, setUserRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRestaurants = async () => {
      if (!user) return;
      
      try {
        const restaurants = await restaurantApi.getAll();
        const owned = restaurants.filter(r => r.admin_id === user.id);
        
        setUserRestaurants(owned);
        if (owned.length > 0) {
          setRestaurantId(owned[0].id);
        } else {
          toast.error("No restaurant found. Please register your restaurant first.");
          navigate("/restaurant-registration");
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        toast.error("Failed to load restaurant data");
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchUserRestaurants();
    } else if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading marketing hub...</p>
        </div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Restaurant Found</h2>
          <p className="text-muted-foreground mb-4">
            You need to register a restaurant before accessing the marketing hub.
          </p>
          <button
            onClick={() => navigate("/restaurant-registration")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded"
          >
            Register Restaurant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Hub</h1>
          <p className="text-muted-foreground">
            Manage your campaigns, promotions, and customer engagement.
          </p>
        </div>
        
        {userRestaurants.length > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Store className="h-4 w-4" />
              Switch Restaurant:
            </span>
            <Select value={restaurantId || ""} onValueChange={setRestaurantId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select restaurant" />
              </SelectTrigger>
              <SelectContent>
                {userRestaurants.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <MarketingDashboard restaurantId={restaurantId} />
    </div>
  );
}
