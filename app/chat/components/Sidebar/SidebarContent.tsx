'use client';

import { ActivityItem } from '../../types/chat';
import { ActivityLog } from './ActivityLog';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarContentProps {
  activities: ActivityItem[];
  className?: string;
  onNewChat?: () => void;
  onActivityClick?: (activity: ActivityItem) => void;
}

export const SidebarContent = ({
  activities,
  className,
  onNewChat,
  onActivityClick,
}: SidebarContentProps) => {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-4 border-b">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ActivityLog
          activities={activities}
          className="py-4"
          onActivityClick={onActivityClick}
        />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="p-2 rounded-full bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Upgrade to Pro</p>
            <p className="text-xs text-muted-foreground">
              Get access to all features
            </p>
          </div>
          <Button variant="default" size="sm" className="text-xs">
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SidebarContent;
