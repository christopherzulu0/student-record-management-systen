"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Sparkles } from "lucide-react"

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 animate-gradient-rotate" />
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/40 hover:border-accent/60 hover:bg-accent/30 transition-all group cursor-pointer">
          <Zap size={14} className="text-accent group-hover:animate-spin" style={{ animationDuration: "1s" }} />
          <span className="text-sm font-semibold text-accent">Limited Time Offer</span>
        </div>

        <h2 className="text-balance text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
          Ready to Transform
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-blue-500 bg-clip-text text-transparent">
            Your Institution?
          </span>
        </h2>
        <p className="text-pretty text-xl text-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join educational leaders using SARMS to modernize student record management. Start your free trial today—no
          credit card required. Full feature access for 30 days.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button
            size="lg"
            className="gap-2 min-w-48 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent shadow-xl hover:shadow-2xl transition-all duration-300 group transform hover:scale-110 text-white"
          >
            Start Free Trial
            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="min-w-48 bg-background/50 border-2 border-primary/40 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 text-foreground transform hover:scale-110"
          >
            Schedule a Demo
          </Button>
        </div>

        <p className="text-sm text-foreground/60 flex items-center justify-center gap-6">
          <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer group">
            <Sparkles size={14} className="text-accent group-hover:scale-110 transition-transform" />
            Quick setup
          </span>
          <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer group">
            <Sparkles size={14} className="text-accent group-hover:scale-110 transition-transform" />
            No installation
          </span>
          <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer group">
            <Sparkles size={14} className="text-accent group-hover:scale-110 transition-transform" />
            Full access
          </span>
        </p>
      </div>
    </section>
  )
}
