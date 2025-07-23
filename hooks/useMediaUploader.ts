import { useState, useCallback, useRef } from 'react';
import { MediaService, MediaItem } from '@/lib/media/MediaService';

export interface UploadOptions {
  endpoint: string;
  headers?: Record<string, string>;
  fieldName?: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number, uploadedBytes: number, totalBytes: number) => void;
  onComplete?: (response: any) => void;
  onError?: (error: Error) => void;
}

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  metadata?: Record<string, any>;
}

export function useMediaUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const mediaService = MediaService.getInstance();

  const validateFile = useCallback((file: File, options: UploadOptions) => {
    // Check file size
    if (options.maxFileSize && file.size > options.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${options.maxFileSize} bytes`);
    }

    // Check file type
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      const fileType = file.type.toLowerCase();
      const isAllowed = options.allowedTypes.some(allowedType => {
        // Handle wildcard types like 'image/*'
        if (allowedType.endsWith('/*')) {
          const typePrefix = allowedType.slice(0, -2);
          return fileType.startsWith(typePrefix);
        }
        return fileType === allowedType.toLowerCase();
      });

      if (!isAllowed) {
        throw new Error(`File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
      }
    }
  }, []);

  const uploadFile = useCallback(async (file: File, options: UploadOptions): Promise<UploadResult> => {
    // Reset state
    setIsUploading(true);
    setProgress(0);
    setUploadedBytes(0);
    setTotalBytes(file.size);
    setError(null);
    setResult(null);
    
    // Create a new AbortController for this upload
    abortControllerRef.current = new AbortController();
    
    try {
      // Validate the file
      validateFile(file, options);
      
      // Create form data
      const formData = new FormData();
      formData.append(options.fieldName || 'file', file);
      
      // Create a media item for tracking
      const mediaItem: MediaItem = {
        id: `upload-${Date.now()}`,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 
              file.type.startsWith('audio/') ? 'audio' : 'document',
        source: { file },
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
        status: 'capturing',
        timestamp: Date.now(),
      };
      
      setMediaItem(mediaItem);
      
      // Start the upload
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setProgress(progress);
          setUploadedBytes(event.loaded);
          setTotalBytes(event.total);
          
          if (options.onProgress) {
            options.onProgress(progress, event.loaded, event.total);
          }
        }
      };
      
      // Create a promise to handle the upload
      const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              const result: UploadResult = {
                url: response.url || response.fileUrl || '',
                fileName: response.fileName || file.name,
                fileSize: response.fileSize || file.size,
                fileType: response.fileType || file.type,
                metadata: response.metadata || {},
              };
              
              // Update media item with the result
              if (mediaItem) {
                mediaItem.source.url = result.url;
                mediaItem.status = 'idle';
                mediaService.emit('mediaUpdated', mediaItem);
              }
              
              setResult(result);
              if (options.onComplete) {
                options.onComplete(response);
              }
              
              resolve(result);
            } catch (error) {
              const err = error instanceof Error ? error : new Error('Failed to parse upload response');
              setError(err);
              if (options.onError) {
                options.onError(err);
              }
              reject(err);
            }
          } else {
            const error = new Error(`Upload failed with status ${xhr.status}`);
            setError(error);
            if (options.onError) {
              options.onError(error);
            }
            reject(error);
          }
        };
        
        xhr.onerror = () => {
          const error = new Error('Upload failed');
          setError(error);
          if (options.onError) {
            options.onError(error);
          }
          reject(error);
        };
        
        xhr.onabort = () => {
          const error = new Error('Upload cancelled');
          setError(error);
          if (options.onError) {
            options.onError(error);
          }
          reject(error);
        };
      });
      
      // Set up the request
      xhr.open('POST', options.endpoint, true);
      
      // Add headers if provided
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }
      
      // Set up abort signal
      if (abortControllerRef.current) {
        abortControllerRef.current.signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }
      
      // Send the request
      xhr.send(formData);
      
      // Wait for the upload to complete
      return await uploadPromise;
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Upload failed');
      setError(err);
      
      // Update media item with error
      if (mediaItem) {
        mediaItem.status = 'error';
        mediaItem.error = err.message;
        mediaService.emit('mediaUpdated', mediaItem);
      }
      
      if (options.onError) {
        options.onError(err);
      }
      
      throw err;
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  }, [mediaService, validateFile]);
  
  const abortUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  const reset = useCallback(() => {
    abortUpload();
    setProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);
    setError(null);
    setResult(null);
    setMediaItem(null);
  }, [abortUpload]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return {
    // State
    isUploading,
    progress,
    uploadedBytes,
    totalBytes,
    error,
    result,
    mediaItem,
    
    // Actions
    uploadFile,
    abortUpload,
    reset,
  };
}

export default useMediaUploader;
