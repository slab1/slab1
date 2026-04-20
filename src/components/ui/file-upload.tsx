
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, FileText, Loader2, Upload } from 'lucide-react';
import { useUpload } from '@/hooks/use-upload';

interface FileUploadProps {
  onFileUrlChange: (url: string | null, metadata?: { name: string, size: number, type: string }) => void;
  storageBucket: string;
  storagePath: string;
  fileTypes?: string; // e.g., "image/*", "application/pdf", etc.
  className?: string;
  buttonText?: string;
  initialUrl?: string | null;
  initialFileName?: string | null;
}

export function FileUpload({ 
  onFileUrlChange, 
  storageBucket, 
  storagePath,
  fileTypes = "*",
  className = '',
  buttonText = 'Upload File',
  initialUrl = null,
  initialFileName = null
}: FileUploadProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(initialUrl);
  const [fileName, setFileName] = useState<string | null>(initialFileName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, replace, deleteFile, isUploading } = useUpload({
    bucket: storageBucket,
    path: storagePath,
    onSuccess: (url) => {
      // Logic for onSuccess is handled in handleFileChange to pass metadata
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const prevFileName = fileName;
    const prevFileUrl = fileUrl;
    setFileName(file.name);
    
    try {
      const url = await replace(file, fileUrl);
      setFileUrl(url);
      onFileUrlChange(url, {
        name: file.name,
        size: file.size,
        type: file.type
      });
    } catch (error) {
      setFileName(prevFileName);
      setFileUrl(prevFileUrl);
    }
  };

  const handleClear = async () => {
    if (fileUrl) {
      await deleteFile(fileUrl);
    }
    setFileName(null);
    setFileUrl(null);
    onFileUrlChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        variant="outline" 
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex-1"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept={fileTypes}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      
      {fileName && (
        <div className="flex items-center gap-2 border rounded-md px-3 py-1.5 flex-1 bg-muted/30">
          <FileText className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm truncate">{fileName}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 ml-auto flex-shrink-0"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
