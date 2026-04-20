
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { reviewsApi } from "@/api/reviews";

export interface ReviewFormProps {
  restaurantId: string;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

const MAX_REVIEW_LENGTH = 2000;
const MIN_REVIEW_LENGTH = 10;

export function ReviewForm({ restaurantId, onReviewSubmitted, onCancel }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to leave a review");
      return;
    }
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (review.trim().length < MIN_REVIEW_LENGTH) {
      toast.error(`Review must be at least ${MIN_REVIEW_LENGTH} characters`);
      return;
    }

    if (review.length > MAX_REVIEW_LENGTH) {
      toast.error(`Review cannot exceed ${MAX_REVIEW_LENGTH} characters`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await reviewsApi.addReview({
        restaurant_id: restaurantId,
        user_id: user.id,
        rating,
        content: review
      });
      
      toast.success("Your review has been submitted!");
      setRating(0);
      setReview("");
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-muted/50 border rounded-lg p-6 mt-6 text-center">
        <p className="text-muted-foreground mb-3">You must be logged in to leave a review.</p>
        <Button variant="outline" asChild>
          <a href="/login">Log in</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium mr-3">Your rating:</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="p-1 focus:outline-none"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star 
                    className={`h-6 w-6 ${
                      (hoverRating ? value <= hoverRating : value <= rating)
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300"
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>
          
          <Textarea
            placeholder="Share your experience at this restaurant..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            maxLength={MAX_REVIEW_LENGTH}
            className="min-h-[120px]"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{review.length < MIN_REVIEW_LENGTH ? `Minimum ${MIN_REVIEW_LENGTH} characters` : ''}</span>
            <span>{review.length}/{MAX_REVIEW_LENGTH}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
