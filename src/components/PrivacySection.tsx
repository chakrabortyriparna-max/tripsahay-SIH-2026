import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, Trash2, KeyRound, Lock, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const PrivacySection: React.FC = () => {
  const [locationPerm, setLocationPerm] = useState<boolean>(true);
  const [motionPerm, setMotionPerm] = useState<boolean>(true);
  const [cloudSync, setCloudSync] = useState<boolean>(false);
  const [deletedConfirmed, setDeletedConfirmed] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // 27. Consent counter-parallax
  // Consent card yPercent +10 -> -10 scrubbed against scroll while copy stays put
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (sectionRef.current && cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { yPercent: 10 },
          {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleDelete = () => {
    setDeletedConfirmed(true);
    setTimeout(() => {
      setDeletedConfirmed(false);
    }, 3500);
  };

  return (
    <section
      id="privacy"
      ref={sectionRef}
      data-cursor="#7A6BA8"
      data-label="PRIVACY"
      className="relative w-full bg-[#EFE8FA] text-[#4A3728] py-28 md:py-36 px-6 md:px-16 border-b-2 border-[#4A3728] overflow-hidden select-none"
    >
      {/* Background soft glow */}
      <div className="absolute top-10 right-10 w-[550px] h-[550px] rounded-full bg-[#D9C7EE] opacity-60 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-[#FFF9F0] opacity-40 filter blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        {/* Left Column (Copy stays put) */}
        <div className="lg:col-span-7 space-y-6 reveal">
          <div className="font-mono text-xs tracking-widest text-[#7A6BA8] font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7A6BA8]" />
            <span className="scramble-kicker">SECTION 05 — PRIVACY &amp; CONSENT · LILAC LIGHT</span>
          </div>

          <h2 className="font-serif-custom text-4xl sm:text-6xl font-normal leading-[1.08] text-[#4A3728]">
            Private by architecture,<br />
            <em className="italic text-[#7A6BA8] font-semibold">not by promise.</em>
          </h2>

          <p className="text-lg text-[#7a6a58] font-light leading-relaxed max-w-xl">
            Your location history is the most sensitive data a phone holds. TripSahay treats it that way: every point is written to your device first, encrypted at rest, and uploaded only if you turn sync on. Consent is two toggles, in plain language — and "delete everything" means the cloud copies too.
          </p>

          <div className="space-y-3 pt-2">
            <div className="font-mono text-xs text-[#7A6BA8] bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-[#7A6BA8]/30 inline-flex items-center gap-2 font-bold shadow-sm">
              <KeyRound className="w-3.5 h-3.5 text-[#7A6BA8]" />
              <span>YOUR TRIP DATA STAYS ON THIS PHONE UNTIL YOU CHOOSE TO SYNC.</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#4A3728]/70">
              <span className="bg-[#D9C7EE]/60 px-2.5 py-1 rounded-md border border-[#7A6BA8]/20">✓ SQLCipher AES-256</span>
              <span className="bg-[#D9C7EE]/60 px-2.5 py-1 rounded-md border border-[#7A6BA8]/20">✓ Zero Telemetry Pings</span>
              <span className="bg-[#D9C7EE]/60 px-2.5 py-1 rounded-md border border-[#7A6BA8]/20">✓ DPDP Act 2023 Compliant</span>
            </div>
          </div>
        </div>

        {/* Right Column: 27. Consent Counter-Parallax Card (yPercent +10 -> -10) */}
        <div className="lg:col-span-5">
          <div
            ref={cardRef}
            className="bg-white border-2 border-[#4A3728] rounded-3xl p-7 sm:p-8 shadow-[12px_14px_0px_rgba(122,107,168,0.5)] space-y-6 will-change-transform"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#4A3728]/15 pb-4">
              <div>
                <span className="font-mono text-[10px] text-[#7A6BA8] font-bold tracking-wider block">CONSENT ARCHITECTURE</span>
                <h3 className="font-serif-custom text-2xl font-bold text-[#4A3728]">
                  First-run consent
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[#2E6E4E] bg-[#DFF3E4] px-2.5 py-1 rounded-lg border border-[#2E6E4E]/30 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                DPDP 2023
              </span>
            </div>

            {/* Static Toggles (Lilac switches) */}
            <div className="space-y-4">
              {/* Toggle 1: Location */}
              <div className="flex items-center justify-between py-2 border-b border-[#EFE8FA]">
                <div>
                  <b className="font-serif-custom text-base block text-[#4A3728]">Location</b>
                  <span className="text-xs text-[#7a6a58] font-light">only while you move</span>
                </div>
                <button
                  onClick={() => setLocationPerm(!locationPerm)}
                  className={`w-13 h-7 rounded-full p-1 transition-colors cursor-pointer border border-[#4A3728] relative ${
                    locationPerm ? 'bg-[#7A6BA8]' : 'bg-[#d9cdee]'
                  }`}
                  aria-label="Toggle location permission"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                      locationPerm ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Motion Sensors */}
              <div className="flex items-center justify-between py-2 border-b border-[#EFE8FA]">
                <div>
                  <b className="font-serif-custom text-base block text-[#4A3728]">Motion Sensors</b>
                  <span className="text-xs text-[#7a6a58] font-light">never leaves the phone</span>
                </div>
                <button
                  onClick={() => setMotionPerm(!motionPerm)}
                  className={`w-13 h-7 rounded-full p-1 transition-colors cursor-pointer border border-[#4A3728] relative ${
                    motionPerm ? 'bg-[#7A6BA8]' : 'bg-[#d9cdee]'
                  }`}
                  aria-label="Toggle motion sensor permission"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                      motionPerm ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Cloud Sync (Off by default) */}
              <div className="flex items-center justify-between py-2 border-b border-[#EFE8FA]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <b className="font-serif-custom text-base block text-[#4A3728]">Cloud Sync</b>
                    <span className="font-mono text-[9px] bg-[#C96B4A]/10 text-[#C96B4A] px-1.5 py-0.5 rounded font-bold">OFF BY DEFAULT</span>
                  </div>
                  <span className="text-xs text-[#7a6a58] font-light">encrypted backup to Firestore</span>
                </div>
                <button
                  onClick={() => setCloudSync(!cloudSync)}
                  className={`w-13 h-7 rounded-full p-1 transition-colors cursor-pointer border border-[#4A3728] relative ${
                    cloudSync ? 'bg-[#7A6BA8]' : 'bg-[#d9cdee]'
                  }`}
                  aria-label="Toggle cloud sync"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                      cloudSync ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Delete-Everything Dashed Alert Card */}
            <div className="bg-[#FFF9F0] border-2 border-dashed border-[#C96B4A] rounded-2xl p-4 text-xs text-[#7a6a58] space-y-2.5">
              <div className="font-bold text-[#4A3728] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#C96B4A]">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Everything</span>
                </div>
                <span className="font-mono text-[9px] text-[#7a6a58]">ZERO-ORPHAN PURGE</span>
              </div>
              <p className="leading-relaxed font-light">
                One button, verified deletion. Local SQLite wipe + remote cascade. What's gone stays gone forever.
              </p>
              <button
                onClick={handleDelete}
                className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold border-2 transition-all cursor-pointer ${
                  deletedConfirmed
                    ? 'bg-[#2E6E4E] text-white border-[#2E6E4E] shadow-inner'
                    : 'bg-white text-[#C96B4A] border-[#4A3728] hover:bg-[#FBEFD4] shadow-[2px_2px_0px_rgba(74,55,40,0.8)]'
                }`}
              >
                {deletedConfirmed ? '✓ ALL LOCAL & CLOUD DATA PURGED' : 'TRIGGER ZERO-ORPHAN WIPE'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
