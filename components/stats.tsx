"use client"

export default function Stats() {
  const stats = [
    {
      value: "80%",
      label: "Faster Processing",
      description: "Automated document generation reduces processing time significantly",
    },
    {
      value: "50%",
      label: "Reduced Workload",
      description: "Administrative staff spend 50% less time on manual record handling",
    },
    {
      value: "99.9%",
      label: "System Uptime",
      description: "Bank-level reliability ensures continuous access to critical records",
    },
    {
      value: "0",
      label: "Data Loss Events",
      description: "Multi-region backups with redundant systems prevent any data loss",
    },
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Proven <span className="text-gradient-primary">Impact</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            Results from institutions using SARMS
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white/40 border border-primary/20 backdrop-blur-sm hover:bg-white/50 transition-all card-hover-subtle group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <p className="text-5xl font-black text-gradient-primary mb-3 group-hover:scale-110 transition-transform">
                {stat.value}
              </p>
              <h3 className="text-lg font-bold mb-2">{stat.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
