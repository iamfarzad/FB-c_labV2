'use client';

import { useState, useEffect, useRef } from 'react';
import { ExternalLink, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export interface LinkPreviewData {
  /**
   * The URL of the link
   */
  url: string;
  /**
   * The title of the linked page
   */
  title?: string;
  /**
   * A brief description of the linked content
   */
  description?: string;
  /**
   * The domain name of the URL
   */
  domain?: string;
  /**
   * URL of an image associated with the content
   */
  image?: string;
  /**
   * The favicon of the website
   */
  favicon?: string;
  /**
   * The MIME type of the content
   */
  contentType?: string;
  /**
   * Width of the content if it's an image or video
   */
  width?: number;
  /**
   * Height of the content if it's an image or video
   */
  height?: number;
  /**
   * Error message if fetching the preview failed
   */
  error?: string;
  /**
   * Whether the preview is still loading
   */
  isLoading?: boolean;
}

interface LinkPreviewProps {
  /**
   * The URL to generate a preview for
   */
  url: string;
  /**
   * Optional preview data if already loaded
   */
  previewData?: Partial<LinkPreviewData>;
  /**
   * Callback when preview data is loaded
   */
  onPreviewLoad?: (data: LinkPreviewData) => void;
  /**
   * Callback when there's an error loading the preview
   */
  onError?: (error: Error) => void;
  /**
   * Whether to show a close button
   * @default false
   */
  showCloseButton?: boolean;
  /**
   * Callback when the close button is clicked
   */
  onClose?: () => void;
  /**
   * Custom class name for the container
   */
  className?: string;
  /**
   * Whether to show the preview inline or as a card
   * @default 'card'
   */
  variant?: 'inline' | 'card';
  /**
   * Whether to show the loading skeleton
   * @default true
   */
  showLoadingState?: boolean;
}

/**
 * Extracts the domain from a URL
 */
const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch (e) {
    return '';
  }
};

/**
 * Fetches link preview data from a URL
 */
const fetchLinkPreview = async (url: string): Promise<LinkPreviewData> => {
  try {
    // In a real app, you would make an API call to your backend
    // to fetch the link metadata to avoid CORS issues
    const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch link preview: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      ...data,
      url,
      domain: data.domain || extractDomain(url),
    };
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return {
      url,
      domain: extractDomain(url),
      error: 'Failed to load preview',
    };
  }
};

export const LinkPreview = ({
  url,
  previewData: initialPreviewData,
  onPreviewLoad,
  onError,
  showCloseButton = false,
  onClose,
  className,
  variant = 'card',
  showLoadingState = true,
}: LinkPreviewProps) => {
  const [preview, setPreview] = useState<LinkPreviewData>(() => ({
    url,
    domain: extractDomain(url),
    isLoading: !initialPreviewData,
    ...initialPreviewData,
  }));
  
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const isMounted = useRef(true);
  const imageRef = useRef<HTMLImageElement>(null);

  // Fetch link preview data
  useEffect(() => {
    if (initialPreviewData) {
      setPreview(prev => ({
        ...prev,
        ...initialPreviewData,
        isLoading: false,
      }));
      return;
    }

    const loadPreview = async () => {
      try {
        setPreview(prev => ({ ...prev, isLoading: true }));
        const data = await fetchLinkPreview(url);
        
        if (!isMounted.current) return;
        
        setPreview({
          ...data,
          isLoading: false,
        });
        
        onPreviewLoad?.(data);
      } catch (error) {
        console.error('Error loading link preview:', error);
        if (!isMounted.current) return;
        
        setPreview(prev => ({
          ...prev,
          error: 'Failed to load preview',
          isLoading: false,
        }));
        
        onError?.(error as Error);
      }
    };

    loadPreview();

    return () => {
      isMounted.current = false;
    };
  }, [url, initialPreviewData, onPreviewLoad, onError]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleImageError = () => {
    setIsImageError(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderLoadingState = () => (
    <div className="flex flex-col space-y-2 p-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );

  const renderErrorState = () => (
    <div className="p-3 text-sm text-muted-foreground">
      Couldn't load preview. <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Open link</a>
    </div>
  );

  const renderContent = () => {
    if (preview.isLoading && showLoadingState) {
      return renderLoadingState();
    }

    if (preview.error) {
      return renderErrorState();
    }

    return (
      <div className="flex flex-col">
        {preview.image && !isImageError && (
          <div className="relative aspect-video overflow-hidden rounded-t-md bg-muted">
            <img
              ref={imageRef}
              src={preview.image}
              alt={preview.title || 'Link preview'}
              className={cn(
                'h-full w-full object-cover transition-opacity',
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-1 flex-col p-3">
          <div className="mb-1 line-clamp-2 text-sm font-medium">
            {preview.title || preview.domain || 'Link'}
          </div>
          {preview.description && (
            <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
              {preview.description}
            </p>
          )}
          <div className="mt-auto flex items-center">
            {preview.favicon ? (
              <img
                src={preview.favicon}
                alt=""
                className="mr-2 h-3 w-3"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <LinkIcon className="mr-2 h-3 w-3 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {preview.domain || new URL(url).hostname}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {preview.title || preview.domain || url}
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </span>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full max-w-md overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm transition-colors hover:bg-accent/50',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      {showCloseButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 z-10 h-6 w-6 rounded-full bg-background/80 p-0 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          onClick={handleClose}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Close preview</span>
        </Button>
      )}
      {renderContent()}
    </div>
  );
};

export default LinkPreview;
