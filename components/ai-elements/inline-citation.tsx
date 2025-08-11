'use client';

import * as React from 'react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

export type InlineCitationProps = ComponentProps<'span'>;

export const InlineCitation = ({
  className,
  ...props
}: InlineCitationProps) => (
  <span
    className={cn('inline items-center gap-1 group', className)}
    {...props}
  />
);

export type InlineCitationTextProps = ComponentProps<'span'>;

export const InlineCitationText = ({
  className,
  ...props
}: InlineCitationTextProps) => (
  <span
    className={cn('group-hover:bg-accent transition-colors', className)}
    {...props}
  />
);

export type InlineCitationCardProps = ComponentProps<typeof HoverCard>;

export const InlineCitationCard = (props: InlineCitationCardProps) => (
  <HoverCard openDelay={0} closeDelay={0} {...props} />
);

export type InlineCitationCardTriggerProps = ComponentProps<'div'> & {
  sources: string[];
};

export const InlineCitationCardTrigger = ({
  sources,
  className,
  ...props
}: InlineCitationCardTriggerProps) => (
  <HoverCardTrigger asChild>
    <div
      className={cn('ml-1 rounded-full', className)}
      {...props}
    >
      <Badge variant="secondary" className="cursor-pointer">
        {sources.length ? (
          <>
            {new URL(sources[0]).hostname}{' '}
            {sources.length > 1 && `+${sources.length - 1}`}
          </>
        ) : (
          'unknown'
        )}
      </Badge>
    </div>
  </HoverCardTrigger>
);

export type InlineCitationCardBodyProps = ComponentProps<'div'>;

export const InlineCitationCardBody = ({
  className,
  ...props
}: InlineCitationCardBodyProps) => (
  <HoverCardContent className={cn('w-80 p-0 relative', className)} {...props} />
);

export type InlineCitationSourceProps = ComponentProps<'div'> & {
  title?: string;
  url?: string;
  description?: string;
};

export const InlineCitationSource = ({
  title,
  url,
  description,
  className,
  children,
  ...props
}: InlineCitationSourceProps) => (
  <div className={cn('space-y-1', className)} {...props}>
    {title && (
      <h4 className="text-sm font-medium leading-tight truncate">{title}</h4>
    )}
    {url && (
      <p className="text-xs text-muted-foreground break-all truncate">{url}</p>
    )}
    {description && (
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {description}
      </p>
    )}
    {children}
  </div>
);

export type InlineCitationQuoteProps = ComponentProps<'blockquote'>;

export const InlineCitationQuote = ({
  children,
  className,
  ...props
}: InlineCitationQuoteProps) => (
  <blockquote
    className={cn(
      'border-l-2 border-muted pl-3 text-sm italic text-muted-foreground',
      className,
    )}
    {...props}
  >
    {children}
  </blockquote>
);

// Simple citation display component for grounded search results
export type GroundedCitationProps = {
  citations: Array<{
    uri: string;
    title?: string;
    description?: string;
  }>;
  className?: string;
};

export const GroundedCitation = ({ citations, className }: GroundedCitationProps) => {
  if (!citations || citations.length === 0) return null;

  return (
    <InlineCitationCard>
      <InlineCitationCardTrigger sources={citations.map(c => c.uri)} />
      <InlineCitationCardBody>
        <div className="p-4 space-y-3">
          <h4 className="text-sm font-medium">Sources</h4>
          {citations.map((citation, index) => (
            <InlineCitationSource
              key={index}
              title={citation.title}
              url={citation.uri}
              description={citation.description}
            />
          ))}
        </div>
      </InlineCitationCardBody>
    </InlineCitationCard>
  );
};
