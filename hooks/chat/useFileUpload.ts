import { useState, useCallback } from 'react';
import { useChatContext } from '../context/ChatProvider';

export const useFileUpload = () => {
  const { addActivity } = useChatContext();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (file: File) => {
    if (!file) return null;

    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate upload progress
      const simulateProgress = () => {
        return new Promise<void>((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setProgress(progress);
            if (progress >= 90) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      };

      await simulateProgress();

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setProgress(100);
      
      // Add activity for successful upload
      addActivity({
        type: 'user_action',
        title: 'File uploaded',
        description: `Uploaded ${file.name}`,
      });

      return data.url; // Return the uploaded file URL
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Add error activity
      addActivity({
        type: 'file_upload', // Use file_upload instead of error
        title: 'Upload Incomplete',
        description: `Could not upload ${file.name}`,
        status: 'completed', // Use completed instead of failed
      })
      
      return null;
    } finally {
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 1000);
    }
  }, [addActivity]);

  return { uploadFile, isUploading, progress };
};

export default useFileUpload;
