
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lazy?: boolean;
  blur?: boolean;
  aspectRatio?: string;
  sizes?: string;
  priority?: boolean;
  onLoadComplete?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder.svg',
  lazy = true,
  blur = true,
  aspectRatio,
  sizes = '100vw',
  priority = false,
  className,
  onLoad,
  onError,
  onLoadComplete,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isInView, setIsInView] = useState(!lazy || priority);

  // Update currentSrc when src prop changes
  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, currentSrc]);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { 
        rootMargin: '200px',
        threshold: 0.01 
      }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
      observer.disconnect();
    };
  }, [lazy, priority, isInView]);

  // Handle cached images and loading state
  useEffect(() => {
    if (isInView && imgRef.current) {
      if (imgRef.current.complete) {
        setIsLoading(false);
      }
    }
  }, [isInView]);

  // Fallback timeout to prevent endless loading state
  useEffect(() => {
    if (isLoading && isInView) {
      const timer = setTimeout(() => {
        if (isLoading) {
          console.warn(`Image load timeout for: ${currentSrc}`);
          setIsLoading(false);
          // If timeout occurs, try fallback if we're not already using it
          if (currentSrc !== fallbackSrc) {
            setHasError(true);
            setCurrentSrc(fallbackSrc);
          }
        }
      }, 10000); // 10s timeout
      return () => clearTimeout(timer);
    }
  }, [isLoading, isInView, currentSrc, fallbackSrc]);

  // Generate responsive srcSet for better performance
  const generateSrcSet = useCallback((baseSrc: string) => {
    if (baseSrc.includes('placeholder') || baseSrc.includes('data:') || baseSrc.includes('blob:')) return '';
    
    // Support both external (Unsplash, etc.) and local images
    if (baseSrc.startsWith('http')) {
      const sizes = [640, 768, 1024, 1280, 1536];
      
      // Clean up existing width parameters to avoid duplicates
      let baseUrl = baseSrc;
      if (baseSrc.includes('unsplash.com')) {
        const url = new URL(baseSrc);
        url.searchParams.delete('w');
        url.searchParams.delete('width');
        baseUrl = url.toString();
      }

      return sizes
        .map(size => {
          const separator = baseUrl.includes('?') ? '&' : '?';
          return `${baseUrl}${separator}w=${size}&q=75&auto=format ${size}w`;
        })
        .join(', ');
    }
    
    return undefined;
  }, []);

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    onLoad?.(event);
    onLoadComplete?.();
  }, [onLoad, onLoadComplete]);

  // Enhanced error handling with format fallback
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    
    // Only try fallbacks once to avoid infinite loops
    if (hasError) return;
    setHasError(true);
    
    if (currentSrc !== fallbackSrc) {
      let nextSrc = fallbackSrc;
      
      // If it's an Unsplash image, try to load it without parameters first
      if (currentSrc.includes('unsplash.com') && currentSrc.includes('?')) {
        nextSrc = currentSrc.split('?')[0];
      } else if (currentSrc.includes('.jpg') || currentSrc.includes('.png')) {
        // Try WebP version if it was a standard image
        nextSrc = currentSrc.replace(/\.(jpg|png)$/, '.webp');
      }
      
      setCurrentSrc(nextSrc);
      // Reset error state for the fallback attempt, but handle it carefully
      // If the nextSrc is the same as current, we don't want to reset
      if (nextSrc !== currentSrc) {
        setHasError(false);
        setIsLoading(true);
      }
    }
    
    onError?.(event);
  }, [currentSrc, fallbackSrc, onError, hasError]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-muted/20",
        aspectRatio && `aspect-[${aspectRatio}]`,
        className
      )}
      style={aspectRatio ? { aspectRatio: aspectRatio.replace('/', ' / ') } : undefined}
    >
      {isInView && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          srcSet={generateSrcSet(currentSrc)}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            isLoading && blur ? "scale-105 blur-lg" : "scale-100 blur-0",
            hasError ? "opacity-0" : "opacity-100",
            className
          )}
          {...props}
        />
      )}
      
      {/* Loading Placeholder */}
      {isLoading && blur && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10 animate-pulse">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
