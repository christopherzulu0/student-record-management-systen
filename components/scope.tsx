"use client"

import { CheckCircle2, Users, Database, FileCheck, BarChart3 } from "lucide-react"

const scopeItems = [
  {
    icon: Users,
    title: "Student Registration",
    description: "Streamlined enrollment with validation",
    features: ["Real-time sync", "Validated data", "Instant confirmation"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: BarChart3,
    title: "Grade Management",
    description: "Real-time tracking and analytics",
    features: ["Live updates", "Analytics", "History tracking"],
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: FileCheck,
    title: "Transcripts",
    description: "Automated report generation",
    features: ["Instant generation", "Digital signatures", "Verified"],
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Database,
    title: "Audit Trails",
    description: "Complete logging and compliance",
    features: ["Full logging", "Compliance", "Integrity"],
    color: "from-indigo-500 to-violet-500",
  },
]

export default function Scope() {
  return (
    <section className="py-32 sm:py-40 lg:py-56 bg-gradient-to-b from-background to-muted/5 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/6 rounded-full blur-3xl opacity-40 animate-float"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-gradient-to-r from-primary/12 to-secondary/12 border border-primary/30 rounded-full w-fit mx-auto backdrop-blur-md">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">System Scope</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-balance">
              <span className="text-gradient-bold">What's Included</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light">
              Comprehensive platform covering all essential academic management functions.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scopeItems.map((item, i) => (
            <div
              key={i}
              className="group relative overflow-hidden p-5 rounded-xl border border-border/50 bg-white/60 backdrop-blur-sm hover:border-primary/30 hover:shadow-md transition-all duration-500 hover:-translate-y-1 animate-fade-in-up card-hover-subtle"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-8 transition-opacity rounded-full blur-xl -mr-10 -mt-10`}
              ></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform text-white shadow-sm`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="text-base font-bold mb-1 text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 font-light">{item.description}</p>

                <div className="space-y-1 pt-3 border-t border-border/30">
                  {item.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${item.color}`}></span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
