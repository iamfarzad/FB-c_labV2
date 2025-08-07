"use client";

import { useState, useCallback, useEffect } from 'react';
import { useWebSocketVoice } from '@/hooks/use-websocket-voice';
import { useVoiceRecorder } from '@/hooks/use-voice-recorder';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function VoiceInput() {
  const { toast } = useToast();

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
  } = useVoiceRecorder({
    onAudioChunk,
    onTurnComplete,
  });

  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    const anyError = websocketError || recorderError;
    if (anyError) {
      toast({
        title: "Voice Error",
        description: anyError,
        variant: "destructive",
      });
    }
  }, [websocketError, recorderError, toast]);

  const handleToggleRecording = useCallback(async () => {
    if (!isSessionActive) {
      try {
        await startSession();
        await startRecording();
        setIsSessionActive(true);
      } catch (e) {
        console.error("Failed to start session and recording", e);
      }
    } else {
      stopRecording();
      onTurnComplete(); // Signal turn complete when manually stopping
      stopSession();
      setIsSessionActive(false);
    }
  }, [isSessionActive, startSession, startRecording, stopRecording, stopSession, onTurnComplete]);

  const getStatusText = () => {
    if (websocketError || recorderError) return "An error occurred. Please try again.";
    if (!isConnected && !isSessionActive) return "Disconnected. Click the mic to start.";
    if (!isConnected && isSessionActive) return "Connecting...";
    if (isRecording) return "Listening... Speak now.";
    if (isProcessing) return "AI is thinking...";
    if (transcript) return "AI has responded. Click to speak again.";
    return "Connected. Click the mic to speak.";
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 border rounded-lg h-full bg-card text-card-foreground">
      <h2 className="text-lg font-semibold mb-2">Live Voice Input</h2>
      <p className="text-sm text-muted-foreground mb-4 h-5">{getStatusText()}</p>
      
      <Button
        onClick={handleToggleRecording}
        size="lg"
        disabled={!isConnected && isSessionActive}
        className={`w-24 h-24 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 ${
          isRecording ? 'bg-red-500 hover:bg-red-600 shadow-lg' : 'bg-blue-500 hover:bg-blue-600 shadow-md'
        }`}
      >
        {isRecording ? <MicOff size={48} /> : <Mic size={48} />}
      </Button>

      <div className="w-full mt-6 p-4 border rounded-md bg-background min-h-[100px]">
        <h3 className="font-semibold mb-2">Live Transcript</h3>
        <p className="text-sm text-muted-foreground italic">
          {transcript || "The AI's response will appear here..."}
        </p>
      </div>
    </div>
  );
}