
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { OptimizedImage } from './optimized-image';
import { useUpload } from '@/hooks/use-upload';

interface ImageUploadProps {
  onImageUrlChange: (url: string | null) => void;
  initialImageUrl?: string | null;
  storageBucket: string;
  storagePath: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export function ImageUpload({ 
  onImageUrlChange, 
  initialImageUrl, 
  storageBucket, 
  storagePath,
  className = '',
  aspectRatio = 'square'
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, replace, deleteFile, isUploading } = useUpload({
    bucket: storageBucket,
    path: storagePath,
    compress: true,
    onSuccess: (url) => {
      setImageUrl(url);
      onImageUrlChange(url);
    }
  });

  const aspectRatioClass = 
    aspectRatio === 'square' ? 'aspect-square' : 
    aspectRatio === 'video' ? 'aspect-video' : 
    'aspect-[3/4]';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Create a temporary preview
    const objectUrl = URL.createObjectURL(file);
    const prevImageUrl = imageUrl;
    setImageUrl(objectUrl);
    
    try {
      await replace(file, imageUrl);
    } catch (error) {
      setImageUrl(prevImageUrl);
    }
  };

  const handleRemoveImage = async () => {
    if (imageUrl) {
      // Only delete from storage if it's not the initial image 
      // (or handle initial image deletion separately if needed)
      if (imageUrl !== initialImageUrl && !imageUrl.startsWith('blob:')) {
        await deleteFile(imageUrl);
      }
    }
    setImageUrl(null);
    onImageUrlChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`${className}`}>
      {imageUrl ? (
        <div className={`relative ${aspectRatioClass} rounded-md overflow-hidden border`}>
          <OptimizedImage 
            src={imageUrl} 
            alt="Uploaded image" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-md ${aspectRatioClass} flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-muted/50 transition-colors`}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Click to upload an image</p>
            </>
          )}
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
}
