import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause, RotateCcw, Sparkles, Activity, Layers, Disc, Compass } from 'lucide-react';
import { playPosterTick } from '../utils/audio';
import { LectureChapter } from '../types';

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS: LectureChapter[] = [
  {
    id: 'ch1',
    code: 'CH.01',
    title: 'MOTION-AWARE GPS',
    duration: '04:12',
    description: 'Accelerometer gates GPS radio — asleep when idle, waking within 3 meters of detected velocity.',
    category: 'SENSORY GATING',
    accent: '#F2765A',
    formula: 'v > 0.8 m/s ⇒ GPS_WAKE()',
  },
  {
    id: 'ch2',
    code: 'CH.02',
    title: 'SEGMENT-SAFE ROUTING',
    duration: '03:45',
    description: 'Zero dropped journeys across tunnels, subterranean stations, and deep river gorges.',
    category: 'TOPOLOGY PRESERVATION',
    accent: '#BFE3CE',
    formula: 'Δt_lost > 45s ⇒ FORK_SEGMENT()',
  },
  {
    id: 'ch3',
    code: 'CH.03',
    title: 'APPEND-ONLY LEDGER',
    duration: '05:20',
    description: 'Every coordinate point is immutable, stored locally in SQLite with cryptographically signed sequence IDs.',
    category: 'LOCAL CONSISTENCY',
    accent: '#D9C7EE',
    formula: 'hash(P_i) = SHA256(P_{i-1} || coord)',
  },
  {
    id: 'ch4',
    code: 'CH.04',
    title: 'THE RESURRECTION',
    duration: 'LIVE',
    description: 'Transforming deprecated timeline archives into interactive vector topologies in real time.',
    category: 'ARCHIVAL RENAISSANCE',
    accent: '#E0A458',
    formula: 'T_restored = Σ geo_spline(T_raw)',
  },
];

