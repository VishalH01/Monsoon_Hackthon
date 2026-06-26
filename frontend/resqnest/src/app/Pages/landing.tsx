"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const FILL = { fontVariationSettings: "'FILL' 1" } as const;

const FEATURES = [
  {
    icon: "home_pin",
    title: "Shelter Locator",
    body: "Real-time GPS mapping of verified emergency shelters with live capacity updates and accessibility filtering.",
    iconWrap: "bg-blue-50 text-secondary group-hover:bg-secondary group-hover:text-white",
  },
  {
    icon: "psychology",
    title: "AI Emergency Prioritization",
    body: "Natural Language Processing (NLP) to analyze incoming SOS messages and rank urgency for first responders.",
    iconWrap: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
  },
  {
    icon: "payments",
    title: "Donation Management",
    body: "Blockchain-verified ledger tracking for monetary and material donations, ensuring 100% transparency.",
    iconWrap: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
  },
  {
    icon: "person_search",
    title: "Missing Person Tracking",
    body: "Facial recognition and secure database cross-referencing to reunite families across diverse impact zones.",
    iconWrap: "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
  },
  {
    icon: "local_shipping",
    title: "Relief Distribution",
    body: "Dynamic routing for logistics fleets to deliver food, water, and medicine avoiding blocked or hazardous paths.",
    iconWrap: "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white",
  },
];

