import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  name: string;
  size: number;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export const useMedia = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get file type from MIME type
  const getFileType = (file: File): MediaFile['type'] => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image':
        return 'image';
      case 'video':
        return 'video';
      case 'audio':
        return 'audio';
      default:
        return 'document';
    }
  };

  // Add files to the media list
  const addMediaFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).map(file => {
      const fileType = getFileType(file);
      const fileId = uuidv4();
      const fileUrl = URL.createObjectURL(file);
      
      return {
        id: fileId,
        file,
        type: fileType,
        url: fileUrl,
        name: file.name,
        size: file.size,
        uploadProgress: 0,
        status: 'pending' as const,
      };
    });

    setMediaFiles(prev => [...prev, ...newFiles]);
    return newFiles;
  }, []);

  // Upload a single file
  const uploadFile = useCallback(async (file: MediaFile) => {
    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('type', file.type);

    // Update file status to uploading
    setMediaFiles(prev =>
      prev.map(f =>
        f.id === file.id ? { ...f, status: 'uploading' } : f
      )
    );

    try {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setMediaFiles(prev =>
            prev.map(f =>
              f.id === file.id ? { ...f, uploadProgress: progress } : f
            )
          );
        }
      };

      // Handle upload completion
      const uploadPromise = new Promise<{ url: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve({ url: response.url });
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });

      xhr.open('POST', '/api/upload', true);
      xhr.send(formData);

      const result = await uploadPromise;
      
      // Update file status to completed
      setMediaFiles(prev =>
        prev.map(f =>
          f.id === file.id
            ? { ...f, status: 'completed', url: result.url }
            : f
        )
      );

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      
      // Update file status to error
      setMediaFiles(prev =>
        prev.map(f =>
          f.id === file.id
            ? { ...f, status: 'error', error: error.message }
            : f
        )
      );
      
      throw error;
    }
  }, []);

  // Upload all pending files
  const uploadAll = useCallback(async () => {
    const pendingFiles = mediaFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return [];

    setIsUploading(true);
    setError(null);

    try {
      const results = [];
      for (const file of pendingFiles) {
        try {
          const result = await uploadFile(file);
          results.push(result);
        } catch (err) {
          console.error(`Failed to upload file: ${file.name}`, err);
          // Continue with next file even if one fails
        }
      }
      return results;
    } finally {
      setIsUploading(false);
    }
  }, [mediaFiles, uploadFile]);

  // Remove a file
  const removeFile = useCallback((fileId: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        // Revoke object URL to avoid memory leaks
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  // Clear all files
  const clearAllFiles = useCallback(() => {
    // Revoke all object URLs to avoid memory leaks
    mediaFiles.forEach(file => {
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });
    setMediaFiles([]);
  }, [mediaFiles]);

  // Get files by status
  const getFilesByStatus = useCallback((status: MediaFile['status']) => {
    return mediaFiles.filter(file => file.status === status);
  }, [mediaFiles]);

  return {
    // State
    mediaFiles,
    isUploading,
    error,
    
    // Actions
    addMediaFiles,
    uploadFile,
    uploadAll,
    removeFile,
    clearAllFiles,
    getFilesByStatus,
  };
};

export default useMedia;
