'use client';

import { ActivityItem } from '../../../app/chat/types/chat';
import { getActivityIcon, getActivityColor } from '../../../app/chat/utils/chat-utils';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';
import { Check, ChevronDown, Search, Link2, Brain, Edit3, FileText, Activity } from 'lucide-react';

// Map activity types to their corresponding icons
const activityIcons = {
  search: Search,
  link: Link2,
  analyze: Brain,
  generate: Edit3,
  complete: FileText,
};

// Status types
type TimelineStatus = 'pending' | 'processing' | 'done';

interface TimelineActivityLogProps {
  activities: ActivityItem[];
  className?: string;
  onActivityClick?: (activity: ActivityItem) => void;
}

export const TimelineActivityLog = ({
  activities,
  className,
  onActivityClick,
}: TimelineActivityLogProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [statuses, setStatuses] = useState<Record<string, TimelineStatus>>({});

  // Initialize statuses and expanded items
  useEffect(() => {
    const initialStatuses: Record<string, TimelineStatus> = {};
    const initialExpanded: Record<string, boolean> = {};
    
    activities.forEach((activity, index) => {
      initialStatuses[activity.id] = 'pending';
      initialExpanded[activity.id] = false;
      
      // Simulate processing state with a delay
      if (index === 0) {
        // First item starts processing immediately
        setTimeout(() => {
          setStatuses(prev => ({ ...prev, [activity.id]: 'processing' }));
          
          // Mark as done after a delay
          setTimeout(() => {
            setStatuses(prev => ({ ...prev, [activity.id]: 'done' }));
            
            // Start next item if exists
            if (activities[index + 1]) {
              setStatuses(prev => ({ ...prev, [activities[index + 1].id]: 'processing' }));
            }
          }, 2000);
        }, 500);
      }
    });
    
    setStatuses(initialStatuses);
    setExpandedItems(initialExpanded);
  }, [activities]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStatusIcon = (status: TimelineStatus) => {
    switch (status) {
      case 'done':
        return <Check className="h-3 w-3 text-green-500" />;
      case 'processing':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        );
      default:
        return <div className="h-2 w-2 rounded-full border-2 border-muted-foreground/50" />;
    }
  };

  const getStatusText = (status: TimelineStatus) => {
    switch (status) {
      case 'done':
        return 'Complete';
      case 'processing':
        return 'Processing';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: TimelineStatus) => {
    switch (status) {
      case 'done':
        return 'text-green-500';
      case 'processing':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn('relative h-full flex flex-col', className)}>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Activity Log</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-foreground animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-xs">Live</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type as keyof typeof activityIcons] || activityIcons.search;
          const status = statuses[activity.id] || 'pending';
          const isExpanded = expandedItems[activity.id] || false;
          
          return (
            <div 
              key={activity.id} 
              className="relative group"
              onClick={() => onActivityClick?.(activity)}
            >
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className="absolute left-4 top-6 bottom-0 w-px bg-border" />
              )}
              
              <div className="relative flex items-start">
                {/* Timeline dot */}
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                  'border-2',
                  status === 'done' 
                    ? 'border-green-500 bg-green-500/10' 
                    : status === 'processing'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-muted-foreground/30 bg-background',
                )}>
                  <Icon className={cn(
                    'h-4 w-4',
                    status === 'done' 
                      ? 'text-green-500' 
                      : status === 'processing'
                      ? 'text-blue-500'
                      : 'text-muted-foreground/50'
                  )} />
                </div>
                
                {/* Content */}
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{activity.title}</h3>
                    <div className={cn("text-xs flex items-center space-x-2", getStatusColor(status))}>
                      <span>{getStatusText(status)}</span>
                      <div className="h-3 w-3 flex items-center justify-center">
                        {getStatusIcon(status)}
                      </div>
                    </div>
                  </div>
                  
                  {activity.description && (
                    <div className="mt-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(activity.id);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center"
                      >
                        <ChevronDown 
                          className={cn(
                            'h-3 w-3 mr-1 transition-transform',
                            isExpanded ? 'transform rotate-180' : ''
                          )} 
                        />
                        {isExpanded ? 'Hide details' : 'Show details'}
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-2 pl-4 border-l-2 border-muted">
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                          {activity.details && Array.isArray(activity.details) && (
                            <ul className="mt-2 space-y-1">
                              {activity.details.map((detail, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex">
                                  <span className="mr-2">•</span>
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {typeof activity.progress === 'number' && (
                    <div className="mt-2">
                      <Progress value={activity.progress} className="h-1.5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineActivityLog;
