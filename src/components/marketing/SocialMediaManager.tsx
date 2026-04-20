import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  MessageSquare, 
  Share2, 
  Heart, 
  Eye,
  Calendar,
  Image,
  Users,
  Plus,
  Link as LinkIcon,
  Trash2,
  Edit
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(280, "Content must be less than 280 characters"),
  platform: z.string().min(1, "Platform is required"),
  schedule_time: z.string().optional(),
  image_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

type PostFormValues = z.infer<typeof postSchema>;

interface SocialPost {
  id: string;
  content: string;
  platform: string;
  status: string;
  image_url?: string;
  scheduled_at?: string;
  published_at?: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  created_at: string;
}

export function SocialMediaManager({ restaurantId }: { restaurantId: string }) {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      platform: "instagram",
      schedule_time: "",
      image_url: "",
    },
  });

  // Fetch posts from database
  const { data: socialPosts, isLoading } = useQuery({
    queryKey: ["social-posts", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_media_posts")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as SocialPost[];
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (newPost: PostFormValues) => {
      const { data, error } = await supabase
        .from("social_media_posts")
        .insert({
          restaurant_id: restaurantId,
          content: newPost.content,
          platform: newPost.platform,
          image_url: newPost.image_url || null,
          scheduled_at: newPost.schedule_time || null,
          status: newPost.schedule_time ? "scheduled" : "published",
          published_at: newPost.schedule_time ? null : new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-posts", restaurantId] });
      toast({ title: "Post created successfully!" });
      setIsCreatePostOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create post", description: error.message, variant: "destructive" });
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, ...updates }: PostFormValues & { id: string }) => {
      const { data, error } = await supabase
        .from("social_media_posts")
        .update({
          content: updates.content,
          platform: updates.platform,
          image_url: updates.image_url || null,
          scheduled_at: updates.schedule_time || null,
          status: updates.schedule_time ? "scheduled" : "published",
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-posts", restaurantId] });
      toast({ title: "Post updated successfully!" });
      setEditingPost(null);
      setIsCreatePostOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update post", description: error.message, variant: "destructive" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("social_media_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-posts", restaurantId] });
      toast({ title: "Post deleted successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete post", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (values: PostFormValues) => {
    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, ...values });
    } else {
      createPostMutation.mutate(values);
    }
  };

  const handleEditPost = (post: SocialPost) => {
    setEditingPost(post);
    form.reset({
      content: post.content,
      platform: post.platform,
      schedule_time: post.scheduled_at || "",
      image_url: post.image_url || "",
    });
    setIsCreatePostOpen(true);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return "📷";
      case "facebook": return "📘";
      case "tiktok": return "🎵";
      case "twitter": return "🐦";
      default: return "📱";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "scheduled": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "draft": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Calculate stats from posts
  const socialStats = {
    instagram: { 
      posts: socialPosts?.filter(p => p.platform === "instagram").length || 0,
      engagement: socialPosts?.filter(p => p.platform === "instagram").reduce((sum, p) => sum + p.likes + p.comments, 0) || 0
    },
    facebook: { 
      posts: socialPosts?.filter(p => p.platform === "facebook").length || 0,
      engagement: socialPosts?.filter(p => p.platform === "facebook").reduce((sum, p) => sum + p.likes + p.comments, 0) || 0
    },
    tiktok: { 
      posts: socialPosts?.filter(p => p.platform === "tiktok").length || 0,
      engagement: socialPosts?.filter(p => p.platform === "tiktok").reduce((sum, p) => sum + p.likes + p.comments, 0) || 0
    },
    twitter: { 
      posts: socialPosts?.filter(p => p.platform === "twitter").length || 0,
      engagement: socialPosts?.filter(p => p.platform === "twitter").reduce((sum, p) => sum + p.likes + p.comments, 0) || 0
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Social Media Management
          </h2>
          <p className="text-muted-foreground">
            Manage your social media presence and engage with customers
          </p>
        </div>
        
        <Dialog open={isCreatePostOpen} onOpenChange={(open) => {
          setIsCreatePostOpen(open);
          if (!open) {
            setEditingPost(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Edit Post" : "Create Social Media Post"}</DialogTitle>
              <DialogDescription>
                {editingPost ? "Update your post content" : "Create engaging content for your social media platforms"}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="instagram">📷 Instagram</SelectItem>
                          <SelectItem value="facebook">📘 Facebook</SelectItem>
                          <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                          <SelectItem value="twitter">🐦 Twitter</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Content</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="What's happening at your restaurant today?"
                          rows={4}
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormMessage />
                        <p className="text-sm text-muted-foreground">
                          {field.value.length}/280 characters
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://example.com/image.jpg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schedule_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Time (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="datetime-local"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => {
                    setIsCreatePostOpen(false);
                    setEditingPost(null);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createPostMutation.isPending || updatePostMutation.isPending}
                  >
                    {createPostMutation.isPending || updatePostMutation.isPending 
                      ? "Saving..." 
                      : editingPost 
                        ? "Save Changes" 
                        : form.watch("schedule_time") ? "Schedule Post" : "Post Now"
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Social Media Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(socialStats).map(([platform, stats]) => (
          <Card key={platform}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{getPlatformIcon(platform)}</span>
                <Badge variant="outline" className="capitalize">{platform}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stats.posts}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
                <p className="text-sm text-green-600 font-medium">
                  {stats.engagement} engagements
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Your Posts</CardTitle>
          <CardDescription>Manage your social media content</CardDescription>
        </CardHeader>
        <CardContent>
          {socialPosts?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No posts yet. Create your first post to get started!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {socialPosts?.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(post.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletePostMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="mb-3 text-sm">{post.content}</p>
                  
                  {post.image_url && (
                    <div className="mb-3">
                      <OptimizedImage
                        src={post.image_url}
                        alt="Post content"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{post.likes}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{post.comments}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Share2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{post.shares}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">{post.reach}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Ideas */}
      <Card>
        <CardHeader>
          <CardTitle>Content Ideas</CardTitle>
          <CardDescription>Boost engagement with these proven content types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Image className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Behind the Scenes</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Show your kitchen, staff at work, or food preparation process
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Customer Spotlights</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Feature happy customers and their favorite dishes
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold">Daily Specials</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Highlight today's special menu items and limited offers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
