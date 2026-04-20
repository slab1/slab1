import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { RestaurantGalleryImage } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Expand, Image as ImageIcon, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ComprehensiveGalleryProps {
  images: RestaurantGalleryImage[];
  fallbackImage?: string;
}

export function ComprehensiveGallery({ 
  images, 
  fallbackImage = "https://placehold.co/1200x800?text=No+Images+Available" 
}: ComprehensiveGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const galleryImages = useMemo(() => {
    if (!images || images.length === 0) {
      return [{ id: 'fallback', url: fallbackImage, caption: 'No gallery images available', category: 'other' as const }];
    }
    return images;
  }, [images, fallbackImage]);

  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return galleryImages;
    return galleryImages.filter(img => img.category === activeCategory);
  }, [galleryImages, activeCategory]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    galleryImages.forEach(img => {
      if (img.category) cats.add(img.category);
    });
    return Array.from(cats);
  }, [galleryImages]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % filteredImages.length);
    }
  }, [selectedImageIndex, filteredImages.length]);

  const handlePrevious = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  }, [selectedImageIndex, filteredImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'Escape') setSelectedImageIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, filteredImages, handleNext, handlePrevious]);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full sm:w-auto">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat.replace('_', ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            {filteredImages.length} images
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" role="list">
        {filteredImages.map((image, index) => (
          <button 
            key={image.id} 
            className="gallery-grid-item group relative aspect-square overflow-hidden rounded-xl border bg-muted cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 text-left p-0"
            onClick={() => setSelectedImageIndex(index)}
            aria-label={`View ${image.caption || 'image'} in full screen`}
            role="listitem"
          >
            <OptimizedImage 
              src={image.url} 
              alt={image.caption || "Restaurant image"} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              fallbackSrc={fallbackImage}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Expand className="text-white h-8 w-8" aria-hidden="true" />
            </div>
            {image.category && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity capitalize bg-white/90 text-black hover:bg-white"
              >
                {image.category.replace('_', ' ')}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox / Fullscreen Dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={(open) => !open && setSelectedImageIndex(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none flex flex-col justify-center items-center overflow-hidden">
          {selectedImageIndex !== null && (
            <>
              <div className="relative w-full h-full flex items-center justify-center group">
                {/* Image Navigation */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full h-12 w-12 hidden md:flex"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <div className="relative max-w-full max-h-full flex flex-col items-center">
                  <OptimizedImage 
                    src={filteredImages[selectedImageIndex].url} 
                    alt={filteredImages[selectedImageIndex].caption || "Restaurant image"} 
                    className="max-w-full max-h-[85vh] object-contain select-none"
                    fallbackSrc={fallbackImage}
                  />
                  
                  {filteredImages[selectedImageIndex].caption && (
                    <div className="p-4 text-center w-full bg-black/50 text-white">
                      <p className="text-sm md:text-base font-medium">
                        {filteredImages[selectedImageIndex].caption}
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        Image {selectedImageIndex + 1} of {filteredImages.length}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full h-12 w-12 hidden md:flex"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>

                {/* Mobile Tap Areas for navigation */}
                <div className="absolute inset-y-0 left-0 w-1/4 z-40 md:hidden" onClick={handlePrevious} />
                <div className="absolute inset-y-0 right-0 w-1/4 z-40 md:hidden" onClick={handleNext} />
                
                {/* Close button */}
                <DialogClose className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
                  <X className="h-6 w-6" />
                </DialogClose>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
