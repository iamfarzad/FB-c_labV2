"use client"

import React from "react"
import { Zap, Monitor, Users, Video, MessageSquare, Clock, Calendar, MapPin, Wifi, Coffee } from "lucide-react"

interface DeliverySectionProps {
  theme: "light" | "dark"
}

export const DeliverySection: React.FC<DeliverySectionProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const deliveryOptions = [
    {
      title: "In-Person Workshop",
      icon: <Users className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      description: "Join us for an immersive, hands-on experience in a collaborative environment.",
      features: [
        "Live instruction with Q&A",
        "Networking with other participants",
        "Hands-on exercises with direct support",
        "Lunch and refreshments included"
      ],
      details: [
        { icon: <MapPin className="h-4 w-4" />, text: "Location: TBD (Central Berlin)" },
        { icon: <Calendar className="h-4 w-4" />, text: "Date: June 25, 2024" },
        { icon: <Clock className="h-4 w-4" />, text: "Time: 10:00 AM - 4:00 PM CET" },
        { icon: <Wifi className="h-4 w-4" />, text: "WiFi and power outlets provided" },
        { icon: <Coffee className="h-4 w-4" />, text: "Lunch & refreshments included" }
      ]
    },
    {
      title: "Live Online",
      icon: <Video className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      description: "Join the workshop remotely with live streaming and interactive elements.",
      features: [
        "Live video streaming of the workshop",
        "Interactive Q&A sessions",
        "Digital workshop materials",
        "Access to session recordings"
      ],
      details: [
        { icon: <Monitor className="h-4 w-4" />, text: "Platform: Zoom (link provided after registration)" },
        { icon: <Calendar className="h-4 w-4" />, text: "Date: June 25, 2024" },
        { icon: <Clock className="h-4 w-4" />, text: "Time: 10:00 AM - 4:00 PM CET" },
        { icon: <MessageSquare className="h-4 w-4" />, text: "Slack community access included" },
        { icon: <Video className="h-4 w-4" />, text: "Recordings available for 30 days" }
      ]
    },
    {
      title: "Self-Paced",
      icon: <Clock className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      description: "Access the workshop materials at your own pace with pre-recorded content.",
      features: [
        "Full workshop recordings",
        "Downloadable resources",
        "Lifetime access to materials",
        "Email support for questions"
      ],
      details: [
        { icon: <Monitor className="h-4 w-4" />, text: "Access: 24/7 through our learning portal" },
        { icon: <Clock className="h-4 w-4" />, text: "Start anytime" },
        { icon: <MessageSquare className="h-4 w-4" />, text: "Email support" },
        { icon: <Zap className="h-4 w-4" />, text: "Lifetime access to updates" }
      ]
    }
  ]

  return (
    <section className="py-20 relative bg-gradient-to-b from-[var(--color-orange-accent)]/5 to-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Delivery Options</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
            Choose Your <span className="gradient-text">Learning Style</span>
          </h2>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            Flexible options to fit your schedule and learning preferences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {deliveryOptions.map((option, index) => (
            <div 
              key={index}
              className={`${cardBg} ${cardBorder} border rounded-2xl overflow-hidden flex flex-col`}
            >
              <div className="p-6 pb-0">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-orange-accent)]/10 flex items-center justify-center mb-4">
                  {option.icon}
                </div>
                <h3 className={`text-xl font-bold ${textColor} mb-2`}>{option.title}</h3>
                <p className={mutedTextColor}>{option.description}</p>
                
                <ul className="mt-6 space-y-3 mb-6">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange-accent)]/10 flex items-center justify-center mt-0.5 mr-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)]" />
                      </div>
                      <span className={mutedTextColor}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-auto p-6 pt-0">
                <div className="border-t border-[var(--glass-border)] pt-6">
                  <h4 className={`font-semibold ${textColor} mb-3 flex items-center`}>
                    <Zap className="h-4 w-4 text-[var(--color-orange-accent)] mr-2" />
                    Details
                  </h4>
                  <ul className="space-y-2">
                    {option.details.map((detail, i) => (
                      <li key={i} className="flex items-start">
                        <div className="text-[var(--color-orange-accent)] mr-2 mt-0.5">
                          {detail.icon}
                        </div>
                        <span className={`text-sm ${mutedTextColor}`}>{detail.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6">
                  <a 
                    href="#register" 
                    className="block w-full text-center px-4 py-3 rounded-none bg-[var(--color-orange-accent)]/10 hover:bg-[var(--color-orange-accent)]/20 border border-[var(--color-orange-accent)]/30 text-[var(--color-orange-accent)] font-medium transition-colors"
                  >
                    Choose {option.title.split(' ')[0]}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`${cardBg} ${cardBorder} border rounded-2xl p-8 md:p-12`}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Corporate & Group Training</h3>
              <p className={`${mutedTextColor} mb-6`}>
                Looking to train your team? We offer customized workshops tailored to your organization's specific needs and goals.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Customized content for your industry",
                  "Flexible scheduling for your team",
                  "Volume discounts available",
                  "On-site or virtual delivery options"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange-accent)]/10 flex items-center justify-center mt-0.5 mr-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)]" />
                    </div>
                    <span className={mutedTextColor}>{item}</span>
                  </li>
                ))}
              </ul>
              <a 
                href="#contact" 
                className="inline-flex items-center px-6 py-3 rounded-none bg-[var(--color-orange-accent)] hover:bg-[var(--color-orange-accent-light)] text-white font-medium transition-colors"
              >
                Request Group Training Info
              </a>
            </div>
            <div className="bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-[var(--color-orange-accent-light)]/10 rounded-2xl p-8 border border-[var(--glass-border)]">
              <h4 className={`text-lg font-semibold ${textColor} mb-4`}>Not Sure Which to Choose?</h4>
              <p className={`${mutedTextColor} mb-6`}>
                Our most popular option is the Live Online workshop, which offers the perfect balance of interaction and convenience.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange-accent)]/10 flex items-center justify-center mt-0.5 mr-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)]" />
                  </div>
                  <div>
                    <h5 className={`font-medium ${textColor}`}>Need help deciding?</h5>
                    <p className={`text-sm ${mutedTextColor}`}>Book a free 15-minute consultation call</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange-accent)]/10 flex items-center justify-center mt-0.5 mr-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)]" />
                  </div>
                  <div>
                    <h5 className={`font-medium ${textColor}`}>Special requirements?</h5>
                    <p className={`text-sm ${mutedTextColor}`}>Contact us for accessibility needs or other questions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
