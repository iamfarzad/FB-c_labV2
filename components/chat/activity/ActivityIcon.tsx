'use client';

import { ActivityItem } from '@/app/chat/types/chat';
import {
  Bot,
  User,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Code,
  Link2,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Loader2,
  Sparkles,
  BrainCircuit,
  Settings,
} from 'lucide-react';

interface ActivityIconProps {
  type: ActivityItem['type'];
  className?: string;
}

export const ActivityIcon = ({
  type,
  className = 'h-4 w-4',
}: ActivityIconProps) => {
  const iconProps = { className };

  switch (type) {
    case 'ai_thinking':
      return <BrainCircuit {...iconProps} />;
    case 'analyzing':
    case 'analyzing_video':
      return <Loader2 {...iconProps} className={`${className} animate-spin`} />;
    case 'chat_summary':
      return <MessageSquare {...iconProps} />;
    case 'code_execution':
      return <Code {...iconProps} />;
    case 'complete':
    case 'video_complete':
      return <CheckCircle {...iconProps} className={`${className} text-green-500`} />;
    case 'document_analysis':
      return <FileText {...iconProps} />;
    case 'error':
      return <AlertTriangle {...iconProps} className={`${className} text-red-500`} />;
    case 'event':
      return <Sparkles {...iconProps} />;
    case 'generating':
      return <Loader2 {...iconProps} className={`${className} animate-spin`} />;
    case 'image':
    case 'image_generation':
      return <ImageIcon {...iconProps} />;
    case 'processing':
      return <Loader2 {...iconProps} className={`${className} animate-spin`} />;
    case 'system_message':
      return <Settings {...iconProps} />;
    case 'url_analysis':
      return <Link2 {...iconProps} />;
    case 'user_action':
      return <User {...iconProps} />;
    case 'video_processing':
      return <VideoIcon {...iconProps} />;
    default:
      return <Bot {...iconProps} />;
  }
};

export default ActivityIcon;
