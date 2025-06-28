import React from 'react';

interface SectionBadgeProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionBadge({ icon, children, className }: SectionBadgeProps) {
  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6 ${className}`}>
      {icon}
      <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide ml-2">
        {children}
      </span>
    </div>
  );
} 