export const LecturePoster: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chapterListRef = useRef<HTMLDivElement | null>(null);
  const posterWrapperRef = useRef<HTMLDivElement | null>(null);

  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animMode, setAnimMode] = useState<'swiss_flow' | 'gps_radar' | 'topological_spline' | 'kinetic_grid'>('swiss_flow');
  const [speed, setSpeed] = useState<number>(1);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const animTimeRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number; vx: number; vy: number }>({ x: 150, y: 200, vx: 0, vy: 0 });

  // 22. Chapter rows stagger in x: -14 -> 0 on top 78%
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (chapterListRef.current) {
        const rows = chapterListRef.current.querySelectorAll('.chapter-row');
        gsap.fromTo(
          rows,
          {
            x: -14,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: chapterListRef.current,
              start: 'top 78%',
              once: true,
            },
          }
        );
      }
    }, chapterListRef);

    return () => ctx.revert();
  }, []);

  // 3D Perspective Tilt on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 12, y: -y * 12 });

    const canvas = canvasRef.current;
    if (canvas) {
      const prevX = mousePosRef.current.x;
      const prevY = mousePosRef.current.y;
      const curX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const curY = (e.clientY - rect.top) * (canvas.height / rect.height);
      mousePosRef.current = {
        x: curX,
        y: curY,
        vx: curX - prevX,
        vy: curY - prevY,
      };
    }
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // 22. Canvas Generative Poster Animation Engine (3 Translucent Radial Forms with Multiply Blend 9-14s yoyo)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastStamp = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastStamp) / 1000, 0.1);
      lastStamp = now;

      if (isPlaying) {
        animTimeRef.current += dt * speed;
      }
      const t = animTimeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background poster paper base
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(0, 0, w, h);

      // 22. THREE TRANSLUCENT RADIAL FORMS (Multiply blend mode, 9-14s yoyo drift)
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';

      // Form 1 (Peach/Coral Bloom - ~9s yoyo loop)
      const f1Progress = (Math.sin((t * (2 * Math.PI)) / 9) + 1) / 2; // 0 to 1 yoyo
      const cx1 = w * 0.35 + (f1Progress - 0.5) * 110 + (mousePosRef.current.x - w * 0.5) * 0.08;
      const cy1 = h * 0.3 + (Math.cos((t * (2 * Math.PI)) / 11) * 60) + (mousePosRef.current.y - h * 0.5) * 0.08;
      const r1 = 130 + Math.sin(t * 0.8) * 25;

      const grad1 = ctx.createRadialGradient(cx1, cy1, 15, cx1, cy1, r1);
      grad1.addColorStop(0, 'rgba(250, 217, 193, 0.95)');
      grad1.addColorStop(0.65, 'rgba(242, 118, 90, 0.45)');
      grad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(cx1, cy1, r1, 0, Math.PI * 2);
      ctx.fill();

      // Form 2 (Mint/Emerald Bloom - ~12s yoyo loop)
      const f2Progress = (Math.cos((t * (2 * Math.PI)) / 12) + 1) / 2;
      const cx2 = w * 0.72 + (f2Progress - 0.5) * 90;
      const cy2 = h * 0.58 + (Math.sin((t * (2 * Math.PI)) / 13) * 70);
      const r2 = 145 + Math.cos(t * 0.7) * 20;

      const grad2 = ctx.createRadialGradient(cx2, cy2, 15, cx2, cy2, r2);
      grad2.addColorStop(0, 'rgba(191, 227, 206, 0.9)');
      grad2.addColorStop(0.7, 'rgba(46, 110, 78, 0.35)');
      grad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(cx2, cy2, r2, 0, Math.PI * 2);
      ctx.fill();

      // Form 3 (Lilac/Lavender Bloom - ~14s yoyo loop)
      const f3Progress = (Math.sin((t * (2 * Math.PI)) / 14) + 1) / 2;
      const cx3 = w * 0.3 + (f3Progress - 0.5) * 80;
      const cy3 = h * 0.76 + (Math.cos((t * (2 * Math.PI)) / 10) * 55);
      const r3 = 125 + Math.sin(t * 0.6) * 18;

      const grad3 = ctx.createRadialGradient(cx3, cy3, 10, cx3, cy3, r3);
      grad3.addColorStop(0, 'rgba(217, 199, 238, 0.9)');
      grad3.addColorStop(0.65, 'rgba(122, 107, 168, 0.35)');
      grad3.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad3;
      ctx.beginPath();
      ctx.arc(cx3, cy3, r3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // MODE SPECIFIC DRAWING
      if (animMode === 'swiss_flow') {
        // Dynamic undulating ribbon curves (Studio Feixen wave ribbons)
        ctx.save();
        const ribbonCount = 7;
        for (let i = 0; i < ribbonCount; i++) {
          ctx.beginPath();
          const baseOffset = i * 26;
          ctx.strokeStyle = i % 2 === 0 ? '#4A3728' : '#F2765A';
          ctx.lineWidth = i === 3 ? 3.5 : 1.8;
          ctx.lineCap = 'round';

          for (let x = 30; x <= w - 30; x += 12) {
            const wave1 = Math.sin((x * 0.015) + (t * 2.2) + (i * 0.4)) * 30;
            const wave2 = Math.cos((x * 0.03) - (t * 1.5)) * 14;
            const mouseEffect = Math.exp(-Math.hypot(x - mousePosRef.current.x, (h * 0.45 + baseOffset) - mousePosRef.current.y) / 70) * 45;
            const y = h * 0.38 + baseOffset + wave1 + wave2 - mouseEffect;

            if (x === 30) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Kinetic rotating geometric asterisk / star stamp
        const starX = w * 0.82;
        const starY = h * 0.22;
        ctx.save();
        ctx.translate(starX, starY);
        ctx.rotate(t * 0.8);
        ctx.strokeStyle = '#4A3728';
        ctx.lineWidth = 2.5;
        for (let a = 0; a < 8; a++) {
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(-18, 0);
          ctx.lineTo(18, 0);
          ctx.stroke();
        }
        ctx.restore();
        ctx.restore();
      } else if (animMode === 'gps_radar') {
        // GPS Radar Rings with sweeping beam
        ctx.save();
        const centerX = w * 0.5;
        const centerY = h * 0.52;

        ctx.strokeStyle = 'rgba(74, 55, 40, 0.22)';
        ctx.lineWidth = 1.2;
        for (let r = 40; r <= 160; r += 30) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(centerX - 170, centerY);
        ctx.lineTo(centerX + 170, centerY);
        ctx.moveTo(centerX, centerY - 170);
        ctx.lineTo(centerX, centerY + 170);
        ctx.stroke();

        // Sweeping beam
        const sweepAngle = (t * 2.5) % (Math.PI * 2);
        const sweepGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 160);
        sweepGrad.addColorStop(0, 'rgba(242, 118, 90, 0.45)');
        sweepGrad.addColorStop(1, 'rgba(242, 118, 90, 0)');
        ctx.fillStyle = sweepGrad;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, 160, sweepAngle - 0.5, sweepAngle);
        ctx.closePath();
        ctx.fill();

        // Blips on radar
        const blips = [
          { dist: 70, angle: t * 0.4, label: 'SAT_18 (GPS-L1)' },
          { dist: 110, angle: -t * 0.6 + 1.2, label: 'SAT_24 (GLONASS)' },
          { dist: 135, angle: t * 0.8 + 2.5, label: 'BEACON_KOCHI' },
        ];

        blips.forEach((b) => {
          const bx = centerX + Math.cos(b.angle) * b.dist;
          const by = centerY + Math.sin(b.angle) * b.dist;
          ctx.fillStyle = '#F2765A';
          ctx.beginPath();
          ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#4A3728';
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillText(b.label, bx + 8, by + 3);
        });
        ctx.restore();
      } else if (animMode === 'topological_spline') {
        // Dynamic fracture and reconnect spline
        ctx.save();
        ctx.strokeStyle = '#4A3728';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);

        const pts = 8;
        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          const prog = i / pts;
          const px = 40 + prog * (w - 80);
          const py = h * 0.42 + Math.sin(prog * Math.PI * 3 + t * 2) * 55 + Math.cos(t * 1.5 + i) * 20;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);

          // Waypoint markers
          ctx.save();
          ctx.fillStyle = i % 2 === 0 ? '#F2765A' : '#4A3728';
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.stroke();
        ctx.restore();
      } else if (animMode === 'kinetic_grid') {
        // Kinetic Swiss dot-matrix morphing grid
        ctx.save();
        const cols = 12;
        const rows = 16;
        const startX = 40;
        const startY = h * 0.28;
        const gridW = w - 80;
        const gridH = h * 0.48;

        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const gx = startX + (c / (cols - 1)) * gridW;
            const gy = startY + (r / (rows - 1)) * gridH;
            const distMouse = Math.hypot(gx - mousePosRef.current.x, gy - mousePosRef.current.y);
            const influence = Math.exp(-distMouse / 65);
            const scale = 1.5 + Math.sin(c * 0.4 + r * 0.5 + t * 3) * 1.5 + influence * 5;

            ctx.fillStyle = influence > 0.3 ? '#F2765A' : 'rgba(74, 55, 40, 0.4)';
            ctx.beginPath();
            ctx.arc(gx + influence * 8, gy + influence * 8, Math.max(1, scale), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // Top Poster Meta Header
      ctx.save();
      ctx.fillStyle = '#4A3728';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillText('TRIPSAHAY DISCOURSE NO. 081', 32, 42);

      ctx.fillStyle = '#C96B4A';
      ctx.font = '500 9px "JetBrains Mono", monospace';
      ctx.fillText('• SWISS DESIGN RATIO 3:4', 32, 58);

      const timeStr = new Date().toISOString().substring(11, 19) + ' UTC';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#7a6a58';
      ctx.fillText(timeStr, w - 32, 42);
      ctx.fillText(`FPS: ${(60 * speed).toFixed(0)} · TICK: ${t.toFixed(1)}s`, w - 32, 58);
      ctx.restore();

      // Dynamic Poster Headline Graphic
      ctx.save();
      ctx.fillStyle = '#4A3728';
      ctx.font = '600 24px "Fraunces", serif';
      ctx.textAlign = 'left';
      ctx.fillText('On Not Losing', 32, 98);

      ctx.font = 'italic 700 28px "Fraunces", serif';
      ctx.fillStyle = '#F2765A';
      ctx.fillText('Your Memories.', 32, 130);

      // Chapter badge
      const curChapter = CHAPTERS[activeChapter];
      ctx.fillStyle = '#4A3728';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(`CURRENT: ${curChapter.code} — ${curChapter.title}`, 32, 160);

      ctx.fillStyle = '#7a6a58';
      ctx.font = '400 9.5px "JetBrains Mono", monospace';
      ctx.fillText(curChapter.formula, 32, 178);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeChapter, isPlaying, animMode, speed]);

  const selectChapter = (index: number) => {
    setActiveChapter(index);
    playPosterTick(440 + index * 120);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-12">
      {/* Left Column: Context & 22. Chapter Rows Navigator (staggers in x: -14 -> 0 on top 78%) */}
      <div className="lg:col-span-6 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BFE3CE] border border-[#4A3728] text-xs font-mono text-[#4A3728] font-semibold mb-3 shadow-[2px_2px_0px_rgba(74,55,40,0.8)]">
            <Sparkles className="w-3.5 h-3.5 text-[#2E6E4E]" />
            <span>STUDIO FEIXEN KINETIC POSTER ENGINE</span>
          </div>
          <h3 className="font-serif-custom text-3xl sm:text-4xl text-[#4A3728] font-semibold leading-tight">
            Field notes, <em className="italic text-[#F2765A] font-bold">animated &amp; alive.</em>
          </h3>
          <p className="text-[#7a6a58] text-base leading-relaxed mt-3 font-light max-w-xl">
            Every mechanism powering TripSahay has a living visual proof. Touch and explore the poster to witness accelerometer gating, cryptographic append chains, and topological resurrection running live.
          </p>
        </div>

        {/* 22. Chapter Selection Rows (CH.01–04 + durations, stagger in x: -14 -> 0 on top 78%) */}
        <div ref={chapterListRef} className="space-y-2.5">
          {CHAPTERS.map((ch, idx) => {
            const isSelected = activeChapter === idx;
            return (
              <button
                key={ch.id}
                onClick={() => selectChapter(idx)}
                className={`chapter-row w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-white border-[#4A3728] shadow-[5px_5px_0px_rgba(74,55,40,0.9)] translate-x-1'
                    : 'bg-[#FFFDF8] border-[#4A3728]/40 hover:border-[#4A3728] hover:bg-white'
                }`}
                style={{ willChange: 'transform, opacity' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded border border-[#4A3728] font-bold ${
                        isSelected ? 'bg-[#F2765A] text-white' : 'bg-[#FBEFD4] text-[#4A3728]'
                      }`}
                    >
                      {ch.code}
                    </span>
                    <span className="font-serif-custom text-base font-semibold text-[#4A3728]">
                      {ch.title}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#C96B4A]">
                    {ch.duration}
                  </span>
                </div>
                {isSelected && (
                  <div className="pt-1.5 border-t border-[#4A3728]/15 mt-1">
                    <p className="text-xs text-[#7a6a58] leading-relaxed">
                      {ch.description}
                    </p>
                    <div className="font-mono text-[11px] text-[#C96B4A] bg-[#FFF9F0] px-2 py-1 rounded mt-1.5 border border-[#4A3728]/20 inline-block">
                      {ch.formula}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Mode & Speed Switcher Controls */}
        <div className="bg-[#FFF9F0] border-2 border-[#4A3728] rounded-xl p-3.5 shadow-[4px_4px_0px_rgba(74,55,40,0.85)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-semibold text-[#4A3728] mr-1">VISUAL MODE:</span>
            <button
              onClick={() => {
                setAnimMode('swiss_flow');
                playPosterTick(400);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono border border-[#4A3728] cursor-pointer ${
                animMode === 'swiss_flow' ? 'bg-[#F2765A] text-white font-bold' : 'bg-white text-[#4A3728]'
              }`}
              title="Swiss kinetic ribbon waves"
            >
              <Activity className="w-3 h-3 inline mr-1" />
              Waves
            </button>
            <button
              onClick={() => {
                setAnimMode('gps_radar');
                playPosterTick(480);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono border border-[#4A3728] cursor-pointer ${
                animMode === 'gps_radar' ? 'bg-[#F2765A] text-white font-bold' : 'bg-white text-[#4A3728]'
              }`}
              title="Satellite Radar sweep"
            >
              <Compass className="w-3 h-3 inline mr-1" />
              Radar
            </button>
            <button
              onClick={() => {
                setAnimMode('topological_spline');
                playPosterTick(540);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono border border-[#4A3728] cursor-pointer ${
                animMode === 'topological_spline' ? 'bg-[#F2765A] text-white font-bold' : 'bg-white text-[#4A3728]'
              }`}
              title="Topological segment recovery"
            >
              <Layers className="w-3 h-3 inline mr-1" />
              Spline
            </button>
            <button
              onClick={() => {
                setAnimMode('kinetic_grid');
                playPosterTick(600);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono border border-[#4A3728] cursor-pointer ${
                animMode === 'kinetic_grid' ? 'bg-[#F2765A] text-white font-bold' : 'bg-white text-[#4A3728]'
              }`}
              title="Kinetic dot matrix"
            >
              <Disc className="w-3 h-3 inline mr-1" />
              Grid
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg border border-[#4A3728] bg-white text-[#4A3728] hover:bg-[#FBEFD4] cursor-pointer transition-colors"
              title={isPlaying ? 'Pause simulation' : 'Play simulation'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#F2765A]" />}
            </button>
            <button
              onClick={() => {
                animTimeRef.current = 0;
                playPosterTick(320);
              }}
              className="p-1.5 rounded-lg border border-[#4A3728] bg-white text-[#4A3728] hover:bg-[#FBEFD4] cursor-pointer transition-colors"
              title="Reset time"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1 font-mono text-xs text-[#7a6a58]">
              <span>SPEED:</span>
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono border border-[#4A3728]/40 ${
                    speed === s ? 'bg-[#4A3728] text-white font-bold' : 'bg-white text-[#4A3728]'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: 22. Rotated Poster Card with Poster Sway (±0.5° on 5s sine loop) */}
      <div ref={posterWrapperRef} className="lg:col-span-6 flex justify-center">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: isHovered
              ? `perspective(800px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(1.02)`
              : 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)',
            transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
            willChange: 'transform',
          }}
          className="poster-sway relative w-full max-w-[420px] aspect-[3/4] bg-white rounded-2xl border-[2.5px] border-[#4A3728] overflow-hidden shadow-[14px_16px_0px_rgba(74,55,40,0.85)] cursor-crosshair select-none"
        >
          {/* Animated Canvas */}
          <canvas
            ref={canvasRef}
            width={420}
            height={560}
            className="w-full h-full block"
          />

          {/* Stamped Chapter Ticker at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pointer-events-auto">
            <div className="border-t-[1.5px] border-[#4A3728] pt-3 space-y-1.5 font-mono text-xs">
              {CHAPTERS.map((ch, i) => (
                <div
                  key={ch.id}
                  onClick={() => selectChapter(i)}
                  className={`flex justify-between items-center py-1 px-1.5 rounded cursor-pointer transition-colors ${
                    activeChapter === i
                      ? 'bg-[#F2765A] text-white font-bold'
                      : 'text-[#4A3728] hover:bg-[#FBEFD4]'
                  }`}
                >
                  <span>{ch.code} — {ch.title}</span>
                  <span className={activeChapter === i ? 'text-white' : 'text-[#C96B4A]'}>
                    {ch.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Holographic Sticker Overlay in top right */}
          <div className="absolute top-4 right-4 pointer-events-none transform rotate-3">
            <div className="bg-[#FFE3B3] text-[#4A3728] font-mono text-[10px] font-bold px-2 py-1 rounded border border-[#4A3728] shadow-[2px_2px_0px_rgba(74,55,40,0.8)]">
              LIVE SIMULATION
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
