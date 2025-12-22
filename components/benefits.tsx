"use client"

import { TrendingUp, Clock, Shield, CheckCircle, Users, BarChart4, BookOpen } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function Benefits() {
  return (
    <section
      id="benefits"
      className="relative py-20 sm:py-32 bg-gradient-to-b from-secondary/3 to-background overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 hover:border-accent/40 transition-colors group cursor-pointer">
            <TrendingUp size={14} className="text-accent group-hover:animate-bounce" />
            <span className="text-sm font-semibold text-accent">Impact & Results</span>
          </div>
          <h2 className="text-balance text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
            Tangible Benefits for
            <br />
            <span className="bg-gradient-to-r from-primary via-emerald-500 to-accent bg-clip-text text-transparent">
              Every Stakeholder
            </span>
          </h2>
          <p className="text-pretty text-lg text-foreground/70 max-w-2xl mx-auto">
            Real improvements that directly impact efficiency, satisfaction, and institutional reputation across all
            user groups.
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="group relative overflow-hidden border border-border/40 bg-gradient-to-br from-blue-500/5 to-transparent hover:border-blue-500/50 transition-all duration-300 p-8 hover:shadow-xl hover:scale-105">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />

            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:border-blue-500/50 group-hover:bg-blue-500/20 group-hover:scale-125 transition-all">
              <Clock size={28} className="text-blue-500" />
            </div>
            <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text mb-2">
              80%
            </h3>
            <p className="text-lg font-bold text-foreground mb-3">Faster Access</p>
            <p className="text-foreground/70 leading-relaxed">
              Reduce document retrieval time from hours to seconds. Students and staff can access records instantly
              anytime, anywhere.
            </p>
          </Card>

          <Card className="group relative overflow-hidden border border-border/40 bg-gradient-to-br from-emerald-500/5 to-transparent hover:border-emerald-500/50 transition-all duration-300 p-8 hover:shadow-xl hover:scale-105">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />

            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/20 group-hover:scale-125 transition-all">
              <TrendingUp size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text mb-2">
              50%
            </h3>
            <p className="text-lg font-bold text-foreground mb-3">Less Admin Work</p>
            <p className="text-foreground/70 leading-relaxed">
              Automate repetitive tasks and manual data entry, freeing administrative staff to focus on strategic
              initiatives and student support.
            </p>
          </Card>

          <Card className="group relative overflow-hidden border border-border/40 bg-gradient-to-br from-red-500/5 to-transparent hover:border-red-500/50 transition-all duration-300 p-8 hover:shadow-xl hover:scale-105">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />

            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 group-hover:border-red-500/50 group-hover:bg-red-500/20 group-hover:scale-125 transition-all">
              <Shield size={28} className="text-red-500" />
            </div>
            <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-red-600 to-red-400 bg-clip-text mb-2">
              99.9%
            </h3>
            <p className="text-lg font-bold text-foreground mb-3">Data Security</p>
            <p className="text-foreground/70 leading-relaxed">
              Military-grade encryption, FERPA compliance, and advanced security protocols ensure student data is always
              protected and secure.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Students Benefits */}
          <Card className="border border-border/40 bg-gradient-to-br from-primary/5 to-transparent p-8 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/30 transition-all">
                <Users size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">For Students</h3>
                <p className="text-sm text-foreground/60">Empower your academic journey</p>
              </div>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-primary flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Instant access to grades, transcripts, and report cards 24/7</span>
              </li>
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-primary flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Easy online request for official documents and certificates</span>
              </li>
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-primary flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">No more long queues or waiting for administrative processing</span>
              </li>
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-primary flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Track real-time academic progress and performance metrics</span>
              </li>
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-primary flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Mobile-friendly access from any device, anywhere</span>
              </li>
            </ul>
          </Card>

          {/* Teachers Benefits */}
          <Card className="border border-border/40 bg-gradient-to-br from-purple-500/5 to-transparent p-8 hover:border-purple-500/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/30 transition-all">
                <BookOpen size={24} className="text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">For Teachers</h3>
                <p className="text-sm text-foreground/60">Streamline your teaching workflow</p>
              </div>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-purple-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Quick grade input and student performance tracking</span>
              </li>
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-purple-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Generate progress reports and attendance records in seconds</span>
              </li>
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-purple-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Access student historical data and academic trends</span>
              </li>
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-purple-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Write and submit recommendation letters with digital signatures</span>
              </li>
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-purple-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Reduce administrative burden and focus more on teaching</span>
              </li>
            </ul>
          </Card>

          {/* Administrators Benefits */}
          <Card className="border border-border/40 bg-gradient-to-br from-accent/5 to-transparent p-8 hover:border-accent/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/30 transition-all">
                <BarChart4 size={24} className="text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">For Administrators</h3>
                <p className="text-sm text-foreground/60">Optimize school operations</p>
              </div>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-accent flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Streamlined record management with centralized database</span>
              </li>
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-accent flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Comprehensive audit trails and compliance documentation</span>
              </li>
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-accent flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Advanced analytics and institutional performance dashboards</span>
              </li>
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-accent flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Multi-level permission management and role-based access</span>
              </li>
              <li className="flex gap-3 text-foreground/70 group/item hover:text-foreground transition-colors cursor-pointer">
                <CheckCircle
                  size={20}
                  className="text-accent flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
                />
                <span className="text-sm">Automated reporting, backups, and disaster recovery protocols</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  )
}
