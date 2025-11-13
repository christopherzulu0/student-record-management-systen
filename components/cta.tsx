"use client"

import { ArrowRight, Zap, Sparkles } from "lucide-react"

export default function CTA() {
  return (
    <section className="py-32 sm:py-40 lg:py-56 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/8 to-accent/10"></div>
        <div className="absolute -top-56 -right-56 w-[700px] h-[700px] bg-primary/15 rounded-full blur-3xl opacity-40 animate-float"></div>
        <div
          className="absolute -bottom-56 -left-56 w-[700px] h-[700px] bg-accent/15 rounded-full blur-3xl opacity-40 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/85 backdrop-blur-xl border border-white/50 rounded-2xl p-10 sm:p-12 text-center space-y-8 shadow-glow animate-fade-in-up">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary/12 to-secondary/12 border border-primary/30 rounded-full mx-auto">
              <Sparkles size={16} className="text-primary animate-bounce-slow" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Ready to Transform?</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground text-balance leading-tight">
              <span className="text-gradient-bold">Start Your Journey Today</span>
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
              Join institutions transforming their academic records management with unmatched efficiency and security.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="group relative px-8 sm:px-10 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-semibold text-sm inline-flex items-center justify-center gap-2 hover:scale-105 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative flex items-center gap-2">
                <Zap size={18} />
                Get Started
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
            <button className="px-8 sm:px-10 py-4 border-2 border-primary/30 hover:border-primary/60 text-foreground rounded-xl hover:bg-primary/5 transition-all font-semibold text-sm">
              Request Demo
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-black/5">
            {[
              { text: "No Credit Card", icon: "💳" },
              { text: "Setup in Minutes", icon: "⚡" },
              { text: "24/7 Support", icon: "🎯" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-center gap-2 hover:scale-105 transition-transform cursor-pointer"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs sm:text-sm font-semibold text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
