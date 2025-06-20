"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface SkillCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  skills: { name: string; level: number }[]
  color: string
  className?: string
  theme?: "light" | "dark"
}

export function SkillCard({
  icon: Icon,
  title,
  description,
  skills,
  color,
  className,
  theme = "light"
}: SkillCardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const bgGradient = `bg-gradient-to-br ${color}`
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900"
  const mutedTextColor = theme === "dark" ? "text-gray-300/80" : "text-gray-600/90"
  const cardBg = theme === "dark" ? "bg-gray-900/80" : "bg-white/90"

  return (
    <div
      className={cn("h-full w-full cursor-pointer", className)}
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="h-full w-full rounded-2xl overflow-hidden relative"
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px"
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 0.77, 0.47, 0.97] }}
      >
        {/* Front of Card */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center text-center backface-hidden",
            cardBg,
            "border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
          )}
          style={{ backfaceVisibility: "hidden" }}
          animate={{
            opacity: isFlipped ? 0 : 1,
            rotateY: 0
          }}
        >
          <div className={cn("p-4 rounded-2xl mb-5", bgGradient, "shadow-lg")}>
            <Icon className={cn("h-8 w-8", textColor)} />
          </div>
          <h3 className={cn("text-xl font-bold mb-2", textColor)}>{title}</h3>
          {description && (
            <p className={cn("text-sm mb-4", mutedTextColor)}>{description}</p>
          )}
          <div className="w-full mt-4">
            {skills.slice(0, 3).map((skill, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className={mutedTextColor}>{skill.name}</span>
                  <span className={mutedTextColor}>{skill.level}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", {
                      [color.split(" ")[0]]: true
                    })}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{
                      duration: 1,
                      delay: 0.2 + (index * 0.1),
                      ease: [0.16, 0.77, 0.47, 0.97]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <motion.div
            className={cn(
              "absolute bottom-4 text-xs font-medium",
              isHovered ? textColor : mutedTextColor,
              "transition-colors duration-300 flex items-center"
            )}
          >
            Tap for details
            <motion.span
              className="ml-1"
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{
                repeat: isHovered ? Infinity : 0,
                repeatType: "reverse",
                duration: 0.8
              }}
            >
              →
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Back of Card */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center",
            cardBg,
            "border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
          animate={{
            opacity: isFlipped ? 1 : 0,
            rotateY: 180
          }}
        >
          <h3 className={cn("text-xl font-bold mb-4", textColor)}>Skills Details</h3>
          <div className="w-full space-y-4">
            {skills.map((skill, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className={mutedTextColor}>{skill.name}</span>
                  <span className={cn("font-medium", textColor)}>{skill.level}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", {
                      [color.split(" ")[0]]: true
                    })}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{
                      duration: 1,
                      delay: 0.1 + (index * 0.05),
                      ease: [0.16, 0.77, 0.47, 0.97]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <motion.div
            className={cn(
              "absolute bottom-4 text-xs font-medium cursor-pointer",
              "text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300",
              "transition-colors duration-300 flex items-center"
            )}
            onClick={(e) => {
              e.stopPropagation()
              setIsFlipped(false)
            }}
          >
            ← Back to front
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
