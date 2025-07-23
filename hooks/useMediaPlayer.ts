import { useState, useRef, useEffect, useCallback } from 'react';
import { getMediaService, MediaItem, MediaPlaybackOptions } from '@/lib/media/MediaService';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

interface UseMediaPlayerProps extends Omit<MediaPlaybackOptions, 'onEnded' | 'onError'> {
  src?: string | MediaStream | File | null;
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onVolumeChange?: (volume: number) => void;
  onDurationChange?: (duration: number) => void;
}

export function useMediaPlayer({
  src,
  autoPlay = false,
  loop = false,
  muted = false,
  volume = 1.0,
  playbackRate = 1.0,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
  onVolumeChange,
  onDurationChange,
}: UseMediaPlayerProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const mediaElementRef = useRef<HTMLMediaElement | null>(null);
  const mediaItemRef = useRef<MediaItem | null>(null);
  const mediaService = useRef<ReturnType<typeof getMediaService> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  // Initialize media service on mount
  useEffect(() => {
    try {
      if (isBrowser) {
        mediaService.current = getMediaService();
        setIsInitialized(true);
      } else {
        throw new Error('MediaPlayer is only available in the browser');
      }
    } catch (error) {
      console.warn('Failed to initialize MediaService:', error);
      setInitError(error instanceof Error ? error : new Error('Failed to initialize MediaService'));
    }

    return () => {
      // Cleanup
      if (mediaService.current && mediaItemRef.current) {
        mediaService.current.stopMedia(mediaItemRef.current.id);
        mediaService.current = null;
      }
    };
  }, []);

  // Helper to safely access media service methods
  const withMediaService = <T extends (...args: any[]) => any>(
    fn: (service: NonNullable<typeof mediaService.current>, ...args: any[]) => any
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

  // Handle media element events
  const setupMediaElement = useCallback((element: HTMLMediaElement) => {
    if (!isBrowser || !element) return undefined;
    if (!element) return;
    
    mediaElementRef.current = element;
    
    const handlePlay = () => {
      setIsPlaying(true);
      if (onPlay) onPlay();
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      if (onPause) onPause();
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    
    const handleError = () => {
      const error = new Error(
        element.error ? 
        `Media error (${element.error.code}): ${element.error.message}` : 
        'Unknown media error'
      );
      setError(error);
      if (onError) onError(error);
    };
    
    const handleTimeUpdate = () => {
      if (element) {
        setCurrentTime(element.currentTime);
        if (onTimeUpdate) {
          onTimeUpdate(element.currentTime, element.duration || 0);
        }
      }
    };
    
    const handleVolumeChange = () => {
      if (element) {
        setCurrentVolume(element.volume);
        setIsMuted(element.muted);
        if (onVolumeChange) {
          onVolumeChange(element.volume);
        }
      }
    };
    
    const handleDurationChange = () => {
      if (element) {
        setDuration(element.duration || 0);
        if (onDurationChange) {
          onDurationChange(element.duration || 0);
        }
      }
    };
    
    // Add event listeners
    element.addEventListener('play', handlePlay);
    element.addEventListener('pause', handlePause);
    element.addEventListener('ended', handleEnded);
    element.addEventListener('error', handleError);
    element.addEventListener('timeupdate', handleTimeUpdate);
    element.addEventListener('volumechange', handleVolumeChange);
    element.addEventListener('durationchange', handleDurationChange);
    
    // Initial setup
    element.volume = volume;
    element.muted = muted;
    element.playbackRate = playbackRate;
    element.loop = loop;
    
    // Cleanup function
    return () => {
      element.removeEventListener('play', handlePlay);
      element.removeEventListener('pause', handlePause);
      element.removeEventListener('ended', handleEnded);
      element.removeEventListener('error', handleError);
      element.removeEventListener('timeupdate', handleTimeUpdate);
      element.removeEventListener('volumechange', handleVolumeChange);
      element.removeEventListener('durationchange', handleDurationChange);
      
      // Clean up media service
      if (mediaItemRef.current) {
        mediaService.stopMedia(mediaItemRef.current.id);
        mediaItemRef.current = null;
      }
    };
  }, [
    loop, 
    muted, 
    volume, 
    playbackRate, 
    onPlay, 
    onPause, 
    onEnded, 
    onError, 
    onTimeUpdate, 
    onVolumeChange, 
    onDurationChange,
    mediaService
  ]);

  // Handle source changes
  useEffect(() => {
    if (!isBrowser || !mediaElementRef.current || !src || !isInitialized) {
      if (!isInitialized && !initError) {
        setError(new Error('Media player is initializing...'));
      } else if (initError) {
        setError(initError);
      }
      return;
    }
    
    const playMedia = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Clean up previous media item if exists
        if (mediaItemRef.current) {
          await withMediaService((service) => {
            service.removeMediaItem(mediaItemRef.current!.id);
          })();
          mediaItemRef.current = null;
        }
        
        // Create a new media item based on the source type
        let mediaItem: MediaItem;
        
        if (typeof src === 'string') {
          // URL string
          mediaItem = {
            id: `media-${Date.now()}`,
            type: 'video', // Will be updated by MediaService
            source: { url: src },
            metadata: {},
            status: 'idle',
            timestamp: Date.now()
          };
        } else if (src instanceof MediaStream) {
          // MediaStream
          mediaItem = {
            id: `media-${Date.now()}`,
            type: 'video',
            source: { stream: src },
            metadata: {},
            status: 'idle',
            timestamp: Date.now()
          };
        } else if (src instanceof File) {
          // File object
          mediaItem = {
            id: `media-${Date.now()}`,
            type: src.type.startsWith('video/') ? 'video' : 'audio',
            source: { 
              file: src,
              url: URL.createObjectURL(src)
            },
            metadata: {
              name: src.name,
              size: src.size,
              type: src.type
            },
            status: 'idle',
            timestamp: Date.now()
          };
        } else {
          throw new Error('Unsupported media source type');
        }
        
        // Play the media using the safe wrapper
        await withMediaService((service) => 
          service.playMedia(
            mediaItem.id,
            mediaElementRef.current!,
            {
            autoplay: autoPlay,
            loop,
            muted,
            volume,
            playbackRate,
            onEnded: () => {
              setIsPlaying(false);
              if (onEnded) onEnded();
            },
            onError: (error) => {
              setError(error);
              if (onError) onError(error);
            }
          }
          )
        )();
        
        mediaItemRef.current = mediaItem;
        
        if (autoPlay) {
          setIsPlaying(true);
        }
        
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to play media');
        setError(error);
        if (onError) onError(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    playMedia();
    
    return () => {
      if (mediaItemRef.current && mediaService.current) {
        withMediaService((service) => {
          service.stopMedia(mediaItemRef.current!.id);
        })();
        mediaItemRef.current = null;
      }
    };
  }, [src, autoPlay, loop, muted, volume, playbackRate, onEnded, onError, mediaService]);

  // Control methods
  const play = useCallback(async () => {
    if (!mediaElementRef.current) return;
    
    try {
      await mediaElementRef.current.play();
      setIsPlaying(true);
      if (onPlay) onPlay();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to play');
      setError(error);
      if (onError) onError(error);
      throw error;
    }
  }, [onPlay, onError]);

  const pause = useCallback(() => {
    if (!mediaElementRef.current) return;
    mediaElementRef.current.pause();
    // The pause event will be handled by the event listener
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play().catch(() => {
        // Error is already handled in play()
      });
    }
  }, [isPlaying, play, pause]);

  const setVolume = useCallback((newVolume: number) => {
    if (!mediaElementRef.current) return;
    const volume = Math.max(0, Math.min(1, newVolume));
    mediaElementRef.current.volume = volume;
    // The volumechange event will update the state
  }, []);

  const mute = useCallback(() => {
    if (!mediaElementRef.current) return;
    mediaElementRef.current.muted = true;
    // The volumechange event will update the state
  }, []);

  const unmute = useCallback(() => {
    if (!mediaElementRef.current) return;
    mediaElementRef.current.muted = false;
    // The volumechange event will update the state
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      unmute();
    } else {
      mute();
    }
  }, [isMuted, mute, unmute]);

  const seek = useCallback((time: number) => {
    if (!mediaElementRef.current) return;
    mediaElementRef.current.currentTime = time;
    // The timeupdate event will update the state
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (!mediaElementRef.current) return;
    mediaElementRef.current.playbackRate = rate;
  }, []);

  // Handle prop changes
  useEffect(() => {
    if (!mediaElementRef.current) return;
    
    if (mediaElementRef.current.loop !== loop) {
      mediaElementRef.current.loop = loop;
    }
    
    if (mediaElementRef.current.muted !== muted) {
      mediaElementRef.current.muted = muted;
    }
    
    if (mediaElementRef.current.volume !== volume) {
      mediaElementRef.current.volume = volume;
    }
    
    if (mediaElementRef.current.playbackRate !== playbackRate) {
      mediaElementRef.current.playbackRate = playbackRate;
    }
  }, [loop, muted, volume, playbackRate]);

  return {
    // Refs
    mediaElementRef,
    
    // State
    isPlaying,
    isMuted,
    volume: currentVolume,
    currentTime,
    duration,
    isLoading,
    error,
    
    // Controls
    play,
    pause,
    togglePlay,
    setVolume,
    mute,
    unmute,
    toggleMute,
    seek,
    setPlaybackRate,
    
    // Setup
    setupMediaElement,
  };
}

export default useMediaPlayer;
