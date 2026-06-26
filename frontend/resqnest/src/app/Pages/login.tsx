"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex min-h-screen">
      {/* Left Side: Visual Panel (Hidden on Mobile) */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-[#0F172A] overflow-hidden items-center justify-center">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container rounded-full blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-[120px] -ml-48 -mb-48" />
        </div>
        <div className="relative z-10 w-full px-16 flex flex-col items-center">
          {/* Branding Header */}
          <div className="absolute top-12 left-12 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white font-bold text-xl">
              R
            </div>
            <span className="font-headline-md text-headline-md font-extrabold text-white tracking-tight">
              ReliefLink
            </span>
          </div>
          {/* Main Illustration */}
          <div className="w-full max-w-2xl transform hover:scale-[1.02] transition-transform duration-700 ease-out">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="ReliefLink Disaster Management Ecosystem"
              className="w-full h-auto drop-shadow-2xl rounded-2xl"
              src="https://lh3.googleusercontent.com/aida/AP1WRLt_XRdrlkXvOV0hkJxbRnfDp5dBbKQrknQYn6wyOMJauthtAa-pm9xrVXZo6rm0BtpWVfTN6SPZBl448H0hXzOMiC6sgtCEVsSv12Gew0o58DeR8FLP2Wb9PXW6Lin9a-0T91dhdxY7Gl23bVxVallu1tbcmgHkbQtgb5b-k63KGhyNEMGEvBZBT9XazoTPey38A_WKCp78ndcRrfDqxFUosVxAeiXlpp71nN14gAvRB6XNsBLR-P_sj4I"
            />
          </div>
          {/* Mission Text */}
          <div className="mt-12 text-center max-w-md">
            <h2 className="font-headline-lg text-headline-lg text-white mb-4">
              Orchestrating Global Resilience
            </h2>
            <p className="font-body-md text-body-md text-white/70">
              A mission-critical management system designed for rapid
              deployment, resource tracking, and field coordination during
              emergency operations.
            </p>
          </div>
        </div>
        {/* Bottom Floating Badge */}
        <div className="absolute bottom-12 left-12 glass-panel px-4 py-2 rounded-full flex items-center gap-2 border-white/20">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-label-md text-white/90 tracking-widest uppercase">
            System Operational
          </span>
        </div>
      </section>

      {/* Right Side: Auth Panel */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-[440px] flex flex-col">
          {/* Mobile Header Only */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white font-bold text-xl">
              R
            </div>
            <span className="font-headline-md text-headline-md font-extrabold text-primary tracking-tight">
              ReliefLink
            </span>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-xl p-8 lg:p-10 shadow-md border border-slate-200">
            <div className="mb-8">
              <h1 className="font-headline-lg text-headline-lg text-on-background mb-1">
                Operator Login
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Sign in to the HQ Deployment Console
              </p>
            </div>

            {/* Social Login Cluster */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-outline-variant hover:bg-slate-50 rounded-lg transition-all active:scale-95">
                <span className="material-symbols-outlined text-[20px]">
                  account_balance
                </span>
                <span className="font-label-md text-label-md text-on-surface">
                  Microsoft SSO
                </span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-outline-variant hover:bg-slate-50 rounded-lg transition-all active:scale-95">
                <span className="material-symbols-outlined text-[20px]">
                  domain
                </span>
                <span className="font-label-md text-label-md text-on-surface">
                  Agency ID
                </span>
              </button>
            </div>

            <div className="relative flex items-center gap-4 mb-8">
              <div className="flex-grow h-px bg-outline-variant/50" />
              <span className="text-[12px] font-label-md text-on-surface-variant uppercase tracking-widest">
                or email access
              </span>
              <div className="flex-grow h-px bg-outline-variant/50" />
            </div>

            {/* Login Form */}
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label
                  className="font-label-md text-label-md text-on-background block"
                  htmlFor="email"
                >
                  Official Email Address
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors text-[20px]">
                    mail
                  </span>
                  <input
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-outline-variant focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all text-body-md font-body-md bg-white"
                    id="email"
                    placeholder="name@agency.gov"
                    type="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    className="font-label-md text-label-md text-on-background"
                    htmlFor="password"
                  >
                    Secure Password
                  </label>
                  <Link
                    className="text-[13px] font-label-md text-secondary hover:underline"
                    href="#"
                  >
                    Reset access?
                  </Link>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors text-[20px]">
                    lock
                  </span>
                  <input
                    className="w-full pl-11 pr-12 py-3 rounded-lg border border-outline-variant focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all text-body-md font-body-md bg-white"
                    id="password"
                    placeholder="••••••••••••"
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary"
                  id="remember"
                  type="checkbox"
                />
                <label
                  className="font-body-sm text-body-sm text-on-surface-variant select-none"
                  htmlFor="remember"
                >
                  Remember this terminal for 12 hours
                </label>
              </div>

              <button
                className="w-full py-4 bg-primary-container text-white font-label-md text-label-md rounded-lg shadow-lg shadow-primary-container/20 hover:bg-primary transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group"
                type="submit"
              >
                Authenticate &amp; Enter
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  login
                </span>
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Don&apos;t have a tactical account?{" "}
              <Link
                className="text-secondary font-bold hover:underline"
                href="/register"
              >
                Register New Entity
              </Link>
            </p>
            <div className="flex items-center gap-6 text-[12px] font-label-md text-on-surface-variant/60 uppercase tracking-tighter">
              <Link
                className="hover:text-on-background transition-colors"
                href="#"
              >
                Privacy Policy
              </Link>
              <span className="w-1 h-1 bg-outline-variant rounded-full" />
              <Link
                className="hover:text-on-background transition-colors"
                href="#"
              >
                Usage Agreement
              </Link>
              <span className="w-1 h-1 bg-outline-variant rounded-full" />
              <Link
                className="hover:text-on-background transition-colors"
                href="#"
              >
                Audit Logs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
