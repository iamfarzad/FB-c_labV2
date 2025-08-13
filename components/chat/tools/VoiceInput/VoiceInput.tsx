// components/chat/tools/VoiceInput/VoiceInput.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useWebSocketVoice } from '@/hooks/use-websocket-voice';
import { useVoiceRecorder } from '@/hooks/use-voice-recorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Volume2, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FbcVoiceOrb } from './FbcVoiceOrb';

interface VoiceInputProps {
  onClose: () => void;
  mode?: 'modal' | 'card';
  onTranscript?: (transcript: string) => void;
}

// Request microphone permissions upfront
const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    // Check if permissions API is available
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (permission.state === 'granted') {
        return true;
      }
    }

    // Try to get user media to trigger permission request
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        channelCount: 1,
        sampleRate: { ideal: 16000 },
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      } 
    });
    
    // Stop the stream immediately - we just wanted to check permissions
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied or unavailable:', error);
    return false;
  }
};

export function VoiceInput({ onClose, mode = 'modal', onTranscript }: VoiceInputProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const hasStartedRef = useRef(false);

  const {
    isConnected,
    isProcessing,
    transcript,
    error: websocketError,
    startSession,
    stopSession,
    onAudioChunk,
    onTurnComplete,
  } = useWebSocketVoice();

  const {
    isRecording,
    startRecording,
    stopRecording,
    error: recorderError,
    volume,
    hasPermission,
    requestPermission,
  } = useVoiceRecorder({
    onAudioChunk,
    onTurnComplete 
  });

  // Request permissions and initialize WebSocket connection on mount
  useEffect(() => {
    const initializeVoiceInput = async () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      console.info('[VoiceInput] Requesting microphone permission...');
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        toast({ 
          title: "Microphone Access Required", 
          description: "Please allow microphone access to use voice input. Check your browser settings and reload the page.", 
          variant: "destructive" 
        });
        return;
      }

      console.info('[VoiceInput] Initializing WebSocket connection...');
      try {
        await startSession();
        console.info('[VoiceInput] WebSocket session started');
        setIsInitialized(true);
      } catch (error) {
        console.error('[VoiceInput] Failed to start WebSocket session:', error);
        toast({ 
          title: "Connection Error", 
          description: "Failed to connect to voice server. Please try again.", 
          variant: "destructive" 
        });
      }
    };

    initializeVoiceInput();

    // Cleanup on unmount
    return () => {
      if (isRecording) {
        stopRecording();
      }
      stopSession();
    };
  }, []); // Empty dependency array - only run once on mount

  // Handle errors
  useEffect(() => {
    const anyError = websocketError || recorderError;
    if (anyError) {
      console.error('[VoiceInput] Error detected:', anyError);
      toast({
        title: "Voice Error",
        description: anyError,
        variant: "destructive" 
      });
    }
  }, [websocketError, recorderError, toast]);

  // Handle transcript updates
  useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  // Retry WebSocket connection
  const retryConnection = useCallback(async () => {
    if (connectionAttempts >= 3) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect after 3 attempts. Please check your internet connection and try again later.",
        variant: "destructive"
      });
      return;
    }

    setConnectionAttempts(prev => prev + 1);
    console.info(`[VoiceInput] Retrying WebSocket connection (attempt ${connectionAttempts + 1}/3)...`);
    
    try {
      await startSession();
      console.info('[VoiceInput] WebSocket session started on retry');
      setIsInitialized(true);
      setConnectionAttempts(0); // Reset on success
    } catch (error) {
      console.error('[VoiceInput] Retry failed:', error);
      toast({
        title: "Connection Retry Failed",
        description: `Attempt ${connectionAttempts + 1} failed. ${connectionAttempts < 2 ? 'Will retry...' : 'Please try again later.'}`,
        variant: "destructive"
      });
    }
  }, [connectionAttempts, startSession, toast]);

  const handleMicClick = useCallback(async () => {
    console.info('[VoiceInput] Mic button clicked. Recording:', isRecording, 'Connected:', isConnected, 'Permission:', hasPermission);
    
    if (hasPermission === false) {
      toast({ 
        title: "Microphone Access Denied", 
        description: "Please allow microphone access in your browser settings and reload the page.", 
        variant: "destructive" 
      });
      return;
    }

    if (isRecording) {
      console.info('[VoiceInput] Stopping recording...');
      stopRecording();
      // Always flush buffered audio on manual stop
      onTurnComplete();
      setIsExpanded(false);
    } else {
      // If not connected yet, attempt to connect now
      if (!isConnected) {
        console.info('[VoiceInput] Not connected, attempting to start session before recording');
        try {
          await startSession();
        } catch (e) {
          console.error('[VoiceInput] Failed to start session before recording:', e);
        }
      }

      try {
        // Request mic permission first if not granted
        if (!hasPermission) {
          const ok = await requestPermission();
          if (!ok) {
            toast({
              title: 'Microphone access denied',
              description: 'Please allow microphone access in your browser settings and try again.',
              variant: 'destructive'
            })
            return
          }
        }
        console.info('[VoiceInput] Starting recording...');
        const success = await startRecording();
        if (success) {
          console.info('[VoiceInput] Recording started successfully');
          setIsExpanded(true);
        } else {
          console.error('[VoiceInput] Failed to start recording');
          toast({ 
            title: "Recording Failed", 
            description: "Could not access microphone. Please check permissions.", 
            variant: "destructive" 
          });
        }
      } catch (e) {
        console.error('[VoiceInput] Error starting recording:', e);
        toast({ 
          title: "Recording Error", 
          description: e instanceof Error ? e.message : "Failed to start recording", 
          variant: "destructive" 
        });
      }
    }
  }, [isRecording, isConnected, hasPermission, startRecording, stopRecording, onTurnComplete, requestPermission, startSession, toast]);

  const getStatusText = () => {
    if (hasPermission === false) return "Microphone access denied - check browser settings";
    if (hasPermission === null) return "Requesting microphone access...";
    if (!isConnected && connectionAttempts > 0) return `Connection failed (${connectionAttempts}/3 attempts)`;
    if (!isConnected) return "Connecting to voice server...";
    if (isRecording) return "🎤 Listening... Speak now";
    if (isProcessing) return "🤖 Processing your speech...";
    if (transcript) return "✅ AI response received";
    return "Click microphone to start voice chat";
  };

  const getStatusColor = () => {
    if (hasPermission === false) return "text-red-500";
    if (hasPermission === null) return "text-yellow-500";
    if (!isConnected && connectionAttempts > 0) return "text-red-500";
    if (!isConnected) return "text-yellow-500";
    if (isRecording) return "text-green-500";
    if (isProcessing) return "text-blue-500";
    if (transcript) return "text-green-500";
    return "text-muted-foreground";
  };

  const getOrbState = () => {
    if (hasPermission === false) return 'idle';
    if (!isConnected) return 'idle';
    if (isRecording) return 'listening';
    if (isProcessing) return 'thinking';
    if (transcript) return 'talking';
    return 'idle';
  };

  // Volume indicator for debugging
  const VolumeIndicator = () => {
    if (!isRecording) return null;
    return (
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-red-500 transition-all duration-100"
          style={{ width: `${Math.min(volume * 100, 100)}%` }}
        />
      </div>
    );
  };

  if (mode === 'card') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Voice Chat</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleMicClick}
              className="relative w-20 h-20 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              <FbcVoiceOrb 
                className="w-full h-full"
                state={getOrbState()}
                isRecording={isRecording}
              />
            </button>

            <p className={cn("text-xs text-center", getStatusColor())}>{getStatusText()}</p>
            {!hasPermission && (
              <div className="text-xs text-yellow-500 text-center">
                Microphone access denied. Click the mic and allow access in the browser prompt.
              </div>
            )}

            {/* Retry button for failed connections */}
            {!isConnected && connectionAttempts > 0 && connectionAttempts < 3 && (
              <Button
                onClick={retryConnection}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Retry Connection
              </Button>
            )}

            <VolumeIndicator />

            {isExpanded && transcript && (
              <div className="w-full mt-2 p-3 bg-muted rounded-md">
                <p className="text-sm">{transcript}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Modal mode (full screen)
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Voice Chat</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <button
            onClick={handleMicClick}
            className="relative w-32 h-32 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            <FbcVoiceOrb 
              className="w-full h-full"
              state={getOrbState()}
              isRecording={isRecording}
            />
          </button>

          <p className={cn("text-sm text-center", getStatusColor())}>{getStatusText()}</p>
          {!hasPermission && (
            <div className="text-xs text-yellow-500 text-center">
              Microphone access denied. Click the mic and allow access in the browser prompt.
            </div>
          )}

          {/* Retry button for failed connections */}
          {!isConnected && connectionAttempts > 0 && connectionAttempts < 3 && (
      <Button
              onClick={retryConnection}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Retry Connection
      </Button>
          )}

          <VolumeIndicator />

          {transcript && (
            <div className="w-full p-4 border rounded-md bg-muted">
              <h3 className="font-semibold mb-2 text-sm">AI Response</h3>
              <p className="text-sm">{transcript}</p>
            </div>
          )}

          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
              <p>Recording: {isRecording ? 'Yes' : 'No'}</p>
              <p>Processing: {isProcessing ? 'Yes' : 'No'}</p>
              <p>Volume: {(volume * 100).toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
