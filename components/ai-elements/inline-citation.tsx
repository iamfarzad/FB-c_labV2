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

// ===========================================
// Minimal Carousel for Inline Citations (test page support)
// ===========================================
type CarouselContextValue = {
  index: number
  count: number
  setCount: (n: number) => void
  next: () => void
  prev: () => void
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

export type InlineCitationCarouselProps = React.ComponentProps<'div'>

export const InlineCitationCarousel = ({ className, children, ...props }: InlineCitationCarouselProps) => {
  const [index, setIndex] = React.useState(0)
  const [count, setCount] = React.useState(0)

  const next = React.useCallback(() => setIndex(i => (count === 0 ? 0 : (i + 1) % count)), [count])
  const prev = React.useCallback(() => setIndex(i => (count === 0 ? 0 : (i - 1 + count) % count)), [count])

  const value = React.useMemo(() => ({ index, count, setCount, next, prev }), [index, count, setCount, next, prev])

  return (
    <CarouselContext.Provider value={value}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

export type InlineCitationCarouselHeaderProps = React.ComponentProps<'div'>

export const InlineCitationCarouselHeader = ({ className, children, ...props }: InlineCitationCarouselHeaderProps) => (
  <div className={cn('flex items-center justify-between border-b', className)} {...props}>
    {children}
  </div>
)

export type InlineCitationCarouselContentProps = React.ComponentProps<'div'>

export const InlineCitationCarouselContent = ({ className, children, ...props }: InlineCitationCarouselContentProps) => {
  const ctx = React.useContext(CarouselContext)
  const childArray = React.Children.toArray(children)

  React.useEffect(() => {
    if (ctx) ctx.setCount(childArray.length)
  }, [ctx, childArray.length])

  return (
    <div className={cn('relative overflow-hidden', className)} {...props}>
      {childArray.map((child, i) => (
        <div key={i} className={cn(i === (ctx?.index ?? 0) ? 'block' : 'hidden')}>
          {child}
        </div>
      ))}
    </div>
  )
}

export type InlineCitationCarouselItemProps = React.ComponentProps<'div'>

export const InlineCitationCarouselItem = ({ className, children, ...props }: InlineCitationCarouselItemProps) => (
  <div className={cn('p-3 space-y-2', className)} {...props}>
    {children}
  </div>
)

export type InlineCitationCarouselIndexProps = React.ComponentProps<'span'>

export const InlineCitationCarouselIndex = ({ className, ...props }: InlineCitationCarouselIndexProps) => {
  const ctx = React.useContext(CarouselContext)
  const indexLabel = ctx ? `${Math.min(ctx.index + 1, Math.max(1, ctx.count))}/${Math.max(1, ctx.count)}` : '1/1'
  return (
    <span className={cn('text-xs text-muted-foreground', className)} {...props}>
      {indexLabel}
    </span>
  )
}

export type InlineCitationCarouselNavButtonProps = React.ComponentProps<'button'>

export const InlineCitationCarouselPrev = ({ className, children, ...props }: InlineCitationCarouselNavButtonProps) => {
  const ctx = React.useContext(CarouselContext)
  return (
    <button
      type="button"
      onClick={() => ctx?.prev()}
      className={cn('inline-flex h-6 w-6 items-center justify-center rounded border bg-card hover:bg-accent/10', className)}
      {...props}
    >
      {children || <ArrowLeftIcon className="h-3.5 w-3.5" />}
    </button>
  )
}

export const InlineCitationCarouselNext = ({ className, children, ...props }: InlineCitationCarouselNavButtonProps) => {
  const ctx = React.useContext(CarouselContext)
  return (
    <button
      type="button"
      onClick={() => ctx?.next()}
      className={cn('inline-flex h-6 w-6 items-center justify-center rounded border bg-card hover:bg-accent/10', className)}
      {...props}
    >
      {children || <ArrowRightIcon className="h-3.5 w-3.5" />}
    </button>
  )
}
