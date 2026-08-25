import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Droplets, Wind, Sparkles, RefreshCw, Flame, Volume2, VolumeX, X } from 'lucide-react';
import { playMistSwoosh, playSteamBurst } from '../utils/audio';
import { Postcard } from '../types';

const POSTCARDS: Postcard[] = [
  {
    id: 'art-1',
    num: '01',
    title: 'PILGRIMS',
    subtitle: 'NIGHT OF AUGUST 14 · FORT KOCHI',
    description: 'Three travellers crossing the midnight blue coast under a crescent moon. Sacred geometry navigation vectors captured while walking the coastline.',
    svgType: 'pilgrims',
    date: 'AUG 14, 2026',
    location: 'Fort Kochi Beach',
    bgHex: '#1D3FBF',
    accentHex: '#F2E3C6'
  },
  {
    id: 'art-2',
    num: '02',
    title: 'THE LAMP',
    subtitle: 'NIGHT OF AUGUST 15 · JEW TOWN',
    description: 'A street lantern caught in swirling cream vortices of monsoon mist. The accelerometer filtered out rain tremors to preserve the true illumination arc.',
    svgType: 'lamp',
    date: 'AUG 15, 2026',
    location: 'Mattancherry Alley',
    bgHex: '#1D3FBF',
    accentHex: '#F2E3C6'
  },
  {
    id: 'art-3',
    num: '03',
    title: 'RIPPLES',
    subtitle: 'NIGHT OF AUGUST 16 · VEMBANAD LAKE',
    description: 'Concentric acoustic ripple rings radiating from a night ferry. GPS signal held firm across 12 nautical miles of silent backwaters.',
    svgType: 'ripples',
    date: 'AUG 16, 2026',
    location: 'Backwater Crossing',
    bgHex: '#1D3FBF',
    accentHex: '#F2E3C6'
  },
  {
    id: 'art-4',
    num: '04',
    title: 'THE WALK HOME',
    subtitle: 'NIGHT OF AUGUST 17 · ERNAKULAM',
    description: 'Walking through concrete canyon silhouettes toward the morning star. 18.4 kilometres auto-logged with zero battery anxiety.',
    svgType: 'walk_home',
    date: 'AUG 17, 2026',
    location: 'Marine Drive Wharf',
    bgHex: '#1D3FBF',
    accentHex: '#F2E3C6'
  }
];

