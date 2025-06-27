'use client';

import { ActivityItem } from '@/app/chat/types/chat';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ActivityIcon } from './ActivityIcon';

interface ActivityLogProps {
  activities: ActivityItem[];
  onActivityClick?: (activity: ActivityItem) => void;
  className?: string;
}

export const ActivityLog = ({
  activities,
  onActivityClick,
  className,
}: ActivityLogProps) => {
  const handleClick = (activity: ActivityItem) => {
    if (onActivityClick) {
      onActivityClick(activity);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p>No activities yet</p>
          <p className="text-sm">Your activities will appear here</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {activities.map((activity) => (
            <li key={activity.id}>
              <button
                onClick={() => handleClick(activity)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg p-3 text-left',
                  'transition-colors hover:bg-muted/50',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'active:bg-muted/70',
                  'disabled:pointer-events-none disabled:opacity-50'
                )}
                disabled={!onActivityClick}
              >
                <div className="mt-0.5">
                  <ActivityIcon type={activity.type} />
                </div>
                <div className="flex-1 space-y-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-sm font-medium">
                      {activity.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="truncate text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                  {activity.progress !== undefined && (
                    <div className="mt-1">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${activity.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityLog;
