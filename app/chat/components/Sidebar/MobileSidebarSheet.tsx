'use client';

import { ActivityItem } from '../../types/chat';
import { SidebarContent } from './SidebarContent';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface MobileSidebarSheetProps {
  activities: ActivityItem[];
  onNewChat: () => void;
  onActivityClick: (activity: ActivityItem) => void;
  className?: string;
  children?: React.ReactNode;
}

export const MobileSidebarSheet = ({
  activities,
  onNewChat,
  onActivityClick,
  className,
  children,
}: MobileSidebarSheetProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className={cn('md:hidden', className)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="fixed left-0 top-0 h-full w-[300px] translate-x-0 rounded-none border-0 p-0 sm:max-w-[300px]">
        <DialogHeader className="p-4 text-left">
          <DialogTitle>Chat History</DialogTitle>
        </DialogHeader>
        <div className="h-[calc(100%-57px)] overflow-auto">
          <SidebarContent
            activities={activities}
            onNewChat={onNewChat}
            onActivityClick={onActivityClick}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileSidebarSheet;
