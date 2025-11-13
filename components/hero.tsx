"use client"

import { useEffect, useState } from "react"

export default function Hero() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-40 bg-gradient-to-b from-background via-background to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl opacity-60 animate-float-slow"></div>
        <div
          className="absolute -bottom-20 right-10 w-80 h-80 bg-secondary/8 rounded-full blur-3xl opacity-50"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/3 -right-40 w-96 h-96 bg-accent/6 rounded-full blur-3xl opacity-40"
          style={{ animationDelay: "4s" }}
        ></div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(69,89,164,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(69,89,164,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/8 border border-primary/30 rounded-full hover:border-primary/60 hover:bg-primary/12 transition-all duration-300 group cursor-pointer">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse scale-110"></span>
            <span className="text-sm font-medium text-foreground">Trusted by 500+ Schools Worldwide</span>
          </div>
        </div>

        <div className="space-y-6 text-center mb-12">
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight animate-fade-in-up">
              <span className="block text-foreground">Manage Academic</span>
              <span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent font-black"
                style={{ animationDelay: "0.1s" }}
              >
                Records with Precision
              </span>
              <span className="block text-foreground" style={{ animationDelay: "0.2s" }}>
                Built for Modern Schools
              </span>
            </h1>
          </div>

          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            All-in-one platform for student records, grades, transcripts, and reports. Streamline your academic
            administration with enterprise-grade security and intuitive design.
          </p>
        </div>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <button className="group relative px-8 py-3.5 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0">
            <span className="relative flex items-center justify-center gap-2">
              Start Free Trial
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
          <button className="px-8 py-3.5 border-2 border-primary/30 text-foreground rounded-lg font-semibold hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-0.5">
            Watch 2-Min Demo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative">
          {/* Card 1 - Grades Management */}
          <div
            className="group relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-primary/10 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            style={{
              transform: `translateY(${scrollY * 0.05}px)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">Grades Management</h3>
                <p className="text-muted-foreground text-sm mt-1">Manage and track student performance seamlessly</p>
              </div>
            </div>
          </div>

          {/* Card 2 - Transcripts */}
          <div
            className="group relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-secondary/10 hover:border-secondary/30 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            style={{
              transform: `translateY(${scrollY * 0.08}px)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">Official Transcripts</h3>
                <p className="text-muted-foreground text-sm mt-1">Generate and deliver academic records instantly</p>
              </div>
            </div>
          </div>

          {/* Card 3 - Security */}
          <div
            className="group relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-accent/10 hover:border-accent/30 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            style={{
              transform: `translateY(${scrollY * 0.06}px)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">Bank-Grade Security</h3>
                <p className="text-muted-foreground text-sm mt-1">End-to-end encryption and compliance</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-primary/10">
          {[
            { number: "50K+", label: "Active Users", icon: "👥" },
            { number: "500+", label: "Partner Schools", icon: "🏫" },
            { number: "99.9%", label: "Uptime Guarantee", icon: "✓" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center space-y-3 animate-fade-in-up"
              style={{ animationDelay: `${0.5 + i * 0.1}s` }}
            >
              <p className="text-2xl">{stat.icon}</p>
              <p className="text-3xl sm:text-4xl font-bold text-gradient-primary">{stat.number}</p>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-16px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
