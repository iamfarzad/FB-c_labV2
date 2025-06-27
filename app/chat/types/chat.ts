import { ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  dataItems?: any[];
  audioData?: string;
  sources?: any[];
}

export interface ActivityItem {
  id: string;
  type: 'video_processing' | 'image_generation' | 'chat_summary' | 'ai_thinking' | 'error' | 'user_action' | 'system_message' | 'event'  | 'image'
  | 'analyzing_video'
  | 'analyzing'
  | 'generating'
  | 'processing'
  | 'complete'
  | 'video_complete'
  | 'search'
  | 'link'
  | 'analyze'
  | 'generate'
  | 'document_analysis'
  | 'code_execution'
  | 'url_analysis'
  | 'file_upload'
  | 'image_capture'
  | 'screen_share'
  | 'voice_input';
  title: string;
  description?: string;
  timestamp: number;
  user?: string;
  progress?: number;
  isLiveProcessing?: boolean;
  isPerMessageLog?: boolean;
  sourceMessageId?: string;
  link?: string;
  icon?: ReactNode;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  details?: string[];
}

export interface UploadOption {
  id: string;
  label: string;
  icon: ReactNode;
  description: string;
  action: () => void;
}

export interface VideoLearningData {
  videoUrl: string;
  title: string;
  learningModules: any[];
  currentModule?: any;
  progress: number;
  isActive: boolean;
}
