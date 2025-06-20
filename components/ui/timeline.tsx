"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

/**
 * Represents a single entry in the timeline
 */
export interface TimelineEntry {
  /** Year or date of the event */
  year: string;
  /** Title of the event */
  title: string;
  /** Short description of the event */
  description: string;
  /** Optional detailed description */
  details?: string;
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Custom color for the timeline dot */
  color?: string;
  /** Optional image URL */
  imageUrl?: string;
}

interface TimelineProps {
  /** Array of timeline entries */
  data: TimelineEntry[];
  /** Color theme */
  theme?: "light" | "dark";
  /** Additional CSS classes */
  className?: string;
}

/**
 * A responsive timeline component that displays a vertical list of events
 */
export const Timeline = ({
  data,
  theme = "light",
  className = ""
}: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // Theme variables
  const themeClasses = {
    text: theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]",
    mutedText: theme === "dark" ? "text-[var(--color-light-silver)]/80" : "text-[var(--color-gunmetal)]/80",
    border: theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200",
    bg: theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white",
    containerBg: theme === 'dark' ? 'bg-[var(--color-gunmetal)]' : 'bg-white'
  };

  // Calculate height for the animated timeline line
  useEffect(() => {
    const updateHeight = () => {
      if (ref.current) {
        setHeight(ref.current.getBoundingClientRect().height);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, [ref, data]);

  // Animation setup
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className={`w-full font-sans ${themeClasses.containerBg} ${className}`}
      ref={containerRef}
    >
      <div className="relative max-w-5xl mx-auto py-16 px-4 md:px-8 lg:px-10">
        <div ref={ref} className="relative">
          {data.map((item, index) => (
            <div
              key={`${item.year}-${index}`}
              className="flex justify-start pt-10 md:pt-20"
            >
              {/* Timeline dot and year */}
              <div className="sticky flex flex-col md:flex-row z-40 items-center top-20 self-start max-w-xs lg:max-w-sm md:w-full">
                <div
                  className={`h-10 absolute left-3 md:left-3 w-10 rounded-full ${themeClasses.bg} flex items-center justify-center border ${themeClasses.border}`}
                >
                  {item.icon ? (
                    <item.icon className="h-4 w-4 text-[var(--color-orange-accent)]" />
                  ) : (
                    <div
                      className={`h-3 w-3 rounded-full ${item.color || 'bg-[var(--color-orange-accent)]'}`}
                    />
                  )}
                </div>
                <h3 className="hidden md:block text-2xl md:pl-16 font-bold text-[var(--color-orange-accent)]">
                  {item.year}
                </h3>
              </div>

              {/* Timeline content */}
              <div className="relative pl-16 pr-4 md:pl-4 w-full">
                <div
                  className={`${themeClasses.bg} p-6 rounded-xl border ${themeClasses.border} shadow-sm hover:shadow-md transition-all duration-300`}
                >
                  <h3 className="md:hidden block text-xl font-bold text-[var(--color-orange-accent)] mb-2">
                    {item.year}
                  </h3>
                  <h4 className={`text-xl font-semibold mb-2 ${themeClasses.text}`}>
                    {item.title}
                  </h4>
                  <p className={`${themeClasses.mutedText} mb-4`}>
                    {item.description}
                  </p>
                  {item.details && (
                    <p className={`${themeClasses.mutedText} text-sm`}>
                      {item.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Animated timeline line */}
          <div
            style={{ height: `${height}px` }}
            className="absolute left-8 top-0 overflow-hidden w-[2px] bg-gradient-to-b from-transparent via-[var(--color-orange-accent)] to-transparent"
          >
            <motion.div
              style={{
                height: heightTransform,
                opacity: opacityTransform,
              }}
              className="w-[2px] bg-gradient-to-b from-[var(--color-orange-accent)] to-[var(--color-blue-accent)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
