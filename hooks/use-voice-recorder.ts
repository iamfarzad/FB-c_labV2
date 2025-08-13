import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceRecorderConfig {
  onAudioChunk: (chunk: ArrayBuffer) => void;
  onTurnComplete: () => void;
  vadSilenceThreshold?: number;
  voiceThreshold?: number;
  sampleRate?: number;
  chunkSize?: number;
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
  vadSilenceThreshold = 500, // 500ms of silence triggers turn complete
  voiceThreshold = 0.002,
  sampleRate = 16000,
  chunkSize = 4096,
}: VoiceRecorderConfig) {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isInitializing: false,
    error: null,
    volume: 0,
    hasPermission: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);
  const isProcessingTurnCompleteRef = useRef<boolean>(false);
  const isRecordingRef = useRef<boolean>(false);

  const initializeAudioContext = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isInitializing: true, error: null }));
      
      // Create audio context at native sample rate
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      
      if (context.state === 'suspended') {
        await context.resume();
      }

      // Get microphone stream with better error handling
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: { ideal: sampleRate },
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
        mediaStreamRef.current = stream;
      } catch (mediaError) {
        console.error('Failed to get user media:', mediaError);
        let errorMessage = 'Microphone access failed';
        
        if (mediaError instanceof Error) {
          if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
            errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
          } else if (mediaError.name === 'NotFoundError' || mediaError.name === 'DevicesNotFoundError') {
            errorMessage = 'No microphone found. Please connect a microphone and try again.';
          } else if (mediaError.name === 'NotReadableError' || mediaError.name === 'TrackStartError') {
            errorMessage = 'Microphone is already in use by another application.';
          } else if (mediaError.name === 'OverconstrainedError' || mediaError.name === 'ConstraintNotSatisfiedError') {
            errorMessage = 'Microphone does not support the required audio settings.';
          } else {
            errorMessage = `Microphone error: ${mediaError.message}`;
          }
        }
        
        setState(prev => ({ ...prev, isInitializing: false, error: errorMessage, hasPermission: false }));
        return false;
      }

      // Create audio processing chain
      const source = context.createMediaStreamSource(mediaStreamRef.current!);
      const analyser = context.createAnalyser();
      const processor = context.createScriptProcessor(chunkSize, 1, 1);
      
      analyser.fftSize = 512;
      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(context.destination);

      processorNodeRef.current = processor;
      analyserNodeRef.current = analyser;

      setState(prev => ({ ...prev, isInitializing: false, hasPermission: true, error: null }));
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Audio initialization failed';
      setState(prev => ({ ...prev, isInitializing: false, error: errorMsg, hasPermission: false }));
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }, [chunkSize, sampleRate]);

  const resampleAudio = useCallback((input: Float32Array, inputRate: number, outputRate: number): Float32Array => {
    if (inputRate === outputRate) return input;
    
    const ratio = inputRate / outputRate;
    const outputLength = Math.round(input.length / ratio);
    const output = new Float32Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
      const srcIdx = i * ratio;
      const idx = Math.floor(srcIdx);
      const frac = srcIdx - idx;
      output[i] = input[idx] * (1 - frac) + (input[idx + 1] || 0) * frac;
    }
    
    return output;
  }, []);

  const convertToPCM16 = useCallback((input: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    
    return buffer;
  }, []);

  const processAudioChunk = useCallback((event: AudioProcessingEvent) => {
    if (!isRecordingRef.current) return;
    
    const inputBuffer = event.inputBuffer.getChannelData(0);
    const currentTime = Date.now();
    
    // Calculate volume for VAD
    const dataArray = new Uint8Array(analyserNodeRef.current!.frequencyBinCount);
    analyserNodeRef.current!.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length / 255;
    setState(prev => ({ ...prev, volume }));

    // Resample audio to target sample rate
    const resampled = resampleAudio(
      inputBuffer, 
      audioContextRef.current!.sampleRate,
      sampleRate
    );
    
    // Convert to PCM16 format
    const pcmBuffer = convertToPCM16(resampled);
    
    // Always send audio chunks to server
    onAudioChunk(pcmBuffer);

    // Simple VAD: detect silence for turn completion
    const hasVoice = volume > voiceThreshold;
    
    if (hasVoice) {
      lastSpeechTimeRef.current = currentTime;
      silenceStartRef.current = null;
      isProcessingTurnCompleteRef.current = false; // Reset turn complete flag
      console.info(`🎤 Voice detected (volume: ${volume.toFixed(4)})`);
    } else {
      if (silenceStartRef.current === null) {
        silenceStartRef.current = currentTime;
        console.info(`🔇 Silence started (volume: ${volume.toFixed(4)})`);
      }
    }

    // Check if we should send TURN_COMPLETE
    if (
      silenceStartRef.current && 
      !isProcessingTurnCompleteRef.current &&
      lastSpeechTimeRef.current > 0 && // Ensure we had some speech before
      (currentTime - silenceStartRef.current >= vadSilenceThreshold)
    ) {
      console.info(`🔇 Silence detected for ${vadSilenceThreshold}ms, sending TURN_COMPLETE`);
      isProcessingTurnCompleteRef.current = true;
      silenceStartRef.current = null;
      
      // Send TURN_COMPLETE signal
      onTurnComplete();
      
      // Reset the flag after a delay to allow for new speech
      setTimeout(() => {
        isProcessingTurnCompleteRef.current = false;
      }, 1000);
    }
  }, [onAudioChunk, onTurnComplete, vadSilenceThreshold, sampleRate, resampleAudio, convertToPCM16]);

  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return false;
    
    try {
      // Initialize audio context if needed
      if (!audioContextRef.current || !state.hasPermission) {
        const success = await initializeAudioContext();
        if (!success) return false;
      }
      
      // Set up audio processing
      if (processorNodeRef.current) {
        processorNodeRef.current.onaudioprocess = processAudioChunk;
      }
      
      isRecordingRef.current = true;
      lastSpeechTimeRef.current = 0;
      silenceStartRef.current = null;
      isProcessingTurnCompleteRef.current = false;
      
      setState(prev => ({ ...prev, isRecording: true, error: null }));
      console.info('🎤 Recording started');
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start recording';
      setState(prev => ({ ...prev, error: errorMsg }));
      console.error('Failed to start recording:', error);
      return false;
    }
  }, [state.hasPermission, initializeAudioContext, processAudioChunk]);

  const stopRecording = useCallback(() => {
    if (!isRecordingRef.current) return;
    
    try {
      // Stop audio processing
      if (processorNodeRef.current) {
        processorNodeRef.current.onaudioprocess = null;
      }
      
      isRecordingRef.current = false;
      setState(prev => ({ ...prev, isRecording: false, volume: 0 }));
      console.info('🛑 Recording stopped');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error stopping recording';
      setState(prev => ({ ...prev, error: errorMsg }));
      console.error('Error stopping recording:', error);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    // Triggers a getUserMedia prompt via initializeAudioContext
    return initializeAudioContext()
  }, [initializeAudioContext])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stopRecording]);

  return { ...state, startRecording, stopRecording, requestPermission };
}