import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Brain, Workflow } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ayvlo-bg text-ayvlo-text">
      {/* Header */}
      <header className="border-b border-ayvlo-accent">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-ayvlo-gold">Ayvlo</div>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm hover:text-ayvlo-blue">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm hover:text-ayvlo-blue">
              Docs
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Autonomous Analytics
          <br />
          <span className="text-ayvlo-gold">that Never Sleep</span>
        </h1>
        <p className="text-xl text-ayvlo-text/70 mb-8 max-w-2xl mx-auto">
          Ayvlo detects anomalies in your data, explains what's happening, and takes action
          automatically. So you can focus on building.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button size="lg" variant="outline">
              View Documentation
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-ayvlo-secondary p-8 rounded-lg border border-ayvlo-accent">
            <div className="h-12 w-12 bg-ayvlo-gold/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-ayvlo-gold" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Detect</h3>
            <p className="text-ayvlo-text/70">
              AI-powered anomaly detection across all your metrics. Catch issues before they
              become problems.
            </p>
          </div>
          <div className="bg-ayvlo-secondary p-8 rounded-lg border border-ayvlo-accent">
            <div className="h-12 w-12 bg-ayvlo-blue/10 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-ayvlo-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Explain</h3>
            <p className="text-ayvlo-text/70">
              Get human-readable explanations for every anomaly. Understand the root cause
              instantly.
            </p>
          </div>
          <div className="bg-ayvlo-secondary p-8 rounded-lg border border-ayvlo-accent">
            <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <Workflow className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Act</h3>
            <p className="text-ayvlo-text/70">
              Autonomous workflows take action automatically. Notify teams, trigger processes,
              resolve issues.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <div className="bg-gradient-to-r from-ayvlo-gold/20 to-ayvlo-blue/20 rounded-lg p-12 text-center border border-ayvlo-accent">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-ayvlo-text/70 mb-8">
            Join companies using Ayvlo to monitor their critical metrics.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ayvlo-accent py-8">
        <div className="container mx-auto px-4 text-center text-sm text-ayvlo-text/50">
          © 2025 Ayvlo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
