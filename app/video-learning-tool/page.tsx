// app/video-learning-tool/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDataContext } from '@/context/data-context';
import type { Example } from '@/lib/types';
import { getYoutubeEmbedUrl, getYouTubeVideoTitle, validateYoutubeUrl } from '@/lib/youtube-utils';

interface LearningModule {
  title: string;
  url: string;
}

export default function VideoLearningTool() {
  const { examples } = useDataContext();
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [iframeSrc, setIframeSrc] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (examples?.length) {
      const videoExamples = examples
        .filter((e: Example) => e.url.includes('youtube.com'))
        .map((e: Example) => ({ title: e.title, url: e.url }));
      setLearningModules(videoExamples);
      if (videoExamples.length > 0) {
        setVideoUrl(videoExamples[0].url);
      }
    }
  }, [examples]);

  useEffect(() => {
    if (videoUrl) {
      const isValidUrl = validateYoutubeUrl(videoUrl);
      setIsValid(isValidUrl);
      if (isValidUrl) {
        setIframeSrc(getYoutubeEmbedUrl(videoUrl));
        setIsLoading(true);
        getYouTubeVideoTitle(videoUrl)
          .then(setVideoTitle)
          .finally(() => setIsLoading(false));
      } else {
        setIframeSrc('');
        setVideoTitle('');
      }
    }
  }, [videoUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
  };

  const handleModuleClick = (url: string) => {
    setVideoUrl(url);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Video Learning Tool</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="aspect-w-16 aspect-h-9 mb-4">
            {isValid && iframeSrc ? (
              <iframe
                src={iframeSrc}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg shadow-lg"
              ></iframe>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                <p className="text-gray-500">Enter a valid YouTube URL to begin</p>
              </div>
            )}
          </div>
          {isLoading ? (
            <div className="animate-pulse h-8 w-3/4 bg-gray-300 rounded"></div>
          ) : (
            <h2 className="text-2xl font-semibold">{videoTitle}</h2>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Learning Modules</h3>
          <div className="space-y-2">
            {learningModules.map((module) => (
              <Button
                key={module.url}
                variant={videoUrl === module.url ? 'default' : 'outline'}
                onClick={() => handleModuleClick(module.url)}
                className="w-full justify-start"
              >
                {module.title}
              </Button>
            ))}
          </div>
          <div className="mt-4">
            <Input
              type="text"
              value={videoUrl}
              onChange={handleUrlChange}
              placeholder="Enter YouTube URL"
              className={!isValid && videoUrl ? 'border-red-500' : ''}
            />
            {!isValid && videoUrl && <p className="text-red-500 text-sm mt-1">Invalid YouTube URL</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
