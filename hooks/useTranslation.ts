import { useTranslation as useNextTranslation } from 'next-i18next'
import { TFunction } from 'i18next'

// Define the available namespaces
export type Namespace = 'common' | 'homepage' | 'chat'

// Define the translation keys for each namespace
export interface TranslationKeys {
  common: {
    navigation: {
      home: string
      about: string
      contact: string
      consulting: string
      workshop: string
      chat: string
      admin: string
    }
    buttons: {
      getStarted: string
      learnMore: string
      submit: string
      cancel: string
      save: string
      delete: string
      edit: string
      close: string
      back: string
      next: string
      previous: string
      loading: string
      tryAgain: string
    }
    forms: {
      name: string
      email: string
      message: string
      phone: string
      company: string
      required: string
      optional: string
      invalidEmail: string
      fieldRequired: string
    }
    status: {
      success: string
      error: string
      warning: string
      info: string
      loading: string
      completed: string
      pending: string
      failed: string
    }
    time: {
      now: string
      today: string
      yesterday: string
      tomorrow: string
      thisWeek: string
      lastWeek: string
      thisMonth: string
      lastMonth: string
    }
    language: {
      english: string
      norwegian: string
      selectLanguage: string
    }
  }
  homepage: {
    hero: {
      title: string
      subtitle: string
      cta: string
      learnMore: string
    }
    features: {
      title: string
      subtitle: string
      items: {
        automation: {
          title: string
          description: string
        }
        insights: {
          title: string
          description: string
        }
        scalability: {
          title: string
          description: string
        }
        support: {
          title: string
          description: string
        }
      }
    }
    testimonials: {
      title: string
      subtitle: string
    }
    cta: {
      title: string
      subtitle: string
      button: string
      contact: string
    }
  }
  chat: {
    interface: {
      title: string
      placeholder: string
      send: string
      clear: string
      newChat: string
      typing: string
      connecting: string
      connected: string
      disconnected: string
    }
    messages: {
      welcome: string
      error: string
      networkError: string
      rateLimited: string
      invalidInput: string
      processing: string
      thinking: string
      generating: string
    }
    actions: {
      copy: string
      copied: string
      regenerate: string
      like: string
      dislike: string
      share: string
      export: string
      delete: string
      edit: string
    }
    settings: {
      title: string
      model: string
      temperature: string
      maxTokens: string
      systemPrompt: string
      save: string
      reset: string
    }
    history: {
      title: string
      empty: string
      clear: string
      export: string
      search: string
    }
    upload: {
      title: string
      dragDrop: string
      supported: string
      maxSize: string
      uploading: string
      success: string
      error: string
    }
  }
}

// Custom hook with TypeScript support
export function useTranslation<T extends Namespace = 'common'>(
  namespace?: T
): {
  t: TFunction
  i18n: any
  ready: boolean
} {
  return useNextTranslation(namespace || 'common')
}

// Helper function to get nested translation keys
export function getNestedTranslation(
  t: TFunction,
  key: string,
  options?: any
): string {
  return t(key, options) as string
}

// Type-safe translation function
export function useTypedTranslation<T extends Namespace>(namespace: T) {
  const { t, i18n, ready } = useNextTranslation(namespace)
  
  return {
    t: t as TFunction,
    i18n,
    ready,
  }
}
