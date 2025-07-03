"use client"

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group relative inline-flex items-center justify-center rounded-none font-semibold transition-all duration-300 transform',
  {
    variants: {
      variant: {
        primary: 'px-8 py-4 bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white text-lg shadow-2xl hover:shadow-[var(--color-orange-accent)]/25 hover:scale-105',
        secondary: 'px-6 py-4 border border-[var(--glass-border)] text-lg hover:bg-[var(--glass-bg)]',
        tertiary: 'px-6 py-3 border-2 border-[var(--color-orange-accent)] text-[var(--color-gunmetal)] hover:bg-[var(--color-orange-accent)] hover:text-white',
      },
      size: {
        default: 'px-8 py-4 text-lg',
        sm: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);


export interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  href?: string;
  children: React.ReactNode;
  withArrow?: boolean;
}

const CTAButton = React.forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ className, variant, size, href, children, withArrow, ...props }, ref) => {
    
    const content = (
      <>
        {variant === 'primary' && <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
        <span className="relative">{children}</span>
        {withArrow && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={cn(buttonVariants({ variant, size, className }))}>
            {content}
        </Link>
      );
    }

    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {content}
      </button>
    );
  }
);

CTAButton.displayName = 'CTAButton';

export { CTAButton, buttonVariants };
