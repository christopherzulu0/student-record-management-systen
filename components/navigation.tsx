"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary hidden sm:inline">
              SARMS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="#features"
              className="px-4 py-2 text-foreground hover:text-primary transition-colors font-medium text-base"
            >
              Features
            </Link>
            <Link
              href="#roles"
              className="px-4 py-2 text-foreground hover:text-primary transition-colors font-medium text-base"
            >
              For Teams
            </Link>
            <Link
              href="#scope"
              className="px-4 py-2 text-foreground hover:text-primary transition-colors font-medium text-base"
            >
              Capabilities
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="px-6 py-2.5 rounded-lg hover:bg-muted transition-colors font-semibold text-foreground">
              Sign In
            </button>
            <button className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg hover:shadow-xl hover:shadow-primary/20 transition-all font-semibold hover:scale-105">
              Get Started
            </button>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={26} className="text-foreground" /> : <Menu size={26} className="text-foreground" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-6 space-y-3 border-t border-border/40 pt-4 animate-in fade-in slide-in-from-top-2">
            <Link
              href="#features"
              className="block px-4 py-2 text-foreground hover:text-primary transition-colors font-medium rounded-lg hover:bg-muted"
            >
              Features
            </Link>
            <Link
              href="#roles"
              className="block px-4 py-2 text-foreground hover:text-primary transition-colors font-medium rounded-lg hover:bg-muted"
            >
              For Teams
            </Link>
            <Link
              href="#scope"
              className="block px-4 py-2 text-foreground hover:text-primary transition-colors font-medium rounded-lg hover:bg-muted"
            >
              Capabilities
            </Link>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 px-4 py-2 rounded-lg hover:bg-muted transition-colors font-semibold text-foreground">
                Sign In
              </button>
              <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
