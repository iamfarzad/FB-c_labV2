const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'no'],
    localePath: path.resolve('./public/locales'),
    localeDetection: true,
  },
  fallbackLng: {
    'no': ['en'],
    default: ['en']
  },
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  
  // Namespace configuration
  ns: ['common', 'homepage', 'chat'],
  defaultNS: 'common',
  
  // Interpolation options
  interpolation: {
    escapeValue: false, // React already does escaping
  },
  
  // Server-side rendering options
  serializeConfig: false,
  use: [],
}
