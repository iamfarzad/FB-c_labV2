// Layout Components
export { default as ChatLayout } from './layout/ChatLayout';
export { default as ChatHeader } from './layout/ChatHeader';
export { default as ChatMain } from './layout/ChatMain';
export { default as ChatSidebar } from './layout/ChatSidebar';
export { default as ChatFooter } from './layout/ChatFooter';

// Message Components
export { default as MessageList } from './messages/MessageList';
export { default as MessageItem } from './messages/MessageItem';
export { default as MessageInput } from './messages/MessageInput';
export { default as MessageMenu } from './messages/MessageMenu';
export { default as MessageStatus } from './messages/MessageStatus';

// Feature Components
export { default as EmojiPicker } from './messages/EmojiPicker';
export { default as ReactionPicker, ReactionList } from './messages/ReactionPicker';
export { default as MentionSuggestions } from './messages/MentionSuggestions';
export { default as LinkPreview } from './messages/LinkPreview';
export { default as CodeBlock } from './messages/CodeBlock';
export { default as TypingIndicator } from './messages/TypingIndicator';

// Modals
export { default as VoiceInputModal } from './modals/VoiceInputModal';
export { default as WebcamModal } from './modals/WebcamModal';
export { default as ScreenShareModal } from './modals/ScreenShareModal';

// Hooks
export { useChat } from '../hooks/useChat';
export { useActivities } from '../hooks/useActivities';
export { useMedia } from '../hooks/useMedia';
export { useFileUpload } from '../hooks/useFileUpload';

// Context
export { ChatProvider } from '../context/ChatContext';

// Re-export types
export type { Message, ActivityItem, UploadOption } from '../types/chat';
