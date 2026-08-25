import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Upload, CheckCircle2, MapPin, Sparkles, Navigation, RefreshCw } from 'lucide-react';
import { Trip } from '../types';

gsap.registerPlugin(ScrollTrigger);

const RESTORED_TRIPS: Trip[] = [
  {
    id: 't1',
    year: 2026,
    title: 'Fort Kochi Heritage Walk',
    subtitle: 'AUG · 3 DAYS · 214 KM',
    distanceKm: 214,
    days: 3,
    status: 'recovered',
    category: 'WALK',
    date: 'AUG 2026',
    pointsCount: 1420
  },
  {
    id: 't2',
    year: 2024,
    title: 'Vembanad & Backwaters Ferry',
    subtitle: 'DEC · 4 DAYS · 340 KM',
    distanceKm: 340,
    days: 4,
    status: 'recovered',
    category: 'FERRY',
    date: 'DEC 2024',
    pointsCount: 3120
  },
  {
    id: 't3',
    year: 2023,
    title: 'Goa Coastal Roadtrip',
    subtitle: 'DEC · 6 DAYS · 1,102 KM',
    distanceKm: 1102,
    days: 6,
    status: 'recovered',
    category: 'ROADTRIP',
    date: 'DEC 2023',
    pointsCount: 8450
  },
  {
    id: 't4',
    year: 2021,
    title: 'Munnar Tea Highland Trails',
    subtitle: 'OCT · 5 DAYS · 1,031 KM',
    distanceKm: 1031,
    days: 5,
    status: 'recovered',
    category: 'HILLS',
    date: 'OCT 2021',
    pointsCount: 6890
  }
];

interface ResurrectionSectionProps {
  onOpenAiForTrip?: (trip: Trip) => void;
}

