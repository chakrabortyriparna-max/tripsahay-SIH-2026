import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Radio, Compass, Sparkles } from 'lucide-react';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const percentageRef = useRef<HTMLSpanElement | null>(null);
  const [coordsText, setCoordsText] = useState('9.9312° N · 76.2673° E — ACQUIRING SATELLITES');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      setIsCompleted(true);
      return;
    }

    const progressObj = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        // Curtain yPercent -100 over 0.9s with power4.inOut
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power4.inOut',
          onComplete: () => {
            setIsCompleted(true);
            onComplete();
            ScrollTrigger.refresh();
          },
        });
      },
    });

    // 0 -> 100 percentage in Fraunces driving a 2px bar
    tl.to(progressObj, {
      value: 100,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        const val = Math.round(progressObj.value);
        if (percentageRef.current) {
          percentageRef.current.textContent = `${String(val).padStart(3, '0')}%`;
        }
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${val}%`;
        }
      },
    });

    // Rapid coordinate jitter during acquisition
    const coordInterval = setInterval(() => {
      if (progressObj.value < 90) {
        const lat = (9.9312 + (Math.random() - 0.5) * 0.004).toFixed(4);
        const lng = (76.2673 + (Math.random() - 0.5) * 0.004).toFixed(4);
        setCoordsText(`${lat}° N · ${lng}° E — ACQUIRING SATELLITES`);
      } else {
        setCoordsText('9.9678° N · 76.2422° E — FORT KOCHI LOCK ✦');
      }
    }, 90);

    return () => {
      clearInterval(coordInterval);
      tl.kill();
    };
  }, [onComplete]);

  if (isCompleted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-100 flex flex-col justify-between bg-[#FFF9F0] text-[#4A3728] p-6 sm:p-12 md:p-16 select-none border-b-4 border-[#4A3728]"
      style={{ willChange: 'transform' }}
    >
      {/* Top Header in Preloader */}
      <div className="flex items-center justify-between border-b border-[#4A3728]/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F2765A] border-2 border-[#4A3728] flex items-center justify-center text-white text-xs font-bold shadow-[2px_2px_0px_rgba(74,55,40,0.9)]">
            TS
          </div>
          <span className="font-serif-custom text-xl font-bold text-[#4A3728] tracking-tight">
            TripSahay
          </span>
        </div>

        <div className="font-mono text-xs text-[#C96B4A] font-bold flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#F2765A] animate-ping" />
          <span className="hidden sm:inline">SMART INDIA HACKATHON 2026</span>
          <span className="sm:hidden">SIH 2026</span>
        </div>
      </div>

      {/* Middle Center: Fraunces Big Percentage + Satellite GPS Readout */}
      <div className="max-w-3xl mx-auto w-full text-center space-y-6 my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBEFD4] border-2 border-[#4A3728] shadow-[3px_3px_0px_rgba(74,55,40,0.9)]">
          <Compass className="w-3.5 h-3.5 text-[#F2765A] animate-spin [animation-duration:6s]" />
          <span className="font-mono text-xs font-bold text-[#4A3728] tracking-wider">
            {coordsText}
          </span>
        </div>

        <div className="font-serif-custom text-7xl sm:text-9xl md:text-[130px] font-normal leading-none tracking-tight text-[#4A3728]">
          <span ref={percentageRef}>000%</span>
        </div>

        <p className="font-mono text-xs text-[#7a6a58] tracking-widest uppercase">
          Initializing On-Device SQLite Ledger · DPDP 2023 Shield · Motion Cadence Engine
        </p>

        {/* 2px Progress Bar */}
        <div className="w-full max-w-md mx-auto h-[2px] bg-[#4A3728]/20 relative overflow-hidden rounded-full mt-4">
          <div
            ref={progressBarRef}
            className="h-full bg-[#F2765A] transition-all duration-75 w-0"
          />
        </div>
      </div>

      {/* Bottom Footer Metadata */}
      <div className="flex items-center justify-between border-t border-[#4A3728]/20 pt-4 font-mono text-[11px] text-[#7a6a58]">
        <div>PASSIVE RESURRECTION · ZERO TRACKING BEACONS</div>
        <div className="text-right">KERALA TOURISM FIELD EDITION</div>
      </div>
    </div>
  );
};
