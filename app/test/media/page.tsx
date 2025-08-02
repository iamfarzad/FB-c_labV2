'use client';

import { useState, useRef } from 'react';
import { useMediaCapture, useMediaPlayer } from '@/hooks';
import { PageShell, PageHeader } from '@/components/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function MediaTestPage() {
  return (
    <PageShell>
      <PageHeader
        title="Media Service Test"
        subtitle="Test media capture and playback functionality"
      />
      
      <div className="space-y-8">
        <MediaCaptureTest />
        <Separator />
        <MediaPlaybackTest />
      </div>
    </PageShell>
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
    <Card>
      <CardHeader>
        <CardTitle>Media Capture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-h-96 bg-muted rounded-lg"
        />
        <div className="flex items-center gap-4">
          <Button
            onClick={isCapturing ? stopCapture : () => startCapture()}
            variant={isCapturing ? "destructive" : "default"}
          >
            {isCapturing ? 'Stop' : 'Start Recording'}
          </Button>
          {isCapturing && (
            <Button
              onClick={isPaused ? resumeCapture : pauseCapture}
              variant="secondary"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
          {isCapturing && (
            <span className="text-muted-foreground font-mono">
              {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Media Playback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <video
          ref={(el) => {
            if (el) {
              mediaElementRef.current = el;
              setupMediaElement(el);
            }
          }}
          className="w-full max-h-96 bg-muted rounded-lg"
        />
        <div className="space-y-4">
          <Input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
          />
          <div className="flex items-center gap-4">
            <Button
              onClick={isPlaying ? pause : play}
              disabled={!videoUrl}
              variant={isPlaying ? "secondary" : "default"}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <span className="text-sm text-muted-foreground font-mono">
              {currentTime.toFixed(1)} / {duration.toFixed(1)}s
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
