import { Message, ActivityItem } from '../types/chat';
import { Loader, MessageSquare, ImageIcon, Video, FileText, Code, Globe, CheckCircle, AlertTriangle } from 'lucide-react';

export const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'video_processing':
    case 'video_complete':
      return Video;
    case 'image_generation':
      return ImageIcon;
    case 'chat_summary':
      return MessageSquare;
    case 'ai_thinking':
      return Loader;
    case 'document_analysis':
      return FileText;
    case 'code_execution':
      return Code;
    case 'url_analysis':
      return Globe;
    case 'complete':
      return CheckCircle;
    case 'error':
      return AlertTriangle;
    default:
      return MessageSquare;
  }
};

export const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'complete':
    case 'video_complete':
      return 'text-green-500';
    case 'error':
      return 'text-red-500';
    case 'ai_thinking':
    case 'processing':
    case 'analyzing':
    case 'generating':
      return 'text-blue-500 animate-pulse';
    default:
      return 'text-gray-500';
  }
};

export const scrollToBottom = (element: HTMLElement | null) => {
  if (element) {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: 'smooth',
    });
  }
};

export const detectYouTubeUrl = (text: string): string | null => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
  const match = text.match(youtubeRegex);
  return match ? match[0] : null;
};

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
