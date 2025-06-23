'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToastType } from './toast';

const toastVariants = {
  default: 'bg-background text-foreground border',
  destructive: 'bg-destructive text-destructive-foreground border-destructive/50',
  success: 'bg-green-600 text-white border-green-700',
};

const toastIcons = {
  default: <Info className="h-4 w-4" />,
  destructive: <AlertCircle className="h-4 w-4" />,
  success: <CheckCircle className="h-4 w-4" />,
};

export function Toaster() {
  const { toasts, dismissToast } = useToast();
  
  // Early return if no toasts to render
  if (!toasts.length) return null;

  return (
    <div className="fixed top-0 right-0 z-[100] flex flex-col p-4 gap-2 max-w-xs w-full">
      {toasts.map(({ id, title, description, type = 'default' as ToastType }) => (
        <div
          key={id}
          className={cn(
            'relative flex items-start p-4 rounded-md shadow-lg overflow-hidden transition-all duration-300',
            'border',
            toastVariants[type]
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toastIcons[type as keyof typeof toastIcons]}
          </div>
          <div className="ml-3 flex-1">
            <div className="text-sm font-medium">{title}</div>
            {description && (
              <div className="mt-1 text-sm opacity-90">{description}</div>
            )}
          </div>
          <button
            onClick={() => dismissToast(id)}
            className="ml-4 -mr-1.5 -mt-0.5 flex-shrink-0 p-1 rounded-md opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
