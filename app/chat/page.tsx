'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { 
  ChatProvider, 
  useChat, 
  ChatMessages, 
  ChatInput, 
  DesktopSidebar, 
  MobileSidebarSheet,
  useFileUpload
} from './components';

// Main Chat Component that uses the Chat Context
const ChatInterface = () => {
  const {
    messages,
    activities,
    isSidebarOpen,
    isLoading,
    input,
    setInput,
    sendMessage,
    addActivity,
    toggleSidebar,
    startNewChat,
    handleActivityClick,
  } = useChat();
  
  const { toast } = useToast();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { uploadFile, isUploading } = useFileUpload();

  // Handle sending a message
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const fileUrl = await uploadFile(file);
      if (fileUrl) {
        // Add a message with the uploaded file
        const message = {
          id: Date.now().toString(),
          role: 'user' as const,
          content: `File uploaded: ${file.name}`,
          timestamp: new Date(),
          fileUrl,
          fileName: file.name,
        };
        
        // In a real app, you would send this to your API
        console.log('File uploaded:', fileUrl);
        
        // Add activity
        addActivity({
          type: 'user_action',
          title: 'File uploaded',
          description: `Uploaded ${file.name}`,
        });
      }
    } catch (error) {
      console.error('Error handling file upload:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your file.',
        variant: 'destructive',
      });
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        activities={activities}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onNewChat={startNewChat}
        onActivityClick={handleActivityClick}
      />

      {/* Mobile Sidebar */}
      <MobileSidebarSheet
        activities={activities}
        onNewChat={startNewChat}
        onActivityClick={handleActivityClick}
      >
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50"
        >
          <span className="sr-only">Open sidebar</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </MobileSidebarSheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <ChatMessages messages={messages} className="pb-4" />
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <ChatInput
          value={input}
          onChange={(value) => setInput(value)}
          onSend={handleSend}
          onFileUpload={handleFileUpload}
          isSending={isLoading}
        />
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};

// Page Component that wraps everything with the ChatProvider
const ChatPage = () => {
  return (
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  );
};

export default ChatPage;
