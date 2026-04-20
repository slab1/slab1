import { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { RestaurantGalleryImage } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Expand, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface RestaurantGalleryCarouselProps {
  images: RestaurantGalleryImage[];
  fallbackImage?: string;
}

export function RestaurantGalleryCarousel({ 
  images, 
  fallbackImage = "https://placehold.co/1200x800?text=No+Images+Available" 
}: RestaurantGalleryCarouselProps) {
  const [selectedImage, setSelectedImage] = useState<RestaurantGalleryImage | null>(null);
  const galleryImages = images && images.length > 0 
    ? images 
    : fallbackImage 
      ? [{ id: 'fallback', url: fallbackImage, caption: 'No gallery images available' }] 
      : [];

  return (
    <div className="space-y-6">
      {/* Main carousel */}
      <Carousel className="w-full">
        <div className="relative">
          <CarouselContent>
            {galleryImages.map((image) => (
              <CarouselItem key={image.id} className="relative">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl">
                  <OptimizedImage 
                    src={image.url} 
                    alt={image.caption || "Restaurant image"} 
                    className="object-cover w-full h-full transition-all duration-300 hover:scale-105"
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                      <p className="text-sm font-medium">{image.caption}</p>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white rounded-full"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
        </div>
      </Carousel>

      {/* Thumbnails row */}
      <div className="grid grid-cols-5 gap-2">
        {galleryImages.slice(0, 5).map((image, index) => (
          <button
            key={image.id}
            className={cn(
              "aspect-square overflow-hidden rounded-md border border-border",
              selectedImage?.id === image.id && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedImage(image)}
          >
            <OptimizedImage 
              src={image.url} 
              alt={image.caption || `Thumbnail ${index + 1}`} 
              className="w-full h-full object-cover transition-all hover:scale-110"
              fallbackSrc="/placeholder.svg"
            />
          </button>
        ))}
        {galleryImages.length > 5 && (
          <button 
            className="aspect-square overflow-hidden rounded-md border border-muted bg-muted/50 flex items-center justify-center text-muted-foreground"
            onClick={() => {}}
          >
            <div className="text-center">
              <p className="text-sm font-medium">+{galleryImages.length - 5}</p>
              <p className="text-xs">more</p>
            </div>
          </button>
        )}
      </div>

      {/* Lightbox dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-screen-lg w-full p-1 sm:p-2">
          {selectedImage && (
            <div className="relative w-full">
              <OptimizedImage 
                src={selectedImage.url} 
                alt={selectedImage.caption || "Restaurant image"} 
                className="w-full h-full object-contain max-h-[80vh]"
              />
              {selectedImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                  <p className="text-sm md:text-base">{selectedImage.caption}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
