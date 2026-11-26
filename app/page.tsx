'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiEdit3, FiLock, FiShare2, FiFolder,
  FiCheckSquare, FiZap, FiArrowRight, FiCheck,
  FiDownload, FiSmartphone,
} from 'react-icons/fi';
import { SiAndroid, SiApple } from 'react-icons/si';
import { useTheme } from 'next-themes';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstallable, setPwaInstallable] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();

    // Capture PWA install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setPwaInstallable(false);
      setDeferredPrompt(null);
    } else {
      // Fallback: download APK
      const a = document.createElement('a');
      a.href = '/notylist.apk';
      a.download = 'notylist.apk';
      a.click();
    }
  };

  const handleDownloadApk = () => {
    const a = document.createElement('a');
    a.href = '/notylist.apk';
    a.download = 'notylist.apk';
    a.click();
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      // User not authenticated
    } finally {
      setIsChecking(false);
    }
  };

  if (!mounted || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-hover transition-colors">
                <FiEdit3 className="text-white" size={20} />
              </div>
              <span className="text-lg font-semibold text-text-primary">Notylist</span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary px-4 py-2 text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container-custom py-20 sm:py-28">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary">
              <FiZap size={14} />
              <span className="font-medium">Free forever · No credit card required</span>
            </div>

            {/* Headline */}
            <h1 className="text-display-lg sm:text-display-xl text-text-primary font-bold tracking-tight">
              Your notes, perfectly
              <br />
              <span className="gradient-text">organized</span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              A powerful note-taking workspace with task management, rich text editing,
              and seamless organization. Built for productivity.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="btn-primary px-8 py-3 text-base group w-full sm:w-auto"
              >
                Start for free
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
              <button
                onClick={handleInstallPWA}
                className="btn-secondary px-8 py-3 text-base gap-2 w-full sm:w-auto"
              >
                <FiDownload size={18} />
                <div className="text-left">
                  <div className="text-xs opacity-70">{pwaInstallable ? 'Add to home screen' : 'Download APK'}</div>
                  <div className="text-sm font-semibold">Install App</div>
                </div>
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 pt-8 text-sm">
              <div className="flex items-center gap-2">
                <FiCheck className="text-success" size={16} />
                <span className="text-text-secondary">Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="text-success" size={16} />
                <span className="text-text-secondary">No ads</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="text-success" size={16} />
                <span className="text-text-secondary">Offline ready</span>
              </div>
            </div>
          </div>

          {/* App Preview */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-xl border border-border bg-background-elevated p-2 shadow-soft-lg">
              <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-background-card to-background-secondary overflow-hidden">
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="w-full max-w-3xl space-y-6">
                    {/* Mock Editor Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <FiEdit3 className="text-primary" size={18} />
                        </div>
                        <div>
                          <div className="h-4 w-32 bg-text-primary/20 rounded mb-2" />
                          <div className="h-3 w-24 bg-text-secondary/20 rounded" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-20 bg-background-card rounded-lg" />
                        <div className="h-8 w-8 bg-background-card rounded-lg" />
                      </div>
                    </div>

                    {/* Mock Editor Content */}
                    <div className="space-y-4 opacity-60">
                      <div className="h-6 w-3/4 bg-text-primary/20 rounded" />
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-text-secondary/20 rounded" />
                        <div className="h-4 w-5/6 bg-text-secondary/20 rounded" />
                        <div className="h-4 w-4/6 bg-text-secondary/20 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-display-md text-text-primary font-bold">
              Everything you need to stay organized
            </h2>
            <p className="text-lg text-text-secondary">
              Powerful features designed for modern productivity
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<FiEdit3 size={24} />}
              title="Rich Text Editor"
              description="Format your notes with headings, lists, links, and more. Full markdown support included."
            />
            <FeatureCard
              icon={<FiFolder size={24} />}
              title="Smart Categories"
              description="Organize notes with custom categories and tags. Find anything instantly."
            />
            <FeatureCard
              icon={<FiCheckSquare size={24} />}
              title="Task Management"
              description="Built-in to-do list with priorities, due dates, and progress tracking."
            />
            <FeatureCard
              icon={<FiShare2 size={24} />}
              title="Secure Sharing"
              description="Share notes publicly or protect them with password encryption."
            />
            <FeatureCard
              icon={<FiLock size={24} />}
              title="Private by Default"
              description="Your notes are encrypted and only accessible to you. Full privacy guaranteed."
            />
            <FeatureCard
              icon={<FiZap size={24} />}
              title="Utility Tools"
              description="Instagram/Pinterest downloader, QR code generator, and more tools included."
            />
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 border-t border-border">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 sm:p-12 text-center space-y-8 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent -z-10" />

              <div className="space-y-4">
                <h2 className="text-display-md text-text-primary font-bold">
                  Take your notes anywhere
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  Access your notes on any device. Android app available now, iOS coming soon.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleInstallPWA}
                  className="btn-primary px-6 py-3 gap-3 w-full sm:w-auto"
                >
                  <FiDownload size={20} />
                  <div className="text-left">
                    <div className="text-xs opacity-80">{pwaInstallable ? 'Add to home screen' : 'Download APK'}</div>
                    <div className="text-sm font-semibold">Install App</div>
                  </div>
                </button>

                <button
                  onClick={handleDownloadApk}
                  className="btn-secondary px-6 py-3 gap-3 w-full sm:w-auto"
                >
                  <SiAndroid size={20} />
                  <div className="text-left">
                    <div className="text-xs opacity-80">Direct download</div>
                    <div className="text-sm font-semibold">Android APK</div>
                  </div>
                </button>
              </div>

              <p className="text-sm text-text-muted">
                Install as app on Android · iOS: use "Add to Home Screen" in Safari
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-display-md text-text-primary font-bold">
              Start organizing your notes today
            </h2>
            <p className="text-lg text-text-secondary">
              Join thousands of users who trust Notylist for their note-taking needs.
              No credit card required.
            </p>
            <Link href="/signup" className="btn-primary px-8 py-3 text-base inline-flex items-center gap-2">
              Get started for free
              <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background-secondary">
        <div className="container-custom py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FiEdit3 className="text-white" size={16} />
                </div>
                <span className="font-semibold text-text-primary">Notylist</span>
              </div>
              <p className="text-sm text-text-secondary">
                Professional note-taking for modern teams
              </p>
            </div>

            {/* Product */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary">Product</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <Link href="/signup" className="hover:text-text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary">Company</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <Link href="/contact" className="hover:text-text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-text-primary transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-text-primary transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>

            {/* Get Started */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary">Get Started</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <Link href="/signup" className="hover:text-text-primary transition-colors">
                    Sign up
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-text-primary transition-colors">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-text-muted">
              © {new Date().getFullYear()} Notylist. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card-hover p-6 space-y-4 group">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
