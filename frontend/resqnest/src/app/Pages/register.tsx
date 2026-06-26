"use client";

import Link from "next/link";
import { useState } from "react";

type Role = "victim" | "volunteer";

const SKILLS = [
  "Medical",
  "Logistics",
  "Search & Rescue",
  "Technical/IT",
  "Language Support",
];

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("victim");
  const [skills, setSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitted(false);
    // Simulated submission — backend wiring comes later.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const tabClass = (active: boolean) =>
    `flex-1 py-2 px-4 rounded-md text-body-sm transition-all text-center ${
      active
        ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] text-primary font-semibold"
        : "text-on-surface-variant hover:bg-white/50"
    }`;

  return (
    <>
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-md border-b border-outline-variant flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            health_and_safety
          </span>
          <span className="font-headline-md text-headline-md font-bold text-primary">
            ReliefLink
          </span>
        </div>
        <Link
          className="font-label-md text-label-md font-semibold text-primary hover:opacity-80 transition-all"
          href="/login"
        >
          Login
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center py-24 px-margin-mobile">
        {/* Background Animation Effect */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40" />

        {/* Registration Card */}
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-md border border-outline-variant overflow-hidden">
          {/* Header Section */}
          <div className="p-stack-lg border-b border-outline-variant bg-surface-container-low/50">
            <h1 className="font-headline-md text-headline-md text-on-surface mb-2">
              Create Your Account
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Join the disaster relief network to coordinate and receive aid
              effectively.
            </p>
          </div>

          <form className="p-stack-lg space-y-stack-lg" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="space-y-stack-sm">
              <label className="font-label-md text-label-md text-on-surface-variant block uppercase tracking-wider">
                Account Role
              </label>
              <div className="flex p-1 bg-surface-container rounded-lg gap-1 border border-outline-variant">
                <button
                  className={tabClass(role === "victim")}
                  onClick={() => setRole("victim")}
                  type="button"
                >
                  I need assistance (Victim)
                </button>
                <button
                  className={tabClass(role === "volunteer")}
                  onClick={() => setRole("volunteer")}
                  type="button"
                >
                  I want to serve (Volunteer)
                </button>
              </div>
            </div>

            {/* Common Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface block">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 pl-4 pr-10 rounded-lg border border-outline bg-white font-body-md text-body-md form-input-focus transition-all"
                    placeholder="John Doe"
                    required
                    type="text"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant">
                    person
                  </span>
                </div>
              </div>
              {/* Email */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface block">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 pl-4 pr-10 rounded-lg border border-outline bg-white font-body-md text-body-md form-input-focus transition-all"
                    placeholder="john@example.com"
                    required
                    type="email"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant">
                    mail
                  </span>
                </div>
              </div>
              {/* Phone Number */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface block">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 pl-4 pr-10 rounded-lg border border-outline bg-white font-body-md text-body-md form-input-focus transition-all"
                    placeholder="+1 (555) 000-0000"
                    required
                    type="tel"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant">
                    call
                  </span>
                </div>
              </div>
              {/* Location */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface block">
                  Primary Location
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 pl-4 pr-10 rounded-lg border border-outline bg-white font-body-md text-body-md form-input-focus transition-all"
                    placeholder="San Francisco, CA"
                    required
                    type="text"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                    location_on
                  </span>
                </div>
              </div>
              {/* Password */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface block">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 pl-4 pr-10 rounded-lg border border-outline bg-white font-body-md text-body-md form-input-focus transition-all"
                    placeholder="••••••••"
                    required
                    type="password"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant">
                    lock
                  </span>
                </div>
              </div>
              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface block">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 pl-4 pr-10 rounded-lg border border-outline bg-white font-body-md text-body-md form-input-focus transition-all"
                    placeholder="••••••••"
                    required
                    type="password"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant">
                    lock_reset
                  </span>
                </div>
              </div>
            </div>

            {/* Volunteer Specific Fields */}
            {role === "volunteer" && (
              <div className="space-y-stack-lg pt-4 border-t border-outline-variant">
                {/* Skills Multi-select */}
                <div className="space-y-3">
                  <label className="font-label-md text-label-md text-on-surface block">
                    Specialized Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map((skill) => {
                      const active = skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          className={`px-3 py-1.5 rounded-full border border-secondary font-body-sm transition-all ${
                            active
                              ? "bg-secondary text-white"
                              : "text-secondary hover:bg-secondary/5"
                          }`}
                          onClick={() => toggleSkill(skill)}
                          type="button"
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Availability Selection */}
                <div className="space-y-3">
                  <label className="font-label-md text-label-md text-on-surface block">
                    Availability Status
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: "immediate", label: "Immediate" },
                      { value: "weekends", label: "Weekends" },
                      { value: "remote", label: "Remote" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="relative flex items-center p-4 rounded-lg border border-outline bg-white cursor-pointer hover:bg-surface transition-all"
                      >
                        <input
                          className="w-4 h-4 text-primary focus:ring-primary"
                          name="availability"
                          type="radio"
                          value={option.value}
                        />
                        <span className="ml-3 font-body-sm text-body-sm">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                className="mt-1 w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                id="terms"
                required
                type="checkbox"
              />
              <label
                className="font-body-sm text-body-sm text-on-surface-variant"
                htmlFor="terms"
              >
                I agree to the{" "}
                <Link className="text-primary hover:underline" href="#">
                  Terms of Service
                </Link>{" "}
                and acknowledge the{" "}
                <Link className="text-primary hover:underline" href="#">
                  Privacy Policy
                </Link>{" "}
                regarding emergency data sharing.
              </label>
            </div>

            {/* Success message */}
            {submitted && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 font-body-sm text-body-sm">
                <span className="material-symbols-outlined">check_circle</span>
                Registration submitted successfully! Please check your email for
                verification.
              </div>
            )}

            {/* CTA */}
            <div className="pt-4">
              <button
                className="w-full h-14 bg-primary-container text-white font-headline-md text-headline-md font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">
                      progress_activity
                    </span>
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Already have an account?{" "}
                <Link
                  className="text-primary font-semibold hover:underline"
                  href="/login"
                >
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant flex flex-col md:flex-row justify-between items-center py-stack-lg px-margin-mobile md:px-margin-desktop gap-stack-md">
        <div className="flex items-center gap-2">
          <span className="font-label-md text-label-md font-bold text-on-surface">
            ReliefLink
          </span>
        </div>
        <div className="flex gap-stack-md">
          <Link
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Privacy Policy
          </Link>
          <Link
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Contact Support
          </Link>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          © 2024 ReliefLink Emergency Management System. All rights reserved.
        </p>
      </footer>
    </>
  );
}
