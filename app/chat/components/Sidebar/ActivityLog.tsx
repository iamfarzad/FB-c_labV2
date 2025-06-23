'use client';

import { ActivityItem } from '../../types/chat';
import { getActivityIcon, getActivityColor } from '../../utils/chat-utils';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ActivityLogProps {
  activities: ActivityItem[];
  className?: string;
  onActivityClick?: (activity: ActivityItem) => void;
}

export const ActivityLog = ({
  activities,
  className,
  onActivityClick,
}: ActivityLogProps) => {
  const IconComponent = ({ type }: { type: ActivityItem['type'] }) => {
    const Icon = getActivityIcon(type);
    return <Icon className={cn('h-4 w-4', getActivityColor(type))} />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-medium text-muted-foreground px-4">Recent Activity</h3>
      <div className="space-y-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={cn(
              'group flex items-center gap-3 p-3 rounded-lg cursor-pointer',
              'hover:bg-accent hover:text-accent-foreground transition-colors',
              onActivityClick && 'cursor-pointer'
            )}
            onClick={() => onActivityClick?.(activity)}
          >
            <div className="flex-shrink-0">
              <IconComponent type={activity.type} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </div>
              {activity.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
              )}
              {typeof activity.progress === 'number' && (
                <div className="mt-1">
                  <Progress value={activity.progress} className="h-1.5" />
                </div>
              )}
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground px-4">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
