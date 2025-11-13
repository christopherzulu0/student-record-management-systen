"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "Is SARMS secure for student data?",
      answer:
        "Yes. SARMS implements enterprise-grade encryption (AES-256), secure authentication (JWT), role-based access control, and complies with education data protection regulations. All data is backed up across multiple secure data centers.",
    },
    {
      question: "Can SARMS handle multiple schools?",
      answer:
        "Absolutely. SARMS is designed as a scalable cloud-based solution that can support single schools or multi-institutional deployments with separate data isolation for each organization.",
    },
    {
      question: "What about offline access?",
      answer:
        "Students and staff can download their critical documents (transcripts, progress reports) for offline access. Administrative functions require online access to maintain data consistency.",
    },
    {
      question: "How long does implementation take?",
      answer:
        "Typical implementation takes 2-4 weeks, including system setup, staff training, and data migration. We provide dedicated support during the entire process.",
    },
    {
      question: "What integrations does SARMS support?",
      answer:
        "SARMS integrates with email systems for notifications, SMS gateways for alerts, and can connect with existing school management systems through our API.",
    },
    {
      question: "Is there customer support?",
      answer:
        "Yes, we offer 24/7 technical support via email, phone, and chat. Premium packages include dedicated account managers and custom training sessions.",
    },
  ]

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Frequently Asked <span className="text-gradient-primary">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground font-light">Everything you need to know about SARMS</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="group animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left p-5 rounded-xl bg-white/40 border border-primary/20 hover:bg-white/60 hover:border-primary/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    size={20}
                    className={`text-primary transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {openIndex === i && (
                <div className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 border-t-0 rounded-b-xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-muted-foreground leading-relaxed font-light">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm text-center animate-fade-in-up">
          <p className="text-muted-foreground mb-4 font-light">Can't find the answer you're looking for?</p>
          <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  )
}
