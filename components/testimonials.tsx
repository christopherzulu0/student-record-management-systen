"use client"

import { Card } from "@/components/ui/card"
import { Star, Quote, ArrowRight } from "lucide-react"
import { useState } from "react"

const testimonials = [
  {
    name: "Dr. Sarah Mensah",
    role: "Principal, Accra High School",
    content:
      "SARMS has transformed how we manage student records. What used to take days now takes minutes. Our staff is happier, and students are getting their documents faster than ever.",
    rating: 5,
    initials: "SM",
  },
  {
    name: "James Kofi",
    role: "Vice Principal, Kumasi Secondary",
    content:
      "The security features give us peace of mind. Our student data is encrypted and backed up automatically. The compliance reports are generated instantly for audits.",
    rating: 5,
    initials: "JK",
  },
  {
    name: "Ama Boateng",
    role: "Student, Voinjama High School",
    content:
      "I can access my academic records anytime, anywhere. Getting my transcript for college applications used to be stressful. Now it's just a few clicks. Amazing!",
    rating: 5,
    initials: "AB",
  },
]

export default function Testimonials() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="relative py-20 sm:py-32 bg-gradient-to-b from-background to-secondary/3 overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 -right-32 h-80 w-80 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 -left-32 h-80 w-80 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 hover:border-accent/40 transition-colors group cursor-pointer">
            <Star size={14} className="text-accent fill-accent group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-accent">Testimonials</span>
          </div>
          <h2 className="text-balance text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
            Trusted by
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-yellow-500 bg-clip-text text-transparent">
              Educational Leaders
            </span>
          </h2>
          <p className="text-pretty text-lg text-foreground/70 max-w-2xl mx-auto">
            Hear from principals, administrators, and students who have transformed their institutions with SARMS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative overflow-hidden border border-border/40 transition-all duration-300 p-8 bg-gradient-to-br from-background to-secondary/5 cursor-pointer ${
                hoveredIndex === index
                  ? "border-accent/50 shadow-2xl scale-105 from-accent/5"
                  : "hover:border-accent/30 hover:shadow-lg"
              }`}
            >
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-25 transition-opacity group-hover:rotate-45">
                <Quote size={40} className="text-accent" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-accent text-accent group-hover:scale-110 transition-transform"
                    style={{ transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground/70 mb-8 leading-relaxed italic group-hover:text-foreground transition-colors">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-foreground/60">{testimonial.role}</p>
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