export const SaunaMistGallery: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedPostcard, setSelectedPostcard] = useState<Postcard | null>(null);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [steamBurstActive, setSteamBurstActive] = useState<boolean>(false);
  const [saunaTemp, setSaunaTemp] = useState<number>(84);
  const [humidity, setHumidity] = useState<number>(88);

  const lastWipeAudioTime = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; isInside: boolean }>({ x: -100, y: -100, isInside: false });
  const wipeHistoryRef = useRef<Array<{ x: number; y: number; r: number; time: number }>>([]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseRef.current = { x, y, isInside: true };

    // 26. Record wipe with r=90 and 0.95 strength
    wipeHistoryRef.current.push({
      x,
      y,
      r: 90,
      time: performance.now()
    });

    if (wipeHistoryRef.current.length > 250) {
      wipeHistoryRef.current.shift();
    }

    const now = performance.now();
    if (soundOn && now - lastWipeAudioTime.current > 140) {
      lastWipeAudioTime.current = now;
      playMistSwoosh();
    }
  };

  const handlePointerLeave = () => {
    mouseRef.current.isInside = false;
  };

  const triggerSteamBurst = () => {
    setSteamBurstActive(true);
    setSaunaTemp((prev) => Math.min(prev + 4, 98));
    setHumidity((prev) => Math.min(prev + 8, 99));

    // Clear wipe history so mist re-covers immediately
    wipeHistoryRef.current = [];

    if (soundOn) {
      playSteamBurst();
    }

    setTimeout(() => {
      setSteamBurstActive(false);
    }, 1800);
  };

  const resetMist = () => {
    wipeHistoryRef.current = [];
  };

  // 26. FALLING MIST WIPE ENGINE
  // Offscreen fog tile (2× height): uniform base veil + 30 soft cloud patches + 70 highlighted droplets.
  // Per frame: tile drawn twice at globalAlpha .38 with scrolling offset (seamless downward fall);
  // cursor → destination-out radial brush (r90, .95 strength) clears fog locally — artwork at 100% under cursor, mist drifts back over.
  // Fog base alpha ~40 measured. IntersectionObserver pause
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let scrollY = 0;

    // Build offscreen fog tile (2x height)
    const tileW = 600;
    const tileH = 1200; // 2x height
    const fogTile = document.createElement('canvas');
    fogTile.width = tileW;
    fogTile.height = tileH;
    const fCtx = fogTile.getContext('2d');

    if (fCtx) {
      // 1. Uniform base veil
      fCtx.fillStyle = 'rgba(238, 233, 224, 0.95)';
      fCtx.fillRect(0, 0, tileW, tileH);

      // 2. 30 soft cloud patches
      for (let i = 0; i < 30; i++) {
        const cx = Math.random() * tileW;
        const cy = Math.random() * tileH;
        const cr = 60 + Math.random() * 140;
        const grad = fCtx.createRadialGradient(cx, cy, 0, cx, cy, cr);
        grad.addColorStop(0, 'rgba(255, 252, 245, 0.85)');
        grad.addColorStop(0.6, 'rgba(240, 234, 222, 0.4)');
        grad.addColorStop(1, 'rgba(230, 224, 212, 0.0)');
        fCtx.fillStyle = grad;
        fCtx.beginPath();
        fCtx.arc(cx, cy, cr, 0, Math.PI * 2);
        fCtx.fill();
      }

      // 3. 70 highlighted droplets
      for (let i = 0; i < 70; i++) {
        const dx = Math.random() * tileW;
        const dy = Math.random() * tileH;
        const dr = 1.8 + Math.random() * 3.5;

        // Droplet body
        fCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        fCtx.beginPath();
        fCtx.arc(dx, dy, dr, 0, Math.PI * 2);
        fCtx.fill();

        // Highlight glint
        fCtx.fillStyle = 'rgba(29, 63, 191, 0.35)';
        fCtx.beginPath();
        fCtx.arc(dx + dr * 0.3, dy + dr * 0.3, dr * 0.5, 0, Math.PI * 2);
        fCtx.fill();
      }
    }

    const resize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.offsetWidth;
      const h = canvas.parentElement.offsetHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!isVisible) return;

      const w = canvas.width;
      const h = canvas.height;

      // Downward falling mist speed
      scrollY = (scrollY + 0.65) % h;

      ctx.clearRect(0, 0, w, h);

      // 26. Tile drawn twice at globalAlpha .38 with scrolling offset (seamless downward fall)
      ctx.save();
      ctx.globalAlpha = 0.38; // Fog base alpha ~40 measured

      // Draw tile 1 & tile 2 for seamless vertical wrapping
      ctx.drawImage(fogTile, 0, scrollY - h, w, h);
      ctx.drawImage(fogTile, 0, scrollY, w, h);

      ctx.restore();

      // 26. Cursor -> destination-out radial brush (r90, .95 strength) clears fog locally
      const wipes = wipeHistoryRef.current;
      const now = performance.now();

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';

      // Re-draw decaying recent swipe trails (mist drifts back over in ~10s)
      for (let i = 0; i < wipes.length; i++) {
        const item = wipes[i];
        const ageSec = (now - item.time) / 1000;
        const wipeStrength = Math.max(0, 0.95 * (1.0 - ageSec / 10));

        if (wipeStrength > 0.02) {
          const radGrad = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, item.r);
          radGrad.addColorStop(0, `rgba(0, 0, 0, ${wipeStrength})`);
          radGrad.addColorStop(0.7, `rgba(0, 0, 0, ${wipeStrength * 0.75})`);
          radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Active cursor wipe circle (r=90, .95 strength)
      if (mouseRef.current.isInside && mouseRef.current.x > 0) {
        const liveGrad = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          90
        );
        liveGrad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
        liveGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.7)');
        liveGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = liveGrad;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 90, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    // 26. IntersectionObserver pauses rAF off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isVisible) {
              isVisible = true;
              animId = requestAnimationFrame(render);
            }
          } else {
            isVisible = false;
            cancelAnimationFrame(animId);
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(section);
    animId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      data-cursor="#2E6E4E"
      data-label="SAUNA MIST"
      className="relative w-full bg-[#DFF3E4] text-[#4A3728] border-t-2 border-[#4A3728] py-24 md:py-32 px-6 md:px-16 overflow-hidden select-none"
    >
      {/* Background Ambience Steam Blooms */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#BFE3CE] filter blur-[90px] -top-20 -left-20 animate-mist-drift" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#FFF9F0] filter blur-[80px] bottom-10 right-10 animate-mist-drift" />
      </div>

      {/* Header & Sauna Atmosphere Station */}
      <div className="relative z-10 max-w-6xl mx-auto mb-12 reveal">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-[#2E6E4E] mb-3 font-bold bg-white/70 backdrop-blur-sm px-3.5 py-1 rounded-full border border-[#2E6E4E]/40 shadow-sm">
              <Wind className="w-3.5 h-3.5 text-[#2E6E4E]" />
              <span className="scramble-kicker">SAUNA AGENCY CONDENSATION &amp; MIST ENGINE</span>
            </div>
            <h2 className="font-serif-custom text-4xl sm:text-6xl text-[#4A3728] font-normal leading-tight">
              Four nights, <em className="italic text-[#1D3FBF] font-semibold">remembered.</em>
            </h2>
            <p className="text-[#7a6a58] text-base sm:text-lg mt-3 font-light max-w-2xl leading-relaxed">
              Monsoon mist falling continuously over the glass. Swipe your cursor across the cards to clear the falling fog and reveal the risograph journey prints below.
            </p>
          </div>

          {/* Sauna Climate & Controls */}
          <div className="bg-white/90 backdrop-blur-md border-2 border-[#4A3728] rounded-2xl p-4 shadow-[6px_6px_0px_rgba(74,55,40,0.85)] flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-3 pr-3 border-r border-[#4A3728]/20">
              <div>
                <span className="text-[#7a6a58] block text-[10px]">TEMP</span>
                <span className="font-bold text-[#C96B4A] text-sm">{saunaTemp}°C</span>
              </div>
              <div>
                <span className="text-[#7a6a58] block text-[10px]">HUMIDITY</span>
                <span className="font-bold text-[#1D3FBF] text-sm">{humidity}%</span>
              </div>
            </div>

            {/* Pour Water Steam Burst Button */}
            <button
              onClick={triggerSteamBurst}
              disabled={steamBurstActive}
              className={`px-3 py-2 rounded-xl border-2 border-[#4A3728] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                steamBurstActive
                  ? 'bg-[#F2765A] text-white animate-pulse'
                  : 'bg-[#FFF3D6] text-[#4A3728] hover:bg-[#FFE3B3] shadow-[2px_2px_0px_rgba(74,55,40,0.8)]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#F2765A]" />
              <span>{steamBurstActive ? 'HISSING STEAM...' : 'Pour Water on Stones'}</span>
            </button>

            {/* Reset / Sound Toggle */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={resetMist}
                className="p-2 bg-white rounded-lg border border-[#4A3728] hover:bg-[#FBEFD4] cursor-pointer"
                title="Reset Steam Mist"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#4A3728]" />
              </button>
              <button
                onClick={() => setSoundOn(!soundOn)}
                className="p-2 bg-white rounded-lg border border-[#4A3728] hover:bg-[#FBEFD4] cursor-pointer"
                title={soundOn ? 'Mute mist audio' : 'Unmute mist audio'}
              >
                {soundOn ? (
                  <Volume2 className="w-3.5 h-3.5 text-[#2E6E4E]" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-[#7a6a58]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 26. Main Postcards Grid (Underneath Falling Mist) */}
      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-0">
          {POSTCARDS.map((card) => (
            <figure
              key={card.id}
              onClick={() => setSelectedPostcard(card)}
              className="group relative bg-[#1D3FBF] border-[2.5px] border-[#4A3728] rounded-2xl overflow-hidden shadow-[10px_12px_0px_rgba(74,55,40,0.85)] cursor-pointer transition-transform hover:-translate-y-1 duration-200"
            >
              {/* 4 Risograph SVG Postcards */}
              <div className="w-full aspect-[16/9] relative overflow-hidden">
                {card.svgType === 'pilgrims' && (
                  <svg viewBox="0 0 1600 900" className="w-full h-full block">
                    <rect width="1600" height="900" fill="#1D3FBF" />
                    <rect y="560" width="1600" height="340" fill="#F2E3C6" />
                    <g stroke="#F2E3C6" strokeWidth="3" opacity="0.85">
                      <path d="M820 560 L300 80" />
                      <path d="M820 560 L480 60" />
                      <path d="M820 560 L660 40" />
                      <path d="M820 560 L840 30" />
                      <path d="M820 560 L1020 60" />
                      <path d="M820 560 L1200 90" />
                      <path d="M820 560 L1380 160" />
                    </g>
                    <g stroke="#1D3FBF" strokeWidth="3" opacity="0.8">
                      <path d="M820 560 L200 900" />
                      <path d="M820 560 L500 900" />
                      <path d="M820 560 L820 900" />
                      <path d="M820 560 L1150 900" />
                      <path d="M820 560 L1420 880" />
                    </g>
                    <circle cx="1330" cy="150" r="46" fill="#F2E3C6" />
                    <circle cx="1312" cy="138" r="42" fill="#1D3FBF" />
                    <g fill="#10131a">
                      <ellipse cx="700" cy="640" rx="60" ry="26" />
                      <rect x="688" y="600" width="18" height="46" rx="8" />
                      <rect x="662" y="655" width="9" height="52" />
                      <rect x="726" y="655" width="9" height="52" />
                      <ellipse cx="850" cy="660" rx="48" ry="21" />
                      <rect x="842" y="628" width="14" height="36" rx="7" />
                      <rect x="822" y="672" width="8" height="44" />
                      <rect x="872" y="672" width="8" height="44" />
                      <ellipse cx="960" cy="676" rx="36" ry="16" />
                      <rect x="954" y="650" width="11" height="30" rx="5" />
                      <rect x="938" y="686" width="7" height="36" />
                      <rect x="978" y="686" width="7" height="36" />
                    </g>
                  </svg>
                )}

                {card.svgType === 'lamp' && (
                  <svg viewBox="0 0 1600 900" className="w-full h-full block">
                    <rect width="1600" height="900" fill="#1D3FBF" />
                    <g fill="#F2E3C6">
                      <path
                        d="M800 470 C 640 430, 560 320, 640 220 C 700 140, 880 120, 990 190 C 1120 270, 1140 420, 1010 520 C 900 610, 700 610, 580 520 C 440 415, 460 210, 620 120 C 500 260, 520 400, 660 490 C 800 575, 980 545, 1060 440 C 1140 330, 1080 210, 950 170 C 840 135, 720 175, 690 260 C 665 330, 710 405, 800 425 Z"
                        opacity="0.95"
                      />
                    </g>
                    <g stroke="#F2E3C6" strokeWidth="4" opacity="0.6" fill="none">
                      <path d="M780 470 C 700 450, 660 390, 690 330" />
                      <path d="M860 480 C 960 470, 1030 400, 1010 320" />
                      <path d="M760 250 C 820 200, 920 200, 980 250" />
                    </g>
                    <g fill="#10131a">
                      <rect x="788" y="470" width="24" height="330" rx="6" />
                      <path d="M760 470 L840 470 L826 430 L774 430 Z" />
                      <path d="M770 430 L830 430 L830 360 L800 330 L770 360 Z" />
                      <circle cx="800" cy="392" r="17" fill="#F9E7B3" />
                    </g>
                    <circle cx="1360" cy="130" r="42" fill="#F2E3C6" />
                    <circle cx="1344" cy="118" r="38" fill="#1D3FBF" />
                  </svg>
                )}

                {card.svgType === 'ripples' && (
                  <svg viewBox="0 0 1600 900" className="w-full h-full block">
                    <rect width="1600" height="900" fill="#1D3FBF" />
                    <path d="M0 430 Q 800 330 1600 430 L1600 900 L0 900 Z" fill="#F2E3C6" />
                    <g fill="none" stroke="#1D3FBF" strokeWidth="7" strokeDasharray="2 16" strokeLinecap="round" opacity="0.85">
                      <ellipse cx="800" cy="620" rx="120" ry="46" />
                      <ellipse cx="800" cy="620" rx="230" ry="90" />
                      <ellipse cx="800" cy="620" rx="345" ry="136" />
                      <ellipse cx="800" cy="620" rx="465" ry="184" />
                      <ellipse cx="800" cy="620" rx="590" ry="234" />
                      <ellipse cx="800" cy="620" rx="715" ry="284" />
                    </g>
                    <g fill="#10131a">
                      <rect x="792" y="570" width="16" height="46" rx="6" />
                      <circle cx="800" cy="558" r="10" />
                    </g>
                    <g fill="#F2E3C6">
                      <circle cx="770" cy="130" r="34" />
                      <circle cx="758" cy="122" r="30" fill="#1D3FBF" />
                    </g>
                  </svg>
                )}

                {card.svgType === 'walk_home' && (
                  <svg viewBox="0 0 1600 900" className="w-full h-full block">
                    <rect width="1600" height="900" fill="#1D3FBF" />
                    <g fill="#F2E3C6">
                      <path d="M0 0 L520 0 L620 240 L560 300 L0 300 Z" opacity="0.95" />
                      <path d="M1080 0 L1600 0 L1600 320 L1040 260 L1080 0 Z" opacity="0.95" />
                      <path d="M0 420 L360 470 L300 900 L0 900 Z" opacity="0.95" />
                      <path d="M1600 430 L1230 480 L1300 900 L1600 900 Z" opacity="0.95" />
                      <path d="M700 900 L660 480 L800 440 L940 480 L900 900 Z" />
                    </g>
                    <g fill="#1D3FBF" opacity="0.85">
                      <rect x="60" y="30" width="26" height="14" />
                      <rect x="120" y="30" width="26" height="14" />
                      <rect x="60" y="70" width="26" height="14" />
                      <rect x="120" y="70" width="26" height="14" />
                      <rect x="180" y="30" width="26" height="14" />
                      <rect x="240" y="70" width="26" height="14" />
                      <rect x="1160" y="30" width="26" height="14" />
                      <rect x="1220" y="30" width="26" height="14" />
                      <rect x="1280" y="70" width="26" height="14" />
                      <rect x="1340" y="30" width="26" height="14" />
                      <rect x="1400" y="70" width="26" height="14" />
                      <rect x="80" y="540" width="26" height="14" />
                      <rect x="140" y="590" width="26" height="14" />
                      <rect x="80" y="640" width="26" height="14" />
                      <rect x="200" y="690" width="26" height="14" />
                      <rect x="1300" y="540" width="26" height="14" />
                      <rect x="1360" y="590" width="26" height="14" />
                      <rect x="1420" y="640" width="26" height="14" />
                      <rect x="1300" y="690" width="26" height="14" />
                    </g>
                    <path d="M820 300 L836 348 L884 362 L836 376 L820 424 L804 376 L756 362 L804 348 Z" fill="#F2E3C6" />
                    <g fill="#10131a">
                      <circle cx="800" cy="700" r="13" />
                      <path d="M786 716 L814 716 L820 782 L806 782 L800 748 L794 782 L780 782 Z" />
                    </g>
                  </svg>
                )}
              </div>

              {/* Card Bottom Stamp Caption */}
              <figcaption className="absolute left-4 bottom-4 z-10 bg-[#FFF9F0] border-2 border-[#4A3728] rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold text-[#4A3728] shadow-[3px_3px_0px_rgba(74,55,40,0.9)] flex items-center gap-2">
                <span>{card.num} — {card.title}</span>
                <span className="text-[#C96B4A] font-normal text-[10px] hidden sm:inline">
                  ({card.location})
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* 26. Falling Mist Wipe Canvas Overlay */}
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="absolute inset-0 w-full h-full z-20 cursor-crosshair touch-none"
        />
      </div>

      {/* Floating Prompt */}
      <div className="relative z-30 max-w-md mx-auto text-center mt-8">
        <div className="inline-flex items-center gap-2 font-mono text-xs text-[#2E6E4E] bg-white/85 backdrop-blur-sm px-4 py-2 rounded-full border border-[#2E6E4E]/30 shadow-sm">
          <Droplets className="w-4 h-4 text-[#1D3FBF]" />
          <span>SWIPE CURSOR ACROSS CARDS TO WIPE AWAY FALLING SAUNA MIST</span>
        </div>
      </div>

      {/* Postcard Inspector Modal */}
      {selectedPostcard && (
        <div className="fixed inset-0 z-50 bg-[#4A3728]/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FFF9F0] border-3 border-[#4A3728] rounded-3xl max-w-2xl w-full p-6 shadow-[16px_20px_0px_rgba(74,55,40,0.95)] relative space-y-4">
            <button
              onClick={() => setSelectedPostcard(null)}
              className="absolute top-4 right-4 p-2 rounded-full border border-[#4A3728] bg-white text-[#4A3728] hover:bg-[#FBEFD4] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-[#C96B4A] font-bold">
              <span>POSTCARD {selectedPostcard.num}</span>
              <span>•</span>
              <span>{selectedPostcard.date}</span>
            </div>

            <h3 className="font-serif-custom text-3xl font-semibold text-[#4A3728]">
              {selectedPostcard.title}
            </h3>

            <p className="text-sm text-[#7a6a58] leading-relaxed">
              {selectedPostcard.description}
            </p>

            <div className="bg-[#DFF3E4] border border-[#2E6E4E]/30 p-3 rounded-xl font-mono text-xs text-[#2E6E4E]">
              📍 LOCATION: {selectedPostcard.location} · COMPILED WITH TRIPSAHAY GPS GATING
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPostcard(null)}
                className="px-6 py-2.5 rounded-full bg-[#F2765A] text-white font-semibold border-2 border-[#4A3728] shadow-[3px_3px_0px_rgba(74,55,40,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
