import { UploadOption, Message, ActivityItem } from '../types/chat';
import { Image, FileText, Code, Link2, Youtube } from 'lucide-react';
import { ReactNode } from 'react';

// Create icon components with proper typing
const createIcon = (Icon: React.ComponentType<{ className?: string }>): ReactNode => (
  <Icon className="h-4 w-4" />
);

const ImageIcon = createIcon(Image);
const FileTextIcon = createIcon(FileText);
const CodeIcon = createIcon(Code);
const Link2Icon = createIcon(Link2);
const YoutubeIcon = createIcon(Youtube);

export const UPLOAD_MENU_ITEMS: UploadOption[] = [
  {
    id: 'image',
    label: 'Image',
    icon: ImageIcon,
    description: 'Upload an image',
    action: () => {},
  },
  {
    id: 'document',
    label: 'Document',
    icon: FileTextIcon,
    description: 'Upload a document',
    action: () => {},
  },
  {
    id: 'code',
    label: 'Code Snippet',
    icon: CodeIcon,
    description: 'Share a code snippet',
    action: () => {},
  },
  {
    id: 'link',
    label: 'Link',
    icon: Link2Icon,
    description: 'Share a URL',
    action: () => {},
  },
  {
    id: 'youtube',
    label: 'YouTube Video',
    icon: YoutubeIcon,
    description: 'Share a YouTube video',
    action: () => {},
  },
];

export const SHOWCASE_CAPABILITIES = [
  {
    id: 'code',
    title: 'Code Generation',
    description: 'Generate code in multiple programming languages',
    icon: 'code',
  },
  {
    id: 'document',
    title: 'Document Analysis',
    description: 'Upload and analyze documents',
    icon: 'file-text',
  },
  {
    id: 'image',
    title: 'Image Understanding',
    description: 'Analyze and describe images',
    icon: 'image',
  },
  {
    id: 'video',
    title: 'Video Learning',
    description: 'Learn from video content',
    icon: 'video',
  },
];

export const DEFAULT_MESSAGES: Message[] = [
  {
    id: 'welcome-1',
    role: 'assistant' as const,
    content: 'Hello! How can I assist you today?',
    timestamp: new Date(),
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'welcome',
    type: 'system_message',
    title: 'Welcome to the chat',
    description: 'Start a new conversation',
    timestamp: Date.now(),
  },
];

export const FILE_UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: [
    'image/*',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export const SUPPORTED_VIDEO_PLATFORMS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
];
