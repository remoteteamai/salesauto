'use client'

import { useEffect } from 'react'

interface CalendlyEmbedProps {
  url?: string
  className?: string
}

export function CalendlyEmbed({ url, className = '' }: CalendlyEmbedProps) {
  const calendlyUrl = url || process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/salesautoai/demo'

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div
      className={`calendly-inline-widget ${className}`}
      data-url={calendlyUrl}
      style={{ minWidth: '320px', height: '700px' }}
    />
  )
}

interface CalendlyButtonProps {
  url?: string
  text?: string
  className?: string
}

export function CalendlyButton({ url, text = 'Schedule a Demo', className = '' }: CalendlyButtonProps) {
  const calendlyUrl = url || process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/salesautoai/demo'

  const openCalendly = () => {
    if (typeof window !== 'undefined' && (window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({ url: calendlyUrl })
    } else {
      window.open(calendlyUrl, '_blank')
    }
  }

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://assets.calendly.com/assets/external/widget.css'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(link)
      document.head.removeChild(script)
    }
  }, [])

  return (
    <button
      onClick={openCalendly}
      className={`inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors ${className}`}
    >
      {text}
    </button>
  )
}
