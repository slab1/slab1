import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Send, X } from 'lucide-react';
import { reviewsApi } from '@/api/reviews';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface ReviewFormProps {
  restaurantId: string;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    content?: string;
    title?: string;
  };
}

export function ReviewForm({ restaurantId, onReviewSubmitted, onCancel, existingReview }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write a review');
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        // Update existing review
        await reviewsApi.update(existingReview.id, {
          rating,
          content: content.trim(),
          title: title.trim() || undefined
        });
        toast.success('Review updated successfully');
      } else {
        // Create new review
        await reviewsApi.create({
          restaurant_id: restaurantId,
          user_id: user.id,
          rating,
          content: content.trim(),
          title: title.trim() || undefined
        });
        toast.success('Review submitted successfully');
      }

      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue: number) => {
    setHoverRating(starValue);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleStarLeave}
            className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
        </span>
      </div>
    );
  };

  const getRatingLabel = (rating: number) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[rating as keyof typeof labels] || '';
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 mb-4">Please sign in to leave a review</p>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Overall Rating</Label>
            <div className="flex items-center gap-4">
              {renderStars()}
              {rating > 0 && (
                <span className="text-sm font-medium text-gray-700">
                  {getRatingLabel(rating)}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Click on the stars to rate your experience
            </p>
          </div>

          {/* Title (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{title.length}/100 characters</p>
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Review</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share details of your experience. What did you like? What could be improved?"
              className="min-h-32 resize-none"
              maxLength={2000}
              required
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Minimum 10 characters required</span>
              <span>{content.length}/2000 characters</span>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Review Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be honest and constructive</li>
              <li>• Focus on your dining experience</li>
              <li>• Avoid offensive language</li>
              <li>• Keep it relevant to the restaurant</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || content.trim().length < 10}
              className="flex-1"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {existingReview ? 'Update Review' : 'Submit Review'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
