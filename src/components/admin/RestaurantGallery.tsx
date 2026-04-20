import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Plus, Image } from "lucide-react";
import restaurantApi from "@/api/restaurant";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { RestaurantGalleryImage } from "@/api/types";
import { isApiError } from "@/api/utils";

interface RestaurantGalleryProps {
  restaurantId: string;
  onClose: () => void;
}

export function RestaurantGallery({ restaurantId, onClose }: RestaurantGalleryProps) {
  const [galleryImages, setGalleryImages] = useState<RestaurantGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const images = await restaurantApi.getGallery(restaurantId);
        if (isApiError(images)) {
          console.error("Error fetching gallery:", images.error);
          toast.error("Failed to load gallery images");
          setGalleryImages([]);
        } else {
          setGalleryImages(images || []);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
        toast.error("Failed to load gallery images");
        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [restaurantId]);

  const handleAddImage = async () => {
    if (!newImageUrl) {
      toast.error("Image URL is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const newImage = await restaurantApi.addGalleryImage({
        restaurant_id: restaurantId,
        url: newImageUrl,
        caption: newImageCaption
      });

      if (isApiError(newImage)) {
        console.error("Error adding image:", newImage.error);
        toast.error("Failed to add image");
      } else if (newImage) {
        setGalleryImages([...galleryImages, newImage]);
        setNewImageUrl("");
        setNewImageCaption("");
        setIsAddDialogOpen(false);
        toast.success("Image added to gallery");
      }
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Failed to add image");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const result = await restaurantApi.deleteGalleryImage(id);
      if (isApiError(result)) {
        console.error("Error deleting image:", result.error);
        toast.error("Failed to delete image");
      } else {
        setGalleryImages(galleryImages.filter(img => img.id !== id));
        toast.success("Image deleted from gallery");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Restaurant Gallery</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Image
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Back to Restaurant
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-10">Loading gallery...</div>
        ) : galleryImages.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No images in the gallery yet.</p>
            <p className="text-sm">Click "Add Image" to add your first gallery image.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="relative group rounded-md overflow-hidden border border-border">
                <OptimizedImage 
                  src={image.url} 
                  alt={image.caption || "Restaurant gallery image"} 
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button 
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
                {image.caption && (
                  <div className="p-2 text-sm">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Gallery Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">Caption (optional)</Label>
                <Input
                  id="caption"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  placeholder="Enter image caption"
                />
              </div>
              {newImageUrl && (
                <div className="mt-4">
                  <p className="text-sm mb-2">Preview:</p>
                  <div className="relative max-h-40 border rounded-md overflow-hidden">
                    <OptimizedImage
                      src={newImageUrl}
                      alt="Preview"
                      className="max-h-40 object-contain w-full"
                      lazy={false}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddImage} 
                disabled={isSubmitting || !newImageUrl}
              >
                {isSubmitting ? "Adding..." : "Add Image"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