const STEPS = [
  {
    num: "01",
    label: "Alert",
    color: "text-primary",
    body: "Early detection via sensor integration and citizen reports triggers global response nodes.",
  },
  {
    num: "02",
    label: "Coordination",
    color: "text-secondary",
    body: "Unified command center assigns tasks to NGOs, governments, and local volunteer networks.",
  },
  {
    num: "03",
    label: "Deployment",
    color: "text-emerald-400",
    body: "Assets and personnel are dispatched to ground zero with real-time navigation and support.",
  },
  {
    num: "04",
    label: "Recovery",
    color: "text-purple-400",
    body: "Long-term rebuilding initiatives and donation distribution to ensure community resilience.",
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fade cards in as they scroll into view (ported from the original script).
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const els = Array.from(
      root.querySelectorAll<HTMLElement>(".grid > div")
    );
    els.forEach((el) =>
      el.classList.add(
        "transition-all",
        "duration-700",
        "opacity-0",
        "translate-y-10"
      )
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#F8FAFC] text-on-surface">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-outline-variant/30 px-6 md:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-2xl" style={FILL}>
              volunteer_activism
            </span>
          </div>
          <span className="font-headline-md text-headline-md font-extrabold text-primary tracking-tight">
            ReliefLink
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-label-md text-label-md text-on-surface-variant">
          <a className="hover:text-primary transition-colors" href="#">
            Home
          </a>
          <a className="hover:text-primary transition-colors" href="#features">
            Features
          </a>
          <a className="hover:text-primary transition-colors" href="#about">
            About
          </a>
          <a className="hover:text-primary transition-colors" href="#contact">
            Contact
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container rounded-xl transition-all"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 bg-secondary text-white font-label-md text-label-md rounded-xl hover:shadow-lg transition-all active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="glass-card p-8 md:p-12 rounded-[16px] shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/10 text-primary-container rounded-full font-label-md text-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                LIVE MISSION TRACKING ACTIVE
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface leading-tight mb-6">
                Connecting Communities{" "}
                <span className="text-primary">During Disasters</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-lg">
                ReliefLink provides the mission-critical infrastructure to
                coordinate emergency response, track logistics, and save lives
                with precision software.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* TODO: point to /sos once that page exists */}
                <Link
                  href="/register"
                  className="px-8 py-4 bg-[#DC2626] text-white font-label-md text-label-md rounded-xl shadow-xl shadow-red-500/20 hover:bg-[#B91C1C] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">emergency</span>
                  Report Emergency
                </Link>
                <Link
                  href="/register"
                  className="px-8 py-4 bg-[#2563EB] text-white font-label-md text-label-md rounded-xl shadow-xl shadow-blue-500/20 hover:bg-[#1D4ED8] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">group</span>
                  Become a Volunteer
                </Link>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="ReliefLink Platform Visualization"
              className="relative z-0 w-full h-auto animate-float drop-shadow-2xl rounded-2xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC6DJH5m3_6cN6ff3f1RySkAU_X_RJGSSgdOQQnRJaAoH1IWUphjkph1bY_FnuIWw-BQ79NMai7fOPVOxGMMh-Og3OFObytkaLS3RR5QW9aoSkwKRWxPEYm9RNM-8uly0y6-FC8depegAA-JKJBzEAeCBmj87SOgQz0hU1aOiHvKgQJt2kOSa3CTm-_bOXzvLpGN5SNStb29YHPlPK-kpZBfEzaFqO7xQZNBwMOanphqTTNEnlNyvsvGfhCOzNYPdr3zqcOHKw4hg"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "12s", label: "Avg. Response", color: "text-primary" },
              { value: "1.2M+", label: "Lives Impacted", color: "text-secondary" },
              { value: "45", label: "Countries", color: "text-on-surface" },
              { value: "50k+", label: "Volunteers", color: "text-on-surface" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="shimmer-bg p-8 rounded-[16px] text-center border border-slate-100"
              >
                <div
                  className={`font-headline-lg text-headline-lg mb-1 ${stat.color}`}
                >
                  {stat.value}
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-surface-container-lowest" id="features">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg mb-4">
              Command &amp; Control Capabilities
            </h2>
            <p className="text-on-surface-variant font-body-lg max-w-2xl mx-auto">
              Equipping operators with real-time situational awareness and
              automated triage systems.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Shelter Locator */}
            <FeatureCard {...FEATURES[0]} />

            {/* SOS — highlighted */}
            <div className="p-8 bg-white rounded-[16px] border-2 border-primary animate-emergency shadow-xl relative overflow-hidden group">
              <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl">sos</span>
              </div>
              <h3 className="font-headline-md text-xl mb-3">One Click SOS</h3>
              <p className="text-on-surface-variant font-body-md">
                Instant distress signal broadcast with precise coordinates,
                health telemetry, and immediate drone dispatch integration.
              </p>
            </div>

            {FEATURES.slice(1).map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 bg-on-surface text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-xl">
              <h2 className="font-headline-lg text-headline-lg mb-4">
                Disaster Response Lifecycle
              </h2>
              <p className="text-white/60 font-body-lg">
                A systematic 4-step approach to mitigating chaos and ensuring
                operational continuity.
              </p>
            </div>
            <button className="px-8 py-4 border border-white/20 rounded-xl hover:bg-white/10 transition-all font-label-md">
              View Protocol Documentation
            </button>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="relative p-8 rounded-[16px] bg-white/5 border border-white/10 flex flex-col gap-12"
              >
                <div className="text-5xl font-extrabold text-white/10">
                  {step.num}
                </div>
                <div>
                  <div className={`font-headline-md text-xl mb-2 ${step.color}`}>
                    {step.label}
                  </div>
                  <p className="text-white/70 font-body-md">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="font-headline-lg text-headline-lg text-center mb-16">
            Trusted by Crisis Operators
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Testimonial
              quote="ReliefLink has transformed our response time. During the last hurricane, the AI prioritization saved us hours of triage, allowing our teams to reach victims in under 15 minutes."
              name="Sarah Jenkins"
              role="Director, National Crisis Center"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuAzu_iX1S-hkxMRclWrWELlVOsCPt-MtYKID4CRaMaxJhekKPrHeoUUCwdw8Qxlpg1Nz8ycKTRwLaOFWowzKGc1MNRwUFbE4Rd_qEQYXgEtFVH5s9gWr-SG0tHMhhkSKrm7royYsk9YaeuTlX_mf7op8qpR-nMVwiLxkWSzNMem-_kF2xIiB307OPmuRcmQY50dAnMpZt69kNf5W87RfMuPJOiruv_gjs7E2kznoP2rybQZvO0jjy7Q181vZoM_hGUp43ym62sywyE"
            />
            <Testimonial
              quote="As a field volunteer, communication is everything. The app's offline maps and seamless logistics tracking mean we're never operating in the dark. It is truly life-saving tech."
              name="Marcous Thorne"
              role="Lead Field Responder, NGO Alliance"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuBRmomEDM4QbnXu8ErghDuPwU3oscM3djYxRopurdA_psE2KdeqrntkmYXbAQ8XUMt9DOGDgaJolXcJJ8ZmEWwjwceN8tQ774PQvrustzA5RH-2ySGTbAxgWdVxdZB8xZ7-y2fpD0uo-i_xmuNiKb4dDTAMCj4yWgpJb2gztGBRBGtcIgb9_oNoo7K0Gyx4nnXy7YYds8Sxy-e778Bc98FknbTuOm234fc-M5dlURLBCeWh5ifwvCtrj4UzY_Cicimz3580ssR7Ul0"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-xl" style={FILL}>
                  volunteer_activism
                </span>
              </div>
              <span className="font-headline-md text-xl font-extrabold tracking-tight">
                ReliefLink
              </span>
            </div>
            <p className="text-white/50 font-body-sm leading-relaxed mb-6">
              The world&apos;s most advanced disaster management platform, built
              for the operators who stand between chaos and stability.
            </p>
            <div className="flex gap-4">
              {["share", "language", "public"].map((icon) => (
                <a
                  key={icon}
                  className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-lg">
                    {icon}
                  </span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-label-md text-label-md mb-6 text-white">
              Mission-Critical HQ
            </h4>
            <p className="text-white/50 font-body-sm mb-4">
              1200 Logistics Way
              <br />
              Silicon Valley, CA 94025
              <br />
              United States
            </p>
            <div className="flex items-center gap-2 text-primary font-bold mb-2">
              <span className="material-symbols-outlined text-sm">
                emergency_share
              </span>
              Emergency Line: 1-800-RELIEF
            </div>
          </div>
          <div>
            <h4 className="font-label-md text-label-md mb-6 text-white">
              Quick Links
            </h4>
            <ul className="space-y-3 text-white/50 font-body-sm">
              {[
                "About Mission",
                "Partner Agencies",
                "Safety Protocols",
                "Global Network",
              ].map((item) => (
                <li key={item}>
                  <a className="hover:text-white transition-colors" href="#">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-label-md text-label-md mb-6 text-white">
              Legal &amp; Privacy
            </h4>
            <ul className="space-y-3 text-white/50 font-body-sm">
              {[
                "Terms of Operations",
                "Data Privacy Policy",
                "Impact Reports",
                "Security Disclosure",
              ].map((item) => (
                <li key={item}>
                  <a className="hover:text-white transition-colors" href="#">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-white/10 text-center text-white/30 font-body-sm">
          © 2024 ReliefLink Systems. All rights reserved. Precision Software for
          Humanitarian Crisis.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  iconWrap,
}: {
  icon: string;
  title: string;
  body: string;
  iconWrap: string;
}) {
  return (
    <div className="p-8 bg-white rounded-[16px] border border-outline-variant/30 shadow-sm hover:shadow-xl transition-all group">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${iconWrap}`}
      >
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h3 className="font-headline-md text-xl mb-3">{title}</h3>
      <p className="text-on-surface-variant font-body-md">{body}</p>
    </div>
  );
}

function Testimonial({
  quote,
  name,
  role,
  img,
}: {
  quote: string;
  name: string;
  role: string;
  img: string;
}) {
  return (
    <div className="p-10 bg-white rounded-[16px] border border-outline-variant/30 shadow-md">
      <div className="flex gap-1 text-secondary mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="material-symbols-outlined" style={FILL}>
            star
          </span>
        ))}
      </div>
      <p className="font-body-lg italic text-on-surface mb-8">
        &quot;{quote}&quot;
      </p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full h-full object-cover"
            alt={`${name}, ${role}`}
            src={img}
          />
        </div>
        <div>
          <div className="font-label-md">{name}</div>
          <div className="text-body-sm text-on-surface-variant">{role}</div>
        </div>
      </div>
    </div>
  );
}
