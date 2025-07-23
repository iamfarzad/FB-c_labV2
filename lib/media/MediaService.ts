import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export type MediaType = 'audio' | 'video' | 'image' | 'document' | 'screen' | 'camera';

export interface MediaStreamConstraints {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
  screen?: boolean | DisplayMediaStreamOptions;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  source: MediaSource;
  metadata: MediaMetadata;
  status: 'idle' | 'capturing' | 'paused' | 'playing' | 'error';
  error?: string;
  timestamp: number;
}

export interface MediaSource {
  stream?: MediaStream;
  file?: File;
  url?: string;
  blob?: Blob;
}

export interface MediaMetadata {
  name?: string;
  size?: number;
  duration?: number;
  format?: string;
  width?: number;
  height?: number;
  bitrate?: number;
  [key: string]: any;
}

export interface MediaCaptureOptions {
  constraints: MediaStreamConstraints;
  autoStart?: boolean;
  maxDuration?: number;
  onDataAvailable?: (data: Blob) => void;
}

export interface MediaPlaybackOptions {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  playbackRate?: number;
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

export class MediaService extends EventEmitter {
  private static instance: MediaService;
  private mediaItems: Map<string, MediaItem> = new Map();
  private mediaElements: Map<string, HTMLMediaElement> = new Map();
  private mediaRecorders: Map<string, MediaRecorder> = new Map();
  private activeStreams: Map<string, MediaStream> = new Map();

  private constructor() {
    super();
    this.setupEventListeners();
  }

  public static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  private setupEventListeners() {
    if (isBrowser) {
      window.addEventListener('beforeunload', this.cleanup.bind(this));
    }
  }

  private generateId(): string {
    return `media-${uuidv4()}`;
  }

  public async requestPermissions(constraints: MediaStreamConstraints): Promise<boolean> {
    try {
      if (constraints.audio || constraints.video) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: constraints.audio,
          video: constraints.video
        });
        this.cleanupStream(stream);
        return true;
      }
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  public async captureMedia(options: MediaCaptureOptions): Promise<MediaItem> {
    const id = this.generateId();
    
    try {
      let stream: MediaStream;
      
      if (options.constraints.screen) {
        stream = await navigator.mediaDevices.getDisplayMedia(
          options.constraints.screen as DisplayMediaStreamOptions
        );
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: options.constraints.audio,
          video: options.constraints.video
        });
      }

      const mediaItem: MediaItem = {
        id,
        type: this.determineMediaType(options.constraints),
        source: { stream },
        metadata: {
          name: `Recording-${new Date().toISOString()}`,
          timestamp: Date.now()
        },
        status: 'capturing',
        timestamp: Date.now()
      };

      this.mediaItems.set(id, mediaItem);
      this.activeStreams.set(id, stream);

      if (options.onDataAvailable) {
        this.setupMediaRecorder(id, stream, options.onDataAvailable);
      }

