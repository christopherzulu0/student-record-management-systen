"use client"

import { Star } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
    {
      name: "Dr. James Koroma",
      role: "Principal, Voinjama Multilateral High School",
      content:
        "SARMS transformed our administrative operations. Students now get transcripts instantly instead of waiting weeks.",
      rating: 5,
    },
    {
      name: "Mrs. Fatima Sesay",
      role: "Academic Coordinator",
      content:
        "The system is intuitive and reliable. Our staff requires minimal training, and the time savings are remarkable.",
      rating: 5,
    },
    {
      name: "Samuel Doe",
      role: "Student",
      content:
        "I can access my grades and transcript online anytime. No more queuing at the office. Excellent experience!",
      rating: 5,
    },
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-mesh">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Trusted by <span className="text-gradient-primary">Educational Leaders</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            See what educators and students are saying about SARMS
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white/60 border border-white/40 backdrop-blur-sm hover:bg-white/70 transition-all card-hover-subtle group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} size={16} className="fill-orange-400 text-orange-400" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-6 font-light">{testimonial.content}</p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
