"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Brain,
  Rocket,
  Code,
  Shield,
  Clock,
  BarChart3,
  Cpu,
  BookOpen,
  Sparkles,
  TrendingUp
} from "lucide-react";

interface ServiceFeature {
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ServiceStats {
  value: string;
  label: string;
}

interface ServiceItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tagline: string;
  description: string;
  stats: ServiceStats;
  features: ServiceFeature[];
  cta: string;
  gradient: string;
}

interface AISolutionsSectionProps {
  theme: "light" | "dark";
  className?: string;
}

export const AISolutionsSection: React.FC<AISolutionsSectionProps> = ({ theme }) => {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const services: ServiceItem[] = [
    {
      icon: Cpu,
      title: "AI Consulting",
      tagline: "Transform Operations",
      description: "Custom copilots, workflow automation, private models - all tailored to your business needs. Strategic AI implementation that delivers measurable ROI.",
      stats: { value: "300%", label: "Avg ROI Increase" },
      features: [
        { text: "Custom AI solutions for unique business needs", icon: Brain },
        { text: "Automate repetitive tasks and workflows", icon: Rocket },
        { text: "Secure, private AI models for sensitive data", icon: Shield },
        { text: "Strategic implementation roadmap", icon: TrendingUp }
      ],
      cta: "Get AI Strategy Session",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: BookOpen,
      title: "AI Training",
      tagline: "Empower Your Team",
      description: "3h theory + 3h practice with tools like ChatGPT, Claude, Gemini, Copilot, and LangChain. Hands-on learning with real business applications.",
      stats: { value: "95%", label: "Team Adoption Rate" },
      features: [
        { text: "Practical, hands-on learning experience", icon: Code },
        { text: "Immediate application to real challenges", icon: Clock },
        { text: "Customized for your team's specific needs", icon: BarChart3 },
        { text: "Ongoing support and resources", icon: CheckCircle }
      ],
      cta: "Book Training Session",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Zap,
      title: "Free Workshop",
      tagline: "See Results Fast",
      description: "30 minutes, one task automated, zero fluff. See AI in action and walk away with a working solution that you can implement immediately.",
      stats: { value: "30min", label: "To Working Solution" },
      features: [
        { text: "No-obligation workshop session", icon: CheckCircle },
        { text: "See immediate value in 30 minutes", icon: Clock },
        { text: "Walk away with a working AI solution", icon: Rocket },
        { text: "Actionable next steps provided", icon: ArrowRight }
      ],
      cta: "Schedule Free Workshop",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className={`py-20 relative overflow-hidden ${theme === 'dark' ? 'dark bg-[var(--color-gunmetal)]' : 'light bg-[var(--color-light-silver)]'}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 dot-pattern opacity-30" />
      
      <div className="process-container relative z-10">
        {/* Header */}
        <motion.div
          className="process-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 process-subtitle">
            <Sparkles className="h-4 w-4" />
            AI Solutions That Work
          </div>
          <h2 className="process-title">
            Choose Your <span className="text-orange">AI Journey</span>
          </h2>
          <p className="process-description">
            From strategy to implementation, find the perfect AI solution for your business needs
          </p>
        </motion.div>

        {/* Service Cards Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((service, index) => {
            const isSelected = selectedService === index;
            
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="group relative"
              >
                <div
                  className={`
                    card-minimal cursor-pointer h-full flex flex-col
                    ${isSelected ? 'border-orange-accent-light shadow-lg' : ''}
                    hover:border-orange-accent-light transition-all duration-300
                  `}
                  onClick={() => setSelectedService(isSelected ? null : index)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-orange border-2 border-orange text-white">
                      <service.icon className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary font-tech">
                        {service.stats.value}
                      </div>
                      <div className="text-caption text-secondary">
                        {service.stats.label}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-heading mb-2">{service.title}</h3>
                    <p className="text-orange font-tech font-medium mb-3 text-sm uppercase tracking-tech-wide">
                      {service.tagline}
                    </p>
                    <p className="text-body mb-6 flex-1">
                      {service.description}
                    </p>

                    {/* CTA Button */}
                    <button className="btn-primary w-full group-hover:bg-orange group-hover:text-[var(--color-gunmetal)] transition-all duration-300">
                      {service.cta}
                      <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Expanded Service Details */}
        {selectedService !== null && (
          <motion.div
            className="card-glass p-8 mb-16"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Left Content */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="p-4 bg-orange text-white mr-4">
                    {React.createElement(services[selectedService].icon, { className: "h-8 w-8" })}
                  </div>
                  <div>
                    <h3 className="text-display text-primary mb-2">
                      {services[selectedService].title}
                    </h3>
                    <p className="text-orange font-tech font-medium uppercase tracking-tech-wide">
                      {services[selectedService].tagline}
                    </p>
                  </div>
                </div>

                <p className="text-body mb-8 text-lg">
                  {services[selectedService].description}
                </p>

                <button className="btn-primary text-lg px-8 py-4">
                  {services[selectedService].cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>

              {/* Right Features */}
              <div>
                <h4 className="text-heading mb-6 text-primary">Key Features</h4>
                <div className="space-y-4">
                  {services[selectedService].features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-start gap-4 p-4 card-glass hover:border-orange transition-all duration-300"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {React.createElement(feature.icon, { className: "h-5 w-5 text-orange" })}
                      </div>
                      <p className="text-body">{feature.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 p-2 text-secondary hover:text-orange transition-colors"
              aria-label="Close service details"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-body mb-6">
            Not sure which solution fits your needs?
          </p>
          <button className="btn-secondary px-8 py-4">
            Contact Us
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default AISolutionsSection; 