export const ResurrectionSection: React.FC<ResurrectionSectionProps> = ({ onOpenAiForTrip }) => {
  const [progress, setProgress] = useState<number>(0.85);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip>(RESTORED_TRIPS[0]);

  // DOM Refs for animation
  const sectionRef = useRef<HTMLElement | null>(null);
  const routePathRef = useRef<SVGPathElement | null>(null);
  const stampRow1Ref = useRef<HTMLDivElement | null>(null);
  const stampRow2Ref = useRef<HTMLDivElement | null>(null);
  const stampRow3Ref = useRef<HTMLDivElement | null>(null);
  const stampRow4Ref = useRef<HTMLDivElement | null>(null);

  // 17. Calculated statistics derived from progress p
  const totalKm = Math.round(progress * 3214);
  const tripsCount = Math.round(progress * 12);
  const mbParsed = Math.round(progress * 48);

  const runSimulation = () => {
    setIsSimulating(true);
    setProgress(0);
    let cur = 0;
    const interval = setInterval(() => {
      cur += 0.04;
      if (cur >= 1) {
        cur = 1;
        clearInterval(interval);
        setIsSimulating(false);
      }
      setProgress(cur);
    }, 50);
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 17. SCROLL = IMPORT SCRUB (Pinned-feel scrub:1 over +=140%)
      const rLen = routePathRef.current?.getTotalLength() || 900;
      if (routePathRef.current) {
        gsap.set(routePathRef.current, {
          strokeDasharray: rLen,
          strokeDashoffset: rLen * (1 - progress),
        });
      }

      if (sectionRef.current) {
        const scrubTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            end: '+=140%',
            scrub: 1,
            onUpdate: (self) => {
              if (!isSimulating) {
                const p = Math.min(1, Math.max(0.1, self.progress));
                setProgress(p);
                if (routePathRef.current) {
                  routePathRef.current.style.strokeDashoffset = `${rLen * (1 - p)}`;
                }
              }
            },
          },
        });

        // 18. YEAR-STAMP SLAMS
        // 3 stamp rows (2026/2024/2021) opacity .25 -> 1, x -16 -> 0, back.out(1.4), scrubbed
        const stamps = [stampRow1Ref.current, stampRow2Ref.current, stampRow3Ref.current, stampRow4Ref.current].filter(Boolean);
        if (stamps.length > 0) {
          gsap.fromTo(
            stamps,
            {
              opacity: 0.25,
              x: -16,
            },
            {
              opacity: 1,
              x: 0,
              ease: 'back.out(1.4)',
              stagger: 0.2,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 70%',
                end: 'bottom 80%',
                scrub: 1,
              },
            }
          );
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isSimulating]);

  return (
    <section
      id="resurrection"
      ref={sectionRef}
      data-cursor="#E0A458"
      data-label="RESURRECTION"
      className="relative w-full bg-[#FFF9F0] py-24 px-6 md:px-16 overflow-hidden border-b-2 border-[#4A3728]"
    >
      {/* Background Arc Rings */}
      <svg
        className="gsap-parallax-slow absolute -right-24 top-1/2 -translate-y-1/2 w-[520px] h-[520px] pointer-events-none opacity-40"
        data-speed="0.25"
        viewBox="0 0 520 520"
        fill="none"
      >
        <circle cx="260" cy="260" r="250" stroke="#FFD9C7" strokeWidth="26" />
        <circle cx="260" cy="260" r="200" stroke="#FAD9C1" strokeWidth="26" />
        <circle cx="260" cy="260" r="150" stroke="#BFE3CE" strokeWidth="26" />
        <circle cx="260" cy="260" r="100" stroke="#D9C7EE" strokeWidth="26" />
        <circle cx="260" cy="260" r="55" stroke="#F2765A" strokeWidth="26" />
      </svg>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: File Ingestion & Parsing scrubber */}
        <div className="lg:col-span-6 space-y-6 reveal">
          <div className="font-mono text-xs tracking-widest text-[#C96B4A] font-bold">
            <span className="scramble-kicker">SECTION 02 — THE RESURRECTION &amp; AI WEAVER</span>
          </div>

          {/* 19. INK-FLOW HEADLINE ("Scroll it back to life." with animated #coral->#ochre->#coral loop) */}
          <h2 className="font-serif-custom text-4xl sm:text-6xl text-[#4A3728] font-normal leading-tight">
            Drop the file.<br />
            <em className="ink-flow-headline italic font-bold not-italic">
              Scroll it back to life.
            </em>
          </h2>

          <p className="text-sm sm:text-base text-[#7a6a58] font-light leading-relaxed">
            Google Timeline shutdown does not mean your travel records are lost. TripSahay parses your raw JSON takeaway and feeds waypoint segments into Gemini 2.5 Flash to weave poetic chronicles.
          </p>

          {/* Upload simulator badge */}
          <div className="inline-flex flex-wrap items-center gap-3 font-mono text-xs text-[#4A3728] border-2 border-dashed border-[#C96B4A] bg-white rounded-xl p-3.5 shadow-sm">
            <Upload className="w-4 h-4 text-[#F2765A]" />
            <span className="font-semibold">timeline.json · 48 MB · 2019 → 2026</span>
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="btn btn-magnetic ml-auto px-3 py-1 bg-[#FBEFD4] hover:bg-[#FAD9C1] rounded border border-[#4A3728] text-[11px] font-bold cursor-pointer transition-colors"
            >
              {isSimulating ? 'PARSING...' : 'RE-PARSE TAKEAWAY'}
            </button>
          </div>

          {/* 17. Interactive & Scrub-driven Striped Progress Bar */}
          <div className="space-y-2">
            <div className="h-3.5 bg-[#eadfce] rounded-full overflow-hidden border-2 border-[#4A3728]">
              <div
                className="h-full transition-all duration-75"
                style={{
                  width: `${progress * 100}%`,
                  background:
                    'repeating-linear-gradient(45deg, #F2765A, #F2765A 10px, #E0A458 10px, #E0A458 20px)',
                }}
              />
            </div>
            <div className="flex justify-between items-center font-mono text-xs text-[#7a6a58]">
              <span className="font-bold text-[#4A3728]">
                PARSING · {(progress * 100).toFixed(0)}% · {tripsCount} OF 12 TRIPS RECOVERED
              </span>
              <span className="font-bold text-[#C96B4A]">{mbParsed} / 48 MB</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={progress}
              onChange={(e) => setProgress(parseFloat(e.target.value))}
              className="w-full accent-[#F2765A] cursor-pointer"
            />
          </div>

          {/* 18. YEAR-STAMP SLAMS: Year by Year Trip Rows */}
          <div className="space-y-3 pt-2">
            {RESTORED_TRIPS.map((tr, idx) => {
              const isSelected = selectedTrip.id === tr.id;
              const ref =
                idx === 0
                  ? stampRow1Ref
                  : idx === 1
                  ? stampRow2Ref
                  : idx === 2
                  ? stampRow3Ref
                  : stampRow4Ref;

              return (
                <div
                  key={tr.id}
                  ref={ref}
                  onClick={() => setSelectedTrip(tr)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white rounded-xl border-2 border-[#4A3728] shadow-[3px_3px_0px_rgba(74,55,40,0.85)] transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-[#F2765A] bg-[#FFFDF8]' : 'hover:-translate-y-0.5'
                  }`}
                  style={{ willChange: 'transform, opacity' }}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg border border-[#4A3728] ${
                        tr.year === 2026
                          ? 'bg-[#FBEFD4]'
                          : tr.year === 2024
                          ? 'bg-[#BFE3CE]'
                          : 'bg-[#D9C7EE]'
                      }`}
                    >
                      {tr.year}
                    </span>
                    <div>
                      <h4 className="font-serif-custom text-base font-bold text-[#4A3728]">
                        {tr.title}
                      </h4>
                      <span className="font-mono text-[11px] text-[#7a6a58]">
                        {tr.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAiForTrip?.(tr);
                      }}
                      className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#F2765A] bg-[#FFF9F0] px-2.5 py-1 rounded-md border border-[#F2765A] hover:bg-[#F2765A] hover:text-white transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Weave Story</span>
                    </button>
                    <div className="flex items-center gap-1 font-mono text-xs text-[#2E6E4E] font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">recovered</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Vector Topology Map */}
        <div className="lg:col-span-6">
          <div className="relative h-[490px] bg-[#DFF3E4] border-[2.5px] border-[#4A3728] rounded-2xl overflow-hidden shadow-[12px_14px_0px_rgba(74,55,40,0.85)] p-6 flex flex-col justify-between">
            {/* Top Percent Display */}
            <div className="flex justify-between items-start">
              <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#2E6E4E] bg-white px-2.5 py-1 rounded border border-[#2E6E4E]/30 font-bold">
                <Navigation className="w-3.5 h-3.5" />
                <span>TOPOLOGICAL SPLINE RECONSTRUCTION</span>
              </div>
              <span className="font-mono text-base font-bold text-[#C96B4A]">
                {(progress * 100).toFixed(0)}%
              </span>
            </div>

            {/* SVG Path Route with stroke-dashoffset responsive to progress */}
            <svg viewBox="0 0 700 700" className="absolute inset-0 w-full h-full p-8" fill="none">
              <path
                d="M 60 560 C 200 420, 300 520, 420 380 S 620 300, 680 180"
                stroke="#C75B39"
                strokeOpacity="0.25"
                strokeWidth="4"
              />
              <path
                ref={routePathRef}
                d="M 60 560 C 200 420, 300 520, 420 380 S 620 300, 680 180"
                stroke="#C75B39"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="900"
                strokeDashoffset={900 * (1 - progress)}
                style={{ willChange: 'stroke-dashoffset' }}
              />
              <path
                d="M 120 240 C 240 200, 330 300, 470 250"
                stroke="#C96B4A"
                strokeOpacity="0.35"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
              {/* Waypoint nodes */}
              <circle cx="60" cy="560" r="10" fill="#4A3728" />
              {progress > 0.4 && <circle cx="420" cy="380" r="8" fill="#C75B39" className="animate-pulse" />}
              {progress > 0.8 && <circle cx="680" cy="180" r="10" fill="#F2765A" />}
            </svg>

            {/* 17. Bottom Recovered Kilometres Counter (p * 3214, toLocaleString('en-IN')) */}
            <div className="relative z-10 flex items-end justify-between">
              <div className="bg-white/95 backdrop-blur-sm border border-[#4A3728] rounded-xl p-4 inline-block max-w-[240px] shadow-sm">
                <div className="font-serif-custom text-3xl sm:text-4xl font-bold text-[#4A3728]">
                  {totalKm.toLocaleString('en-IN')} km
                </div>
                <div className="font-mono text-[11px] text-[#C96B4A] tracking-wider font-bold">
                  RECOVERED SO FAR
                </div>
              </div>

              <button
                onClick={() => onOpenAiForTrip?.(selectedTrip)}
                className="bg-[#F2765A] text-white px-4 py-2.5 rounded-xl border-2 border-[#4A3728] font-mono text-xs font-bold shadow-[3px_3px_0px_rgba(74,55,40,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Chronicle for {selectedTrip.title.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
