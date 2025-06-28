'use client';

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Youtube, Loader2, CheckCircle, AlertCircle, Play, Edit, FileCode, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatContext } from '../../../app/chat/context/ChatProvider';

interface VideoToAppProps {
  onAnalysisComplete?: (data: any) => void;
  className?: string;
  videoUrl?: string;
}

type LoadingState = 'idle' | 'validating' | 'loading-spec' | 'loading-code' | 'ready' | 'error';

export const VideoToApp = forwardRef<{ getSpec: () => string; getCode: () => string }, VideoToAppProps>(
  ({ onAnalysisComplete, className, videoUrl: initialUrl }, ref) => {
    const { addActivity } = useChatContext();
    const [videoUrl, setVideoUrl] = useState(initialUrl || '');
    const [inputValue, setInputValue] = useState(initialUrl || '');
    const [loadingState, setLoadingState] = useState<LoadingState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [spec, setSpec] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [isEditingSpec, setIsEditingSpec] = useState(false);
    const [editedSpec, setEditedSpec] = useState('');
    const [activeTab, setActiveTab] = useState('render');
    const [iframeKey, setIframeKey] = useState(0);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      getSpec: () => spec,
      getCode: () => code,
    }));

    // Extract video ID from YouTube URL
    const extractVideoId = (url: string): string | null => {
      try {
        const parsedUrl = new URL(url);
        
        // Handle standard watch URLs
        if (parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') {
          const videoId = parsedUrl.searchParams.get('v');
          if (videoId && videoId.length === 11) {
            return videoId;
          }
        }
        
        // Handle short URLs
        if (parsedUrl.hostname === 'youtu.be') {
          const videoId = parsedUrl.pathname.substring(1);
          if (videoId && videoId.length === 11) {
            return videoId;
          }
        }
        
        // Handle embed URLs
        if (parsedUrl.pathname.startsWith('/embed/')) {
          const videoId = parsedUrl.pathname.substring(7);
          if (videoId && videoId.length === 11) {
            return videoId;
          }
        }
      } catch (e) {
        console.warn('URL parsing failed:', e);
      }
      
      // Fallback regex
      const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regex);
      if (match && match[2].length === 11) {
        return match[2];
      }
      
      return null;
    };

    // Get YouTube embed URL
    const getEmbedUrl = (url: string): string => {
      const videoId = extractVideoId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    };

    // Validate YouTube URL
    const validateUrl = async (url: string): Promise<{ isValid: boolean; error?: string }> => {
      if (extractVideoId(url)) {
        return { isValid: true };
      }
      return { isValid: false, error: 'Invalid YouTube URL' };
    };

    // Generate spec from video
    const generateSpecFromVideo = async (url: string): Promise<string> => {
      const response = await fetch('/api/gemini?action=generateSpec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url })
      });

      if (!response.ok) {
        throw new Error('Failed to generate spec from video');
      }

      const data = await response.json();
      return data.spec;
    };

    // Generate code from spec
    const generateCodeFromSpec = async (spec: string): Promise<string> => {
      const response = await fetch('/api/gemini?action=generateCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec })
      });

      if (!response.ok) {
        throw new Error('Failed to generate code from spec');
      }

      const data = await response.json();
      return data.code;
    };

    // Handle submit
    const handleSubmit = async () => {
      const url = inputValue.trim();
      if (!url) return;

      setLoadingState('validating');
      setError(null);
      
      // Validate URL
      const validation = await validateUrl(url);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid YouTube URL');
        setLoadingState('error');
        return;
      }

      setVideoUrl(url);
      await generateContent(url);
    };

    // Generate content
    const generateContent = async (url: string) => {
      try {
        // Add activity
        addActivity({
          type: 'video_processing',
          title: 'Analyzing YouTube Video',
          description: 'Generating interactive learning app',
          status: 'in_progress',
          progress: 0
        });

        // Generate spec
        setLoadingState('loading-spec');
        const generatedSpec = await generateSpecFromVideo(url);
        setSpec(generatedSpec);

        // Generate code
        setLoadingState('loading-code');
        const generatedCode = await generateCodeFromSpec(generatedSpec);
        setCode(generatedCode);
        
        setLoadingState('ready');
        setIframeKey(prev => prev + 1);

        // Update activity
        addActivity({
          type: 'video_complete',
          title: 'Learning App Generated',
          description: 'Interactive app created successfully',
          status: 'completed'
        });

        // Call completion handler
        if (onAnalysisComplete) {
          onAnalysisComplete({
            url,
            spec: generatedSpec,
            code: generatedCode
          });
        }

      } catch (err: any) {
        console.error('Error generating content:', err);
        setError(err.message || 'Failed to generate content');
        setLoadingState('error');
        
        // Update activity with error
        addActivity({
          type: 'error',
          title: 'Generation Failed',
          description: err.message || 'Failed to generate learning app',
          status: 'failed'
        });
      }
    };

    // Handle spec edit
    const handleSpecEdit = () => {
      setEditedSpec(spec);
      setIsEditingSpec(true);
    };

    // Handle spec save
    const handleSpecSave = async () => {
      const trimmedSpec = editedSpec.trim();
      if (trimmedSpec === spec) {
        setIsEditingSpec(false);
        return;
      }

      try {
        setLoadingState('loading-code');
        setError(null);
        setSpec(trimmedSpec);
        setIsEditingSpec(false);
        setActiveTab('code');

        // Regenerate code
        const generatedCode = await generateCodeFromSpec(trimmedSpec);
        setCode(generatedCode);
        setLoadingState('ready');
        setIframeKey(prev => prev + 1);

      } catch (err: any) {
        console.error('Error regenerating code:', err);
        setError(err.message || 'Failed to regenerate code');
        setLoadingState('error');
      }
    };

    // Handle code change
    const handleCodeChange = (newCode: string) => {
      setCode(newCode);
      setIframeKey(prev => prev + 1);
    };

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && loadingState === 'idle') {
        handleSubmit();
      }
    };

    return (
      <div className={cn('space-y-4', className)}>
        {/* Input Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold">Video to Learning App</h3>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube URL here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loadingState !== 'idle' && loadingState !== 'error'}
              className="flex-1"
            />
            <Button
              onClick={handleSubmit}
              disabled={!inputValue || (loadingState !== 'idle' && loadingState !== 'error')}
              className="gap-2"
            >
              {loadingState === 'validating' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : loadingState === 'loading-spec' || loadingState === 'loading-code' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Generate app
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        {/* Video Preview */}
        {videoUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Content Area */}
        {(loadingState !== 'idle' || spec || code) && (
          <div className="border-2 border-border rounded-lg overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[600px] flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="render" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Render
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <FileCode className="h-4 w-4" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="spec" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Spec
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                {/* Render Tab */}
                <TabsContent value="render" className="h-full m-0">
                  {loadingState === 'loading-spec' || loadingState === 'loading-code' ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin mb-4" />
                      <p className="text-muted-foreground">
                        {loadingState === 'loading-spec'
                          ? 'Analyzing video content...'
                          : 'Generating interactive app...'}
                      </p>
                    </div>
                  ) : loadingState === 'ready' && code ? (
                    <iframe
                      key={iframeKey}
                      srcDoc={code}
                      className="w-full h-full border-none"
                      title="Generated App"
                      sandbox="allow-scripts"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      {error ? 'Error occurred' : 'Generate an app to see the preview'}
                    </div>
                  )}
                </TabsContent>

                {/* Code Tab */}
                <TabsContent value="code" className="h-full m-0 p-4 overflow-auto">
                  {code ? (
                    <pre className="text-sm">
                      <code>{code}</code>
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No code generated yet
                    </div>
                  )}
                </TabsContent>

                {/* Spec Tab */}
                <TabsContent value="spec" className="h-full m-0 p-4 overflow-auto">
                  {spec ? (
                    isEditingSpec ? (
                      <div className="h-full flex flex-col gap-4">
                        <textarea
                          value={editedSpec}
                          onChange={(e) => setEditedSpec(e.target.value)}
                          className="flex-1 w-full p-4 font-mono text-sm border rounded-md resize-none"
                          placeholder="Edit spec..."
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleSpecSave} className="gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Save & Regenerate
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditingSpec(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col gap-4">
                        <pre className="flex-1 text-sm whitespace-pre-wrap">{spec}</pre>
                        <Button onClick={handleSpecEdit} className="gap-2 w-fit">
                          <Edit className="h-4 w-4" />
                          Edit Spec
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No spec generated yet
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    );
  }
);

VideoToApp.displayName = 'VideoToApp';

export default VideoToApp; 