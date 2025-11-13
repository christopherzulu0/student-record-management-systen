"use client"

import { BookOpen, BarChart3, FileText, Lock, Users, TrendingUp, ArrowRight } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Student Registration",
    description: "Streamlined enrollment with automated validation and real-time data sync.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: BarChart3,
    title: "Smart Grade Management",
    description: "Real-time tracking, instant updates, and powerful performance analytics.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: FileText,
    title: "Digital Transcripts",
    description: "Generate verified transcripts instantly with digital signatures.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Tailored interfaces with granular permission controls.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Lock,
    title: "Bank-Level Security",
    description: "End-to-end encryption and compliance with FERPA standards.",
    color: "from-red-500 to-rose-500",
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Comprehensive dashboards enabling data-driven decisions.",
    color: "from-indigo-500 to-violet-500",
  },
]

export default function Features() {
  return (
    <section
      id="features"
      className="py-32 sm:py-40 lg:py-56 relative overflow-hidden bg-gradient-to-b from-background via-muted/3 to-background"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-secondary/8 rounded-full blur-3xl opacity-50 animate-float-slow"></div>
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/8 rounded-full blur-3xl opacity-40 animate-float"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-gradient-to-r from-primary/12 to-secondary/12 border border-primary/30 rounded-full w-fit mx-auto backdrop-blur-md">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Core Features</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-balance leading-tight">
              <span className="text-gradient-bold">Complete Management Suite</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light">
              Everything needed to streamline academic records with unmatched security and efficiency.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl transition-all duration-500 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={`absolute inset-0 rounded-xl transition-all duration-500 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10`}
              ></div>

              <div className="relative p-6 rounded-xl border border-border/50 bg-white/60 backdrop-blur-sm hover:border-primary/30 hover:shadow-md transition-all duration-500 group-hover:-translate-y-1">
                <div
                  className={`w-11 h-11 rounded-lg mb-4 flex items-center justify-center transition-all duration-500 bg-gradient-to-br ${feature.color} shadow-sm text-white group-hover:scale-110 group-hover:rotate-6`}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-xs font-light mb-3">{feature.description}</p>
                <div className="flex items-center gap-2 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                  Learn more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
