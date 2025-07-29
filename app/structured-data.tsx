import Script from 'next/script'

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Farzad Bayat",
    "jobTitle": "AI Consultant & Automation Expert",
    "description": "AI consultant with 10,000+ hours of real-world AI implementation experience. Specializes in AI automation, chatbot development, and AI consulting services.",
    "url": "https://farzadbayat.com",
    "image": "https://farzadbayat.com/placeholder.svg",
    "sameAs": [
      "https://linkedin.com/in/farzadbayat",
      "https://twitter.com/farzadbayat"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "F.B AI Consulting",
      "url": "https://farzadbayat.com"
    },
    "knowsAbout": [
      "Artificial Intelligence",
      "AI Automation",
      "Chatbot Development",
      "AI Implementation",
      "Machine Learning",
      "Business AI",
      "AI Consulting",
      "AI Training"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "AI Consulting Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Consulting & Automation",
            "description": "Custom AI automation solutions including chatbots, copilots, and workflow automation"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Training Workshops",
            "description": "Hands-on AI training for teams to learn AI implementation and automation"
          }
        }
      ]
    }
  }

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}