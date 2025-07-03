'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VideoToAppGenerator } from '@/components/video-to-app-generator';

interface Video2AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideoUrl?: string;
}

export const Video2AppModal = ({ isOpen, onClose, initialVideoUrl }: Video2AppModalProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={isExpanded ? "max-w-7xl h-[90vh]" : "max-w-5xl h-[80vh]"}
        aria-describedby="video2app-description"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Video to Learning App Generator</DialogTitle>
          <DialogDescription id="video2app-description">
            Transform any YouTube video into an interactive learning application using AI
          </DialogDescription>
        </DialogHeader>

        <div className="h-full">
          <VideoToAppGenerator
            className="h-full"
            onClose={onClose}
            initialVideoUrl={initialVideoUrl}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
