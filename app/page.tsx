import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import Stats from "@/components/stats"
import Scope from "@/components/scope"
import Roles from "@/components/roles"
import Testimonials from "@/components/testimonials"
import Benefits from "@/components/benefits"
import FAQ from "@/components/faq"
import CTA from "@/components/cta"
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <Scope />
      <Roles />
      <Testimonials />
      <Benefits />
      <FAQ />
      <CTA />
      <Footer />
      <ScrollToTop />
    </div>
  )
}
