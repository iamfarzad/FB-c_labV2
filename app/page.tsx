import { Metadata } from 'next'
import HomePage from './HomePage'

export const metadata: Metadata = {
  title: 'AI Consultant & Builder | Farzad Bayat - Transform Your Business with AI',
  description: '10,000+ hours building AI solutions. Transform your business with proven AI consulting, custom implementations, and practical training. See 300% ROI increase with our strategic AI solutions.',
  keywords: [
    'AI consultant',
    'AI implementation',
    'business automation',
    'AI training',
    'custom AI solutions',
    'machine learning consultant',
    'AI strategy',
    'Farzad Bayat'
  ],
  authors: [{ name: 'Farzad Bayat' }],
  creator: 'Farzad Bayat',
  publisher: 'F.B/c AI Consulting',
  openGraph: {
    title: 'AI Consultant & Builder | Farzad Bayat',
    description: 'Transform your business with proven AI solutions. 10,000+ hours of experience delivering 300% ROI increases through strategic AI implementation.',
    url: 'https://farzadbayat.com',
    siteName: 'F.B/c AI Consulting',
    images: [
      {
        url: '/farzad-bayat_profile_2AI.JPG',
        width: 1200,
        height: 630,
        alt: 'Farzad Bayat - AI Consultant and Builder',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Consultant & Builder | Farzad Bayat',
    description: 'Transform your business with proven AI solutions. 10,000+ hours of experience.',
    images: ['/farzad-bayat_profile_2AI.JPG'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your actual verification code
  },
  alternates: {
    canonical: 'https://farzadbayat.com',
  },
  category: 'technology',
}

// Structured Data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Farzad Bayat',
  jobTitle: 'AI Consultant & Builder',
  description: 'Expert AI consultant with 10,000+ hours building AI solutions for businesses',
  url: 'https://farzadbayat.com',
  image: 'https://farzadbayat.com/farzad-bayat_profile_2AI.JPG',
  sameAs: [
    'https://linkedin.com/in/farzadbayat',
    'https://github.com/farzadbayat',
  ],
  knowsAbout: [
    'Artificial Intelligence',
    'Machine Learning',
    'Business Automation',
    'AI Strategy',
    'Custom AI Solutions'
  ],
  offers: {
    '@type': 'Service',
    name: 'AI Consulting Services',
    description: 'Transform your business with proven AI solutions',
    provider: {
      '@type': 'Person',
      name: 'Farzad Bayat'
    }
  }
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage />
    </>
  )
}
