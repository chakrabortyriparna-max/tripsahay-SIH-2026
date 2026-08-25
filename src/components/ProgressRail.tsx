import React, { useEffect, useState } from 'react';
import { scrollTo } from '../utils/motion';

interface RailSection {
  id: string;
  label: string;
  num: string;
  color: string;
}

const RAIL_SECTIONS: RailSection[] = [
  { id: 'home', label: 'POSTCARD', num: '01', color: '#F2765A' },
  { id: 'resurrection', label: 'RESURRECTION', num: '02', color: '#E0A458' },
  { id: 'capture', label: 'CAPTURE', num: '03', color: '#C96B4A' },
  { id: 'passport', label: 'PASSPORTS', num: '04', color: '#A05A2C' },
  { id: 'gallery', label: 'SAUNA MIST', num: '05', color: '#2E6E4E' },
  { id: 'oil', label: 'OIL SURFACE', num: '06', color: '#E0A458' },
  { id: 'privacy', label: 'PRIVACY', num: '07', color: '#7A6BA8' },
  { id: 'manifest', label: 'MANIFEST', num: '08', color: '#F2765A' },
];

export const ProgressRail: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('home');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0,
      }
    );

    RAIL_SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleDotClick = (id: string) => {
    scrollTo(`#${id}`, -40);
  };

  return (
    <nav
      aria-label="Section Navigation"
      className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-3.5 select-none"
    >
      {RAIL_SECTIONS.map((sec) => {
        const isActive = activeId === sec.id;
        const isHovered = hoveredId === sec.id;
        const showLabel = isActive || isHovered;

        return (
          <div
            key={sec.id}
            className="group flex items-center gap-2.5 cursor-pointer"
            onClick={() => handleDotClick(sec.id)}
            onMouseEnter={() => setHoveredId(sec.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Mono Label sliding in on hover/active */}
            <span
              className={`font-mono text-[10px] tracking-wider font-bold transition-all duration-300 transform bg-[#FFFDF8] px-2 py-0.5 rounded border border-[#4A3728]/30 shadow-[2px_2px_0px_rgba(74,55,40,0.7)] ${
                showLabel
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-3 pointer-events-none'
              } ${isActive ? 'text-[#F2765A] border-[#F2765A]' : 'text-[#7a6a58]'}`}
            >
              {sec.num} · {sec.label}
            </span>

            {/* Indicator Dot with Coral Glow Ring */}
            <div className="relative flex items-center justify-center w-5 h-5">
              {/* Outer Glow Ring on Active */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full border-2 animate-ping opacity-60 pointer-events-none"
                  style={{ borderColor: sec.color }}
                />
              )}

              {/* Main Dot */}
              <div
                className={`rounded-full transition-all duration-300 border border-[#4A3728] ${
                  isActive
                    ? 'w-3.5 h-3.5 shadow-[0_0_8px_rgba(242,118,90,0.8)]'
                    : 'w-2 h-2 bg-[#FFFDF8] hover:scale-150 hover:bg-[#F2765A]'
                }`}
                style={{
                  backgroundColor: isActive ? sec.color : undefined,
                  borderColor: isActive ? '#4A3728' : undefined,
                }}
              />
            </div>
          </div>
        );
      })}
    </nav>
  );
};
