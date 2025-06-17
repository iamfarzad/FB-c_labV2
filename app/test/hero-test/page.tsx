"use client"

import { useState } from "react"
import HeroEnhanced from "@/components/magicui/hero-enhanced"

export default function HeroTestPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light")
  }

  const handleStartChat = () => {
    console.log("Start chat clicked")
    // Add your chat initialization logic here
  }

  return (
    <div className={theme}>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={toggleTheme}
            className="mb-8 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Toggle Theme ({theme === "light" ? "🌞" : "🌙"})
          </button>
          
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            HeroEnhanced Component Test
          </h1>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
            <HeroEnhanced 
              theme={theme} 
              onStartChat={handleStartChat} 
            />
          </div>
          
          <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Test Instructions
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Verify the component renders correctly in both light and dark themes</li>
              <li>Check that all interactive elements (buttons, etc.) work as expected</li>
              <li>Verify animations are smooth and performant</li>
              <li>Test responsiveness on different screen sizes</li>
              <li>Check console for any errors or warnings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
