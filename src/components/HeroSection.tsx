import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Battery, Radio, Sparkles, Smartphone, Navigation, MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onExplore: () => void;
  onResurrect: () => void;
  onOpenWaitlist: () => void;
  onOpenAiStudio: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplore,
  onResurrect,
  onOpenWaitlist,
  onOpenAiStudio,
}) => {
  const [activeSeconds, setActiveSeconds] = useState<number>(42 * 60 + 17);
  const [batteryImpact, setBatteryImpact] = useState<number>(1.2);
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [currentPace, setCurrentPace] = useState<string>('3.4 km/h');

  // DOM Refs for animations
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const fullRoutePathRef = useRef<SVGPathElement | null>(null);
  const phoneContainerRef = useRef<HTMLDivElement | null>(null);
  const miniRoutePathRef = useRef<SVGPathElement | null>(null);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      if (isRecording) {
        setActiveSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (fullRoutePathRef.current) {
        fullRoutePathRef.current.style.strokeDashoffset = '0';
      }
      if (miniRoutePathRef.current) {
        miniRoutePathRef.current.style.strokeDashoffset = '0';
      }
      return;
    }

    const ctx = gsap.context(() => {
      // 10. ROUTE INK-DRAW (Full-panel SVG route path)
      // strokeDasharray = getTotalLength(), dashoffset -> 0 over 2.6s on load
      let fullRouteLength = 1200;
      if (fullRoutePathRef.current) {
        fullRouteLength = fullRoutePathRef.current.getTotalLength() || 1200;
        gsap.set(fullRoutePathRef.current, {
          strokeDasharray: fullRouteLength,
          strokeDashoffset: fullRouteLength,
        });

        gsap.to(fullRoutePathRef.current, {
          strokeDashoffset: 0,
          duration: 2.6,
          ease: 'power2.out',
          delay: 0.2,
        });
      }

      // 11. HEADLINE MASK RISE
      // Each word wrapped in overflow:hidden span; translateY 112% -> 0, 1.1s power3.out, 90ms stagger
      const words = document.querySelectorAll('.hero-mask-word');
      if (words.length > 0) {
        gsap.fromTo(
          words,
          {
            yPercent: 115,
            opacity: 0,
          },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            stagger: 0.09,
            delay: 0.15,
          }
        );
      }

      // 14. PHONE ENTRANCE + MINI ROUTE
      // Phone y: 80 -> 0, rotate: 10 -> 5° over 1.4s; inner mint-screen route draws (dashoffset 300 -> 0)
      if (phoneContainerRef.current) {
        gsap.fromTo(
          phoneContainerRef.current,
          {
            y: 80,
            rotation: 10,
            opacity: 0,
          },
          {
            y: 0,
            rotation: 5,
            opacity: 1,
            duration: 1.4,
            ease: 'power3.out',
            delay: 0.3,
            onComplete: () => {
              // Inner mini route ink draw
              if (miniRoutePathRef.current) {
                const miniLength = miniRoutePathRef.current.getTotalLength() || 300;
                gsap.set(miniRoutePathRef.current, {
                  strokeDasharray: miniLength,
                  strokeDashoffset: miniLength,
                });
                gsap.to(miniRoutePathRef.current, {
                  strokeDashoffset: 0,
                  duration: 1.4,
                  ease: 'power2.out',
                });
              }
            },
          }
        );
      }

      // 15. HERO SCROLL PIN-OUT
      // Scrubbed over +45%: route keeps drawing, phone drifts up -120px, hero copy fades to .25
      if (heroSectionRef.current) {
        const pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });

        // Phone drifts up -120px
        if (phoneContainerRef.current) {
          pinTl.to(
            phoneContainerRef.current,
            {
              y: -120,
              rotation: 2,
              ease: 'none',
            },
            0
          );
        }

        // Hero copy fades to 0.25
        if (heroCopyRef.current) {
          pinTl.to(
            heroCopyRef.current,
            {
              opacity: 0.25,
              y: -40,
              ease: 'none',
            },
            0
          );
        }

        // Route keeps drawing (negative dashoffset / progressive trail)
        if (fullRoutePathRef.current) {
          pinTl.to(
            fullRoutePathRef.current,
            {
              strokeDashoffset: -fullRouteLength * 0.3,
              ease: 'none',
            },
            0
          );
        }
      }
    }, heroSectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={heroSectionRef}
      data-cursor="#F2765A"
      data-label="POSTCARD"
      className="relative min-h-[96vh] w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden pt-20 select-none"
    >
      {/* 12. MESH GRADIENT DRIFT (4 pastel radial-gradient blobs: peach/butter/lilac/mint at 60vmax) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="mesh-blob-butter absolute -top-[20vmax] -left-[15vmax]" />
        <div className="mesh-blob-peach absolute -top-[10vmax] -right-[15vmax]" />
        <div className="mesh-blob-lilac absolute -bottom-[20vmax] left-[10vmax]" />
        <div className="mesh-blob-mint absolute -bottom-[15vmax] -right-[10vmax]" />
      </div>

      {/* 16. TOPO CONTOURS (~9 wavy closed SVG paths, terracotta 16% stroke on 22-34s sine loops) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-1"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="#C96B4A" strokeOpacity="0.16" strokeWidth="1.5" strokeLinecap="round">
          {/* Ring 1 */}
          <path
            className="topo-drift-a"
            d="M 200 450 C 230 320, 480 260, 680 320 C 880 380, 990 280, 1150 360 C 1310 440, 1380 600, 1260 720 C 1140 840, 940 820, 780 770 C 620 720, 410 790, 290 710 C 170 630, 170 580, 200 450 Z"
          />
          {/* Ring 2 */}
          <path
            className="topo-drift-b"
            d="M 260 460 C 290 350, 500 300, 670 350 C 840 400, 950 320, 1080 390 C 1210 460, 1270 590, 1170 690 C 1070 790, 900 760, 770 720 C 640 680, 450 740, 340 670 C 230 600, 230 570, 260 460 Z"
          />
          {/* Ring 3 */}
          <path
            className="topo-drift-c"
            d="M 320 470 C 350 380, 520 340, 660 380 C 800 420, 910 360, 1010 420 C 1110 480, 1160 580, 1080 660 C 1000 740, 860 700, 760 670 C 660 640, 490 690, 390 630 C 290 570, 290 560, 320 470 Z"
          />
          {/* Ring 4 */}
          <path
            className="topo-drift-a"
            d="M 380 480 C 410 410, 540 380, 650 410 C 760 440, 870 400, 940 450 C 1010 500, 1050 570, 990 630 C 930 690, 820 640, 750 620 C 680 600, 530 640, 440 590 C 350 540, 350 550, 380 480 Z"
          />
          {/* Ring 5 (Upper Ridge) */}
          <path
            className="topo-drift-b"
            d="M 50 180 C 180 120, 380 160, 540 100 C 700 40, 890 90, 1060 50 C 1230 10, 1380 80, 1420 190"
          />
          {/* Ring 6 */}
          <path
            className="topo-drift-c"
            d="M 30 220 C 170 160, 370 200, 530 140 C 690 80, 880 130, 1050 90 C 1220 50, 1370 120, 1420 230"
          />
          {/* Ring 7 (Southern Cove) */}
          <path
            className="topo-drift-a"
            d="M 120 780 C 300 840, 560 820, 740 870 C 920 920, 1180 880, 1380 920"
          />
          {/* Ring 8 */}
          <path
            className="topo-drift-b"
            d="M 90 820 C 280 880, 540 860, 720 910 C 900 960, 1160 920, 1360 960"
          />
          {/* Ring 9 (Inland Hill) */}
          <path
            className="topo-drift-c"
            d="M 440 510 C 470 460, 580 440, 660 460 C 740 480, 810 470, 860 510 C 910 550, 920 600, 860 630 C 800 660, 710 630, 640 620 C 570 610, 480 630, 450 590 C 420 550, 410 560, 440 510 Z"
          />
        </g>
      </svg>

      {/* 10. ROUTE INK-DRAW (Full-panel SVG Route across Hero with Ghost Path beneath) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-2"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Ghost Path at 35% opacity beneath */}
        <path
          d="M 80 620 C 260 580, 390 720, 580 560 S 840 420, 980 520 S 1220 320, 1380 380"
          stroke="#C96B4A"
          strokeOpacity="0.35"
          strokeWidth="4"
          strokeDasharray="8 8"
          strokeLinecap="round"
        />

        {/* Dynamic Primary Route (dashoffset animated 0 -> 2.6s) */}
        <path
          ref={fullRoutePathRef}
          d="M 80 620 C 260 580, 390 720, 580 560 S 840 420, 980 520 S 1220 320, 1380 380"
          stroke="#F2765A"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ willChange: 'stroke-dashoffset' }}
        />

        {/* Route Key Waypoint Anchors */}
        <g className="font-mono text-[10px] font-bold" fill="#4A3728">
          {/* Waypoint 1 */}
          <circle cx="80" cy="620" r="6" fill="#4A3728" />
          <circle cx="80" cy="620" r="3" fill="#FFF9F0" />
          <text x="95" y="625" fill="#4A3728" opacity="0.85">
            0.0km · FORT KOCHI
          </text>

          {/* Waypoint 2 */}
          <circle cx="580" cy="560" r="5" fill="#F2765A" />
          <text x="595" y="565" fill="#4A3728" opacity="0.85">
            2.4km · MATTANCHERRY
          </text>

          {/* Waypoint 3 */}
          <circle cx="980" cy="520" r="5" fill="#E0A458" />
          <text x="995" y="525" fill="#4A3728" opacity="0.85">
            5.1km · JEW TOWN
          </text>

          {/* Waypoint 4 (Active GPS ping) */}
          <circle cx="1380" cy="380" r="7" fill="#F2765A" className="animate-ping" opacity="0.7" />
          <circle cx="1380" cy="380" r="6" fill="#F2765A" />
          <text x="1270" y="360" fill="#F2765A">
            ✦ 7.8km · VYPIN DOCK
          </text>
        </g>
      </svg>

      {/* 13. FLOATING 3D SHAPES (Gradient sphere + capsule, radial gradients fake light source, bob at 7s/8.5s) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-3">
        {/* Floating 3D Sphere (Offset highlight at 35% 35%, ambient shadow, 7s bob) */}
        <div
          className="floating-3d-sphere absolute top-[14%] right-[44%] w-20 h-20 sm:w-24 sm:h-24 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 35%, #FFF6EE 0%, #FFB69E 35%, #F2765A 70%, #A83C25 100%)',
            boxShadow: '0 24px 38px -8px rgba(242, 118, 90, 0.45), inset 0 -4px 10px rgba(74, 55, 40, 0.3)',
          }}
        />

        {/* Floating 3D Capsule (Multi-stop smooth gradient, 8.5s bob) */}
        <div
          className="floating-3d-capsule absolute bottom-[18%] right-[8%] w-36 sm:w-44 h-14 sm:h-16 rounded-full"
          style={{
            background:
              'linear-gradient(135deg, #FFF9F0 0%, #D9C7EE 35%, #CDB4DB 70%, #9F85B8 100%)',
            boxShadow: '0 22px 34px -6px rgba(122, 107, 168, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
          }}
        />
      </div>

      {/* Left Column: Monsoon Butter Postcard (lg:col-span-7) */}
      <div
        ref={heroCopyRef}
        className="hero-left-content lg:col-span-7 px-6 sm:px-12 md:px-16 py-14 sm:py-20 flex flex-col justify-center relative z-10 border-b lg:border-b-0 lg:border-r-2 border-[#4A3728]"
        style={{ willChange: 'opacity, transform' }}
      >
        {/* Kicker */}
        <div className="font-mono text-xs tracking-widest text-[#C96B4A] mb-4 font-bold flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#F2765A] animate-pulse" />
          <span className="scramble-kicker">SMART INDIA HACKATHON 2026 · PSCMR081 · GOVERNMENT OF KERALA</span>
        </div>

        {/* 11. HEADLINE MASK RISE (Words wrapped in overflow:hidden spans) */}
        <h1 className="font-serif-custom text-5xl sm:text-7xl lg:text-[86px] font-normal leading-[0.94] tracking-tight text-[#4A3728]">
          <span className="block overflow-hidden pb-1">
            <span className="hero-mask-word inline-block">Every</span>{' '}
            <span className="hero-mask-word inline-block">trip</span>{' '}
            <span className="hero-mask-word inline-block">you</span>
          </span>
          <span className="block overflow-hidden pb-1">
            <span className="hero-mask-word inline-block italic font-semibold text-[#F2765A]">forgot,</span>{' '}
            <span className="hero-mask-word inline-block italic font-semibold text-[#F2765A]">kept.</span>
          </span>
          <span className="block overflow-hidden pt-0.5">
            <span
              className="hero-mask-word inline-block font-extrabold text-transparent"
              style={{
                WebkitTextStroke: '2.5px #4A3728',
              }}
            >
              Automatically.
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-[#7a6a58] max-w-xl font-light leading-relaxed">
          TripSahay records your journeys while you walk — zero check-ins, zero tracking anxiety. Import your dead Google Timeline and watch years of travel come back to life with Gemini AI chronicles.
        </p>

        {/* Call to Actions with Magnetic Button attraction */}
        <div className="flex flex-wrap items-center gap-4 mt-8">
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
            className="btn btn-magnetic inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white text-[#4A3728] text-base font-semibold border-2 border-[#4A3728] hover:bg-[#FFF9F0] shadow-[3px_3px_0px_rgba(74,55,40,0.85)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#F2765A]" />
            <span>Synthesize AI Story</span>
          </button>
        </div>

        {/* Stickers / Trust Badges */}
        <div className="flex flex-wrap gap-3.5 mt-10">
          <div className="bg-[#BFE3CE] text-[#4A3728] font-mono text-xs font-bold px-4 py-2 rounded-xl border-2 border-[#4A3728] shadow-[3px_3px_0px_rgba(74,55,40,0.9)] transform -rotate-2">
            WORKS OFFLINE
          </div>
          <div className="bg-[#D9C7EE] text-[#4A3728] font-mono text-xs font-bold px-4 py-2 rounded-xl border-2 border-[#4A3728] shadow-[3px_3px_0px_rgba(74,55,40,0.9)] transform rotate-2">
            DPDP PRIVATE
          </div>
          <div className="bg-[#FFE3B3] text-[#4A3728] font-mono text-xs font-bold px-4 py-2 rounded-xl border-2 border-[#4A3728] shadow-[3px_3px_0px_rgba(74,55,40,0.9)] transform -rotate-1">
            3.1%/DAY — MEASURED
          </div>
          <div className="bg-[#DFF3E4] text-[#2E6E4E] font-mono text-xs font-bold px-4 py-2 rounded-xl border-2 border-[#2E6E4E] shadow-[3px_3px_0px_#2E6E4E] transform rotate-1">
            FIRESTORE PERSISTENT
          </div>
        </div>
      </div>

      {/* Right Column: Peach Canvas with Interactive Phone Device (lg:col-span-5) */}
      <div className="lg:col-span-5 relative flex items-center justify-center p-8 sm:p-12 overflow-hidden z-10">
        {/* 14. PHONE ENTRANCE + MINI ROUTE (Phone y:80->0, rotate:10->5°, inner route draws after landing) */}
        <div
          ref={phoneContainerRef}
          className="relative w-full max-w-[305px] bg-white rounded-[44px] border-3 border-[#4A3728] shadow-[18px_24px_0px_rgba(74,55,40,0.88)] p-4 transform rotate-5 hover:rotate-1 transition-transform duration-300 z-10"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Dynamic Island / Notch */}
          <div className="w-20 h-5 bg-[#4A3728] rounded-full mx-auto mb-4" />

          {/* Screen Content */}
          <div className="bg-[#FFF9F0] border-2 border-[#4A3728] rounded-2xl p-4 flex flex-col justify-between h-[460px]">
            <div>
              {/* Header with live timer & 14. Pulsing Spice Recording Dot */}
              <div className="flex items-center justify-between pb-3 border-b border-[#4A3728]/15">
                <div className="flex items-center gap-2">
                  {/* 14. Pulsing spice recording dot (CSS 2s) */}
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isRecording ? 'bg-[#F2765A] animate-pulse-spice' : 'bg-gray-400'
                    }`}
                  />
                  <span className="font-mono text-xs font-bold text-[#4A3728]">
                    {formatTime(activeSeconds)}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#2E6E4E] bg-[#DFF3E4] px-2 py-0.5 rounded-full border border-[#2E6E4E]/40 font-bold flex items-center gap-1">
                  <Navigation className="w-2.5 h-2.5 text-[#2E6E4E]" />
                  <span>GPS ACTIVE</span>
                </span>
              </div>

              {/* Trip Title */}
              <div className="mt-3">
                <h4 className="font-serif-custom text-xl font-bold text-[#4A3728]">
                  Fort Kochi Walk
                </h4>
                <p className="font-mono text-xs text-[#C96B4A] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#F2765A]" />
                  <span>coastal cadence · {currentPace}</span>
                </p>
              </div>

              {/* 14. Inner Mint-Screen Mini Route Draw */}
              <div className="mt-3.5 h-32 bg-[#BFE3CE] rounded-xl border-2 border-[#4A3728] overflow-hidden relative p-2 shadow-inner">
                <svg viewBox="0 0 220 120" className="w-full h-full">
                  {/* Background faint path */}
                  <path
                    d="M 15 95 C 55 35, 105 85, 145 45 S 190 65, 205 35"
                    fill="none"
                    stroke="#4A3728"
                    strokeOpacity="0.25"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Mini route drawn after landing */}
                  <path
                    ref={miniRoutePathRef}
                    d="M 15 95 C 55 35, 105 85, 145 45 S 190 65, 205 35"
                    fill="none"
                    stroke="#C75B39"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    style={{ willChange: 'stroke-dashoffset' }}
                  />
                  <circle cx="15" cy="95" r="5" fill="#4A3728" />
                  <circle cx="145" cy="45" r="4" fill="#F2765A" />
                  <circle cx="205" cy="35" r="5" fill="#F2765A" className="animate-pulse" />
                </svg>
                <div className="absolute bottom-1.5 left-2 font-mono text-[9px] text-[#4A3728] font-bold bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-[#4A3728]/20">
                  24 WAYPOINTS RECORDED
                </div>
              </div>

              {/* Battery impact statement */}
              <div className="mt-3 flex items-center justify-between text-xs font-mono text-[#7a6a58]">
                <span className="flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-[#2E6E4E]" />
                  <span>measured battery:</span>
                </span>
                <span className="font-bold text-[#4A3728]">~{batteryImpact}% / day</span>
              </div>

              {/* AI Insight Pill */}
              <div
                onClick={onOpenAiStudio}
                className="mt-2.5 p-2 bg-[#FBEFD4] border border-[#4A3728]/30 rounded-lg text-[10px] text-[#4A3728] flex items-center gap-1.5 cursor-pointer hover:bg-[#FAD9C1] transition-colors"
              >
                <Sparkles className="w-3 h-3 text-[#F2765A]" />
                <span className="font-medium truncate">Gemini: "Petrichor on Princess Street"</span>
              </div>
            </div>

            {/* End / Resume Trip Button */}
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`w-full py-3 rounded-full font-mono text-xs font-bold border-2 border-[#4A3728] shadow-[2px_2px_0px_rgba(74,55,40,0.9)] transition-all cursor-pointer ${
                isRecording
                  ? 'bg-[#F2765A] text-white hover:bg-[#e06548]'
                  : 'bg-[#BFE3CE] text-[#4A3728] hover:bg-[#aee0c0]'
              }`}
            >
              {isRecording ? '■ Pause Passive Recording' : '▶ Resume Trip'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
