
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, User, Flag } from "lucide-react";
import { format } from "date-fns";
import { ReviewForm } from "./ReviewForm";
import { reviewsApi, Review } from "@/api/reviews";
import { useAuth } from "@/hooks/use-auth";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface RestaurantReviewsProps {
  restaurantId: string;
}

export function RestaurantReviews({ restaurantId }: RestaurantReviewsProps) {
  const { user } = useAuth();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const { 
    data: reviews, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["restaurant-reviews", restaurantId],
    queryFn: async () => {
      return reviewsApi.getByRestaurantId(restaurantId);
    }
  });

  const averageRating = reviews?.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "N/A";

  const handleReviewSubmitted = () => {
    refetch();
  };

  const openReportDialog = (reviewId: string) => {
    if (!user) {
      toast.error("You must be logged in to report a review");
      return;
    }
    setReportingReviewId(reviewId);
    setIsReportDialogOpen(true);
  };

  const closeReportDialog = () => {
    setIsReportDialogOpen(false);
    setReportReason("");
    setReportDescription("");
    setReportingReviewId(null);
  };

  const handleSubmitReport = async () => {
    if (!user || !reportingReviewId) return;
    
    if (!reportReason) {
      toast.error("Please select a reason for your report");
      return;
    }
    
    try {
      setReportSubmitting(true);
      
      await reviewsApi.reportReview({
        review_id: reportingReviewId,
        user_id: user.id,
        reason: reportReason,
        description: reportDescription
      });
      
      toast.success("Review reported successfully");
      closeReportDialog();
    } catch (error) {
      console.error("Error reporting review:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold">Guest Reviews</h2>
        {reviews?.length > 0 && (
          <div className="flex items-center mt-2 md:mt-0">
            <div className="flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-semibold">{averageRating}</span>
              <span className="text-sm ml-1">({reviews.length} reviews)</span>
            </div>
          </div>
        )}
      </div>

      <ReviewForm restaurantId={restaurantId} onReviewSubmitted={handleReviewSubmitted} />

      {isLoading ? (
        <div className="text-center py-8">Loading reviews...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          Error loading reviews. Please try again later.
        </div>
      ) : reviews?.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-lg mt-6">
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {reviews?.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {review.user 
                        ? `${review.user.first_name} ${review.user.last_name}` 
                        : "Anonymous"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${
                        star <= review.rating 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-gray-300"
                      }`} 
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3">
                {review.content}
              </div>
              
              <div className="mt-3 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => openReportDialog(review.id)}
                  className="text-muted-foreground"
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Report
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for reporting</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="fake">Fake review</SelectItem>
                  <SelectItem value="offensive">Offensive language</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional details (optional)</label>
              <Textarea 
                placeholder="Please provide any additional details about this report"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeReportDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmitReport} 
              disabled={reportSubmitting || !reportReason}
            >
              {reportSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
