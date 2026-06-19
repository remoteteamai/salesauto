'use client';

import Link from 'next/link';
import { Zap, ArrowRight, PlayCircle, TrendingUp, Database, Bot, Rocket, Shield, Activity, Trophy, Globe, Mail, Network, Calendar } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          background: 'rgba(10, 10, 12, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-500" />
            <span className="text-xl font-bold">Melioro AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#process" className="text-gray-400 hover:text-white transition-colors">How it Works</a>
            <a href="#partners" className="text-gray-400 hover:text-white transition-colors">Partners</a>
          </div>
          <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              borderColor: 'rgba(99, 102, 241, 0.3)',
            }}
          >
            <Zap className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-indigo-400">Powered by Advanced AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Transform Your B2B Data
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Into Revenue Growth
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
            Melioro AI connects your data sources, enriches them with AI-powered insights, 
            and scales your outreach automatically. Stop wasting time on manual data work.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/demo" className="w-full sm:w-auto px-8 py-4 border border-gray-600 hover:border-gray-500 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Calendar className="w-5 h-5" />
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-indigo-500 mb-2">500M+</div>
              <div className="text-gray-400">Data Points</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-indigo-500 mb-2">10k+</div>
              <div className="text-gray-400">AI Agents</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-indigo-500 mb-2">99.9%</div>
              <div className="text-gray-400">Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section id="process" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Three simple steps to transform your outreach</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="p-8 rounded-2xl border"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6">
                <Database className="w-7 h-7 text-indigo-500" />
              </div>
              <div className="text-indigo-500 font-semibold mb-2">Step 1</div>
              <h3 className="text-2xl font-bold mb-3">Connect Data</h3>
              <p className="text-gray-400">
                Seamlessly integrate with your CRM, database, or upload CSV files. 
                We support 100+ data sources out of the box.
              </p>
            </div>
            
            <div
              className="p-8 rounded-2xl border"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6">
                <Bot className="w-7 h-7 text-indigo-500" />
              </div>
              <div className="text-indigo-500 font-semibold mb-2">Step 2</div>
              <h3 className="text-2xl font-bold mb-3">Enrich with AI</h3>
              <p className="text-gray-400">
                Our AI analyzes and enriches your data with firmographics, 
                technographics, and intent signals automatically.
              </p>
            </div>
            
            <div
              className="p-8 rounded-2xl border"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6">
                <Rocket className="w-7 h-7 text-indigo-500" />
              </div>
              <div className="text-indigo-500 font-semibold mb-2">Step 3</div>
              <h3 className="text-2xl font-bold mb-3">Scale Outreach</h3>
              <p className="text-gray-400">
                Deploy AI agents to engage prospects at scale. Personalize 
                messaging based on real-time data enrichment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400">Everything you need to dominate B2B lead generation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className="p-6 rounded-2xl border"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Shield className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Enterprise Grade</h3>
              <p className="text-gray-400 text-sm">
                SOC 2 compliant, GDPR ready, with end-to-end encryption for all your data.
              </p>
            </div>
            
            <div
              className="p-6 rounded-2xl border"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Network className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Graph Enrichment</h3>
              <p className="text-gray-400 text-sm">
                Build relationship maps and discover hidden connections in your data.
              </p>
            </div>
            
            <div
              className="p-6 rounded-2xl border"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Zap className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Instant Triggers</h3>
              <p className="text-gray-400 text-sm">
                Real-time alerts when prospects show buying signals or change status.
              </p>
            </div>
            
            <div
              className="p-6 rounded-2xl border"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <TrendingUp className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">ROI Attribution</h3>
              <p className="text-gray-400 text-sm">
                Track exactly which outreach efforts convert into revenue with precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Program CTA */}
      <section id="partners" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div
            className="p-12 md:p-16 rounded-3xl border text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
              borderColor: 'rgba(99, 102, 241, 0.3)',
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <Trophy className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Partner Program</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join our partner network and earn recurring revenue by helping your clients 
                transform their B2B outreach with Melioro AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <span className="text-gray-300">20% Recurring Commission</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <span className="text-gray-300">Global Partner Network</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <span className="text-gray-300">Dedicated Support</span>
                </div>
              </div>
              <button className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold text-lg transition-all transform hover:scale-105">
                Apply to Partner Program
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-indigo-500" />
                <span className="text-lg font-bold">Melioro AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transform your B2B data into revenue growth with AI-powered enrichment.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div
            className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
          >
            <p className="text-gray-400 text-sm">
              © 2024 Melioro AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
