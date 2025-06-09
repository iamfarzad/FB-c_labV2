"use client"

import type React from "react"
import { useState } from "react"
import {
  X,
  FileText,
  Download,
  ChevronDown,
  ChevronRight,
  Loader2,
  MessageSquare,
  Clock,
  User,
  Bot,
  BarChart3,
  FileDown,
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

interface ChatSidePanelProps {
  theme: "light" | "dark"
  onClose: () => void
  chatHistory: ChatMessage[]
  onDownloadTranscript?: () => void
  onSummarizeChat?: () => void
  onGenerateFollowUpBrief?: () => void
  summaryData?: any
  isLoading?: boolean
  summaryError?: string | null
}

export const ChatSidePanel: React.FC<ChatSidePanelProps> = ({
  theme,
  onClose,
  chatHistory,
  onDownloadTranscript,
  onSummarizeChat,
  onGenerateFollowUpBrief,
  summaryData,
  isLoading = false,
  summaryError,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["summary"]))
  const [activeTab, setActiveTab] = useState<"summary" | "analytics" | "export">("summary")

  const handleDownloadSummary = () => {
    if (!summaryData?.summary) return
    const blob = new Blob([summaryData.summary], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "AI_Conversation_Summary.txt"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) newExpanded.delete(sectionId)
    else newExpanded.add(sectionId)
    setExpandedSections(newExpanded)
  }

  const panelBg =
    theme === "dark"
      ? "bg-[var(--color-gunmetal)]/95 border-[var(--color-gunmetal-lighter)]"
      : "bg-white/95 border-[var(--color-light-silver-darker)]"

  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg =
    theme === "dark"
      ? "bg-[var(--color-gunmetal-lighter)]/50 border-[var(--color-gunmetal-lighter)]"
      : "bg-[var(--color-light-silver)]/30 border-[var(--color-light-silver-darker)]"

  const tabs = [
    { id: "summary", label: "Summary", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "export", label: "Export", icon: FileDown },
  ]

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden glassmorphism ${panelBg} border-l slide-in`}>
      {/* Header */}
      <div
        className={`flex-shrink-0 px-6 py-4 border-b ${theme === "dark" ? "border-[var(--color-gunmetal-lighter)]" : "border-[var(--color-light-silver-darker)]"} bg-gradient-to-r ${theme === "dark" ? "from-[var(--color-orange-accent)]/10 to-transparent" : "from-[var(--color-orange-accent)]/5 to-transparent"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl glassmorphism border`}>
              <FileText size={18} className="text-[var(--color-orange-accent)]" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${textColor} gradient-text`}>Analytics Hub</h3>
              <p className={`text-sm ${mutedTextColor}`}>Chat insights & tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 ${
              theme === "dark"
                        ? "text-[var(--color-light-silver)]/90 hover:text-[var(--color-light-silver)]"
        : "text-[var(--color-gunmetal)]/90 hover:text-[var(--color-gunmetal)]"
            } focus:outline-none focus:ring-2 focus:ring-[var(--color-orange-accent)]/30 group`}
            aria-label="Close side panel"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex space-x-2 p-1 glassmorphism rounded-xl">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex-1 justify-center ${
                activeTab === id
                  ? "bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white shadow-lg transform scale-105"
                  : `${mutedTextColor} hover:bg-[var(--color-orange-accent)]/10 hover:text-[var(--color-orange-accent)] hover:scale-105`
              }`}
              data-backend-tab={id}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="p-4 space-y-4">
            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className={`text-xs font-semibold uppercase tracking-wider ${mutedTextColor}`}>Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={onSummarizeChat}
                  disabled={isLoading || chatHistory.length === 0}
                  className={`flex items-center justify-center space-x-3 p-4 rounded-xl border w-full transition-all duration-300 glassmorphism group ${
                    isLoading || chatHistory.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:surface-glow hover:scale-105"
                  }`}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)]">
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin text-white" />
                    ) : (
                      <MessageSquare size={16} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-medium ${textColor}`}>
                      {isLoading ? "Generating..." : "Generate Summary"}
                    </div>
                    <div className={`text-xs ${mutedTextColor}`}>AI-powered analysis</div>
                  </div>
                </button>

                <button
                  onClick={onGenerateFollowUpBrief}
                  disabled={isLoading || chatHistory.length === 0}
                  className={`flex items-center justify-center space-x-2 p-2 rounded-lg border w-full transition-all duration-200 ${cardBg} ${
                    isLoading || chatHistory.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-[var(--color-orange-accent)]/50 hover:bg-[var(--color-orange-accent)]/5"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin text-[var(--color-orange-accent)]" />
                  ) : (
                    <Clock size={14} className="text-[var(--color-orange-accent)]" />
                  )}
                  <span className={`text-xs font-medium ${textColor}`}>
                    {isLoading ? "Generating..." : "Follow-up Brief"}
                  </span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {summaryError && (
              <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 text-xs">
                {summaryError}
              </div>
            )}

            {/* Summary Content */}
            {summaryData && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-semibold uppercase tracking-wider ${mutedTextColor}`}>
                    Summary Results
                  </h4>
                  <button
                    onClick={handleDownloadSummary}
                    className="flex items-center space-x-1 text-xs text-[var(--color-orange-accent)] hover:underline"
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </button>
                </div>

                {Object.entries(summaryData).map(([key, value]) => (
                  <div key={key} className={`border rounded-lg ${cardBg}`}>
                    <button
                      onClick={() => toggleSection(key)}
                      className="w-full flex items-center justify-between p-3 hover:bg-[var(--color-orange-accent)]/5 transition-colors duration-200"
                    >
                      <span className={`font-medium capitalize text-sm ${textColor}`}>
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      {expandedSections.has(key) ? (
                        <ChevronDown size={14} className="text-[var(--color-orange-accent)]" />
                      ) : (
                        <ChevronRight size={14} className={mutedTextColor} />
                      )}
                    </button>
                    {expandedSections.has(key) && (
                      <div className="px-3 pb-3">
                        <div className={`text-xs leading-relaxed ${textColor}`}>
                          {Array.isArray(value) ? (
                            <ul className="space-y-1">
                              {(value as any[]).map((item, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <div className="w-1 h-1 rounded-full bg-[var(--color-orange-accent)] mt-1.5 flex-shrink-0" />
                                  <span>{String(item)}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>{String(value)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-4 rounded-xl glassmorphism border hover:surface-glow transition-all duration-300 group`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-1 rounded-lg bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)]">
                    <MessageSquare size={12} className="text-white" />
                  </div>
                  <span className={`text-xs font-medium uppercase tracking-wider ${mutedTextColor}`}>Messages</span>
                </div>
                <div className={`text-2xl font-bold ${textColor} group-hover:scale-110 transition-transform`}>
                  {chatHistory.length}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${cardBg}`}>
                <div className="flex items-center space-x-1 mb-1">
                  <User size={12} className="text-[var(--color-orange-accent)]" />
                  <span className={`text-xs font-medium uppercase tracking-wider ${mutedTextColor}`}>User</span>
                </div>
                <div className={`text-lg font-bold ${textColor}`}>
                  {chatHistory.filter((msg) => msg.role === "user").length}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${cardBg}`}>
                <div className="flex items-center space-x-1 mb-1">
                  <Bot size={12} className="text-[var(--color-orange-accent)]" />
                  <span className={`text-xs font-medium uppercase tracking-wider ${mutedTextColor}`}>Assistant</span>
                </div>
                <div className={`text-lg font-bold ${textColor}`}>
                  {chatHistory.filter((msg) => msg.role === "assistant").length}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${cardBg}`}>
                <div className="flex items-center space-x-1 mb-1">
                  <Clock size={12} className="text-[var(--color-orange-accent)]" />
                  <span className={`text-xs font-medium uppercase tracking-wider ${mutedTextColor}`}>Duration</span>
                </div>
                <div className={`text-lg font-bold ${textColor}`}>{chatHistory.length > 0 ? "5m" : "0m"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === "export" && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h4 className={`text-xs font-semibold uppercase tracking-wider ${mutedTextColor}`}>Export Options</h4>
              <button
                onClick={onDownloadTranscript}
                disabled={chatHistory.length === 0}
                className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${cardBg} ${
                  chatHistory.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-[var(--color-orange-accent)]/50 hover:bg-[var(--color-orange-accent)]/5"
                }`}
              >
                <Download size={14} className="text-[var(--color-orange-accent)]" />
                <span className={`text-sm font-medium ${textColor}`}>Download Transcript</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`flex-shrink-0 px-4 py-2 border-t ${theme === "dark" ? "border-[var(--color-gunmetal-lighter)]" : "border-[var(--color-light-silver-darker)]"} ${theme === "dark" ? "bg-[var(--color-gunmetal)]/30" : "bg-[var(--color-light-silver)]/30"}`}
      >
        <p className={`text-xs text-center ${mutedTextColor}`}>AI-powered analysis</p>
      </div>
    </div>
  )
}
