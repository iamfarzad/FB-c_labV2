// components/chat/tools/VoiceInput/VoiceInput.tsx
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useWebSocketVoice } from '@/hooks/use-websocket-voice';
import { useVoiceRecorder } from '@/hooks/use-voice-recorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onClose: () => void;
  mode?: 'modal' | 'card';
  onTranscript?: (transcript: string) => void;
}

export function VoiceInput({ onClose, mode = 'modal', onTranscript }: VoiceInputProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    isConnected, isProcessing, transcript, error: websocketError,
    startSession, stopSession, onAudioChunk, onTurnComplete,
  } = useWebSocketVoice();

  const {
    isRecording, startRecording, stopRecording, error: recorderError,
  } = useVoiceRecorder({ onAudioChunk, onTurnComplete });

  useEffect(() => {
    const anyError = websocketError || recorderError;
    if (anyError) {
      toast({ title: "Voice Error", description: anyError, variant: "destructive" });
    }
  }, [websocketError, recorderError, toast]);

  const handleMicClick = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        await startSession();
        await startRecording();
        setIsExpanded(true);
      } catch (e) {
        console.error("Failed to start session/recording", e);
      }
    }
  }, [isRecording, startSession, startRecording, stopRecording]);
  
  useEffect(() => {
    startSession().then(() => {
        // Optional: automatically start recording once connected
        // startRecording(); 
    });
    return () => {
      stopRecording();
      stopSession();
    };
  }, [startSession, stopSession, startRecording, stopRecording]);

  // Handle transcript updates
  useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  const getStatusText = () => {
    if (!isConnected) return "Connecting...";
    if (isRecording) return "Listening... Speak now.";
    if (isProcessing) return "AI is thinking...";
    if (transcript) return "AI has responded.";
    return "Click to start voice chat";
  };

  const getStatusColor = () => {
    if (!isConnected) return "text-muted-foreground";
    if (isRecording) return "text-red-500";
    if (isProcessing) return "text-blue-500";
    if (transcript) return "text-green-500";
    return "text-muted-foreground";
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
            <Button
              onClick={handleMicClick}
              size="lg"
              disabled={!isConnected}
              className={cn(
                "w-16 h-16 rounded-full transition-all duration-200",
                isRecording 
                  ? "bg-red-500 hover:bg-red-600 shadow-lg scale-105" 
                  : "bg-blue-500 hover:bg-blue-600"
              )}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>

            <p className={cn("text-xs text-center", getStatusColor())}>
              {getStatusText()}
            </p>

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
          <Button
            onClick={handleMicClick}
            size="lg"
            disabled={!isConnected}
            className={cn(
              "w-20 h-20 rounded-full transition-all duration-200",
              isRecording 
                ? "bg-red-500 hover:bg-red-600 shadow-lg scale-105" 
                : "bg-blue-500 hover:bg-blue-600"
            )}
          >
            {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
          </Button>

          <p className={cn("text-sm text-center", getStatusColor())}>
            {getStatusText()}
          </p>

          {transcript && (
            <div className="w-full p-4 border rounded-md bg-muted">
              <h3 className="font-semibold mb-2 text-sm">AI Response</h3>
              <p className="text-sm">{transcript}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}