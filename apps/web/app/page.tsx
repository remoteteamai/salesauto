import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  Users,
  Target,
  TrendingUp,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Menu,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'AI-Powered Prospecting',
    description: 'Automatically identify and qualify leads with machine learning algorithms that learn from your best customers.',
  },
  {
    icon: Mail,
    title: 'Multi-Channel Campaigns',
    description: 'Execute email, LinkedIn, and cold calling campaigns from a single platform with intelligent sequencing.',
  },
  {
    icon: Target,
    title: 'Precision Targeting',
    description: 'Build hyper-targeted audiences based on firmographics, technographics, and behavioral data.',
  },
  {
    icon: TrendingUp,
    title: 'Revenue Analytics',
    description: 'Track every touchpoint from first contact to closed deal with comprehensive pipeline analytics.',
  },
  {
    icon: Clock,
    title: 'Meeting Automation',
    description: 'Let AI handle scheduling, reminders, and follow-ups so your team can focus on selling.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant infrastructure with end-to-end encryption and role-based access control.',
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'VP of Sales, TechCorp',
    content: 'Melioro AI transformed our outbound strategy. We saw a 47% increase in qualified meetings within the first quarter.',
  },
  {
    name: 'Michael Torres',
    role: 'Head of Revenue, ScaleUp',
    content: 'The AI prospecting alone has saved our team 20+ hours per week. It\'s like having an extra SDR on the team.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Director of Growth, InnovateCo',
    content: 'Finally, a platform that actually understands B2B sales. The multi-channel campaigns are incredibly sophisticated.',
  },
]

const pricingPlans = [
  {
    name: 'Starter',
    price: '499',
    description: 'Perfect for small sales teams getting started with AI.',
    features: [
      '5,000 prospect updates/month',
      '1,000 email sends/month',
      'Basic analytics dashboard',
      'Email support',
      '1 user seat',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '999',
    description: 'For growing teams that need advanced AI capabilities.',
    features: [
      '25,000 prospect updates/month',
      '10,000 email sends/month',
      'Advanced AI prospecting',
      'Multi-channel campaigns',
      'Priority support',
      '5 user seats',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with complex sales processes.',
    features: [
      'Unlimited prospect updates',
      'Unlimited email sends',
      'Custom AI model training',
      'Dedicated success manager',
      'SSO & advanced security',
      'Unlimited user seats',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">Melioro AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Star className="h-3 w-3 mr-1" />
            Trusted by 500+ Sales Teams
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
            Build Your AI-Native
            <br />
            <span className="text-primary">Revenue Workforce</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Transform your sales team with AI-powered prospecting, intelligent campaign management, and real-time analytics that drive revenue growth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Scale Revenue
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform handles the entire revenue workflow, from prospecting to closed deal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Revenue Teams
            </h2>
            <p className="text-muted-foreground">
              See what our customers have to say about Melioro AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">&quot;{testimonial.content}&quot;</p>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your team. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={plan.popular ? 'border-primary shadow-lg' : ''}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    {plan.price !== 'Custom' && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your AI Revenue Workforce?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join 500+ sales teams using Melioro AI to close more deals, faster.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold">Melioro AI</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-native revenue workforce platform for modern sales teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Integrations</Link></li>
                <li><Link href="#" className="hover:text-foreground">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Melioro AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Twitter
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                LinkedIn
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
