"use client";

import { cn } from "@/lib/utils";
import { Zap, BarChart, Clock, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Zap className="size-4 text-[var(--color-orange-accent)]" />,
  title = "65% Faster",
  description = "Response time improvement",
  date = "Just now",
  iconClassName = "text-[var(--color-orange-accent)]",
  titleClassName = "text-[var(--color-orange-accent)]",
}: DisplayCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div
      className={cn(
        "relative flex h-40 w-full max-w-md -skew-y-[8deg] select-none flex-col justify-between rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-[var(--color-orange-accent)]/10",
        "group hover:border-[var(--color-orange-accent)]/30",
        isDark ? "backdrop-blur-sm" : "backdrop-blur-sm",
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full p-2",
            "bg-[var(--color-orange-accent)]/10 text-[var(--color-orange-accent)]",
            "transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--color-orange-accent)]/20",
            iconClassName
          )}>
            {icon}
          </span>
          <h3 className={cn(
            "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
            isDark
              ? "from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)]"
              : "from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)]",
            titleClassName
          )}>
            {title}
          </h3>
        </div>
        <p className="text-base text-[var(--color-gunmetal)] dark:text-[var(--color-light-silver)]/90">
          {description}
        </p>
      </div>
      <p className="text-sm text-[var(--color-gunmetal)]/60 dark:text-[var(--color-light-silver)]/60">
        {date}
      </p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      icon: <BarChart className="size-5" />,
      title: "65% Faster",
      description: "Response time dropped with custom chatbot implementation",
      date: "Real Results"
    },
    {
      icon: <Clock className="size-5" />,
      title: "3 Days → 30 Min",
      description: "Financial reports that took 3 days now complete in 30 minutes",
      date: "Time Saved"
    },
    {
      icon: <TrendingUp className="size-5" />,
      title: "40% More",
      description: "Increase in conversion rates after implementing AI insights",
      date: "Performance Boost"
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayCards.map((cardProps, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="w-full"
          >
            <DisplayCard {...cardProps} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}