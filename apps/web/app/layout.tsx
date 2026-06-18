import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Melioro AI - AI-Native Revenue Workforce Platform',
  description: 'Transform your sales team with AI-powered prospecting, campaign management, and analytics.',
  keywords: ['AI', 'sales', 'revenue', 'CRM', 'prospecting', 'campaigns'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
