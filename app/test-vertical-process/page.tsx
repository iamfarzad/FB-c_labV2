"use client"

import React, { useState, useEffect } from 'react'
import { VerticalProcessChain } from '@/components/chat/activity/VerticalProcessChain'
import { FixedVerticalProcessChain } from '@/components/chat/activity/FixedVerticalProcessChain'
import type { ActivityItem } from '@/app/(chat)/chat/types/chat'

export default function TestVerticalProcessPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])

  // Simulate AI reasoning flow
  useEffect(() => {
    const addActivity = (activity: Omit<ActivityItem, "id" | "timestamp">) => {
      setActivities(prev => [...prev, { 
        ...activity, 
        id: Date.now().toString() + Math.random(),
        timestamp: Date.now()
      }])
    }

    const simulateAIFlow = () => {
      // Clear existing activities
      setActivities([])
      
      // Start with user input
      addActivity({
        type: 'user_action',
        title: 'Input Received',
        description: 'User query processed',
        status: 'completed'
      })

      // AI thinking
      setTimeout(() => {
        addActivity({
          type: 'ai_thinking',
          title: 'Analyzing Context',
          description: 'Processing semantic meaning',
          status: 'in_progress'
        })
      }, 800)
      
      // Complete thinking and start search
      setTimeout(() => {
        setActivities(prev => prev.map(a => 
          a.title === 'Analyzing Context' ? { ...a, status: 'completed' } : a
        ))
        addActivity({
          type: 'google_search',
          title: 'External Search',
          description: 'Fetching real-time data',
          status: 'in_progress'
        })
      }, 2200)
      
      // Complete search and start processing
      setTimeout(() => {
        setActivities(prev => prev.map(a => 
          a.title === 'External Search' ? { ...a, status: 'completed' } : a
        ))
        addActivity({
          type: 'doc_analysis',
          title: 'Processing Results',
          description: 'Analyzing retrieved information',
          status: 'in_progress'
        })
      }, 4000)
      
      // Complete processing and generate response
      setTimeout(() => {
        setActivities(prev => prev.map(a => 
          a.title === 'Processing Results' ? { ...a, status: 'completed' } : a
        ))
        addActivity({
          type: 'ai_stream',
          title: 'Generating Response',
          description: 'Creating final output',
          status: 'completed'
        })
      }, 6200)
    }

    // Start simulation
    simulateAIFlow()
    
    // Repeat every 12 seconds
    const interval = setInterval(simulateAIFlow, 12000)
    
    return () => clearInterval(interval)
  }, [])

  const handleActivityClick = (activity: ActivityItem) => {
    console.info('Activity clicked:', activity)
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed Vertical Process Chain - Left Edge */}
      <FixedVerticalProcessChain 
        activities={activities} 
        onActivityClick={handleActivityClick}
      />
      
      {/* Demo content */}
      <div className="pt-12 pb-12 px-8 ml-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Vertical AI Process Chain Demo
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Minimal vertical chain showing AI reasoning flow on the left edge
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">Design Principles</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>• Minimal monochrome aesthetic</li>
                <li>• Vertical flow from top to bottom</li>
                <li>• Size indicates process status</li>
                <li>• Clean connection lines</li>
                <li>• Non-intrusive positioning</li>
              </ul>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">Node States</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-muted-foreground/60 flex items-center justify-center">
                    <div className="w-3 h-3 text-foreground">●</div>
                  </div>
                  <span>Active Process (pulsing, large)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-muted-foreground/40 border border-muted-foreground/30"></div>
                  <span>Completed (medium, filled)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30 border border-muted-foreground/20 opacity-40"></div>
                  <span>Pending (small, faded)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 bg-card rounded-lg p-8 shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Sample Content Area</h3>
            <p className="text-muted-foreground mb-4">
              This is your main content area. The process chain sits quietly on the left edge, 
              showing the AI's reasoning steps without interfering with your primary interface.
            </p>
            <p className="text-muted-foreground mb-4">
              Hover over the nodes in the chain to see detailed tooltips with process information. 
              The active processes will pulse and appear larger, while completed steps fade to smaller sizes.
            </p>
            <p className="text-muted-foreground">
              The vertical layout works well for longer reasoning chains and takes up minimal horizontal space.
            </p>
          </div>

          {/* Embedded Vertical Process Chain */}
          <div className="mt-12 bg-card rounded-lg p-8 shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Embedded Process Chain</h3>
            <div className="flex justify-center">
              <VerticalProcessChain 
                activities={activities} 
                onActivityClick={handleActivityClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
