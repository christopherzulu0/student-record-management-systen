import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-gradient-to-b from-secondary/5 to-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm animate-float">
                SA
              </div>
              <span className="font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SARMS
              </span>
            </div>
            <p className="text-sm text-foreground/60">
              Modern academic record management for educational institutions worldwide.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a href="#features" className="hover:text-foreground hover:text-accent transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground hover:text-accent transition-colors">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground hover:text-accent transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground hover:text-accent transition-colors">
                  Roadmap
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a href="#" className="hover:text-foreground hover:text-accent transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground hover:text-accent transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground hover:text-accent transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground hover:text-accent transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a href="#" className="hover:text-foreground hover:text-accent transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground hover:text-accent transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground hover:text-accent transition-colors">
                  GDPR
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground hover:text-accent transition-colors">
                  Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/40 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground mb-3">Get in Touch</p>
              <div className="space-y-3 text-sm text-foreground/60">
                <div className="flex items-center gap-3 hover:text-foreground transition-colors group cursor-pointer">
                  <Mail size={16} className="text-accent group-hover:scale-110 transition-transform" />
                  <a href="mailto:support@sarms.edu" className="">
                    support@sarms.edu
                  </a>
                </div>
                <div className="flex items-center gap-3 hover:text-foreground transition-colors group cursor-pointer">
                  <Phone size={16} className="text-accent group-hover:scale-110 transition-transform" />
                  <a href="tel:+1234567890">+1 (234) 567-890</a>
                </div>
                <div className="flex items-center gap-3 hover:text-foreground transition-colors group cursor-pointer">
                  <MapPin size={16} className="text-accent group-hover:scale-110 transition-transform" />
                  <span>Voinjama, Liberia</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-col justify-between">
              <p className="text-sm font-semibold text-foreground mb-4">Follow Us</p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all hover:scale-110"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all hover:scale-110"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all hover:scale-110"
                >
                  <Facebook size={18} />
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="flex flex-col justify-between">
              <p className="text-sm text-foreground/60">
                © 2025 SARMS. All rights reserved. | Designed with care for education.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
