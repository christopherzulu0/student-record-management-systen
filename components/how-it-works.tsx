"use client"

import { CheckCircle2, Users, Zap, Database } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: Users,
      title: "User Registration",
      description: "Set up admin, teachers, and students with secure role-based access",
      color: "from-blue-500/20 to-blue-600/20",
    },
    {
      icon: Zap,
      title: "Data Management",
      description: "Instantly record grades, attendance, and academic progress in real-time",
      color: "from-orange-500/20 to-orange-600/20",
    },
    {
      icon: Database,
      title: "Report Generation",
      description: "Auto-generate transcripts, progress reports, and recommendation letters",
      color: "from-purple-500/20 to-purple-600/20",
    },
    {
      icon: CheckCircle2,
      title: "Secure Access",
      description: "Students and parents access records anytime with encrypted security",
      color: "from-green-500/20 to-green-600/20",
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-mesh">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-black mb-6 text-balance">
            How SARMS <span className="text-gradient-primary">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            Simple, streamlined workflow designed for educational institutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={i}
                className="group animate-fade-in-up card-hover-subtle"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`p-6 rounded-xl bg-gradient-to-br ${step.color} border border-white/40 backdrop-blur-sm h-full`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-primary/70">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 p-8 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm animate-fade-in-up">
          <p className="text-center text-muted-foreground font-light">
            <span className="font-semibold text-foreground">Enterprise-grade security</span> ensures all student records
            are encrypted and compliant with educational data protection standards. Your data is backed up automatically
            and accessible 24/7.
          </p>
        </div>
      </div>
    </section>
  )
}
