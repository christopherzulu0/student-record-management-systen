"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold animate-float">
              SA
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SARMS
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors relative group"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-primary group-hover:w-full transition-all duration-300" />
              </Link>
            </SignedIn>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {/* <Button
              variant="outline"
              size="sm"
              className="border-primary/30 hover:border-primary/50 hover:bg-primary/5 bg-transparent"
            >
              Request Demo
            </Button> */}
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
             
            
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-border/40 pt-4">
            <SignedIn>
              <Link
                href="/dashboard"
                className="block text-sm font-medium text-foreground/70 hover:text-foreground py-2"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <a href="#features" className="block text-sm font-medium text-foreground/70 hover:text-foreground py-2">
                Features
              </a>
              <a href="#benefits" className="block text-sm font-medium text-foreground/70 hover:text-foreground py-2">
                Benefits
              </a>
              <a href="#security" className="block text-sm font-medium text-foreground/70 hover:text-foreground py-2">
                Security
              </a>
              <a href="#contact" className="block text-sm font-medium text-foreground/70 hover:text-foreground py-2">
                Contact
              </a>
            </SignedOut>
          </div>
        )}
      </div>
    </nav>
  )
}
