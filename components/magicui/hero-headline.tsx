"use client"

import React from "react"

export const HeroHeadline: React.FC = () => (
  <div className="fixed left-0 right-0 bottom-[15%] z-40 pointer-events-none">
    <h1
      className="font-black text-white text-center"
      style={{
        fontFamily: "var(--font-tech, Arial Black), Arial, sans-serif",
        fontSize: "clamp(4rem, 15vw, 12rem)",
        lineHeight: 0.8,
        letterSpacing: "-0.02em",
        textShadow: "0 0 50px rgba(255,255,255,0.3)",
        filter: "contrast(1.2)",
      }}
    >
      IAMFARZAD
    </h1>
  </div>
)
