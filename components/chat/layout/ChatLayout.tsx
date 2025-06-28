'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  children: ReactNode;
  className?: string;
}

export const ChatLayout = ({
  children,
  className,
}: ChatLayoutProps) => {
  return (
    <div className={cn(
      'flex h-screen w-full flex-col bg-background',
      className
    )}>
      {children}
    </div>
  );
};

export default ChatLayout;
