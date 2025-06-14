"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "CTO at TechCorp",
    content: "The AI solutions provided by F.B/c transformed our data analysis pipeline, saving us countless hours of manual work and improving accuracy by 40%.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Product Manager at InnovateX",
    content: "Working with F.B/c was a game-changer for our product. Their expertise in AI implementation helped us deliver features we thought were years away.",
    rating: 5,
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Director of Operations",
    content: "The team's ability to understand our business needs and translate them into technical solutions is unparalleled. Highly recommended!",
    rating: 5,
  },
]

const clients = [
  { name: "TechCorp", logo: "🤖" },
  { name: "InnovateX", logo: "🚀" },
  { name: "DataFlow", logo: "📊" },
  { name: "CloudNova", logo: "☁️" },
  { name: "QuantumLeap", logo: "⚛️" },
]

export function SocialProof() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of businesses that trust our AI solutions to drive growth and innovation.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-background p-6 rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Client Logos */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
          {clients.map((client, index) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              className="text-4xl hover:scale-110 transition-transform"
              title={client.name}
            >
              {client.logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
