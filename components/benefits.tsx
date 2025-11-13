"use client"

import { TrendingUp, Clock, Shield, BarChart2, Zap, Lock } from "lucide-react"

const benefits = [
  {
    icon: TrendingUp,
    title: "Increased Efficiency",
    subtitle: "50% Workload Reduction",
    description: "Automate processes and eliminate repetitive tasks.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Clock,
    title: "Faster Delivery",
    subtitle: "80% Processing Speed",
    description: "Instant document generation and zero-queue processing.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Shield,
    title: "Enhanced Security",
    subtitle: "Bank-Level Protection",
    description: "End-to-end encryption and compliance with privacy laws.",
    color: "from-red-500 to-rose-500",
  },
  {
    icon: BarChart2,
    title: "Data-Driven Insights",
    subtitle: "Advanced Analytics",
    description: "Comprehensive dashboards for informed decisions.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Improved Accessibility",
    subtitle: "24/7 Portal Access",
    description: "Access records anytime, anywhere from any device.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Lock,
    title: "Compliance & Audit",
    subtitle: "Full Audit Trails",
    description: "Complete audit logging for regulatory compliance.",
    color: "from-indigo-500 to-violet-500",
  },
]

export default function Benefits() {
  return (
    <section className="py-32 sm:py-40 lg:py-56 bg-gradient-to-b from-muted/5 via-background to-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-secondary/6 rounded-full blur-3xl opacity-40 animate-float-slow"></div>
        <div
          className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-accent/6 rounded-full blur-3xl opacity-35 animate-float"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-gradient-to-r from-primary/12 to-secondary/12 border border-primary/30 rounded-full w-fit mx-auto backdrop-blur-md">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Benefits</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-balance leading-tight">
              <span className="text-gradient-bold">Real Results</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light">
              Measurable improvements across efficiency, security, and decision-making.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-500">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-sm text-white`}
                >
                  <benefit.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold mb-1 text-foreground">{benefit.title}</h3>
                <p className="text-xs font-semibold text-primary mb-2">{benefit.subtitle}</p>
                <p className="text-muted-foreground leading-relaxed text-xs font-light">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
