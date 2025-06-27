import { useState, useCallback } from 'react';
import { ActivityItem } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

export type ActivityType = ActivityItem['type'];

interface UseActivitiesProps {
  initialActivities?: ActivityItem[];
  maxActivities?: number;
}

export const useActivities = ({
  initialActivities = [],
  maxActivities = 100,
}: UseActivitiesProps = {}) => {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [isLoading, setIsLoading] = useState(false);

  const addActivity = useCallback((
    activity: Omit<ActivityItem, 'id' | 'timestamp'>
  ) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: uuidv4(),
      timestamp: Date.now(),
    };

    setActivities(prev => {
      // Limit the number of activities to maxActivities
      const updatedActivities = [newActivity, ...prev];
      return updatedActivities.slice(0, maxActivities);
    });

    return newActivity;
  }, [maxActivities]);

  const updateActivity = useCallback((
    id: string,
    updates: Partial<Omit<ActivityItem, 'id'>>
  ) => {
    setActivities(prev =>
      prev.map(activity =>
        activity.id === id ? { ...activity, ...updates } : activity
      )
    );
  }, []);

  const removeActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  const setActivityProgress = useCallback((id: string, progress: number) => {
    updateActivity(id, { progress });
  }, [updateActivity]);

  const setActivityStatus = useCallback((
    id: string,
    status: ActivityItem['status']
  ) => {
    updateActivity(id, { status });
  }, [updateActivity]);

  // Helper to add a loading activity that can be updated later
  const addLoadingActivity = useCallback((
    type: ActivityType,
    title: string,
    description?: string
  ) => {
    return addActivity({
      type,
      title,
      description,
      status: 'in_progress',
      progress: 0,
    });
  }, [addActivity]);

  // Helper to complete an activity
  const completeActivity = useCallback((id: string, updates: Partial<ActivityItem> = {}) => {
    updateActivity(id, {
      ...updates,
      status: 'completed',
      progress: 100,
    });
  }, [updateActivity]);

  // Helper to mark an activity as failed
  const failActivity = useCallback((id: string, error: string) => {
    updateActivity(id, {
      status: 'failed',
      description: error,
      progress: 0,
    });
  }, [updateActivity]);

  return {
    // State
    activities,
    isLoading,
    
    // Actions
    addActivity,
    updateActivity,
    removeActivity,
    clearActivities,
    setActivityProgress,
    setActivityStatus,
    addLoadingActivity,
    completeActivity,
    failActivity,
  };
};

export default useActivities;
