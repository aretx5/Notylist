'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiEdit3, FiArrowLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { SiDiscord } from 'react-icons/si';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function LoginPage() {
  const [loading, setLoading] = useState<'google' | 'discord' | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading('google');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error('Google sign-in failed');
        setLoading(null);
      }
    } catch (error) {
      toast.error('Google sign-in failed');
      setLoading(null);
    }
  };

  const handleDiscordSignIn = async () => {
    setLoading('discord');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error('Discord sign-in failed');
        setLoading(null);
      }
    } catch (error) {
      toast.error('Discord sign-in failed');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="container-custom py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors group">
          <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo & Title */}
          <div className="text-center space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center group-hover:bg-primary-hover transition-colors">
                <FiEdit3 className="text-white" size={24} />
              </div>
            </Link>

            <div className="space-y-2">
              <h1 className="text-display-sm text-text-primary font-bold">
                Welcome back
              </h1>
              <p className="text-text-secondary">
                Sign in to continue to Notylist
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <div className="card p-8 space-y-6">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading !== null}
                className="w-full btn-secondary py-3 gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'google' ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <FcGoogle size={20} />
                )}
                <span className="text-base font-medium">
                  {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
                </span>
              </button>

              <button
                onClick={handleDiscordSignIn}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'discord' ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <SiDiscord size={20} />
                )}
                <span className="text-base">
                  {loading === 'discord' ? 'Connecting...' : 'Continue with Discord'}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-background-card text-text-muted">
                  Secure OAuth authentication
                </span>
              </div>
            </div>

            {/* Info Text */}
            <div className="text-center space-y-2">
              <p className="text-xs text-text-muted">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:text-primary-hover">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:text-primary-hover">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
