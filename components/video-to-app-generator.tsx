"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Code, 
  FileText, 
  Play, 
  Edit, 
  Save, 
  X, 
  Loader2,
  AlertTriangle,
  Maximize2,
  Minimize2,
  BookOpen,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getYoutubeEmbedUrl, validateYoutubeUrl } from '@/lib/youtube';
import { 
  generateSpecFromVideo, 
  generateCodeFromSpec
} from '@/lib/video-to-app';

interface Example {
  title: string;
  url: string;
  description: string;
  category: string;
}

const EXAMPLE_VIDEOS: Example[] = [
  {
    title: "Functional Harmony in Music",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Learn about chord progressions and tonal centers",
    category: "Music Theory"
  },
  {
    title: "JavaScript Closures",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Understanding scope and closure patterns",
    category: "Programming"
  },
  {
    title: "Photosynthesis Process",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "How plants convert light into energy",
    category: "Biology"
  },
  {
    title: "Linear Algebra Basics",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Vectors, matrices, and transformations",
    category: "Mathematics"
  }
];

interface VideoToAppGeneratorProps {
  className?: string;
  onClose?: () => void;
  initialVideoUrl?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

type LoadingState = 'idle' | 'validating' | 'loading-spec' | 'loading-code' | 'ready' | 'error';

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ active, onClick, icon, children }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-3 py-2 text-sm rounded-t-md mr-1 border-b-2 transition-colors",
      active 
        ? "bg-primary text-primary-foreground border-primary" 
        : "bg-transparent border-transparent hover:bg-muted"
    )}
  >
    {icon}
    {children}
  </button>
);

