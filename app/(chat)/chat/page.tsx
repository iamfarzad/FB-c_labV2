"use client"

import { FbcInput } from "./components/FbcInput"

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full mb-4 dark:bg-blue-900/30 dark:text-blue-300">
            Powered by Google Gemini 2.5
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Ask F.B/c AI Anything</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Your next-generation AI consulting service and technology showcase.
          </p>
        </div>
        <FbcInput />
      </div>
    </div>
  )
}
