// Chat components
export { default as ChatInput } from './chat/ChatInput';
export { default as ChatMessage } from './chat/ChatMessage';
export { default as ChatMessages } from './chat/ChatMessages';

// Sidebar components
export { default as ActivityLog } from './Sidebar/ActivityLog';
export { default as DesktopSidebar } from './Sidebar/DesktopSidebar';
export { default as MobileSidebarSheet } from './Sidebar/MobileSidebarSheet';
export { default as SidebarContent } from './Sidebar/SidebarContent';

// Hooks
export { useFileUpload } from '../hooks/useFileUpload';

// Context
export { ChatProvider, useChat } from '../context/ChatContext';

// Types
export type { Message, ActivityItem, UploadOption } from '../types/chat';
