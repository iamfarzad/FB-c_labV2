'use client';

import { ActivityItem } from '../../../app/chat/types/chat';
import { TimelineActivityLog } from '../activity/TimelineActivityLog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { sampleTimelineActivities } from './sampleTimelineData';

interface SidebarContentProps {
  activities: ActivityItem[];
  onNewChat?: () => void;
  onActivityClick?: (activity: ActivityItem) => void;
  className?: string;
}

export const SidebarContent = ({
  activities,
  onNewChat,
  onActivityClick,
  className,
}: SidebarContentProps) => {
  const [timelineActivities, setTimelineActivities] = useState<ActivityItem[]>([]);
  
  useEffect(() => {
    // Use real activities if available, otherwise use sample data for demo
    setTimelineActivities(activities.length > 0 ? activities : sampleTimelineActivities);
  }, [activities]);

  const showNoActivities = timelineActivities.length === 0;

  return (
    <div className={`flex flex-col h-full ${className}`}>
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
        <TimelineActivityLog
            activities={timelineActivities}
            onActivityClick={onActivityClick}
            className="p-4"
        />
        
        {showNoActivities && (
          <div className="text-center p-8 text-muted-foreground">
            <p className="text-sm">No activities to show.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarContent;
