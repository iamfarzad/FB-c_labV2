import { useState, useCallback, useEffect, useRef } from 'react';
import { getMediaService, MediaType, MediaCaptureOptions, MediaItem, MediaService } from '@/lib/media/MediaService';

interface UseMediaCaptureProps extends Omit<MediaCaptureOptions, 'onDataAvailable'> {
  onStart?: () => void;
  onStop?: (data: Blob) => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (error: Error) => void;
}

export function useMediaCapture({
  constraints,
  autoStart = false,
  maxDuration,
  onStart,
  onStop,
  onPause,
  onResume,
  onError,
}: UseMediaCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const mediaService = useRef<MediaService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  // Initialize media service on mount
  useEffect(() => {
    try {
      mediaService.current = getMediaService();
      setIsInitialized(true);
    } catch (error) {
      console.warn('MediaService not available:', error);
      setInitError(error instanceof Error ? error : new Error('Failed to initialize MediaService'));
    }
    
    return () => {
      // Cleanup
      if (mediaService.current) {
        mediaService.current.cleanup();
        mediaService.current = null;
      }
    };
  }, []);

  // Helper to safely access media service methods
  const withMediaService = <T extends (...args: any[]) => any>(
    fn: (service: MediaService, ...args: any[]) => any
  ) => {
    return (...args: any[]) => {
      if (!mediaService.current) {
        const error = initError || new Error('MediaService not initialized');
        onError?.(error);
        throw error;
      }
      return fn(mediaService.current, ...args);
    };
  };

  // Handle timer for capture duration
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    
    timerRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
        
        // Stop if max duration is reached
        if (maxDuration && elapsed >= maxDuration) {
          stopCapture();
        }
      }
    }, 1000);
  }, [maxDuration]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    startTimeRef.current = undefined;
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  const startCapture = useCallback(async () => {
    if (!isInitialized) {
      const error = new Error('MediaService not initialized');
      setError(error);
      onError?.(error);
      return;
    }

    try {
      // Get permissions
      const hasPermission = await withMediaService(
        (service) => service.requestPermissions(constraints)
      )();

      if (!hasPermission) {
        throw new Error('Permission denied for media access');
      }

      // Start media capture
      const mediaItem = await withMediaService((service) => 
        service.captureMedia({
          constraints,
          onDataAvailable: (data: Blob) => {
            onStop?.(data);
          },
        })
      )();

      if (mediaItem) {
        setMediaItem(mediaItem);
        setIsCapturing(true);
        startTimer();
        onStart?.();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start capture');
      setError(error);
      onError?.(error);
    }
  }, [constraints, isInitialized, onStart, onError, startTimer, withMediaService]);

  const stopCapture = useCallback(async () => {
    if (!mediaItem?.id) return;

    try {
      // Get the final media item before stopping
      const finalItem = await withMediaService((service) => {
        service.stopCapture(mediaItem.id);
        return service.getMediaItem(mediaItem.id);
      })();
      
      if (finalItem) {
        setMediaItem({ ...finalItem });
      }
      
      setIsCapturing(false);
      stopTimer();
      
      // Call onStop with the final blob if available
      if (finalItem?.source.blob) {
        onStop?.(finalItem.source.blob);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to stop capture');
      setError(error);
      onError?.(error);
    }
  }, [mediaItem, onStop, onError, stopTimer, withMediaService]);

  const pauseCapture = useCallback(() => {
    if (!mediaItem) return;
    
    try {
      // Note: MediaRecorder's pause() is not widely supported, so we'll stop the timer only
      stopTimer();
      setIsPaused(true);
      
      if (onPause) {
        onPause();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to pause capture');
      setError(error);
      if (onError) {
        onError(error);
      }
    }
  }, [mediaItem, onPause, onError, stopTimer]);

  const resumeCapture = useCallback(async () => {
    if (!mediaItem) return;
    
    try {
      // Restart the capture
      const newItem = await startCapture();
      setIsPaused(false);
      
      if (onResume) {
        onResume();
      }
      
      return newItem;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resume capture');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [mediaItem, onResume, onError, startCapture]);

  // Auto-start capture if requested
  useEffect(() => {
    if (autoStart) {
      startCapture().catch(() => {
        // Error is already handled in startCapture
      });
    }
  }, [autoStart, startCapture]);

  useEffect(() => {
    return () => {
      if (mediaItem?.id) {
        try {
          withMediaService(service => {
            service.removeMediaItem(mediaItem.id);
          })();
        } catch (err) {
          console.warn('Failed to clean up media item:', err);
        }
      }
      clearInterval(timerRef.current);
    };
  }, [mediaItem?.id, withMediaService]);

  return {
    // State
    isCapturing,
    isPaused,
    mediaItem,
    error,
    elapsedTime,
    
    // Actions
    startCapture,
    stopCapture,
    pauseCapture,
    resumeCapture,
    
    // Derived state
    isIdle: !isCapturing && !isPaused,
    isRecording: isCapturing && !isPaused,
  };
}

export default useMediaCapture;
