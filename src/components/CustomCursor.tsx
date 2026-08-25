import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  const [currentColor, setCurrentColor] = useState<string>('#F2765A');
  const [currentLabel, setCurrentLabel] = useState<string>('EXPLORE');
  const [isHoveringInteractive, setIsHoveringInteractive] = useState<boolean>(false);
  const [interactiveLabel, setInteractiveLabel] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Disable on coarse pointer / touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // quickTo for dot (0.08s) and ring (0.35s)
    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' });
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' });
    const setRingX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
    const setRingY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    // Section Observer with rootMargin -49%
    const sections = document.querySelectorAll<HTMLElement>('section[data-cursor]');
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sec = entry.target as HTMLElement;
            const hex = sec.dataset.cursor || '#F2765A';
            const label = sec.dataset.label || 'TRIPSAHAY';
            setCurrentColor(hex);
            setCurrentLabel(label);

            gsap.to(dot, { backgroundColor: hex, duration: 0.4 });
            gsap.to(ring, { borderColor: hex, duration: 0.4 });
          }
        });
      },
      {
        rootMargin: '-49% 0px -49% 0px',
        threshold: 0,
      }
    );

    sections.forEach((sec) => sectionObserver.observe(sec));

    // Interactive Elements Hover
    const handleElementOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        'a, button, input, select, textarea, summary, details, [role="button"], .btn, .interactive-hover'
      ) as HTMLElement | null;

      if (target) {
        setIsHoveringInteractive(true);
        const customLabel = target.dataset.cursorLabel || target.getAttribute('title') || 'OPEN';
        setInteractiveLabel(customLabel.toUpperCase());

        gsap.to(ring, {
          width: 72,
          height: 72,
          backgroundColor: currentColor,
          color: '#ffffff',
          duration: 0.25,
          ease: 'power2.out',
        });
        gsap.to(dot, { opacity: 0, scale: 0, duration: 0.15 });
      }
    };

    const handleElementOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        'a, button, input, select, textarea, summary, details, [role="button"], .btn, .interactive-hover'
      );

      if (target) {
        setIsHoveringInteractive(false);
        setInteractiveLabel('');

        gsap.to(ring, {
          width: 36,
          height: 36,
          backgroundColor: 'transparent',
          color: currentColor,
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(dot, { opacity: 1, scale: 1, duration: 0.2 });
      }
    };

    document.addEventListener('mouseover', handleElementOver);
    document.addEventListener('mouseout', handleElementOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleElementOver);
      document.removeEventListener('mouseout', handleElementOut);
      sectionObserver.disconnect();
    };
  }, [isVisible, currentColor]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-999 overflow-hidden hidden md:block">
      {/* 8px Spice Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full pointer-events-none z-1000 shadow-sm"
        style={{
          backgroundColor: currentColor,
          willChange: 'transform',
        }}
      />

      {/* 36px Ring (grows to 72px filled on interactive hover) */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 -ml-4.5 -mt-4.5 w-9 h-9 rounded-full border-2 pointer-events-none flex items-center justify-center text-center font-mono text-[9px] font-bold tracking-tighter uppercase transition-colors"
        style={{
          borderColor: currentColor,
          willChange: 'transform, width, height',
        }}
      >
        {isHoveringInteractive ? (
          <span ref={labelRef} className="text-white px-1 leading-none truncate max-w-[64px]">
            {interactiveLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
};
