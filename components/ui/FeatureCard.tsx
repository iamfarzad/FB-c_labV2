import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  theme: 'light' | 'dark';
}

export function FeatureCard({ icon, title, description, theme }: FeatureCardProps) {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"

  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-orange-accent)]/10 mb-4 mx-auto">
        {icon}
      </div>
      <h3 className={`text-lg font-semibold ${textColor} mb-2`}>{title}</h3>
      <p className={`text-sm ${mutedTextColor}`}>{description}</p>
    </div>
  );
}
