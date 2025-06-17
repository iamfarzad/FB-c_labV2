// @/components/ContentContainer.tsx
import React from 'react';

interface ContentContainerProps {
  contentBasis: string; // e.g., URL or some identifier for content
  onLoadingStateChange?: (isLoading: boolean) => void;
  children: React.ReactNode; // To render actual content like iframe
}

export default function ContentContainer({ contentBasis, onLoadingStateChange, children }: ContentContainerProps) {
  React.useEffect(() => {
    // Simulate loading based on contentBasis change
    if (onLoadingStateChange) {
      onLoadingStateChange(true);
      const timer = setTimeout(() => {
        console.log(`ContentContainer: Content loaded for ${contentBasis}`);
        onLoadingStateChange(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [contentBasis, onLoadingStateChange]);

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm my-4">
      <h3 className="text-lg font-semibold mb-2">Content Container</h3>
      <p className="text-sm text-muted-foreground mb-2">Displaying content based on: {contentBasis || "N/A"}</p>
      {children}
    </div>
  );
}
