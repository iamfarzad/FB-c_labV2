'use client';

import { ActivityItem } from '../../../app/chat/types/chat';
import { SidebarContent } from './SidebarContent';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DesktopSidebarProps {
  activities: ActivityItem[];
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onActivityClick: (activity: ActivityItem) => void;
  className?: string;
}

export const DesktopSidebar = ({
  activities,
  isOpen,
  onToggle,
  onNewChat,
  onActivityClick,
  className,
}: DesktopSidebarProps) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              'h-full relative z-30 hidden md:flex flex-col border-r border-border bg-card overflow-hidden',
              className
            )}
          >
            <SidebarContent
              activities={activities}
              onNewChat={onNewChat}
              onActivityClick={onActivityClick}
              className="flex-1"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className={cn(
        'fixed top-20 z-50 hidden md:block transition-all duration-300',
        isOpen ? 'left-[288px]' : 'left-4'
      )}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-background/80 backdrop-blur-sm border border-border rounded-full h-8 w-8 shadow-lg hover:bg-muted hover:scale-110 transition-all duration-200"
          onClick={onToggle}
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </>
  );
};

export default DesktopSidebar;
