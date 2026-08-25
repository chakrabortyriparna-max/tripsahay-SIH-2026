import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, ShieldCheck, Database, BatteryCharging } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface OdometerDigitProps {
  char: string;
  delayMs: number;
  triggered: boolean;
}

const OdometerDigit: React.FC<OdometerDigitProps> = ({ char, delayMs, triggered }) => {
  const isNumber = !isNaN(parseInt(char, 10));

  if (!isNumber) {
    return (
      <span className="inline-block px-0.5 text-[#4A3728]">
        {char}
      </span>
    );
  }

  const digit = parseInt(char, 10);

  return (
    <span
      className="inline-block relative overflow-hidden h-[1.15em] leading-[1.15em] align-top text-[#4A3728]"
      style={{ width: '0.62em' }}
    >
      <span
        className="block transition-transform ease-out"
        style={{
          transform: triggered ? `translateY(-${digit * 10}%)` : 'translateY(0%)',
          transitionDuration: '1.2s',
          transitionDelay: `${delayMs}ms`,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <span key={num} className="block text-center h-[1.15em] leading-[1.15em]">
            {num}
          </span>
        ))}
      </span>
    </span>
  );
};

export const StatsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isTriggered, setIsTriggered] = useState<boolean>(false);

  // Values: 12 trips · 3,214 km · 48 MB · 3.1 %/day
  const stats = [
    {
      value: '12',
      unit: 'trips',
      label: 'TRIPS RECOVERED',
      icon: Activity,
      detail: 'Google Timeline archives',
    },
    {
      value: '3,214',
      unit: 'km',
      label: 'KILOMETRES BACK',
      icon: ShieldCheck,
      detail: 'Foot, train, backwater',
    },
    {
      value: '48',
      unit: 'MB',
      label: 'TIMELINE PARSED',
      icon: Database,
      detail: '100% on-device SQLite',
    },
    {
      value: '3.1',
      unit: '%/day',
      label: 'BATTERY IMPACT',
      icon: BatteryCharging,
      detail: 'Screen off, real hardware',
    },
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsTriggered(true);
      return;
    }

    const ctx = gsap.context(() => {
      // 20. ROLLING ODOMETER: Scroll-in at top 88%, once
      if (sectionRef.current) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            setIsTriggered(true);
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Global digit index for 130ms cascade
  let globalDigitCounter = 0;

  return (
    <section
      ref={sectionRef}
      data-cursor="#F2765A"
      data-label="LEDGER"
      className="bg-[#F2E3C6] py-14 px-6 md:px-16 border-b-2 border-[#4A3728] select-none"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          const chars = s.value.split('');

          return (
            <div
              key={idx}
              className="bg-white/90 backdrop-blur-sm border-2 border-[#4A3728] rounded-2xl p-6 shadow-[5px_5px_0px_rgba(74,55,40,0.85)] hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-[#F2765A]" />
                <span className="font-mono text-[10px] text-[#7a6a58] font-bold">
                  PSCMR081 · STAT 0{idx + 1}
                </span>
              </div>

              {/* 20. Rolling Odometer Numbers */}
              <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#4A3728] flex items-baseline flex-wrap">
                {chars.map((ch, charIdx) => {
                  const delay = globalDigitCounter * 130;
                  if (!isNaN(parseInt(ch, 10))) {
                    globalDigitCounter++;
                  }
                  return (
                    <OdometerDigit
                      key={`${idx}-${charIdx}`}
                      char={ch}
                      delayMs={delay}
                      triggered={isTriggered}
                    />
                  );
                })}
                <span className="font-mono text-base sm:text-lg font-bold text-[#C96B4A] ml-2">
                  {s.unit}
                </span>
              </div>

              <div className="font-mono text-xs text-[#C96B4A] tracking-wider font-bold mt-2.5">
                {s.label}
              </div>
              <div className="text-xs text-[#7a6a58] font-light mt-1">
                {s.detail}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
