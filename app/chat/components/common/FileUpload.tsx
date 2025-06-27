'use client';

import { useState, useRef, useCallback, ChangeEvent } from 'react';
import { X, FileText, Image as ImageIcon, File, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FileWithPreview = {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
};

interface FileUploadProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  onFilesChange?: (files: FileWithPreview[]) => void;
  onUpload?: (files: FileWithPreview[]) => Promise<void>;
  disabled?: boolean;
}

const DEFAULT_MAX_SIZE = 10; // 10MB

export const FileUpload = ({
  multiple = false,
  accept = 'image/*,.pdf,.doc,.docx,.txt',
  maxSize = DEFAULT_MAX_SIZE,
  className,
  onFilesChange,
  onUpload,
  disabled = false,
}: FileUploadProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): FileWithPreview['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type === 'application/pdf' || 
        file.type === 'application/msword' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'text/plain') {
      return 'document';
    }
    return 'other';
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    await processFiles(Array.from(e.target.files));
  };

  const processFiles = async (fileList: File[]) => {
    const validFiles: FileWithPreview[] = [];
    const invalidFiles: { name: string; reason: string }[] = [];

    for (const file of fileList) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        invalidFiles.push({
          name: file.name,
          reason: `File exceeds maximum size of ${maxSize}MB`,
        });
        continue;
      }

      // Check file type
      const fileType = getFileType(file);
      if (fileType === 'other' && !accept.includes(file.type)) {
        invalidFiles.push({
          name: file.name,
          reason: 'File type not supported',
        });
        continue;
      }

      const preview = await createPreview(file);
      validFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        preview,
        type: fileType,
        progress: 0,
        status: 'pending',
      });
    }

    if (invalidFiles.length > 0) {
      // Show error toast for invalid files
      console.error('Some files were not accepted:', invalidFiles);
      // You can add a toast notification here
    }

    if (validFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    }
  };

  const handleRemoveFile = (id: string) => {
    const updatedFiles = files.filter((file) => file.id !== id);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await processFiles(droppedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);
    try {
      await onUpload?.(files);
      setFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
      // Update files with error status
      setFiles(files.map(file => ({
        ...file,
        status: 'error',
        error: 'Upload failed',
      })));
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: FileWithPreview['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <File className="h-4 w-4" />;
      case 'audio':
        return <File className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs">
              Supported formats: {accept.split(',').join(', ')}
            </p>
            <p className="text-xs">Max size: {maxSize}MB per file</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
          disabled={disabled}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Clear all
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt="Preview"
                        className="h-full w-full rounded object-cover"
                      />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{file.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.file.size / 1024).toFixed(1)} KB • {file.status}
                    </p>
                    {file.status === 'uploading' && (
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-destructive">{file.error}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(file.id);
                  }}
                  disabled={isUploading}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
          </div>

          {onUpload && (
            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Upload ${files.length} ${files.length === 1 ? 'file' : 'files'}`
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
