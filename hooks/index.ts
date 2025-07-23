// Media Hooks
export { default as useMediaCapture } from './useMediaCapture';
export { default as useMediaPlayer } from './useMediaPlayer';
export { default as useMediaUploader } from './useMediaUploader';

// Re-export types from MediaService for convenience
export type {
  MediaType,
  MediaStreamConstraints,
  MediaItem,
  MediaSource,
  MediaMetadata,
  MediaCaptureOptions,
  MediaPlaybackOptions,
} from '@/lib/media/MediaService';

// Re-export uploader types
export type {
  UploadOptions,
  UploadResult,
} from './useMediaUploader';
