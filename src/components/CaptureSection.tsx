import React, { useRef, useState } from 'react';
import { LecturePoster } from './LecturePoster';
import { Radio, Cpu, ShieldCheck, Zap, Database, Check } from 'lucide-react';

interface BentoTileProps {
  className?: string;
  shadowClass?: string;
  children: React.ReactNode;
}

// 21. Bento Tilt Card (rotateY ±6° / rotateX ∓6° with transformPerspective: 800, spring back on leave, translateY -6px + color-matched shadow)
const BentoTiltCard: React.FC<BentoTileProps> = ({ className = '', shadowClass = '', children }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    // rotateY ±6°, rotateX ∓6°
    setTilt({
      ry: xRatio * 12,
      rx: -yRatio * 12,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-6px)`
          : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
      className={`border-2 border-[#4A3728] rounded-3xl p-7 flex flex-col justify-between select-none ${shadowClass} ${className}`}
    >
      {children}
    </div>
  );
};

export const CaptureSection: React.FC = () => {
  return (
    <section
      id="capture"
      data-cursor="#C96B4A"
      data-label="CAPTURE"
      className="relative w-full bg-[#F2E3C6] py-24 px-6 md:px-16 border-b-2 border-[#4A3728]"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="reveal">
          <div className="font-mono text-xs tracking-widest text-[#C96B4A] font-bold mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#F2765A]" />
            <span className="scramble-kicker">SECTION 03 — HOW CAPTURE WORKS · MORNING PAPER BENTO</span>
          </div>
          <h2 className="font-serif-custom text-4xl sm:text-6xl text-[#4A3728] font-normal leading-tight">
            Engineered, <em className="italic text-[#C96B4A] font-semibold">not magic.</em>
          </h2>
          <p className="text-[#7a6a58] text-base sm:text-lg mt-3 max-w-2xl font-light leading-relaxed">
            Three boring, battle-tested mechanisms doing one extraordinary thing — arranged the way your brain already reads: big thing first, details fanning out.
          </p>
        </div>

        {/* 21. BENTO TILT GRID (5 Asymmetric Tiles: Mint, Amber, Butter, Peach/Coral, and Gradient) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {/* Tile 1 (Mint) — Asymmetric Large Tile (lg:col-span-7) */}
          <BentoTiltCard
            className="lg:col-span-7 bg-[#D9F5E8] shadow-[8px_10px_0px_rgba(46,110,78,0.35)]"
            shadowClass="bento-mint-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-[#2E6E4E] tracking-widest font-bold">
                  01 — MOTION-AWARE GPS RADAR
                </span>
                <span className="bg-white/80 text-[#2E6E4E] font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#2E6E4E]/30">
                  DYNAMIC SAMPLING
                </span>
              </div>
              <h3 className="font-serif-custom text-3xl sm:text-4xl text-[#4A3728] font-semibold leading-tight">
                Point at anything.<br />
                <em className="italic text-[#F2765A] font-bold">It's captured.</em>
              </h3>
              <p className="text-[#7a6a58] text-sm sm:text-base mt-4 font-light leading-relaxed max-w-xl">
                Your phone's motion sensor watches for movement. GPS wakes only when you move, sleeps the moment you stop — a full day of travel costs about 3–4% battery, measured with the screen off.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#4A3728]/15">
              <div className="flex items-center gap-2 font-mono text-xs text-[#2E6E4E] font-bold">
                <Radio className="w-4 h-4 text-[#2E6E4E] animate-pulse" />
                <span>RADAR-GATED SENSORY HARDWARE</span>
              </div>
              <span className="font-mono text-xs font-bold text-[#4A3728]">
                v &gt; 0.8 m/s ⇒ WAKE
              </span>
            </div>
          </BentoTiltCard>

          {/* Tile 2 (Amber) — (lg:col-span-5) */}
          <BentoTiltCard
            className="lg:col-span-5 bg-[#FFF3D6] shadow-[8px_10px_0px_rgba(224,164,88,0.4)]"
            shadowClass="bento-amber-shadow"
          >
            <div>
              <div className="font-mono text-xs text-[#C96B4A] tracking-widest font-bold mb-2">
                02 — SEGMENT-SAFE ROUTING
              </div>
              <h3 className="font-serif-custom text-2xl sm:text-3xl text-[#4A3728] font-semibold leading-snug">
                Signal loss never eats a trip
              </h3>
              <p className="text-[#7a6a58] text-sm mt-3 font-light leading-relaxed">
                Tunnel, backwater, basement? The journey becomes two connected parts — every gap honest, every part labelled.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-3 border-t border-[#4A3728]/15">
              <span className="font-mono text-xs text-[#C96B4A] font-bold">
                ZERO DROPPED WAYPOINTS
              </span>
              <ShieldCheck className="w-4 h-4 text-[#C96B4A]" />
            </div>
          </BentoTiltCard>

          {/* Tile 3 (Butter) — (lg:col-span-4) */}
          <BentoTiltCard
            className="lg:col-span-4 bg-[#FFE3B3] shadow-[8px_10px_0px_rgba(201,107,74,0.35)]"
            shadowClass="bento-butter-shadow"
          >
            <div>
              <div className="font-mono text-5xl font-extrabold text-[#C96B4A]">
                0 taps
              </div>
              <h3 className="font-serif-custom text-2xl text-[#4A3728] font-semibold mt-2">
                to record
              </h3>
              <p className="text-[#7a6a58] text-sm mt-2 font-light">
                You walk. It writes. Continuous passive recording in your pocket.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-3 border-t border-[#4A3728]/15 font-mono text-xs text-[#2E6E4E] font-bold">
              <span>100% HANDS-FREE</span>
              <Zap className="w-4 h-4 text-[#2E6E4E]" />
            </div>
          </BentoTiltCard>

          {/* Tile 4 (Peach/Coral) — (lg:col-span-4) */}
          <BentoTiltCard
            className="lg:col-span-4 bg-[#FFDCC5] shadow-[8px_10px_0px_rgba(242,118,90,0.4)]"
            shadowClass="bento-coral-shadow"
          >
            <div>
              <div className="font-mono text-xs text-[#C96B4A] tracking-widest font-bold mb-2">
                04 — DPDP ENCRYPTED VAULT
              </div>
              <h3 className="font-serif-custom text-2xl text-[#4A3728] font-semibold">
                On-device privacy first
              </h3>
              <p className="text-[#7a6a58] text-sm mt-2 font-light leading-relaxed">
                Zero third-party trackers. Compliant with India's Digital Personal Data Protection Act.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-3 border-t border-[#4A3728]/15 font-mono text-xs text-[#C96B4A] font-bold">
              <span>LOCAL-FIRST ENCLAVE</span>
              <Check className="w-4 h-4 text-[#C96B4A]" />
            </div>
          </BentoTiltCard>

          {/* Tile 5 (Gradient) — (lg:col-span-4) */}
          <BentoTiltCard
            className="lg:col-span-4 bg-gradient-to-br from-[#FFDCC5] via-[#FFF3D6] to-[#E3D7FF] shadow-[8px_10px_0px_rgba(122,107,168,0.4)]"
            shadowClass="bento-gradient-shadow"
          >
            <div>
              <div className="font-mono text-xs text-[#7A6BA8] tracking-widest font-bold mb-2">
                05 — APPEND-ONLY IMMUTABLE LEDGER
              </div>
              <h3 className="font-serif-custom text-2xl text-[#4A3728] font-semibold">
                Nothing overwritten.
              </h3>
              <p className="text-[#7a6a58] text-sm mt-2 font-light leading-relaxed">
                Every point written once, stored in SQLite WAL mode with SHA-256 sequence hashes.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-3 border-t border-[#4A3728]/15">
              <span className="font-mono text-xs font-bold text-[#7A6BA8]">
                SQLITE WAL MODE
              </span>
              <Database className="w-4 h-4 text-[#7A6BA8]" />
            </div>
          </BentoTiltCard>
        </div>

        {/* 22. Kinetic Lecture Poster Animation Section (Interactive Swiss Poster Engine) */}
        <div className="pt-8 border-t border-[#4A3728]/20">
          <LecturePoster />
        </div>

        {/* State Machine Rule Badge */}
        <div className="text-center font-mono text-xs text-[#7a6a58] bg-[#FFF9F0] border-2 border-[#4A3728] rounded-full py-2.5 px-6 max-w-3xl mx-auto shadow-sm">
          SIMPLIFIED STATE FLOW — IDLE → RECORDING ⇄ PAUSED → SYNCED · 100% TRANSITION TEST COVERAGE
        </div>
      </div>
    </section>
  );
};
