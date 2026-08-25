import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Stamp, MapPin, Sparkles, Navigation } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface PassportData {
  no: string;
  title: string;
  issuedTo: string;
  pathD: string;
  accentColor: string;
  stops: string[];
  stamp: string;
  scope: string;
  distance: string;
  dates: string;
}

export const PassportSection: React.FC = () => {
  const [activeCounter, setActiveCounter] = useState<string>('01/03');
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressLineRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  const passports: PassportData[] = [
    {
      no: 'Nº 0042',
      title: 'Kerala Trip Passport',
      issuedTo: 'ISSUED TO CHAKR · AUG 2026 · COMPILED ON-DEVICE',
      pathD: 'M 24 115 C 90 55, 160 105, 220 50 S 310 70, 330 35',
      accentColor: '#C75B39',
      stops: [
        'AUG 14 · arrived Fort Kochi 09:41',
        'AUG 14 · Chinese Fishing Nets · 42 min · 6 photos',
        'AUG 16 · backwater ferry detected · 12 nautical mi',
        'AUG 17 · Jew Town antique alleyway waypoint'
      ],
      stamp: 'FERRY',
      scope: 'Contains route + stops for these dates only — no live location broadcast.',
      distance: '214 KM',
      dates: 'AUG 14–17, 2026'
    },
    {
      no: 'Nº 0031',
      title: 'Munnar Hills',
      issuedTo: 'JUL 2026 · IMPORTED FROM GOOGLE TIMELINE',
      pathD: 'M 30 120 C 110 85, 180 115, 250 55 S 320 45, 330 28',
      accentColor: '#E0A458',
      stops: [
        'JUL 12 · tea estate trails · 14 km on foot',
        'JUL 13 · Top Station viewpoint · sunrise 06:04',
        'JUL 14 · 2,600 m elevation gained · mist-filtered',
        'JUL 15 · Mattupetty Dam reservoir return'
      ],
      stamp: 'HILLS',
      scope: 'Resurrected from a Timeline JSON takeaway — every stop re-verified.',
      distance: '1,031 KM',
      dates: 'JUL 12–15, 2026'
    },
    {
      no: 'Nº 0019',
      title: 'Goa Roadtrip',
      issuedTo: 'DEC 2024 · 6 DAYS · 1,102 KM · THE ONE GOOGLE LOST',
      pathD: 'M 20 130 C 100 95, 150 125, 210 75 S 300 65, 330 32',
      accentColor: '#7A4442',
      stops: [
        'DEC 21 · coastal drive · 6 fuel stops auto-logged',
        'DEC 23 · beach shacks · 3 days, 1 tan, 0 signal drops',
        'DEC 25 · Chapora Fort sunset perimeter loop',
        'DEC 26 · returned home safely · WAL mode archive'
      ],
      stamp: 'ROADTRIP',
      scope: 'The trip that motivated this app. Never lost again.',
      distance: '1,102 KM',
      dates: 'DEC 21–26, 2024'
    }
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (sectionRef.current && trackRef.current) {
        // 23. PINNED HORIZONTAL FAN: Section pin:true over +=220%; track xPercent 0->-66 (scrub:.6);
        const pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: true,
            start: 'top top',
            end: '+=220%',
            scrub: 0.6,
            anticipatePin: 1,
            onUpdate: (self) => {
              const p = self.progress;
              // Progress line scaleX
              if (progressLineRef.current) {
                progressLineRef.current.style.transform = `scaleX(${Math.max(0.05, p)})`;
              }
              // "01/03" counter update in onUpdate
              const panelIndex = Math.min(2, Math.floor(p * 2.999));
              setActiveIdx(panelIndex);
              setActiveCounter(`0${panelIndex + 1}/03`);
            }
          }
        });

        // Horizontal track scrub
        pinTl.to(trackRef.current, {
          xPercent: -66.666,
          ease: 'none'
        }, 0);

        // Per-panel counter-rotation ±1.5° scrubbed
        panelRefs.current.forEach((panel, i) => {
          if (panel) {
            const rotStart = i % 2 === 0 ? -1.5 : 1.5;
            const rotEnd = i % 2 === 0 ? 1.5 : -1.5;
            pinTl.fromTo(
              panel,
              { rotateZ: rotStart },
              { rotateZ: rotEnd, ease: 'none' },
              0
            );
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="passport"
      ref={sectionRef}
      data-cursor="#A05A2C"
      data-label="PASSPORT"
      className="relative w-full h-screen bg-[#F7DAD6] text-[#7A4442] overflow-hidden border-b-2 border-[#7A4442]/30 flex flex-col justify-between"
    >
      {/* Top Section Header & Progress Rail */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-16 pt-8 md:pt-12 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 z-20">
        <div>
          <div className="font-mono text-xs tracking-widest text-[#7A4442]/80 font-bold mb-1.5 flex items-center gap-2">
            <span className="scramble-kicker">SECTION 04 — TRIP PASSPORT · DUSTY ROSE EDITION</span>
          </div>
          <h2 className="font-serif-custom text-3xl sm:text-5xl font-normal leading-tight text-[#7A4442]">
            Your trip, <em className="italic font-semibold">issued.</em>
          </h2>
        </div>

        {/* 23. Progress line scaleX + "01/03" counter display */}
        <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm border-2 border-[#7A4442] rounded-full px-5 py-2 shadow-[3px_3px_0px_rgba(122,68,66,0.8)]">
          <div className="font-mono text-xs font-bold text-[#7A4442] tracking-widest min-w-[52px]">
            {activeCounter}
          </div>
          <div className="w-24 sm:w-36 h-2 bg-[#7A4442]/20 rounded-full overflow-hidden">
            <div
              ref={progressLineRef}
              className="h-full bg-[#7A4442] rounded-full origin-left transition-transform duration-75"
              style={{ transform: 'scaleX(0.33)' }}
            />
          </div>
          <span className="font-mono text-[10px] text-[#7A4442]/70 font-semibold hidden sm:inline">
            HORIZONTAL FAN
          </span>
        </div>
      </div>

      {/* 23. Horizontal Track Container (Contains 3 Passports) */}
      <div className="relative w-full flex-1 flex items-center overflow-hidden z-10 px-6 md:px-16">
        <div
          ref={trackRef}
          className="flex gap-8 md:gap-14 items-center will-change-transform"
          style={{ width: '300%' }}
        >
          {passports.map((p, idx) => (
            <div
              key={idx}
              className="w-full flex-shrink-0 flex justify-center items-center px-4"
              style={{ width: '100%' }}
            >
              {/* 24. Polaroid tape: Each passport has ::before tape strip (peach gradient, rotated -4°, dispenser-style) */}
              <div
                ref={(el) => {
                  panelRefs.current[idx] = el;
                }}
                className="polaroid-tape-card relative w-full max-w-xl bg-[#FFFDF8] border-2 border-[#7A4442] rounded-2xl p-7 md:p-9 shadow-[12px_16px_0px_rgba(122,68,66,0.4)] select-none"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 27px, #f6ecea 27px, #f6ecea 28px)',
                  willChange: 'transform'
                }}
              >
                {/* Header title & passport number */}
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <span className="font-mono text-[10px] text-[#C75B39] font-bold tracking-widest block mb-0.5">
                      PASSPORT PANEL 0{idx + 1}
                    </span>
                    <h3 className="font-serif-custom text-2xl sm:text-3xl font-bold text-[#7A4442]">
                      {p.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-[#b98a87] block">{p.no}</span>
                    <span className="font-mono text-[11px] font-bold text-[#7A4442]">{p.distance}</span>
                  </div>
                </div>

                <div className="font-mono text-[11px] text-[#b98a87] mb-4">
                  {p.issuedTo}
                </div>

                {/* Map Vector Box */}
                <div className="h-36 bg-[#FBEFD4] rounded-xl border border-[#7A4442] overflow-hidden relative mb-4 shadow-inner">
                  <svg viewBox="0 0 344 150" className="w-full h-full">
                    <path
                      d={p.pathD}
                      fill="none"
                      stroke={p.accentColor}
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <circle cx="24" cy="115" r="6" fill="#4A3728" />
                    <circle cx="220" cy="50" r="5" fill={p.accentColor} />
                    <circle cx="330" cy="35" r="6" fill={p.accentColor} />
                  </svg>
                  <div className="absolute top-2 left-3 font-mono text-[10px] text-[#7A4442]/70 font-bold">
                    {p.dates}
                  </div>
                </div>

                {/* Timeline stops */}
                <div className="space-y-2 text-xs text-[#7A4442] font-mono leading-relaxed mb-5">
                  {p.stops.map((st, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#7A4442]" />
                      <span>{st}</span>
                    </div>
                  ))}
                </div>

                {/* Passport Rubber Stamp & Encryption tag */}
                <div className="flex items-center justify-between pt-3.5 border-t border-[#7A4442]/20">
                  <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#7A4442] border-2 border-dashed border-[#7A4442] px-3.5 py-1 rounded-lg transform rotate-2 bg-[#FFFDF8]">
                    <Stamp className="w-3.5 h-3.5" />
                    <span className="font-bold">{p.stamp}</span>
                  </div>
                  <span className="text-[10px] text-[#b98a87] font-mono font-bold">
                    ✓ ENCRYPTED AT REST
                  </span>
                </div>

                <div className="text-[11px] text-[#b98a87] mt-3 font-light">
                  {p.scope}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="w-full text-center pb-6 z-20">
        <span className="font-mono text-xs text-[#7A4442]/70 bg-white/50 px-4 py-1.5 rounded-full border border-[#7A4442]/20">
          SCROLL TO FAN THROUGH PASSPORTS · {activeCounter}
        </span>
      </div>
    </section>
  );
};