const ExampleGallery: React.FC<{
  onSelectExample: (example: Example) => void;
  selectedExample: Example | null;
}> = ({ onSelectExample, selectedExample }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Lightbulb className="w-4 h-4" />
        Example Videos
      </div>
      <div className="grid gap-2">
        {EXAMPLE_VIDEOS.map((example, index) => (
          <Card 
            key={index}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedExample?.url === example.url && "ring-2 ring-primary"
            )}
            onClick={() => onSelectExample(example)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1">{example.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {example.description}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {example.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const VideoToAppGenerator = forwardRef<
  { getSpec: () => string; getCode: () => string },
  VideoToAppGeneratorProps
>(({ className, onClose, initialVideoUrl = '', isExpanded = false, onToggleExpand }, ref) => {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [spec, setSpec] = useState('');
  const [code, setCode] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'render' | 'code' | 'spec'>('render');
  const [isEditingSpec, setIsEditingSpec] = useState(false);
  const [editedSpec, setEditedSpec] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    getSpec: () => spec,
    getCode: () => code,
  }));

  useEffect(() => {
    if (code) {
      setIframeKey(prev => prev + 1);
    }
  }, [code]);

  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const handleSubmit = async () => {
    const inputValue = inputRef.current?.value.trim() || '';
    
    if (!inputValue) {
      inputRef.current?.focus();
      return;
    }

    if (loadingState !== 'idle') return;

    setLoadingState('validating');
    setVideoUrl('');
    setSpec('');
    setCode('');
    setError(null);

    try {
      const validation = await validateYoutubeUrl(inputValue);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid YouTube URL');
      }

      setVideoUrl(inputValue);
      await generateContent(inputValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process video');
      setLoadingState('error');
    }
  };

  const handleExampleSelect = (example: Example) => {
    if (inputRef.current) {
      inputRef.current.value = example.url;
    }
    setVideoUrl(example.url);
    setSelectedExample(example);
    generateContent(example.url);
  };

  const generateContent = async (url: string) => {
    try {
      setLoadingState('loading-spec');
      const generatedSpec = await generateSpecFromVideo(url);
      setSpec(generatedSpec);
      
      setLoadingState('loading-code');
      const generatedCode = await generateCodeFromSpec(generatedSpec);
      setCode(generatedCode);
      setLoadingState('ready');
    } catch (err) {
      console.error('Content generation failed:', err);
      setError(err instanceof Error ? err.message : 'Content generation failed');
      setLoadingState('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && loadingState === 'idle') {
      handleSubmit();
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
    setSaveMessage('HTML updated. Changes will appear in the Render tab.');
  };

  const handleSpecEdit = () => {
    setEditedSpec(spec);
    setIsEditingSpec(true);
  };

  const handleSpecSave = async () => {
    const trimmedEditedSpec = editedSpec.trim();

    if (trimmedEditedSpec === spec) {
      setIsEditingSpec(false);
      setEditedSpec('');
      return;
    }

    try {
      setLoadingState('loading-code');
      setError(null);
      setSpec(trimmedEditedSpec);
      setIsEditingSpec(false);
      setActiveTab('code');

      const generatedCode = await generateCodeFromSpec(trimmedEditedSpec);
      setCode(generatedCode);
      setLoadingState('ready');
    } catch (err) {
      console.error('Code generation failed:', err);
      setError(err instanceof Error ? err.message : 'Code generation failed');
      setLoadingState('error');
    }
  };

  const handleSpecCancel = () => {
    setIsEditingSpec(false);
    setEditedSpec('');
  };

  const renderLoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <p className="text-lg font-medium mb-2">
        {loadingState === 'validating' && 'Validating URL...'}
        {loadingState === 'loading-spec' && 'Generating content spec from video...'}
        {loadingState === 'loading-code' && 'Generating code from content spec...'}
      </p>
      <p className="text-sm text-muted-foreground">This may take a few moments</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Error</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
    </div>
  );

  const renderSpecContent = () => {
    if (loadingState === 'error') {
      return spec ? (
        <ScrollArea className="h-full">
          <pre className="whitespace-pre-wrap font-mono text-sm p-4 leading-relaxed">{spec}</pre>
        </ScrollArea>
      ) : renderErrorState();
    }

    if (loadingState === 'loading-spec') {
      return renderLoadingSpinner();
    }

    if (isEditingSpec) {
      return (
        <div className="h-full flex flex-col">
          <Editor
            height="100%"
            defaultLanguage="text"
            value={editedSpec}
            onChange={(value) => setEditedSpec(value || '')}
            theme="light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'off',
            }}
          />
          <div className="flex gap-2 p-4 border-t">
            <Button onClick={handleSpecSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save & regenerate code
            </Button>
            <Button variant="outline" onClick={handleSpecCancel}>Cancel</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <ScrollArea className="flex-1">
          <pre className="whitespace-pre-wrap font-mono text-sm p-4 leading-relaxed">{spec}</pre>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button onClick={handleSpecEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Spec
          </Button>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'render':
        if (loadingState === 'error') {
          return renderErrorState();
        }
        if (loadingState !== 'ready') {
          return renderLoadingSpinner();
        }
        return (
          <div className="h-full w-full relative">
            <iframe
              key={iframeKey}
              srcDoc={code}
              className="w-full h-full border-none"
              title="Generated Learning App"
              sandbox="allow-scripts"
            />
          </div>
        );

      case 'code':
        if (loadingState === 'error') {
          return renderErrorState();
        }
        if (loadingState !== 'ready') {
          return renderLoadingSpinner();
        }
        return (
          <div className="h-full relative">
            <Editor
              height="100%"
              defaultLanguage="html"
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
            {saveMessage && (
              <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded text-sm">
                {saveMessage}
              </div>
            )}
          </div>
        );

      case 'spec':
        return renderSpecContent();

      default:
        return null;
    }
  };

  return (
    <Card className={cn("w-full h-full flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" />
            <CardTitle>Video to Learning App</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {onToggleExpand && (
              <Button variant="ghost" size="icon" onClick={onToggleExpand}>
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
                  <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="https://www.youtube.com/watch?v=..."
              defaultValue={initialVideoUrl}
              disabled={loadingState !== 'idle'}
              onKeyDown={handleKeyDown}
              onChange={() => {
                setVideoUrl('');
                setSpec('');
                setCode('');
                setError(null);
                setSelectedExample(null);
              }}
              className="flex-1"
            />
            <Button 
              onClick={handleSubmit}
              disabled={loadingState !== 'idle'}
              className="flex items-center gap-2"
            >
              {loadingState === 'validating' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {loadingState === 'validating' ? 'Validating...' : 
               loadingState === 'loading-spec' ? 'Generating...' :
               loadingState === 'loading-code' ? 'Generating...' : 'Generate App'}
            </Button>
          </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full flex gap-4 p-4">
          {/* Left Side - Video and Examples */}
          <div className="w-80 flex flex-col gap-4">
            {videoUrl && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <iframe
                  src={getYoutubeEmbedUrl(videoUrl)}
                  width="100%"
                  height="100%"
                  title="Video Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            
            <ScrollArea className="flex-1">
              <ExampleGallery 
                onSelectExample={handleExampleSelect}
                selectedExample={selectedExample}
              />
            </ScrollArea>
          </div>

          {/* Right Side - Generated Content */}
          <div className="flex-1 flex flex-col">
            {videoUrl ? (
              <div className="h-full border-2 border-border rounded-lg overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex list-none m-0 px-3 bg-muted/50 border-b">
                  <TabButton
                    active={activeTab === 'render'}
                    onClick={() => {
                      if (isEditingSpec && activeTab !== 'spec') {
                        setIsEditingSpec(false);
                        setEditedSpec('');
                      }
                      setActiveTab('render');
                    }}
                    icon={<Play className="w-4 h-4" />}
                  >
                    Render
                  </TabButton>
                  <TabButton
                    active={activeTab === 'code'}
                    onClick={() => {
                      if (isEditingSpec && activeTab !== 'spec') {
                        setIsEditingSpec(false);
                        setEditedSpec('');
                      }
                      setActiveTab('code');
                    }}
                    icon={<Code className="w-4 h-4" />}
                  >
                    Code
                  </TabButton>
                  <TabButton
                    active={activeTab === 'spec'}
                    onClick={() => setActiveTab('spec')}
                    icon={<FileText className="w-4 h-4" />}
                  >
                    Spec
                  </TabButton>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden h-full">
                  {renderTabContent()}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                <div className="text-center">
                  <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {loadingState === 'validating' ? 'Validating URL...' : 'Paste a YouTube URL or select an example'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Generate interactive learning apps from video content
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}); 