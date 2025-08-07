import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceRecorderConfig {
  onAudioChunk: (chunk: ArrayBuffer) => void;
  onTurnComplete: () => void;
  vadSilenceThreshold?: number;
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
  vadSilenceThreshold = 500,
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
  const lastVoiceLoggedRef = useRef<boolean>(false);

  const initializeAudioContext = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isInitializing: true, error: null }));
      const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
      audioContextRef.current = context;
      if (context.state === 'suspended') await context.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 48000, echoCancellation: true } });
      mediaStreamRef.current = stream;

      const source = context.createMediaStreamSource(stream);
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
      setState(prev => ({ ...prev, isInitializing: false, error: error instanceof Error ? error.message : 'Microphone access failed', hasPermission: false }));
      return false;
    }
  }, [chunkSize]);

  const resampleAudio = useCallback((input: Float32Array, inputRate: number) => {
    if (inputRate === sampleRate) return input;
    const ratio = inputRate / sampleRate;
    const outputLength = Math.round(input.length / ratio);
    const output = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i++) {
        const srcIdx = i * ratio;
        const idx = Math.floor(srcIdx);
        const frac = srcIdx - idx;
        output[i] = input[idx] * (1 - frac) + (input[idx + 1] || 0) * frac;
    }
    return output;
  }, [sampleRate]);

  const convertToPCM16 = useCallback((input: Float32Array) => {
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
    
    const dataArray = new Uint8Array(analyserNodeRef.current!.frequencyBinCount);
    analyserNodeRef.current!.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length / 255;
    setState(prev => ({ ...prev, volume }));

    // Lower threshold for better voice detection (was 0.01)
    const hasVoice = volume > 0.005;
    if (hasVoice) {
      lastSpeechTimeRef.current = currentTime;
      silenceStartRef.current = null;
    } else {
      if (silenceStartRef.current === null) silenceStartRef.current = currentTime;
    }

    const resampled = resampleAudio(inputBuffer, audioContextRef.current!.sampleRate);
    const pcmBuffer = convertToPCM16(resampled);
    onAudioChunk(pcmBuffer);

    // Log VAD state for debugging
    if (hasVoice && !lastVoiceLoggedRef.current) {
      console.log(`🎤 Voice detected (volume: ${volume.toFixed(3)})`);
      lastVoiceLoggedRef.current = true;
    } else if (!hasVoice && lastVoiceLoggedRef.current) {
      console.log(`🔇 Silence started (volume: ${volume.toFixed(3)})`);
      lastVoiceLoggedRef.current = false;
    }

    if (silenceStartRef.current && !isProcessingTurnCompleteRef.current && (currentTime - silenceStartRef.current >= vadSilenceThreshold) && (currentTime - lastSpeechTimeRef.current >= vadSilenceThreshold)) {
      console.log(`🔇 Silence detected for ${vadSilenceThreshold}ms, completing turn.`);
      isProcessingTurnCompleteRef.current = true;
      silenceStartRef.current = null;
      
      // Add delay to ensure all audio chunks have been sent to server
      setTimeout(() => {
        console.log('🎯 Triggering TURN_COMPLETE');
        onTurnComplete();
        setTimeout(() => { isProcessingTurnCompleteRef.current = false; }, 1000);
      }, 200); // 200ms delay to ensure audio chunks are processed
    }
  }, [onAudioChunk, onTurnComplete, vadSilenceThreshold, resampleAudio, convertToPCM16]);

  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return false;
    try {
      if (!audioContextRef.current || !state.hasPermission) {
        if (!await initializeAudioContext()) return false;
      }
      if (processorNodeRef.current) {
        processorNodeRef.current.onaudioprocess = processAudioChunk;
      }
      isRecordingRef.current = true;
      setState(prev => ({ ...prev, isRecording: true, error: null }));
      console.log('🎤 Recording started');
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to start recording' }));
      return false;
    }
  }, [state.hasPermission, initializeAudioContext, processAudioChunk]);

  const stopRecording = useCallback(() => {
    if (!isRecordingRef.current) return;
    try {
      if (processorNodeRef.current) processorNodeRef.current.onaudioprocess = null;
      isRecordingRef.current = false;
      setState(prev => ({ ...prev, isRecording: false, volume: 0 }));
      console.log('🛑 Recording stopped');
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Error stopping recording' }));
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
    };
  }, [stopRecording]);

  return { ...state, startRecording, stopRecording };
}