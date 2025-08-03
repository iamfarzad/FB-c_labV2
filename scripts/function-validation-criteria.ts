#!/usr/bin/env tsx

import type { ValidationCriteria } from './validation-pipeline'

export const FUNCTION_VALIDATION_CRITERIA: Record<string, ValidationCriteria> = {
  'Voice Input & Recognition': {
    backend: {
      apiEndpoint: '/api/tools/voice-transcript',
      requestSchema: {
        audioData: 'data:audio/webm;base64,test',
        mimeType: 'audio/webm'
      },
      responseSchema: { text: 'string' },
      errorHandling: true,
      performance: true
    },
    frontend: {
      componentPath: 'components/chat/tools/VoiceInput/VoiceInput.tsx',
      propsInterface: true,
      errorBoundary: true,
      accessibility: true,
      responsive: true
    },
    database: {
      tableExists: ['activities', 'ai_responses'],
      rlsPolicies: true,
      indexes: true,
      constraints: true
    },
    api: {
      endpointExists: true,
      methodSupport: ['POST'],
      authentication: false,
      rateLimiting: true
    },
    bestPractices: {
      typescript: true,
      errorHandling: true,
      logging: true,
      security: true,
      documentation: true
    }
  },

  'Webcam Capture & Processing': {
    backend: {
      apiEndpoint: '/api/tools/webcam-capture',
      requestSchema: {
        image: 'data:image/jpeg;base64,test',
        type: 'image/jpeg'
      },
      responseSchema: { analysis: 'string' },
      errorHandling: true,
      performance: true
    },
    frontend: {
      componentPath: 'components/chat/tools/WebcamCapture/WebcamCapture.tsx',
      propsInterface: true,
      errorBoundary: true,
      accessibility: true,
      responsive: true
    },
    database: {
      tableExists: ['activities', 'ai_responses'],
      rlsPolicies: true,
      indexes: true,
      constraints: true
    },
    api: {
      endpointExists: true,
      methodSupport: ['POST'],
      authentication: false,
      rateLimiting: true
    },
    bestPractices: {
      typescript: true,
      errorHandling: true,
      logging: true,
      security: true,
      documentation: true
    }
  },

  'Screen Share & Analysis': {
    backend: {
      apiEndpoint: '/api/tools/screen-share',
      requestSchema: {
        image: 'data:image/jpeg;base64,test',
        type: 'image/jpeg'
      },
      responseSchema: { analysis: 'string' },
      errorHandling: true,
      performance: true
    },
    frontend: {
      componentPath: 'components/chat/tools/ScreenShare/ScreenShare.tsx',
      propsInterface: true,
      errorBoundary: true,
      accessibility: true,
      responsive: true
    },
    database: {
      tableExists: ['activities', 'ai_responses'],
      rlsPolicies: true,
      indexes: true,
      constraints: true
    },
    api: {
      endpointExists: true,
      methodSupport: ['POST'],
      authentication: false,
      rateLimiting: true
    },
    bestPractices: {
      typescript: true,
      errorHandling: true,
      logging: true,
      security: true,
      documentation: true
    }
  },

  'ROI Calculator & Business Tools': {
    backend: {
      apiEndpoint: '/api/tools/roi-calculation',
      requestSchema: {
        currentCosts: 5000,
        projectedSavings: 3500,
        implementationCost: 500,
        timeFrameMonths: 12
      },
      responseSchema: { roi: 'number' },
      errorHandling: true,
      performance: true
    },
    frontend: {
      componentPath: 'components/chat/tools/ROICalculator/ROICalculator.tsx',
      propsInterface: true,
      errorBoundary: true,
      accessibility: true,
      responsive: true
    },
    database: {
      tableExists: ['activities'],
      rlsPolicies: true,
      indexes: true,
      constraints: true
    },
    api: {
      endpointExists: true,
      methodSupport: ['POST'],
      authentication: false,
      rateLimiting: true
    },
    bestPractices: {
      typescript: true,
      errorHandling: true,
      logging: true,
      security: true,
      documentation: true
    }
  },

  'PDF Summary & Email System': {
    backend: {
      apiEndpoint: '/api/export-summary',
      requestSchema: {
        leadInfo: { name: 'Test', email: 'test@example.com' },
        conversationHistory: [],
        leadResearch: { conversation_summary: 'Test' },
        sessionId: 'test-123'
      },
      responseSchema: { pdf: 'binary' },
      errorHandling: true,
      performance: true
    },
    frontend: {
      componentPath: 'components/chat/header/components/ExportButton.tsx',
      propsInterface: true,
      errorBoundary: true,
      accessibility: true,
      responsive: true
    },
    database: {
      tableExists: ['lead_summaries', 'email_campaigns'],
      rlsPolicies: true,
      indexes: true,
      constraints: true
    },
    api: {
      endpointExists: true,
      methodSupport: ['POST'],
      authentication: false,
      rateLimiting: true
    },
    bestPractices: {
      typescript: true,
      errorHandling: true,
      logging: true,
      security: true,
      documentation: true
    }
  },

  'Video-to-Learning App': {
    backend: {
      apiEndpoint: '/api/video-to-app',
      requestSchema: {
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        userPrompt: 'Create a learning module about the cultural impact of this song.'
      },
      responseSchema: { appUrl: 'string' },
      errorHandling: true,
      performance: true
    },
    frontend: {
      componentPath: 'components/chat/tools/VideoToApp/VideoToApp.tsx',
      propsInterface: true,
      errorBoundary: true,
      accessibility: true,
      responsive: true
    },
    database: {
      tableExists: ['activities', 'ai_responses'],
      rlsPolicies: true,
      indexes: true,
      constraints: true
    },
    api: {
      endpointExists: true,
      methodSupport: ['POST'],
      authentication: false,
      rateLimiting: true
    },
    bestPractices: {
      typescript: true,
      errorHandling: true,
      logging: true,
      security: true,
      documentation: true
    }
  }
}
