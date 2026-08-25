import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const Marquee: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const items = [
    'AUTO-CAPTURED',
    'OFFLINE-FIRST',
    'DPDP PRIVATE',
    'MEASURED BATTERY',
    'RESURRECTED TIMELINES',
    'KERALA TOURISM SIH 2026',
    'FERRY-AWARE',
    'ZERO TAPS'
  ];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let xPos = 0;
    const tickerFunc = () => {
      xPos -= 1;
      const halfWidth = track.scrollWidth / 2;
      if (Math.abs(xPos) >= halfWidth) {
        xPos = 0;
      }
      track.style.transform = `translate3d(${xPos}px, 0, 0)`;
    };

    gsap.ticker.add(tickerFunc);

    return () => {
      gsap.ticker.remove(tickerFunc);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden py-3.5 bg-[#F2765A] border-y-2 border-[#4A3728] select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] relative z-20"
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap will-change-transform"
        style={{ width: 'max-content' }}
      >
        {/* Set 1 */}
        <div className="flex items-center gap-8 font-serif-custom text-[26px] text-white font-medium pr-8">
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <span>{item}</span>
              <span className="text-[#FBEFD4] font-serif-custom italic">✦</span>
            </React.Fragment>
          ))}
        </div>

        {/* Set 2 (Duplicate for seamless continuous loop) */}
        <div className="flex items-center gap-8 font-serif-custom text-[26px] text-white font-medium pr-8">
          {items.map((item, idx) => (
            <React.Fragment key={`dup-${idx}`}>
              <span>{item}</span>
              <span className="text-[#FBEFD4] font-serif-custom italic">✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
