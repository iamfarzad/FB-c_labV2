'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, PanelLeft, History, Plus } from 'lucide-react';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export const ChatSidebar = ({
  isOpen,
  onClose,
  children,
  className,
}: ChatSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!isOpen) return null;

  return (
    <aside
      className={cn(
        'relative flex h-full w-80 flex-col border-l bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-80',
        className
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <h2 className="font-semibold">Activity Log</h2>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8"
          >
            <PanelLeft
              className={cn(
                'h-4 w-4 transition-transform',
                isCollapsed && 'rotate-180'
              )}
            />
            <span className="sr-only">
              {isCollapsed ? 'Expand' : 'Collapse'} sidebar
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 md:hidden"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {!isCollapsed ? (
          children
        ) : (
          <div className="flex flex-col items-center gap-4 pt-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => setIsCollapsed(false)}
            >
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Expand sidebar</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => {}}
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">New chat</span>
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
