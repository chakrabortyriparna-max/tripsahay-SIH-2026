import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, ChevronDown, Check, Compass, Radio, Smartphone, Sparkles, Activity, ShieldCheck, Zap, Database } from 'lucide-react';

interface ManifestSectionProps {
  onOpenWaitlist: () => void;
  onOpenAiStudio: () => void;
}

interface FaqItem {
  id: string;
  q: string;
  a: string;
  previewTitle: string;
  previewFact: string;
  previewBadge: string;
  previewIcon: 'battery' | 'gemini' | 'privacy' | 'launch';
}

export const ManifestSection: React.FC<ManifestSectionProps> = ({ onOpenWaitlist, onOpenAiStudio }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(10);
  const [istTime, setIstTime] = useState<string>('');

  // 29. FAQ Hover Preview State & Floating Card Ref
  const [activeFaq, setActiveFaq] = useState<FaqItem | null>(null);
  const previewCardRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const faqs: FaqItem[] = [
    {
      id: 'battery',
      q: 'Will it eat my phone battery during travel?',
      a: 'No. Motion-sensing silicon algorithms gate the GPS radio so that high-power location queries only trigger when you physically change cadence or location. A full 14-hour day of Kerala travel costs only 3.1% battery on standard hardware.',
      previewTitle: 'SILICON GATED GPS',
      previewFact: '3.1% battery drain over a full 14-hour expedition. Accelerometer pauses polling when idle.',
      previewBadge: '3.1% / 14 HRS',
      previewIcon: 'battery'
    },
    {
      id: 'gemini',
      q: 'How does the Gemini AI story synthesis work?',
      a: 'When you resurrect an old Google Timeline export or finish a journey, our Gemini 2.5 Flash pipeline translates raw latitude-longitude clusters into culturally rich, poetic Risograph chronicles, extracting landmark history, Malayalam idioms, and carbon footprint analysis.',
      previewTitle: 'GEMINI 2.5 FLASH',
      previewFact: 'Translates raw GPS coordinate sequences into poetic cultural Risograph story chapters.',
      previewBadge: 'AI STORYTELLING',
      previewIcon: 'gemini'
    },
    {
      id: 'privacy',
      q: 'Is my data private under India DPDP Act 2023?',
      a: 'Yes. All capture and topological map indexing happens strictly on your local SQLite instance first. Data is uploaded to Firebase Firestore only if you explicitly toggle Cloud Sync. The "Delete Everything" trigger executes an immediate permanent purge.',
      previewTitle: 'ZERO TELEMETRY',
      previewFact: 'Stored in SQLCipher encrypted local database. Cloud backup is opt-in, zero third-party tracking.',
      previewBadge: 'DPDP 2023',
      previewIcon: 'privacy'
    },
    {
      id: 'launch',
      q: 'When is the Android App launching?',
      a: 'We are in closed beta testing with Kerala Tourism field guides. You can reserve your priority slot right now on our Android waitlist to get early wave access.',
      previewTitle: 'CLOSED BETA v1.4',
      previewFact: 'Active testing across Fort Kochi, Munnar, and Wayanad trail routes with 1,482 explorers.',
      previewBadge: 'Q3 2026 WAVE',
      previewIcon: 'launch'
    }
  ];

  // 31. Live IST clock
  useEffect(() => {
    const updateTime = () => {
      setIstTime(
        new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 30. Dotted Countdown: counts 10 -> 00 at 1s intervals, loops
  useEffect(() => {
    const cd = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 10 : prev - 1));
    }, 1000);
    return () => clearInterval(cd);
  }, []);

  // 29. FAQ hover preview: floating card (250px, ink border, hard shadow) follows cursor via quickTo
  useEffect(() => {
    const card = previewCardRef.current;
    if (!card) return;

    const xTo = gsap.quickTo(card, 'x', { duration: 0.2, ease: 'power3.out' });
    const yTo = gsap.quickTo(card, 'y', { duration: 0.2, ease: 'power3.out' });

    const handleMouseMove = (e: MouseEvent) => {
      // Offset card so it doesn't collide directly under cursor pointer
      xTo(e.clientX + 16);
      yTo(e.clientY + 16);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleFaqMouseEnter = (faq: FaqItem) => {
    setActiveFaq(faq);
    if (previewCardRef.current) {
      gsap.to(previewCardRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  };

  const handleFaqMouseLeave = () => {
    if (previewCardRef.current) {
      gsap.to(previewCardRef.current, {
        scale: 0.92,
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => setActiveFaq(null)
      });
    }
  };

  // 30. Dot-matrix numerals: each digit = 3x5 grid of 11px dots, patterns from a 0-9 bitmap map
  // Counts 10->00 at 1s intervals, loops; odd digits coral (#F2765A), even lilac-deep (#7A6BA8)
  const DOT_MAP: Record<string, string[]> = {
    '0': ['111', '101', '101', '101', '111'],
    '1': ['010', '110', '010', '010', '111'],
    '2': ['111', '001', '111', '100', '111'],
    '3': ['111', '001', '111', '001', '111'],
    '4': ['101', '101', '111', '001', '001'],
    '5': ['111', '100', '111', '001', '111'],
    '6': ['111', '100', '111', '101', '111'],
    '7': ['111', '001', '001', '001', '001'],
    '8': ['111', '101', '111', '101', '111'],
    '9': ['111', '101', '111', '001', '111']
  };

  const renderDigit = (digitChar: string, digitIndex: number) => {
    const pattern = DOT_MAP[digitChar] || DOT_MAP['0'];
    const numVal = parseInt(digitChar, 10);
    // 30. Odd digits coral, even lilac-deep
    const activeColorClass = numVal % 2 !== 0 ? 'bg-[#F2765A]' : 'bg-[#7A6BA8]';

    return (
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/70 backdrop-blur-sm rounded-xl border border-[#4A3728]/20 shadow-sm">
        {pattern.flatMap((row, r) =>
          row.split('').map((dot, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-[11px] h-[11px] rounded-full transition-all duration-150 ${
                dot === '1'
                  ? `${activeColorClass} scale-100 shadow-[0_1px_2px_rgba(0,0,0,0.15)]`
                  : 'bg-[#4A3728]/15 scale-90'
              }`}
            />
          ))
        )}
      </div>
    );
  };

  const countStr = String(countdown).padStart(2, '0');

  return (
    <section
      id="manifest"
      ref={sectionRef}
      data-cursor="#F2765A"
      data-label="MANIFEST"
      className="relative w-full bg-[#FBEFD4] pt-24 overflow-hidden border-t-2 border-[#4A3728] select-none"
    >
      {/* 28. WARM AURORA
          3 pastel radial blobs (peach/mint/lilac) on butter bg, multiply blend, drift keyframes 16–22s — compositor-only */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-55">
        {/* Peach blob */}
        <div
          className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-[#FFD6BA] filter blur-[90px] animate-aurora-1"
          style={{ willChange: 'transform' }}
        />
        {/* Mint blob */}
        <div
          className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-[#BFE3CE] filter blur-[95px] animate-aurora-2"
          style={{ willChange: 'transform' }}
        />
        {/* Lilac blob */}
        <div
          className="absolute -bottom-[10%] left-[25%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-[#E3D5FF] filter blur-[85px] animate-aurora-3"
          style={{ willChange: 'transform' }}
        />
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8 reveal">
        <div className="font-mono text-xs tracking-widest text-[#C96B4A] font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F2765A]" />
          <span className="scramble-kicker">SECTION 06 — THE MANIFEST &amp; WAITLIST</span>
        </div>

        <h2 className="font-serif-custom text-5xl sm:text-7xl lg:text-8xl text-[#4A3728] font-normal leading-[0.95]">
          Start <em className="italic text-[#F2765A] font-semibold">keeping.</em>
        </h2>

        <p className="text-lg sm:text-xl text-[#7a6a58] font-light max-w-xl mx-auto leading-relaxed">
          Reserve your spot on the Android launch waitlist. Your resurrected Google Timelines and next expeditions are ready to be immortalized.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onOpenWaitlist}
            className="btn btn-magnetic inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#F2765A] text-white text-base font-semibold border-2 border-[#4A3728] shadow-[4px_4px_0px_rgba(74,55,40,0.95)] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Get the Android App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAiStudio}
            className="btn btn-magnetic inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white text-[#4A3728] text-base font-semibold border-2 border-[#4A3728] hover:bg-[#FFF9F0] shadow-[3px_3px_0px_rgba(74,55,40,0.85)] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#F2765A]" />
            <span>Try Gemini Story Studio</span>
          </button>
        </div>

        {/* 29. FAQ Accordion with Hover Preview */}
        <div className="text-left pt-12 space-y-3.5 max-w-2xl mx-auto">
          {faqs.map((f, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={f.id}
                onMouseEnter={() => handleFaqMouseEnter(f)}
                onMouseLeave={handleFaqMouseLeave}
                className="bg-white/90 backdrop-blur-md border-2 border-[#4A3728] rounded-2xl overflow-hidden shadow-[4px_4px_0px_rgba(74,55,40,0.85)] transition-all hover:border-[#F2765A]"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-5 flex items-center justify-between font-serif-custom text-lg sm:text-xl font-semibold text-[#4A3728] text-left cursor-pointer hover:text-[#F2765A] transition-colors"
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform shrink-0 ml-3 ${
                      isOpen ? 'rotate-180 text-[#F2765A]' : 'text-[#4A3728]'
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-[#7a6a58] font-light leading-relaxed border-t border-[#4A3728]/15 pt-3.5">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 29. FAQ Hover Preview Card (Fixed Portal following cursor via quickTo) */}
      <div
        ref={previewCardRef}
        className="fixed top-0 left-0 z-50 pointer-events-none opacity-0 scale-90 w-[250px] bg-[#FFFDF8] border-2 border-[#4A3728] rounded-2xl p-4 shadow-[8px_8px_0px_rgba(74,55,40,0.9)]"
        style={{ willChange: 'transform, opacity' }}
      >
        {activeFaq && (
          <div className="space-y-2 select-none">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold text-[#F2765A] tracking-wider uppercase">
                {activeFaq.previewBadge}
              </span>
              {activeFaq.previewIcon === 'battery' && <Zap className="w-3.5 h-3.5 text-[#2E6E4E]" />}
              {activeFaq.previewIcon === 'gemini' && <Sparkles className="w-3.5 h-3.5 text-[#F2765A]" />}
              {activeFaq.previewIcon === 'privacy' && <ShieldCheck className="w-3.5 h-3.5 text-[#7A6BA8]" />}
              {activeFaq.previewIcon === 'launch' && <Activity className="w-3.5 h-3.5 text-[#C96B4A]" />}
            </div>
            <h4 className="font-serif-custom text-sm font-bold text-[#4A3728] leading-snug">
              {activeFaq.previewTitle}
            </h4>
            <p className="text-[11px] text-[#7a6a58] leading-tight font-light">
              {activeFaq.previewFact}
            </p>
          </div>
        )}
      </div>

      {/* 31. MEGA FOOTER */}
      <footer className="mt-28 bg-[#FFF9F0] border-t-2 border-[#4A3728] pt-16 pb-12 px-6 md:px-16 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Row: System Status, Live IST clock & Navigation Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2.5">
              {/* 31. Pulsing "ALL SYSTEMS CAPTURING" status */}
              <div className="inline-flex items-center gap-2 font-mono text-xs text-[#2E6E4E] font-bold bg-[#DFF3E4] px-3 py-1 rounded-full border border-[#2E6E4E]/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E6E4E] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E6E4E]" />
                </span>
                <span>ALL SYSTEMS CAPTURING</span>
              </div>

              {/* 31. Live IST clock (toLocaleTimeString('en-IN', timeZone:'Asia/Kolkata')) */}
              <div className="font-mono text-sm text-[#4A3728] font-bold pt-1">
                IST <span className="text-[#F2765A]">{istTime || '00:00:00'}</span>
              </div>
              <div className="font-mono text-xs text-[#7a6a58]">
                9.9312° N, 76.2673° E — FORT KOCHI, KL
              </div>
            </div>

            <div>
              <h4 className="font-mono text-xs tracking-widest text-[#C96B4A] font-bold mb-3">PRODUCT</h4>
              <div className="space-y-1.5 text-sm font-medium text-[#7a6a58]">
                <div><a href="#resurrection" className="hover:text-[#4A3728] transition-colors">Timeline Resurrection</a></div>
                <div><a href="#capture" className="hover:text-[#4A3728] transition-colors">Kinetic Capture Engine</a></div>
                <div><a href="#passport" className="hover:text-[#4A3728] transition-colors">Trip Passports</a></div>
                <div><a href="#gallery" className="hover:text-[#4A3728] transition-colors">Sauna Mist Postcards</a></div>
              </div>
            </div>

            <div>
              <h4 className="font-mono text-xs tracking-widest text-[#C96B4A] font-bold mb-3">TRUST &amp; AI</h4>
              <div className="space-y-1.5 text-sm font-medium text-[#7a6a58]">
                <div><button onClick={onOpenAiStudio} className="hover:text-[#4A3728] text-left cursor-pointer transition-colors">Gemini Story Studio</button></div>
                <div><a href="#privacy" className="hover:text-[#4A3728] transition-colors">DPDP 2023 Architecture</a></div>
                <div><a href="#privacy" className="hover:text-[#4A3728] transition-colors">Wipe Cascade Engine</a></div>
                <div><a href="#oil" className="hover:text-[#4A3728] transition-colors">Thin-Film WebGL Film</a></div>
              </div>
            </div>

            <div>
              <h4 className="font-mono text-xs tracking-widest text-[#C96B4A] font-bold mb-3">SMART INDIA HACKATHON</h4>
              <p className="text-xs text-[#7a6a58] leading-relaxed">
                Problem Statement: PSCMR081<br />
                Govt. of Kerala Tourism &amp; Transport<br />
                Measured on Hardware, Not Marketed.
              </p>
            </div>
          </div>

          {/* 30. Dotted Countdown (3x5 grid of 11px dots, 0-9 bitmap, counts 10->00, loops, odd coral, even lilac-deep) */}
          <div className="flex flex-col items-center justify-center gap-3 pt-6 border-t border-[#4A3728]/15">
            <div className="font-mono text-xs tracking-widest text-[#C96B4A] font-bold uppercase">
              YOUR NEXT TRIP AUTO-STARTS IN
            </div>
            <div className="flex items-center gap-4">
              {renderDigit(countStr[0], 0)}
              <div className="flex flex-col gap-1.5 py-3">
                <span className="w-2 h-2 rounded-full bg-[#4A3728]" />
                <span className="w-2 h-2 rounded-full bg-[#4A3728]" />
              </div>
              {renderDigit(countStr[1], 1)}
            </div>
          </div>

          {/* 31. Giant wordmark — solid "Trip" + coral-outlined-stroke "sahay" (-webkit-text-stroke, no translate overlap) */}
          <div className="text-center select-none pt-4 overflow-hidden">
            <div className="font-serif-custom font-extrabold text-6xl sm:text-9xl md:text-[180px] lg:text-[210px] leading-none tracking-tight text-[#4A3728] flex items-center justify-center">
              <span>Trip</span>
              <span
                className="italic text-transparent"
                style={{
                  WebkitTextStroke: '3px #F2765A'
                }}
              >
                sahay
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#7a6a58] pt-6 border-t border-[#4A3728]/15 gap-2">
            <span>© 2026 TRIPSAHAY — BUILT FOR SIH 2026 · PSCMR081</span>
            <span>MADE IN KERALA · MEASURED, NOT MARKETED</span>
          </div>
        </div>
      </footer>
    </section>
  );
};
