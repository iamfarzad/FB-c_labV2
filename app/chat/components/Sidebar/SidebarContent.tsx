'use client';

import { ActivityItem } from '../../types/chat';
import { ActivityLog } from './ActivityLog';
import { TimelineActivityLog } from './TimelineActivityLog';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, List, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

import { sampleTimelineActivities } from './sampleTimelineData';

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
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [timelineActivities, setTimelineActivities] = useState<ActivityItem[]>([]);
  
  // Determine if we have any activities to show
  const hasActivities = activities && activities.length > 0;
  const hasTimelineActivities = timelineActivities.length > 0;
  const showNoActivities = !hasActivities && !hasTimelineActivities;
  
  // Initialize with sample data for demo if no activities are provided
  useEffect(() => {
    if (activities.length === 0) {
      // Use sample data for demo purposes
      setTimelineActivities(sampleTimelineActivities);
    } else {
      // Use real activities when available
      setTimelineActivities(activities);
    }
  }, [activities]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-4 border-b flex justify-between items-center">
        <Button
          variant="outline"
          className="justify-start gap-2 flex-1 mr-2"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        
        <div className="flex border rounded-md p-0.5 bg-muted/50">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            size="icon"
            className={cn(
              'h-8 w-8 rounded-md',
              viewMode !== 'timeline' && 'opacity-50 hover:opacity-100'
            )}
            onClick={() => setViewMode('timeline')}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Timeline View</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            className={cn(
              'h-8 w-8 rounded-md',
              viewMode !== 'list' && 'opacity-50 hover:opacity-100'
            )}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">List View</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'timeline' ? (
          <TimelineActivityLog
            activities={timelineActivities}
            onActivityClick={onActivityClick}
            className="py-2 px-1"
          />
        ) : (
          <ActivityLog
            activities={activities}
            className="py-4"
            onActivityClick={onActivityClick}
          />
        )}
        
        {showNoActivities && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No activities yet</p>
            <p className="text-xs mt-1">Start a new chat to see activity here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarContent;
