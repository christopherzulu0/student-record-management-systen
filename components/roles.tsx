"use client"

import { BookOpen, Briefcase, Settings, CheckCircle2 } from "lucide-react"

const roles = [
  {
    icon: BookOpen,
    title: "For Students",
    description: "Complete visibility into your academic journey",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-500/10 to-cyan-500/5",
    features: [
      "View grades and transcripts instantly",
      "Track academic progress in real-time",
      "Download verified documents",
      "Access course registration",
      "Manage academic planning",
      "Receive notifications",
    ],
  },
  {
    icon: Briefcase,
    title: "For Teachers",
    description: "Powerful tools for class management",
    color: "from-orange-500 to-amber-500",
    bgColor: "from-orange-500/10 to-amber-500/5",
    features: [
      "Input and manage grades efficiently",
      "Generate performance reports",
      "Real-time class analytics",
      "Export records instantly",
      "Track attendance",
      "Collaborate seamlessly",
    ],
  },
  {
    icon: Settings,
    title: "For Administrators",
    description: "Complete institutional oversight",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-500/10 to-pink-500/5",
    features: [
      "System-wide dashboard",
      "Advanced analytics",
      "Granular permissions",
      "Data backup and audit trails",
      "Compliance monitoring",
      "Reporting suite",
    ],
  },
]

export default function Roles() {
  return (
    <section
      id="roles"
      className="py-32 sm:py-40 lg:py-56 bg-gradient-to-b from-background to-muted/5 relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-64 -right-64 w-[800px] h-[800px] bg-primary/8 rounded-full blur-3xl opacity-40 animate-float"></div>
        <div
          className="absolute -bottom-64 -left-64 w-[800px] h-[800px] bg-accent/8 rounded-full blur-3xl opacity-35 animate-float-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-gradient-to-r from-primary/12 to-secondary/12 border border-primary/30 rounded-full w-fit mx-auto backdrop-blur-md">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">User Roles</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-balance leading-tight">
              <span className="text-gradient-bold">Designed for Every User</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light">
              Customized experiences for students, educators, and administrators.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role, i) => (
            <div key={i} className="group animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div
                className={`absolute inset-0 bg-gradient-to-br ${role.bgColor} rounded-xl transition-all duration-500 group-hover:scale-105 opacity-0 group-hover:opacity-100 blur-lg`}
              ></div>
              <div className="relative p-6 rounded-xl border border-border/50 backdrop-blur-sm transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-md group-hover:-translate-y-1 bg-white/60">
                <div className="mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm text-white`}
                  >
                    <role.icon className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-1 text-foreground">{role.title}</h3>
                <p className="text-muted-foreground mb-5 text-xs font-light">{role.description}</p>

                <ul className="space-y-2">
                  {role.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
