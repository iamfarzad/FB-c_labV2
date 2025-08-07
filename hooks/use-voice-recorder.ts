import { useState, useEffect, useCallback, useRef } from 'react';
import { MicVAD } from '@ricky0123/vad-web';

interface VoiceRecorderConfig {
  onAudioChunk: (chunk: ArrayBuffer) => void;
  onTurnComplete: () => void;
  sampleRate?: number;
}

interface VoiceRecorderState {
  isRecording: boolean;
  isInitializing: boolean;
  error: string | null;
  volume: number;
  hasPermission: boolean;
}

export function useVoiceRecorder({
  onAudioChunk,
  onTurnComplete,
  sampleRate = 16000,
}: VoiceRecorderConfig) {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isInitializing: false,
    error: null,
    volume: 0,
    hasPermission: false,
  });

  const vadRef = useRef<VADProcessor | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isInitializing: true, error: null }));
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate, echoCancellation: true },
      });
      mediaStreamRef.current = stream;

      const vad = await MicVAD.new({
        stream,
        workletURL: '/vad.worklet.js',
        modelURL: '/silero_vad.onnx',
        onSpeechStart: () => console.log('Speech started'),
        onSpeechEnd: onTurnComplete,
        onFrameProcessed: (probabilities) => {
          const volume = probabilities.isSpeech / 2;
          setState(prev => ({ ...prev, volume }));
        },
      });

      vad.start();
      vadRef.current = vad;
      setState(prev => ({ ...prev, isRecording: true, isInitializing: false, hasPermission: true }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Microphone access denied', isInitializing: false }));
    }
  }, [onTurnComplete, sampleRate]);

  const stopRecording = useCallback(() => {
    if (vadRef.current) {
      vadRef.current.destroy();
      vadRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setState(prev => ({ ...prev, isRecording: false, volume: 0 }));
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return { ...state, startRecording, stopRecording };
}
