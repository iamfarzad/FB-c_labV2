"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { DotPattern } from "@/components/ui/dot-pattern";

interface AboutMeCardProps {
  theme?: 'light' | 'dark';
}

export function AboutMeCard({ theme = 'light' }: AboutMeCardProps) {
  return (
    <section className={cn(
      "relative w-full py-16 md:py-24 lg:py-32 overflow-hidden",
      "text-foreground transition-colors duration-300"
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <DotPattern
          width={24}
          height={24}
          cx={1}
          cy={1}
          cr={1}
          className={cn(
            "opacity-100 dark:opacity-100",
            "fill-foreground/10 dark:fill-foreground/5",
            "z-0"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-background/5 to-background/10 dark:from-foreground/5 dark:via-foreground/2 dark:to-foreground/5 z-10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            className="space-y-6 lg:pr-12"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-montserrat">
              <span className="inline-block text-xs md:text-sm font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-4">
                I believe
              </span>

              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                <span className="block">Creating <span className="text-orange-accent font-medium">practical</span>,</span>
                <span className="font-extrabold">real-world solutions</span>
                <span className="block">that <span className="text-orange-accent font-normal">deliver</span></span>
                <span className="font-extrabold text-orange-accent">actual business value</span>
              </h2>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-8 max-w-2xl leading-relaxed">
                With a focus on simplicity and effectiveness, I help businesses transform their ideas into impactful digital experiences.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className={cn(
                  "inline-flex items-center px-8 py-4 rounded-lg font-bold text-white tracking-wide transition-all duration-300",
                  "bg-orange-accent hover:bg-orange-500 hover:shadow-lg hover:-translate-y-0.5",
                  "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                )}
              >
                Discover My Journey
                <svg
                  className="ml-3 w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </motion.div>

          {/* Image with Tilt Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-[400px] lg:h-[500px] w-full"
          >
            <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl group">
              <Image
                src="/farzad-bayat_profile_2AI.JPG"
                alt="Farzad Bayat - AI Consultant & Developer"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />

              {/* Interactive overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 z-10">
                <div className="flex gap-3">
                  <a
                    href="/farzad-bayat_profile_2AI.JPG"
                    download="farzad-bayat-profile.jpg"
                    className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                    aria-label="Download profile image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-accent/30 transition-all duration-500 rounded-2xl pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
