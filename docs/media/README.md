# Unified Media Service Architecture

This document provides an overview of the unified media service architecture implemented in the application.

## Core Components

### 1. MediaService

The `MediaService` is a singleton class that serves as the central hub for all media operations. It manages:

- Media capture (camera, microphone, screen sharing)
- Media playback
- Media recording
- Stream management
- Resource cleanup

### 2. React Hooks

#### useMediaCapture

A hook for capturing media from the user's device.

\`\`\`typescript
const {
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
  isIdle,
  isRecording,
} = useMediaCapture({
  constraints: {
    audio: true,
    video: true,
    // or screen: true for screen sharing
  },
  autoStart: false,
  maxDuration: 60, // seconds
  onStart: () => {},
  onStop: (blob) => {},
  onPause: () => {},
  onResume: () => {},
  onError: (error) => {},
});
\`\`\`

#### useMediaPlayer

A hook for playing media with full control over playback.

\`\`\`typescript
const {
  // Refs
  mediaElementRef,
  
  // State
  isPlaying,
  isMuted,
  volume,
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
} = useMediaPlayer({
  src: 'https://example.com/video.mp4',
  autoPlay: true,
  loop: false,
  muted: false,
  volume: 1.0,
  playbackRate: 1.0,
  onPlay: () => {},
  onPause: () => {},
  onEnded: () => {},
  onError: (error) => {},
  onTimeUpdate: (currentTime, duration) => {},
  onVolumeChange: (volume) => {},
  onDurationChange: (duration) => {},
});

// In your component:
<video 
  ref={setupMediaElement}
  style={{ width: '100%' }}
/>
\`\`\`

#### useMediaUploader

A hook for handling file uploads with progress tracking.

\`\`\`typescript
const {
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
} = useMediaUploader();

// Usage
const handleUpload = async (file) => {
  try {
    const result = await uploadFile(file, {
      endpoint: '/api/upload',
      headers: {
        'Authorization': 'Bearer token',
      },
      fieldName: 'file',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/*', 'video/*'],
      onProgress: (progress, uploaded, total) => {
        console.log(`Upload progress: ${progress}%`);
      },
      onComplete: (response) => {
        console.log('Upload complete:', response);
      },
      onError: (error) => {
        console.error('Upload error:', error);
      },
    });
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
\`\`\`

## Best Practices

### 1. Resource Management

Always clean up media resources when they're no longer needed to prevent memory leaks:

\`\`\`typescript
useEffect(() => {
  // Start media capture
  const item = await startCapture();
  
  // Cleanup function
  return () => {
    if (item) {
      mediaService.removeMediaItem(item.id);
    }
  };
}, []);
\`\`\`

### 2. Error Handling

Always handle errors appropriately:

\`\`\`typescript
const handleError = useCallback((error) => {
  console.error('Media error:', error);
  // Show user-friendly error message
  setError(error.message);
}, []);
\`\`\`

### 3. Performance

- Use appropriate media formats and codecs
- Implement lazy loading for media content
- Use placeholders while media is loading
- Consider using Web Workers for heavy processing

## Examples

### Recording Audio

\`\`\`typescript
const { startCapture, stopCapture, mediaItem } = useMediaCapture({
  constraints: { audio: true },
  onStop: (blob) => {
    // Handle the recorded audio blob
  },
});
\`\`\`

### Playing a Video

\`\`\`typescript
const { setupMediaElement, play, pause } = useMediaPlayer({
  src: 'https://example.com/video.mp4',
  autoPlay: true,
});

return (
  <div>
    <video 
      ref={setupMediaElement}
      style={{ width: '100%' }}
    />
    <button onClick={play}>Play</button>
    <button onClick={pause}>Pause</button>
  </div>
);
\`\`\`

### Uploading a File

\`\`\`typescript
const { uploadFile, progress, isUploading } = useMediaUploader();

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    await uploadFile(file, {
      endpoint: '/api/upload',
      onProgress: (p) => console.log(`Upload: ${p}%`),
    });
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

return (
  <div>
    <input type="file" onChange={handleFileChange} />
    {isUploading && (
      <div>
        <progress value={progress} max="100" />
        <span>{progress}%</span>
      </div>
    )}
  </div>
);
\`\`\`

## Error Handling

The media service provides comprehensive error handling through:

1. Error states in hooks
2. Error events on the MediaService
3. Promise rejections for async operations

Always implement proper error handling to provide a good user experience.

## Browser Support

The media service is designed to work in all modern browsers that support:

- MediaDevices API
- MediaRecorder API
- Web Audio API
- Fetch API

For older browsers, consider providing fallbacks or polyfills.
