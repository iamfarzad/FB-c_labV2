'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'default' | 'destructive' | 'success';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ id, title, description, type = 'default', onDismiss }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const typeStyles = {
    default: 'bg-background text-foreground border',
    destructive: 'bg-destructive text-destructive-foreground border-destructive/50',
    success: 'bg-green-600 text-white border-green-700',
  };

  return (
    <div
      className={cn(
        'relative flex items-start p-4 rounded-md shadow-lg overflow-hidden transition-all duration-300',
        'border',
        typeStyles[type]
      )}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <button
            onClick={onDismiss}
            className="ml-4 -mr-1.5 -mt-0.5 flex-shrink-0 p-1 rounded-md opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
      </div>
    </div>
  );
};

// Remove default export since we're using named export
// Keep type exports
export type { ToastType, ToastProps };
