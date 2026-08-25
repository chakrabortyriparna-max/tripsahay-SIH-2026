import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

/**
 * 2. LENIS SMOOTH SCROLL (Global)
 * lerp: .09; lenis.on('scroll', ScrollTrigger.update) + gsap.ticker.add(t => lenis.raf(t*1000)) + lagSmoothing(0)
 * Anchor links: lenis.scrollTo(href, {offset: -40})
 */
export const initSmoothScroll = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return null;
  }

  lenisInstance = new Lenis({
    lerp: 0.09,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.8,
  });

  // Synchronize Lenis with GSAP ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenisInstance?.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Setup anchor link click interceptor
  document.addEventListener('click', handleAnchorClick);

  return lenisInstance;
};

const handleAnchorClick = (e: MouseEvent) => {
  const target = (e.target as HTMLElement).closest('a[href^="#"]');
  if (target && lenisInstance) {
    const href = target.getAttribute('href');
    if (href && href !== '#' && href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        lenisInstance.scrollTo(el as HTMLElement, { offset: -40 });
      }
    }
  }
};

export const scrollTo = (target: string | HTMLElement, offset: number = -40) => {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset });
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

export const getLenis = () => lenisInstance;

export const destroySmoothScroll = () => {
  document.removeEventListener('click', handleAnchorClick);
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};

/**
 * 4. SCRAMBLE / DECRYPT KICKERS (All section headers)
 * cipher.tv-style: on scroll-in (start: 'top 92%', once), each kicker character cycles
 * █▓▒░<>/|=+* randoms, resolving left-to-right (+2 chars per 26ms tick)
 */
export const initScrambleKickers = () => {
  const cipherChars = '█▓▒░<>/|=+*#@&%';
  const kickers = document.querySelectorAll<HTMLElement>(
    '.scramble-kicker, .kicker-decrypt, [data-scramble]'
  );

  kickers.forEach((el) => {
    // Avoid double initialization
    if (el.dataset.scrambleInit === 'true') return;
    el.dataset.scrambleInit = 'true';

    const originalText = el.textContent?.trim() || '';
    if (!originalText) return;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        let resolvedLength = 0;
        const totalLength = originalText.length;

        const interval = setInterval(() => {
          resolvedLength += 2;
          if (resolvedLength >= totalLength) {
            el.textContent = originalText;
            clearInterval(interval);
            return;
          }

          let displayed = originalText.slice(0, resolvedLength);
          for (let i = resolvedLength; i < totalLength; i++) {
            const char = originalText[i];
            if (char === ' ' || char === '—' || char === '·') {
              displayed += char;
            } else {
              displayed += cipherChars[Math.floor(Math.random() * cipherChars.length)];
            }
          }
          el.textContent = displayed;
        }, 26);
      },
    });
  });
};

/**
 * 5. VELOCITY SKEW (All h2s)
 * ScrollTrigger.onUpdate reads getVelocity()/-350, clamps ±5°, tweens skewY back to 0 over .7s power3
 */
export const initVelocitySkew = () => {
  const headings = document.querySelectorAll<HTMLElement>('h2, .skew-velocity');
  if (headings.length === 0) return;

  // Track skew tween target
  let skewTween: gsap.core.Tween | null = null;

  ScrollTrigger.create({
    onUpdate: (self) => {
      const rawVelocity = self.getVelocity();
      const velocity = rawVelocity / -350;
      const clamped = Math.max(-5, Math.min(5, velocity));

      // Quick apply skew with damping
      gsap.to(headings, {
        skewY: clamped,
        duration: 0.1,
        overwrite: 'auto',
        ease: 'power1.out',
        onComplete: () => {
          skewTween = gsap.to(headings, {
            skewY: 0,
            duration: 0.7,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        },
      });
    },
  });
};

/**
 * 7. MAGNETIC BUTTONS (All .btn & .btn-magnetic)
 * mousemove → translate toward cursor ×.3/.4; leave → elastic.out(1,.4) snap-back
 */
export const initMagneticButtons = () => {
  const buttons = document.querySelectorAll<HTMLElement>('.btn, .btn-magnetic, [data-magnetic="true"]');

  buttons.forEach((btn) => {
    if (btn.dataset.magneticInit === 'true') return;
    btn.dataset.magneticInit = 'true';

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      gsap.to(btn, {
        x: relX * 0.35,
        y: relY * 0.35,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
        overwrite: 'auto',
      });
    };

    btn.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);
  });
};

/**
 * 9. GENERIC REVEALS (All .reveal)
 * opacity 0→1, y 40→0, power3.out 1s, trigger top 85%.
 * Guards: ScrollTrigger.refresh() after preloader/fonts/load + 2.5s/5s safety passes + 6s viewport fallback for stuck elements
 */
export const initGenericReveals = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll<HTMLElement>('.reveal, .gsap-reveal-card, .reveal-item');

  revealElements.forEach((el) => {
    if (el.dataset.revealInit === 'true') return;
    el.dataset.revealInit = 'true';

    if (prefersReducedMotion) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    gsap.fromTo(
      el,
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
          onEnter: () => {
            el.dataset.revealed = 'true';
          },
        },
      }
    );
  });

  // Safety Pass 1: 2.5s
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 2500);

  // Safety Pass 2: 5.0s
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 5000);

  // Viewport Fallback Pass: 6.0s (Ensures no element ever stays hidden if ScrollTrigger failed to fire)
  setTimeout(() => {
    revealElements.forEach((el) => {
      if (el.dataset.revealed !== 'true') {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
          el.dataset.revealed = 'true';
        }
      }
    });
  }, 6000);
};

/**
 * Master Scroll Animation Orchestrator
 */
export const initScrollAnimations = () => {
  initScrambleKickers();
  initVelocitySkew();
  initMagneticButtons();
  initGenericReveals();

  // Parallax floating shapes
  gsap.utils.toArray<HTMLElement>('.gsap-parallax-slow').forEach((el) => {
    const speed = parseFloat(el.dataset.speed || '0.2');
    gsap.to(el, {
      yPercent: speed * 50,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  });

  // Refresh all triggers
  ScrollTrigger.refresh();
};
