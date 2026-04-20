import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, ThumbsUp, Flag, Edit, MoreHorizontal, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';
import { reviewsApi, ReviewWithUser } from '@/api/reviews';
import { ReviewForm } from './ReviewForm';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ReviewsListProps {
  restaurantId: string;
  showWriteReview?: boolean;
  limit?: number;
  showStats?: boolean;
}

export function ReviewsList({
  restaurantId,
  showWriteReview = true,
  limit,
  showStats = true
}: ReviewsListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewWithUser | null>(null);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const reviewsData = await reviewsApi.getByRestaurantId(restaurantId);
      const sortedReviews = reviewsData.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReviews(limit ? sortedReviews.slice(0, limit) : sortedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, limit]);

  const loadUserLikes = useCallback(async () => {
    if (!user) return;
    try {
      const likes = await reviewsApi.getUserLikes(user.id);
      setUserLikes(new Set(likes));
    } catch (error) {
      console.error('Error loading user likes:', error);
    }
  }, [user]);

  useEffect(() => {
    loadReviews();
    if (user) {
      loadUserLikes();
    }
  }, [loadReviews, loadUserLikes, restaurantId, user]);

  const handleLikeReview = async (reviewId: string) => {
    if (!user) {
      toast.error('Please sign in to like reviews');
      return;
    }

    try {
      const isLiked = userLikes.has(reviewId);
      const success = isLiked
        ? await reviewsApi.unlikeReview(reviewId, user.id)
        : await reviewsApi.likeReview(reviewId, user.id);

      if (success) {
        setUserLikes(prev => {
          const newLikes = new Set(prev);
          if (isLiked) {
            newLikes.delete(reviewId);
          } else {
            newLikes.add(reviewId);
          }
          return newLikes;
        });

        // Update review helpful count
        setReviews(prev => prev.map(review =>
          review.id === reviewId
            ? {
                ...review,
                helpful_count: isLiked
                  ? (review.helpful_count || 0) - 1
                  : (review.helpful_count || 0) + 1
              }
            : review
        ));

        toast.success(isLiked ? 'Removed like' : 'Review liked');
      }
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleEditReview = (review: ReviewWithUser) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReportReview = async (reviewId: string) => {
    if (!user) {
      toast.error('Please sign in to report reviews');
      return;
    }

    // In a real app, you'd show a modal to select reason
    const reason = 'Inappropriate content';
    const description = prompt('Please provide details about why you\'re reporting this review:');

    if (description) {
      try {
        const success = await reviewsApi.reportReview({
          review_id: reviewId,
          user_id: user.id,
          reason,
          description
        });

        if (success) {
          toast.success('Review reported successfully');
        }
      } catch (error) {
        toast.error('Failed to report review');
      }
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    loadReviews();
    if (user) {
      loadUserLikes();
    }
  };

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(reviewId)) {
        newExpanded.delete(reviewId);
      } else {
        newExpanded.add(reviewId);
      }
      return newExpanded;
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingStats = () => {
    if (reviews.length === 0) return null;

    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingCounts[review.rating - 1]++;
      }
    });

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    return {
      average: averageRating,
      total: reviews.length,
      distribution: ratingCounts.map((count, index) => ({
        stars: index + 1,
        count,
        percentage: (count / reviews.length) * 100
      })).reverse() // Show 5-star first
    };
  };

  const stats = getRatingStats();

  if (showReviewForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}>
            ← Back to Reviews
          </Button>
        </div>

        <ReviewForm
          restaurantId={restaurantId}
          existingReview={editingReview ? {
            id: editingReview.id,
            rating: editingReview.rating,
            content: editingReview.content,
            title: editingReview.title
          } : undefined}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      {showStats && stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Customer Reviews ({stats.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.average.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(stats.average))}
                </div>
                <p className="text-sm text-gray-600">
                  Based on {stats.total} review{stats.total !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {stats.distribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-2">
                    <span className="text-sm w-8">{item.stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Write Review Button */}
      {showWriteReview && user && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Share your experience</h3>
                <p className="text-sm text-gray-600">Help others make better dining decisions</p>
              </div>
              <Button onClick={() => setShowReviewForm(true)}>
                Write a Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your experience at this restaurant.
            </p>
            {user && (
              <Button onClick={() => setShowReviewForm(true)}>
                Write the First Review
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isLiked = userLikes.has(review.id);
            const isOwnReview = user?.id === review.user_id;
            const isExpanded = expandedReviews.has(review.id);
            const shouldTruncate = review.content && review.content.length > 300;

            return (
              <Card key={review.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user.avatar_url} />
                      <AvatarFallback>
                        {review.user.first_name?.[0]}{review.user.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {review.user.first_name} {review.user.last_name}
                          </span>
                          {review.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          {isOwnReview && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleEditReview(review)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                        {review.title && (
                          <span className="font-medium">{review.title}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="text-gray-700 mb-3">
                        {shouldTruncate && !isExpanded ? (
                          <>
                            {review.content?.slice(0, 300)}...
                            <Button
                              variant="link"
                              className="p-0 h-auto text-blue-600"
                              onClick={() => toggleReviewExpansion(review.id)}
                            >
                              Read more
                            </Button>
                          </>
                        ) : (
                          <>
                            {review.content}
                            {shouldTruncate && (
                              <Button
                                variant="link"
                                className="p-0 h-auto text-blue-600 ml-2"
                                onClick={() => toggleReviewExpansion(review.id)}
                              >
                                Show less
                              </Button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikeReview(review.id)}
                            className={`gap-1 ${isLiked ? 'text-blue-600' : ''}`}
                          >
                            <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                            Helpful ({review.helpful_count || 0})
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReportReview(review.id)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Load More (if limited) */}
      {limit && reviews.length >= limit && (
        <div className="text-center">
          <Button variant="outline">
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
}
