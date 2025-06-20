'use client';

import React, { useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThreeDHoverCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export const ThreeDHoverCard = ({
  title,
  description,
  children,
  className,
  ...props
}: ThreeDHoverCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const layoutId = React.useId();

  return (
    <div className={cn('relative h-full w-full', className)} {...props}>
      <LayoutGroup id={layoutId}>
        <motion.div
          className="h-full w-full rounded-2xl p-8 bg-white/5 backdrop-blur-sm border border-white/10 overflow-visible"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.3 },
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
        >
          <div className="relative z-10 h-full flex flex-col">
            <motion.h3
              className="text-2xl font-bold mb-4 text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: 'tween',
              }}
            >
              {title}
            </motion.h3>
            <motion.p
              className="text-gray-300 mb-6 flex-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: 'tween',
                delay: 0.1,
              }}
            >
              {description}
            </motion.p>
            {children && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: 'tween',
                  delay: 0.2,
                }}
              >
                {children}
              </motion.div>
            )}
          </div>

          <motion.div
            className="absolute inset-0 -z-10 rounded-2xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.05 : 0.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20" />
          </motion.div>

          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
              boxShadow: '0 0 15px rgba(255, 91, 4, 0.3)',
            }}
          />
        </motion.div>
      </LayoutGroup>
    </div>
  );
};
