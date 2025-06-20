// app/video-learning-tool/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import { ArrowLeft, Share2, Star, CheckCircle, Zap, YoutubeIcon, AlertTriangle, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import ContentContainer from '@/components/ContentContainer';
import ExampleGallery from '@/components/ExampleGallery';
import { useDataContext } from '@/context/data-context';
import type { Example } from '@/lib/types';
import { getYoutubeEmbedUrl, getVideoTitle, validateYoutubeUrl } from '@/lib/youtube';

interface LearningModule {
  id: string;
  title: string;
  type: "video_segment" | "quiz" | "reading" | "interactive_exercise";
  completed: boolean;
  content?: string;
  questions?: any[];
  startTime?: number;
  endTime?: number;
}

const VideoPlayerComponent: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
  const [iframeSrc, setIframeSrc] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (videoUrl) {
      validateYoutubeUrl(videoUrl).then(validation => {
        setIsValid(validation.isValid);
        if (validation.isValid) {
          setIframeSrc(getYoutubeEmbedUrl(videoUrl));
        } else {
          console.error("Invalid YouTube URL:", validation.error);
        }
      });
    }
  }, [videoUrl]);

  if (isValid === null) return <div className="text-center p-4 text-muted-foreground">Validating URL...</div>;
  if (!isValid) return <div className="text-center p-4 text-red-500">Invalid YouTube URL provided.</div>;

  return (
    <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg border-2 border-primary/50">
      {iframeSrc ? (
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          title="Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <p>Loading video...</p>
        </div>
      )}
    </div>
  );
};

const VideoLearningToolPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get('videoUrl') || '';
  const [videoTitle, setVideoTitle] = useState("Loading title...");
  const [learningPath, setLearningPath] = useState<LearningModule[]>([]);
  const [currentModule, setCurrentModule] = useState<LearningModule | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const dataContext = useDataContext();

  useEffect(() => {
    if (videoUrl) {
      getYouTubeVideoTitle(videoUrl).then(setVideoTitle);
      setTimeout(() => {
        setLearningPath([
          { id: '1', title: 'Introduction', type: 'video_segment', completed: false, startTime: 0, endTime: 120 },
          { id: '2', title: 'Key Concept 1', type: 'reading', completed: false, content: 'Detailed explanation of key concept 1...' },
          { id: '3', title: 'Quiz 1', type: 'quiz', completed: false, questions: [{q: 'Q1?'}, {q: 'Q2?'}] },
          { id: '4', title: 'Advanced Topic', type: 'video_segment', completed: false, startTime: 120, endTime: 240 },
        ]);
      }, 1000);
    }
  }, [videoUrl]);

  useEffect(() => {
    const completedModules = learningPath.filter(m => m.completed).length;
    setOverallProgress(learningPath.length > 0 ? (completedModules / learningPath.length) * 100 : 0);
  }, [learningPath]);

  const handleModuleCompletion = (moduleId: string, status: boolean) => {
    setLearningPath(prev => prev.map(m => m.id === moduleId ? { ...m, completed: status } : m));
  };

  if (!videoUrl) {
    return (
      <div className="container mx-auto p-4 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-foreground">No Video URL Provided</h1>
        <p className="text-muted-foreground">Please go back to the chat and provide a YouTube video URL to generate a learning app.</p>
        <Button asChild className="mt-4">
          <Link href="/chat">Go to Chat</Link>
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
        <header className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4 hover:text-primary">
            <Link href="/chat"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Chat</Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
            Interactive Learning: {videoTitle}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <YoutubeIcon className="h-4 w-4 text-red-500"/>
              <span>YouTube Video</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1 cursor-pointer hover:border-primary/80">
              <Star className="h-4 w-4 text-yellow-400"/>
              <span>Add to Favorites</span>
            </Badge>
             <Badge variant="outline" className="flex items-center space-x-1 cursor-pointer hover:border-primary/80">
              <Share2 className="h-4 w-4"/>
              <span>Share</span>
            </Badge>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <main className="md:col-span-2 space-y-6">
            <VideoPlayerComponent videoUrl={videoUrl} />
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center"><Zap className="mr-2 h-6 w-6 text-primary"/> Learning Modules</CardTitle>
                <CardDescription className="text-muted-foreground">Complete modules to master the content.</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={overallProgress} className="w-full mb-4 h-3" indicatorClassName="bg-gradient-to-r from-primary to-accent" />
                <ScrollArea className="h-[300px] pr-3">
                  <ul className="space-y-3">
                    {learningPath.map(module => (
                      <li key={module.id}
                          className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer
                                      ${module.completed ? 'bg-green-600/10 border-green-500/30 text-green-700 dark:text-green-400'
                                                         : 'bg-card hover:bg-muted/50 border-border'}`}
                          onClick={() => setCurrentModule(module)}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{module.title} ({module.type.replace('_', ' ')})</span>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleModuleCompletion(module.id, !module.completed); }}>
                            {module.completed ? <CheckCircle className="h-5 w-5 text-green-500"/> : <CheckCircle className="h-5 w-5 text-muted-foreground"/>}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </main>

          <aside className="space-y-6 md:sticky md:top-8 h-fit">
             <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/>Module Details</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[150px] text-card-foreground">
                {currentModule ? (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{currentModule.title}</h3>
                    <p className="text-sm text-muted-foreground">{currentModule.content || `Details for ${currentModule.type.replace('_', ' ')}...`}</p>
                    {currentModule.type === 'quiz' && <Button className="mt-2 w-full bg-primary/80 hover:bg-primary">Start Quiz</Button>}
                  </div>
                ) : <p className="text-muted-foreground">Select a module to see details.</p>}
              </CardContent>
            </Card>
            <ContentContainer contentBasis={videoUrl} onLoadingStateChange={(loading: boolean) => console.log("Content loading:", loading)}>
              <div className="text-sm text-muted-foreground">Additional learning resources will appear here.</div>
            </ContentContainer>
            <ExampleGallery title="Related Examples From Context" onSelectExample={() => {}} selectedExample={dataContext?.defaultExample || null} />
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function VideoLearningToolPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-lg">Loading page details...</div>}>
      <VideoLearningToolPageContent />
    </Suspense>
  );
}
