"use client"

import { Database, FileText, Users, Lock, BarChart3, Zap, ArrowUpRight, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState } from "react"

const features = [
  {
    icon: Database,
    title: "Centralized Data Storage",
    description:
      "Securely store all student academic records in a robust, scalable database with automatic backups, disaster recovery, and real-time synchronization across all devices.",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
    borderColor: "hover:border-blue-500/50",
    badge: "Enterprise",
  },
  {
    icon: FileText,
    title: "Automated Document Generation",
    description:
      "Generate transcripts, report cards, recommendation letters, and custom reports instantly with AI-powered templates. Reduce manual work by up to 90%.",
    color: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-500",
    borderColor: "hover:border-purple-500/50",
    badge: "Smart",
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    description:
      "Customize interfaces for students, teachers, and administrators with granular permission controls. Ensure each user sees only relevant information.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    borderColor: "hover:border-emerald-500/50",
    badge: "Flexible",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "End-to-end encryption, JWT authentication, SSL/TLS protocols, and FERPA compliance. Your student data is protected with military-grade security standards.",
    color: "from-red-500/20 to-red-500/5",
    iconColor: "text-red-500",
    borderColor: "hover:border-red-500/50",
    badge: "Protected",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics Dashboard",
    description:
      "Gain actionable insights into student performance trends, attendance patterns, grade distributions, and institutional metrics with interactive visualizations.",
    color: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    borderColor: "hover:border-amber-500/50",
    badge: "Insights",
  },
  {
    icon: Zap,
    title: "Lightning-Fast Access",
    description:
      "Retrieve student records, transcripts, and documents in milliseconds. 80% faster than traditional methods, reducing wait times from hours to seconds.",
    color: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-500",
    borderColor: "hover:border-cyan-500/50",
    badge: "Speed",
  },
]

export default function Features() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section
      id="features"
      className="relative py-20 sm:py-32 bg-gradient-to-b from-background to-secondary/3 overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 hover:border-accent/40 transition-colors group cursor-pointer">
            <Sparkles size={14} className="text-accent group-hover:animate-spin" style={{ animationDuration: "2s" }} />
            <span className="text-sm font-semibold text-accent">Core Features</span>
          </div>
          <h2 className="text-balance text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
            Powerful Features for
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-blue-500 bg-clip-text text-transparent">
              Modern Education
            </span>
          </h2>
          <p className="text-pretty text-lg text-foreground/70 max-w-2xl mx-auto">
            Everything you need to manage student records efficiently, securely, and transparently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`group relative overflow-hidden border border-border/40 p-8 transition-all duration-300 cursor-pointer ${
                  hoveredIndex === index
                    ? `${feature.borderColor} shadow-2xl scale-105 bg-gradient-to-br ${feature.color}`
                    : "hover:border-primary/30 hover:shadow-lg"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
                />

                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} border border-accent/20 group-hover:border-accent/40 group-hover:scale-110 transition-all duration-300`}
                  >
                    <Icon size={28} className={`${feature.iconColor}`} />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-foreground/10 text-foreground/70 group-hover:bg-foreground/20 group-hover:text-foreground/90 transition-all">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 mb-4 leading-relaxed">{feature.description}</p>

                <div className="flex items-center gap-2 text-accent font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-2">
                  <span className="text-sm">Learn more</span>
                  <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform" />
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