      this.emit('mediaAdded', mediaItem);
      return mediaItem;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to capture media';
      this.emit('error', { id, error: errorMessage });
      throw new Error(errorMessage);
    }
  }

  private determineMediaType(constraints: MediaStreamConstraints): MediaType {
    if (constraints.screen) return 'screen';
    if (constraints.video) return 'video';
    if (constraints.audio) return 'audio';
    return 'video'; // Default to video if no specific type is determined
  }

  private setupMediaRecorder(
    id: string,
    stream: MediaStream,
    onDataAvailable: (data: Blob) => void
  ) {
    const mimeType = this.getSupportedMimeType(stream);
    const options = mimeType ? { mimeType } : undefined;
    
    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          onDataAvailable(new Blob(chunks, { type: mimeType || 'video/webm' }));
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
        const mediaItem = this.mediaItems.get(id);
        
        if (mediaItem) {
          mediaItem.source.blob = blob;
          mediaItem.source.url = URL.createObjectURL(blob);
          mediaItem.status = 'idle';
          this.emit('mediaUpdated', mediaItem);
        }
      };

      mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${event}`);
        this.emit('error', { id, error: error.message });
      };

      this.mediaRecorders.set(id, mediaRecorder);
      mediaRecorder.start();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to setup media recorder';
      this.emit('error', { id, error: errorMessage });
    }
  }

  private getSupportedMimeType(stream: MediaStream): string | undefined {
    const videoCodecs = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm;codecs=h264',
      'video/mp4;codecs=h264',
      'video/webm',
      'video/mp4'
    ];

    const audioCodecs = [
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
      'audio/wav'
    ];

    const codecs = stream.getVideoTracks().length > 0 ? videoCodecs : audioCodecs;
    
    return codecs.find(codec => {
      return MediaRecorder.isTypeSupported(codec);
    });
  }

  public stopCapture(id: string): void {
    const mediaRecorder = this.mediaRecorders.get(id);
    const stream = this.activeStreams.get(id);

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    if (stream) {
      this.cleanupStream(stream);
      this.activeStreams.delete(id);
    }

    this.mediaRecorders.delete(id);
  }

  public async playMedia(id: string, element: HTMLMediaElement, options: MediaPlaybackOptions = {}): Promise<void> {
    const mediaItem = this.mediaItems.get(id);
    if (!mediaItem) {
      throw new Error(`Media item with id ${id} not found`);
    }

    try {
      this.mediaElements.set(id, element);
      
      if (mediaItem.source.stream) {
        element.srcObject = mediaItem.source.stream;
      } else if (mediaItem.source.url) {
        element.src = mediaItem.source.url;
      } else if (mediaItem.source.blob) {
        element.src = URL.createObjectURL(mediaItem.source.blob);
      } else {
        throw new Error('No valid media source available');
      }

      if (options.autoplay) {
        await element.play();
        mediaItem.status = 'playing';
        this.emit('mediaUpdated', mediaItem);
      }

      if (options.volume !== undefined) {
        element.volume = options.volume;
      }

      if (options.playbackRate !== undefined) {
        element.playbackRate = options.playbackRate;
      }

      if (options.muted !== undefined) {
        element.muted = options.muted;
      }

      if (options.loop !== undefined) {
        element.loop = options.loop;
      }

      if (options.onEnded) {
        element.onended = options.onEnded;
      }

      element.onerror = () => {
        mediaItem.status = 'error';
        mediaItem.error = 'Playback failed';
        this.emit('error', { id, error: 'Playback failed' });
        this.emit('mediaUpdated', mediaItem);
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Playback failed';
      if (mediaItem) {
        mediaItem.status = 'error';
        mediaItem.error = errorMessage;
        this.emit('mediaUpdated', mediaItem);
      }
      this.emit('error', { id, error: errorMessage });
      throw error;
    }
  }

  public pauseMedia(id: string): void {
    const element = this.mediaElements.get(id);
    const mediaItem = this.mediaItems.get(id);
    
    if (element && mediaItem && mediaItem.status === 'playing') {
      element.pause();
      mediaItem.status = 'paused';
      this.emit('mediaUpdated', mediaItem);
    }
  }

  public resumeMedia(id: string): void {
    const element = this.mediaElements.get(id);
    const mediaItem = this.mediaItems.get(id);
    
    if (element && mediaItem && mediaItem.status === 'paused') {
      element.play()
        .then(() => {
          mediaItem.status = 'playing';
          this.emit('mediaUpdated', mediaItem);
        })
        .catch(error => {
          mediaItem.status = 'error';
          mediaItem.error = error.message;
          this.emit('error', { id, error: error.message });
          this.emit('mediaUpdated', mediaItem);
        });
    }
  }

  public stopMedia(id: string): void {
    const element = this.mediaElements.get(id);
    const mediaItem = this.mediaItems.get(id);
    
    if (element) {
      element.pause();
      element.src = '';
      element.srcObject = null;
      this.mediaElements.delete(id);
    }

    if (mediaItem) {
      mediaItem.status = 'idle';
      this.emit('mediaUpdated', mediaItem);
    }
  }

  public getMediaItem(id: string): MediaItem | undefined {
    return this.mediaItems.get(id);
  }

  public getAllMediaItems(): MediaItem[] {
    return Array.from(this.mediaItems.values());
  }

  public removeMediaItem(id: string): void {
    this.stopMedia(id);
    this.stopCapture(id);
    
    const mediaItem = this.mediaItems.get(id);
    if (mediaItem?.source.url) {
      URL.revokeObjectURL(mediaItem.source.url);
    }
    
    this.mediaItems.delete(id);
    this.emit('mediaRemoved', id);
  }

  private cleanupStream(stream: MediaStream): void {
    stream.getTracks().forEach(track => {
      track.stop();
      stream.removeTrack(track);
    });
  }

  public cleanup(): void {
    // Stop all active recordings
    this.mediaRecorders.forEach((recorder, id) => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    });

    // Stop all media playback
    this.mediaElements.forEach(element => {
      element.pause();
      element.src = '';
      element.srcObject = null;
    });

    // Clean up all streams
    this.activeStreams.forEach(stream => {
      this.cleanupStream(stream);
    });

    // Revoke object URLs
    this.mediaItems.forEach(item => {
      if (item.source.url) {
        URL.revokeObjectURL(item.source.url);
      }
    });

    // Clear all collections
    this.mediaItems.clear();
    this.mediaElements.clear();
    this.mediaRecorders.clear();
    this.activeStreams.clear();
  }
}

// Export a function that returns the singleton instance
export const getMediaService = () => {
  if (!isBrowser) {
    // Return a mock or throw an error in SSR context
    throw new Error('MediaService is only available in the browser');
  }
  return MediaService.getInstance();
};

// For backward compatibility, but prefer using getMediaService()
export const mediaService = isBrowser ? MediaService.getInstance() : null;
