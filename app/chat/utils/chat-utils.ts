import { Message, ActivityItem } from '../types/chat';
import { 
  Loader, 
  MessageSquare, 
  ImageIcon, 
  Video, 
  FileText, 
  Code, 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  SearchIcon, 
  Link2Icon, 
  Brain, 
  Edit3, 
  BarChart3, 
  FileOutput 
} from 'lucide-react';

export const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    // Timeline specific types
    case 'search':
      return SearchIcon;
    case 'link':
      return Link2Icon;
    case 'analyze':
      return Brain;
    case 'generate':
      return Edit3;
    case 'complete':
      return FileText;
      
    // Existing types
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
    case 'error':
      return AlertTriangle;
    default:
      return MessageSquare;
  }
};

export const getActivityColor = (type: ActivityItem['type']) => {
  // Success/Completion states
  if (['complete', 'video_complete'].includes(type)) {
    return 'text-green-500';
  }
  
  // Error states
  if (type === 'error') {
    return 'text-red-500';
  }
  
  // Processing/loading states
  if (['ai_thinking', 'processing', 'analyzing', 'generating', 'video_processing', 'analyzing_video'].includes(type)) {
    return 'text-blue-500 animate-pulse';
  }
  
  // Timeline specific types
  switch (type) {
    case 'search':
      return 'text-blue-500';
    case 'link':
    case 'url_analysis':
      return 'text-purple-500';
    case 'analyze':
      return 'text-amber-500';
    case 'generate':
      return 'text-emerald-500';
    case 'document_analysis':
      return 'text-indigo-500';
    case 'code_execution':
      return 'text-pink-500';
    case 'image_generation':
    case 'image':
      return 'text-rose-500';
    case 'event':
      return 'text-cyan-500';
    case 'complete':
      return 'text-green-500';
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
