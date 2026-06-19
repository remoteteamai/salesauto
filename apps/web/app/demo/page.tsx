'use client'

import Link from 'next/link'
import { Zap, ArrowLeft, Calendar, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendlyEmbed } from '@/components/calendly/CalendlyEmbed'

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">Melioro AI</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Schedule a Demo
              </h1>
              <p className="text-lg text-muted-foreground">
                See how Melioro AI can transform your sales pipeline with AI-powered
                prospecting, enrichment, and revenue intelligence.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                What to expect
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>Personalized walkthrough of the platform tailored to your sales workflow</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>Live demo of AI-powered prospect discovery and enrichment</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>Q&A session with our product team</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>Custom pricing based on your team size and needs</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 border">
              <p className="text-sm text-muted-foreground">
                &quot;Melioro AI helped us increase our pipeline by 340% in just 3 months.
                The AI-driven insights are game-changing for our outbound strategy.&quot;
              </p>
              <p className="text-sm font-medium mt-3">
                - VP of Sales, Fortune 500 SaaS Company
              </p>
            </div>
          </div>

          {/* Right - Calendly Widget */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <CalendlyEmbed />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; 2026 Melioro AI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
