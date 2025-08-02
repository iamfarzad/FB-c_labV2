'use client';

import React from 'react';
import { ConversationStage } from '@/lib/lead-manager';

interface LeadProgressIndicatorProps {
  currentStage: ConversationStage;
  leadData?: {
    name?: string;
    email?: string;
    company?: string;
  };
  className?: string;
}

const stageConfig = {
  [ConversationStage.GREETING]: {
    label: 'Welcome',
    description: 'Initial greeting',
    icon: '👋',
    color: 'bg-blue-500',
    order: 1
  },
  [ConversationStage.NAME_COLLECTION]: {
    label: 'Introduction',
    description: 'Getting to know you',
    icon: '👤',
    color: 'bg-green-500',
    order: 2
  },
  [ConversationStage.EMAIL_CAPTURE]: {
    label: 'Contact Info',
    description: 'Email collection',
    icon: '📧',
    color: 'bg-yellow-500',
    order: 3
  },
  [ConversationStage.BACKGROUND_RESEARCH]: {
    label: 'Research',
    description: 'Company analysis',
    icon: '🔬',
    color: 'bg-indigo-500',
    order: 4
  },
  [ConversationStage.PROBLEM_DISCOVERY]: {
    label: 'Discovery',
    description: 'Understanding needs',
    icon: '🔍',
    color: 'bg-purple-500',
    order: 5
  },
  [ConversationStage.SOLUTION_PRESENTATION]: {
    label: 'Solution',
    description: 'Presenting options',
    icon: '💡',
    color: 'bg-orange-500',
    order: 6
  },
  [ConversationStage.CALL_TO_ACTION]: {
    label: 'Next Steps',
    description: 'Ready to proceed',
    icon: '🚀',
    color: 'bg-red-500',
    order: 7
  }
};

export function LeadProgressIndicator({ currentStage, leadData, className = '' }: LeadProgressIndicatorProps) {
  const stages = Object.entries(stageConfig).sort(([, a], [, b]) => a.order - b.order);
  const currentStageOrder = stageConfig[currentStage]?.order || 1;

  return (
    <div className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg border border-orange-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Conversation Progress
        </h3>
        {leadData?.name && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {leadData.name}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Stage {currentStageOrder} of {stages.length}</span>
          <span className="text-orange-600 font-medium">{Math.round((currentStageOrder / stages.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full transition-all duration-500 ease-in-out shadow-sm"
            style={{ width: `${(currentStageOrder / stages.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Vertical Stage Indicators */}
      <div className="space-y-2">
        {stages.map(([stage, config], index) => {
          const isCompleted = config.order < currentStageOrder;
          const isCurrent = stage === currentStage;
          const isUpcoming = config.order > currentStageOrder;

          return (
            <div key={stage} className="flex items-center gap-3 relative">
              {/* Stage Circle */}
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 flex-shrink-0
                ${isCompleted ? 'bg-green-500 text-white shadow-sm' : ''}
                ${isCurrent ? 'bg-orange-500 text-white ring-2 ring-orange-200 shadow-md' : ''}
                ${isUpcoming ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400' : ''}
              `}>
                {isCompleted ? '✓' : config.icon}
              </div>

              {/* Vertical Connection Line */}
              {index < stages.length - 1 && (
                <div className={`
                  absolute left-3 top-6 w-0.5 h-4 -z-10
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}
                `} />
              )}

              {/* Stage Info */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${
                  isCurrent ? 'text-orange-600 dark:text-orange-400' : 
                  isCompleted ? 'text-green-600 dark:text-green-400' : 
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {config.label}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {config.description}
                </div>
              </div>

              {/* Current Stage Indicator */}
              {isCurrent && (
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Stage Info */}
      <div className="mt-3 p-2.5 bg-orange-50 dark:bg-gray-700 rounded-lg border border-orange-100">
        <div className="flex items-center space-x-2">
          <span className="text-base">{stageConfig[currentStage]?.icon}</span>
          <div>
            <div className="text-sm font-medium text-orange-900 dark:text-gray-100">
              {stageConfig[currentStage]?.label}
            </div>
            <div className="text-xs text-orange-600 dark:text-gray-400">
              {stageConfig[currentStage]?.description}
            </div>
          </div>
        </div>
      </div>

      {/* Lead Data Summary */}
      {leadData && (
        <div className="mt-3 space-y-1">
          {leadData.name && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Name:</span>
              <span className="text-gray-900 dark:text-gray-100">{leadData.name}</span>
            </div>
          )}
          {leadData.email && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Email:</span>
              <span className="text-gray-900 dark:text-gray-100">{leadData.email}</span>
            </div>
          )}
          {leadData.company && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Company:</span>
              <span className="text-gray-900 dark:text-gray-100">{leadData.company}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
