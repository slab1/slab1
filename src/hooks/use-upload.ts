
import { useState } from "react";
import { storageApi } from "@/api/storage";
import { toast } from "sonner";
import { compressImage } from "@/utils/image";

interface UseUploadOptions {
  bucket: string;
  path?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: any) => void;
  compress?: boolean;
}

export function useUpload(options: UseUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, customPath?: string) => {
    setIsUploading(true);
    setProgress(0);

    try {
      let fileToUpload = file;
      
      // Compress if it's an image and compression is enabled
      if (options.compress && file.type.startsWith('image/')) {
        try {
          fileToUpload = await compressImage(file);
        } catch (e) {
          console.warn("Compression failed, uploading original", e);
        }
      }

      const fileExt = fileToUpload.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const finalPath = customPath || `${options.path || "uploads"}/${fileName}`;

      const { publicUrl } = await storageApi.uploadFile(
        options.bucket,
        finalPath,
        fileToUpload
      );

      if (options.onSuccess) {
        options.onSuccess(publicUrl);
      }

      toast.success("File uploaded successfully");
      return publicUrl;
    } catch (error: any) {
      console.error("Upload hook error:", error);
      if (options.onError) {
        options.onError(error);
      }
      toast.error(error.message || "Failed to upload file");
      throw error;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (url: string) => {
    try {
      const path = storageApi.extractPathFromUrl(url, options.bucket);
      if (path) {
        await storageApi.deleteFile(options.bucket, path);
      }
    } catch (error) {
      console.error("Delete file error:", error);
    }
  };

  const replace = async (file: File, oldUrl?: string | null, customPath?: string) => {
    if (oldUrl && !oldUrl.includes('placeholder')) {
      try {
        const path = storageApi.extractPathFromUrl(oldUrl, options.bucket);
        if (path) {
          await storageApi.deleteFile(options.bucket, path);
        }
      } catch (error) {
        console.error("Error deleting old file during replacement:", error);
        // Continue with upload even if delete fails to avoid blocking the user
      }
    }
    return upload(file, customPath);
  };

  return {
    upload,
    deleteFile,
    replace,
    isUploading,
    progress,
  };
}

export function useDeleteFile(bucket: string) {
  const [isDeleting, setIsDeleting] = useState(false);

  const remove = async (url: string) => {
    if (!url || url.includes('placeholder')) return;
    
    setIsDeleting(true);
    try {
      const path = storageApi.extractPathFromUrl(url, bucket);
      if (path) {
        await storageApi.deleteFile(bucket, path);
        return true;
      }
    } catch (error) {
      console.error("Delete file error:", error);
    } finally {
      setIsDeleting(false);
    }
    return false;
  };

  return { remove, isDeleting };
}
