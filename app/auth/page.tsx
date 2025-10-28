'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions/auth';
import { useEffect } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full rounded-lg bg-gradient-to-r from-[#D4A574] to-[#B8935F] py-3 font-semibold text-[#1B365D] transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2 focus:ring-offset-[#1B365D] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Signing in...' : 'Sign In'}
    </button>
  );
}

export default function AuthPage() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  useEffect(() => {
    if (errorMessage) {
      // Announce error to screen readers
      const announcement = document.getElementById('form-error');
      if (announcement) {
        announcement.focus();
      }
    }
  }, [errorMessage]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1B365D] to-[#0F1B2E] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 border-white/20 rounded-2xl border p-8 shadow-2xl backdrop-blur-lg">
          <div className="mb-8 text-center">
            <h1 className="text-white mb-2 text-3xl font-bold">
              Tailored Care Solutions
            </h1>
            <p className="text-white/80 text-sm">PSW Documentation System</p>
          </div>

          <form
            action={dispatch}
            role="form"
            aria-label="Admin sign in form"
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="email"
                className="text-white mb-2 block text-sm font-medium"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autoFocus
                autoComplete="email"
                defaultValue="admin@tailoredcare.com"
                className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:border-transparent w-full rounded-lg border px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-white mb-2 block text-sm font-medium"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="current-password"
                defaultValue="psw2025"
                className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:border-transparent w-full rounded-lg border px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
                placeholder="Enter your password"
              />
            </div>

            {errorMessage && (
              <div
                id="form-error"
                role="alert"
                aria-live="polite"
                tabIndex={-1}
                className="bg-red-500/20 border-red-500/50 text-red-200 rounded-lg border p-3 text-sm"
              >
                {errorMessage}
              </div>
            )}

            <SubmitButton />

            <p className="text-white/60 mt-4 text-center text-sm">
              Default credentials: admin@tailoredcare.com / psw2025
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
