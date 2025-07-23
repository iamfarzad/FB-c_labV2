'use client';

import { useState, useRef } from 'react';
import { useMediaCapture, useMediaPlayer } from '@/hooks';

export default function MediaTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Media Service Test</h1>
        <div className="space-y-8">
          <MediaCaptureTest />
          <div className="border-t pt-8">
            <MediaPlaybackTest />
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaCaptureTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    isCapturing,
    isPaused,
    elapsedTime,
    startCapture,
    stopCapture,
    pauseCapture,
    resumeCapture,
  } = useMediaCapture({
    constraints: { audio: true, video: true },
    onStop: (blob) => {
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(blob);
      }
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Media Capture</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-h-[400px] bg-black rounded-lg"
      />
      <div className="flex items-center space-x-4">
        <button
          onClick={isCapturing ? stopCapture : () => startCapture()}
          className={`px-4 py-2 rounded-md ${
            isCapturing ? 'bg-red-500' : 'bg-blue-500'
          } text-white`}
        >
          {isCapturing ? 'Stop' : 'Start Recording'}
        </button>
        {isCapturing && (
          <button
            onClick={isPaused ? resumeCapture : pauseCapture}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        {isCapturing && (
          <span className="text-gray-700">
            {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
          </span>
        )}
      </div>
    </div>
  );
}

function MediaPlaybackTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState('');
  
  const { 
    mediaElementRef, 
    setupMediaElement, 
    isPlaying, 
    play, 
    pause, 
    currentTime, 
    duration 
  } = useMediaPlayer({
    src: videoUrl,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Media Playback</h2>
      <video
        ref={(el) => {
          if (el) {
            mediaElementRef.current = el;
            setupMediaElement(el);
          }
        }}
        className="w-full max-h-[400px] bg-black rounded-lg"
      />
      <div className="flex flex-col space-y-2">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="flex items-center space-x-4">
          <button
            onClick={isPlaying ? pause : play}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            disabled={!videoUrl}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <span className="text-sm text-gray-600">
            {currentTime.toFixed(1)} / {duration.toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
}
