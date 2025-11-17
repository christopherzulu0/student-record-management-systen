"use client"

import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/3 to-background py-24 sm:py-32 lg:py-48">
      <div
        className="absolute top-20 right-10 -z-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-pulse"
        style={{ animationDuration: "4s" }}
      />
      <div
        className="absolute -bottom-20 -left-20 -z-10 h-96 w-96 rounded-full bg-primary/15 blur-3xl animate-pulse"
        style={{ animationDuration: "5s", animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/3 -z-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse"
        style={{ animationDuration: "6s", animationDelay: "2s" }}
      />

      <div className="absolute inset-0 -z-10 opacity-30 animate-gradient-rotate bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto max-w-4xl text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="mb-8 flex justify-center">
            <div className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent/20 to-primary/20 px-4 py-2.5 text-sm font-semibold text-foreground border border-accent/30 hover:border-accent/50 hover:bg-gradient-to-r hover:from-accent/30 hover:to-primary/30 transition-all duration-300 cursor-pointer">
              <Sparkles size={16} className="text-accent animate-spin" style={{ animationDuration: "3s" }} />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Transform Your Institution Today
              </span>
            </div>
          </div>

          <h1 className="text-balance text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-8 leading-tight">
            Digitize Student
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-blue-500 bg-clip-text text-transparent animate-gradient-rotate">
              Academic Records
            </span>
            <br />
            with Confidence
          </h1>

          <p className="text-pretty text-lg sm:text-xl leading-8 text-foreground/70 mb-10 max-w-2xl mx-auto">
            SARMS streamlines academic record management for educational institutions. From transcript generation to
            secure document access, manage everything from a single, intuitive platform built for modern schools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="gap-2 min-w-48 bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-primary/70 shadow-xl hover:shadow-2xl transition-all duration-300 group transform hover:scale-105"
            >
              Start Free Trial
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-w-48 bg-background border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
            >
              Watch Demo
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-foreground/60 pt-10 border-t border-gradient-to-r from-transparent via-accent/30 to-transparent">
            <div className="flex items-center gap-2 group hover:text-foreground transition-colors cursor-pointer">
              <CheckCircle2 size={18} className="text-accent group-hover:scale-110 transition-transform" />
              <span>Used by 50+ institutions</span>
            </div>
            <div className="flex items-center gap-2 group hover:text-foreground transition-colors cursor-pointer">
              <CheckCircle2 size={18} className="text-accent group-hover:scale-110 transition-transform" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center gap-2 group hover:text-foreground transition-colors cursor-pointer">
              <CheckCircle2 size={18} className="text-accent group-hover:scale-110 transition-transform" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
