import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Video, 
  CheckCircle, 
  Zap, 
  YoutubeIcon, 
  Info, 
  FileText, 
  ListChecks, 
  X, 
  Maximize2,
  Minimize2,
  Star,
  Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getYoutubeEmbedUrl, getYouTubeVideoTitle, validateYoutubeUrl } from '@/lib/youtube';
import { VideoToAppGenerator } from './video-to-app-generator';

interface LearningModule {
  id: string;
  title: string;
  type: "video_segment" | "quiz" | "reading" | "interactive_exercise";
  completed: boolean;
  content?: string;
  questions?: any[];
  startTime?: number;
  endTime?: number;
  keyPoints?: string[];
}

interface VideoLearningIntegratedProps {
  videoUrl: string;
  videoTitle: string;
  learningModules: LearningModule[];
  onModuleUpdate: (modules: LearningModule[]) => void;
  onModuleSelect: (module: LearningModule) => void;
  onClose: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const VideoPlayerComponent: React.FC<{ videoUrl: string; isExpanded?: boolean }> = ({ videoUrl, isExpanded }) => {
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
    <div className={cn(
      "bg-muted rounded-lg overflow-hidden shadow-lg border-2 border-primary/50 transition-all duration-300",
      isExpanded ? "aspect-video" : "aspect-video"
    )}>
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

export const VideoLearningIntegrated: React.FC<VideoLearningIntegratedProps> = ({
  videoUrl,
  videoTitle,
  learningModules,
  onModuleUpdate,
  onModuleSelect,
  onClose,
  isExpanded = false,
  onToggleExpand
}) => {
  const [currentModule, setCurrentModule] = useState<LearningModule | null>(learningModules[0] || null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [showVideoToApp, setShowVideoToApp] = useState(false);

  useEffect(() => {
    const completedModules = learningModules.filter(m => m.completed).length;
    setOverallProgress(learningModules.length > 0 ? (completedModules / learningModules.length) * 100 : 0);
  }, [learningModules]);

  const handleModuleCompletion = (moduleId: string, status: boolean) => {
    const updatedModules = learningModules.map(m =>
      m.id === moduleId ? { ...m, completed: status } : m
    );
    onModuleUpdate(updatedModules);
  };

  const handleModuleClick = (module: LearningModule) => {
    setCurrentModule(module);
    onModuleSelect(module);
  };

  if (isExpanded) {
    return (
      <Card className="w-full border-2 border-primary/20 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-6 h-6 text-primary" />
              <CardTitle className="text-xl">Interactive Learning Experience</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {onToggleExpand && (
                <Button variant="ghost" size="icon" onClick={onToggleExpand}>
                  <Minimize2 className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription>{videoTitle}</CardDescription>
          
          <div className="flex items-center space-x-2 text-sm">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <YoutubeIcon className="h-3 w-3 text-red-500"/>
              <span>YouTube Video</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1 cursor-pointer hover:border-primary/80">
              <Star className="h-3 w-3 text-yellow-400"/>
              <span>Favorite</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1 cursor-pointer hover:border-primary/80">
              <Share2 className="h-3 w-3"/>
              <span>Share</span>
            </Badge>
            <Button 
              variant={showVideoToApp ? "default" : "outline"} 
              size="sm" 
              onClick={() => setShowVideoToApp(!showVideoToApp)}
              className="text-xs"
            >
              {showVideoToApp ? "Learning Modules" : "Video to App"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {showVideoToApp ? (
            <VideoToAppGenerator 
              initialVideoUrl={videoUrl}
              isExpanded={true}
              onClose={() => setShowVideoToApp(false)}
            />
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Video Player */}
              <div className="lg:col-span-2 space-y-4">
                <VideoPlayerComponent videoUrl={videoUrl} isExpanded={isExpanded} />
                
                {/* Learning Modules */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Zap className="mr-2 h-5 w-5 text-primary"/> Learning Modules
                    </CardTitle>
                    <CardDescription>Complete modules to master the content.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={overallProgress} className="w-full mb-4 h-2" />
                    <p className="text-xs text-muted-foreground mb-3">
                      {Math.round(overallProgress)}% Complete ({learningModules.filter(m => m.completed).length}/{learningModules.length} modules)
                    </p>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {learningModules.map(module => (
                          <div
                            key={module.id}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                              module.completed 
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                                : "bg-card hover:bg-muted/50 border-border",
                              currentModule?.id === module.id && "ring-2 ring-primary"
                            )}
                            onClick={() => handleModuleClick(module)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {module.type === 'video_segment' && <Video className="w-4 h-4 text-blue-500" />}
                                {module.type === 'quiz' && <ListChecks className="w-4 h-4 text-purple-500" />}
                                {module.type === 'reading' && <FileText className="w-4 h-4 text-green-500" />}
                                <span className="text-sm font-medium">{module.title}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleModuleCompletion(module.id, !module.completed);
                                }}
                              >
                                <CheckCircle className={cn(
                                  "w-4 h-4",
                                  module.completed ? "text-green-500" : "text-gray-400"
                                )} />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                              {module.type.replace('_', ' ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Module Details Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Info className="mr-2 h-5 w-5 text-primary"/>Module Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentModule ? (
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-base mb-2">{currentModule.title}</h3>
                          <Badge variant="outline" className="text-xs capitalize">
                            {currentModule.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {currentModule.startTime !== undefined && (
                          <div className="text-sm text-muted-foreground">
                            ⏰ Video timestamp: {Math.floor(currentModule.startTime / 60)}:{String(currentModule.startTime % 60).padStart(2, '0')}
                          </div>
                        )}
                        
                        <div className="text-sm">
                          {currentModule.content || `Interactive ${currentModule.type.replace('_', ' ')} content will be displayed here.`}
                        </div>
                        
                        {currentModule.keyPoints && currentModule.keyPoints.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">🔑 Key Points:</h4>
                            <ul className="text-xs space-y-1">
                              {currentModule.keyPoints.map((point, idx) => (
                                <li key={idx} className="text-muted-foreground">• {point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {currentModule.type === 'quiz' && (
                          <Button className="w-full mt-3" size="sm">
                            Start Quiz
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Select a module to see details.</p>
                    )}
                  </CardContent>
                </Card>

                {overallProgress === 100 && (
                  <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                          Learning Complete! 🎉
                        </span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        You've completed all modules for this video.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Compact view for chat integration
  return (
    <Card className="w-full border border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Learning Modules</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {onToggleExpand && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleExpand}>
                <Maximize2 className="w-3 h-3" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs">{videoTitle}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(overallProgress)}% Complete
          </p>
        </div>

        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {learningModules.map((module) => (
              <div
                key={module.id}
                className={cn(
                  "p-2 rounded-lg border cursor-pointer transition-all",
                  module.completed 
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                    : "bg-card hover:bg-muted/50 border-border"
                )}
                onClick={() => handleModuleClick(module)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {module.type === 'video_segment' && <Video className="w-3 h-3 text-blue-500" />}
                    {module.type === 'quiz' && <ListChecks className="w-3 h-3 text-purple-500" />}
                    {module.type === 'reading' && <FileText className="w-3 h-3 text-green-500" />}
                    <span className="text-xs font-medium">{module.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModuleCompletion(module.id, !module.completed);
                    }}
                  >
                    <CheckCircle className={cn(
                      "w-3 h-3",
                      module.completed ? "text-green-500" : "text-gray-400"
                    )} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}; 