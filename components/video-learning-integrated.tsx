'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, Film, BookOpen, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getYoutubeEmbedUrl, getYouTubeVideoTitle, validateYoutubeUrl } from '@/lib/youtube-utils';
import { VideoToAppGenerator } from './video-to-app-generator';

export function VideoLearningIntegrated() {
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=example');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');

  useEffect(() => {
    const isValid = validateYoutubeUrl(videoUrl);
    setIsValidUrl(isValid);
    if (isValid) {
      getYouTubeVideoTitle(videoUrl).then(setVideoTitle);
    } else {
      setVideoTitle('');
    }
  }, [videoUrl]);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Youtube className="mr-2 text-red-500" />
          Interactive Video Learning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className={cn(!isValidUrl && videoUrl ? 'border-red-500' : '')}
          />
        </div>
        {!isValidUrl && videoUrl && (
          <p className="text-red-500 text-sm mb-4">Please enter a valid YouTube URL.</p>
        )}
        
        {isValidUrl && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="aspect-w-16 aspect-h-9 mb-2">
                <iframe
                  src={getYoutubeEmbedUrl(videoUrl)}
                  title="YouTube video player"
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <h3 className="font-semibold">{videoTitle}</h3>
            </div>
            <div>
              <VideoToAppGenerator initialVideoUrl={videoUrl} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 