/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* tslint:disable */

"use client"

import React from "react"
import ReactDOM from "react-dom/client"
import FBCAIChat from "@/app/page"
import { DataContext } from "@/context/data-context"
import type { Example } from "@/lib/types"

interface DataProviderProps {
  children: React.ReactNode
}

function DataProvider({ children }: DataProviderProps) {
  const [examples, setExamples] = React.useState<Example[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    setIsLoading(true)
    fetch("/data/examples.json")
      .then((res) => res.json())
      .then((fetchedData: Example[]) => {
        setExamples(fetchedData)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load examples:", error)
        setIsLoading(false)
      })
  }, [])

  const empty: Example = {
    title: "",
    url: "",
    spec: "",
    code: "",
    description: "",
    category: "general",
  }

  const value = {
    examples,
    isLoading,
    setExamples,
    defaultExample: examples.length > 0 ? examples[0] : empty,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// F.B/c AI Enhanced App Component
function FBCAIApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-light-silver)] to-[var(--color-gunmetal)] dark:from-[var(--color-gunmetal)] dark:to-[var(--color-gunmetal-lighter)]">
      <style jsx global>{`
        :root {
          --color-orange-accent: #FF5B04;
          --color-gunmetal: #233038;
          --color-light-silver: #D3DBDD;
          --color-gunmetal-light-alpha: rgba(35, 48, 56, 0.85);
          --color-light-silver-dark-alpha: rgba(211, 219, 221, 0.95);
          --color-gunmetal-lighter: #3A4C5A;
          --color-light-silver-darker: #BBC4C7;
          --color-orange-accent-hover: #E65200;
          --color-orange-accent-light: #FF8F6A;
          --color-text-on-orange: #FFFFFF;
          --shadow-soft: 0 8px 32px rgba(0, 0, 0, 0.1);
          --shadow-medium: 0 12px 40px rgba(0, 0, 0, 0.15);
          --shadow-strong: 0 20px 60px rgba(0, 0, 0, 0.2);
          --gradient-orange: linear-gradient(135deg, #FF5B04 0%, #FF8F6A 100%);
          --gradient-glass: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          height: 100%;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          overflow-x: hidden;
        }

        body {
          background: linear-gradient(135deg, var(--color-light-silver) 0%, var(--color-gunmetal) 100%);
          color: var(--color-gunmetal);
          transition: all 0.3s ease;
        }

        .dark body {
          background: linear-gradient(135deg, var(--color-gunmetal) 0%, var(--color-gunmetal-lighter) 100%);
          color: var(--color-light-silver);
        }

        .glassmorphism {
          background: var(--color-light-silver-dark-alpha);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: var(--shadow-soft);
        }

        .dark .glassmorphism {
          background: var(--color-gunmetal-light-alpha);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .gradient-text {
          background: var(--gradient-orange);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .surface-glow {
          box-shadow: 0 0 30px rgba(255, 91, 4, 0.2);
        }

        .floating-element {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .slide-in {
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <FBCAIChat />
    </div>
  )
}

// Initialize the app
if (typeof window !== "undefined") {
  const rootElement = document.getElementById("root")
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <DataProvider>
          <FBCAIApp />
        </DataProvider>
      </React.StrictMode>,
    )
  }
}

export default FBCAIApp
