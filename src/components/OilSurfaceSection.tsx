import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Sliders, Volume2, VolumeX, Eye } from 'lucide-react';
import { playHarmonicChime } from '../utils/audio';

export const OilSurfaceSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [vibrancy, setVibrancy] = useState<number>(1.2);
  const [filmViscosity, setFilmViscosity] = useState<number>(1.0);

  // Mouse tracking targets
  const mouseTargetRef = useRef<{ x: number; y: number; hover: number; lastChime: number }>({
    x: 0.5,
    y: 0.5,
    hover: 0.0,
    lastChime: 0
  });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = sectionRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const ny = Math.max(0, Math.min(1, 1.0 - (e.clientY - rect.top) / rect.height));

      const target = mouseTargetRef.current;
      target.x = nx;
      target.y = ny;
      target.hover = 1.0;
      setIsInteracting(true);

      const now = performance.now();
      if (soundEnabled && now - target.lastChime > 140) {
        target.lastChime = now;
        playHarmonicChime(320 + nx * 400 + ny * 200);
      }
    },
    [soundEnabled]
  );

  const handlePointerLeave = () => {
    mouseTargetRef.current.hover = 0.0;
    setIsInteracting(false);
  };

  // 25. WARM IRIDESCENT WEBGL FILM
  // Raw WebGL fullscreen fragment shader: domain-warped fbm (4 octaves) = oil film;
  // cos-palette iridescence; mouse bulge exp(-d×3.2) warps the field + speckle particles densify in the bulge;
  // smooth mouse lerp .07. Perf: DPR capped 1, low-power GPU hint, IntersectionObserver pauses rAF off-screen
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    // Low-power GPU hint & DPR capped to 1
    const gl = canvas.getContext('webgl', {
      powerPreference: 'low-power',
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false
    });
    if (!gl) return;

    const vsSource = `
      attribute vec2 aPos;
      void main() {
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uHover;
      uniform float uVibrancy;
      uniform float uSpeed;

      // 4-octave FBM for organic fluid turbulence
      vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return fract(sin(p) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                       dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                   mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                       dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
      }

      // Exactly 4 octaves domain FBM
      float fbm4(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 4; ++i) {
          v += a * noise(p);
          p = rot * p * 2.02 + vec2(2.4, 1.7);
          a *= 0.5;
        }
        return v;
      }

      // Inigo Quilez cosine palette formula
      vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
        return a + b * cos(6.2831853 * (c * t + d));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        vec2 asp = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 p = uv * asp * 2.6;

        float t = uTime * 0.16 * uSpeed;

        // 25. Mouse bulge exp(-d * 3.2) warps the field
        vec2 mouseAsp = uMouse * asp;
        vec2 uvAsp = uv * asp;
        float d = length(uvAsp - mouseAsp);
        float mouseBulge = exp(-d * 3.2) * (0.4 + uHover * 0.85);

        // Bulge displacement
        vec2 bulgeVec = normalize(uvAsp - mouseAsp + 0.001) * mouseBulge * 0.6;
        p += bulgeVec;

        // Domain-warped FBM (4 octaves)
        vec2 q = vec2(
          fbm4(p + vec2(0.0, 0.0) + vec2(t * 0.2, t * 0.1)),
          fbm4(p + vec2(5.2, 1.3) - vec2(t * 0.15, t * 0.2))
        );

        vec2 r = vec2(
          fbm4(p + 3.4 * q + vec2(1.7, 9.2) + vec2(t * 0.3, t * 0.05)),
          fbm4(p + 3.4 * q + vec2(8.3, 2.8) - vec2(t * 0.1, t * 0.25))
        );

        float f = fbm4(p + 3.8 * r + mouseBulge * 1.4);

        // 25. Cos-palette warm iridescence (coral, ochre, petroleum teal, gold, rose)
        vec3 a = vec3(0.52, 0.45, 0.48);
        vec3 b = vec3(0.48, 0.52, 0.46);
        vec3 c = vec3(1.0, 1.0, 0.95);
        vec3 d_phase = vec3(0.02, 0.28, 0.58);

        float phase = f * 1.8 + mouseBulge * 0.6 + t * 0.25;
        vec3 iridescent = cosPalette(phase, a, b, c, d_phase);

        // Deep warm midnight backing
        vec3 darkBase = vec3(0.07, 0.05, 0.06);
        vec3 color = mix(darkBase, iridescent, clamp(0.55 + f * 0.45 + mouseBulge * 0.4, 0.0, 1.0));

        // Vibrancy saturation
        float lum = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(lum), color, uVibrancy * 1.3);

        // 25. Speckle particles that densify in the bulge
        float speckleHash = fract(sin(dot(floor(uv * uResolution.xy * 0.75) + floor(uTime * 12.0), vec2(12.9898, 78.233))) * 43758.5453);
        float speckle = pow(speckleHash, 24.0) * (0.3 + mouseBulge * 3.5);
        color += vec3(1.0, 0.92, 0.75) * speckle;

        // Specular sheen ring around bulge edge
        float rim = pow(clamp(1.0 - d * 2.8, 0.0, 1.0), 3.0) * mouseBulge;
        color += vec3(0.95, 0.65, 0.45) * rim * 0.8;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Fullscreen quad buffer
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uMouse = gl.getUniformLocation(program, 'uMouse');
    const uHover = gl.getUniformLocation(program, 'uHover');
    const uVibrancyLoc = gl.getUniformLocation(program, 'uVibrancy');
    const uSpeedLoc = gl.getUniformLocation(program, 'uSpeed');

    let animationFrameId: number;
    // 25. Smooth mouse lerp .07
    const smoothMouse = { x: 0.5, y: 0.5, hover: 0.0 };
    let isVisible = true;

    // 25. DPR capped to 1
    const resize = () => {
      const dpr = 1;
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (time: number) => {
      if (!isVisible) return;

      // 25. Smooth mouse lerp .07
      const target = mouseTargetRef.current;
      smoothMouse.x += (target.x - smoothMouse.x) * 0.07;
      smoothMouse.y += (target.y - smoothMouse.y) * 0.07;
      smoothMouse.hover += (target.hover - smoothMouse.hover) * 0.07;

      resize();

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, time * 0.001);
      gl.uniform2f(uMouse, smoothMouse.x, smoothMouse.y);
      gl.uniform1f(uHover, smoothMouse.hover);
      gl.uniform1f(uVibrancyLoc, vibrancy);
      gl.uniform1f(uSpeedLoc, filmViscosity);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      animationFrameId = requestAnimationFrame(render);
    };

    // 25. IntersectionObserver pauses rAF off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isVisible) {
              isVisible = true;
              animationFrameId = requestAnimationFrame(render);
            }
          } else {
            isVisible = false;
            cancelAnimationFrame(animationFrameId);
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(section);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [vibrancy, filmViscosity]);

  return (
    <section
      id="oil"
      ref={sectionRef}
      data-cursor="#E0A458"
      data-label="OIL SURFACE"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-[75vh] w-full bg-[#0a0a0f] border-y-2 border-[#4A3728] overflow-hidden select-none cursor-crosshair"
    >
      {/* WebGL Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Floating Description Card */}
      <div className="absolute left-6 md:left-14 bottom-8 md:bottom-12 z-20 pointer-events-none max-w-lg reveal">
        <div className="bg-[#FFF9F0]/95 backdrop-blur-md border-2 border-[#4A3728] rounded-2xl p-6 shadow-[10px_12px_0px_rgba(74,55,40,0.9)]">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-[#C96B4A] mb-2 font-bold">
            <Sparkles className="w-4 h-4 text-[#F2765A]" />
            <span className="scramble-kicker">INTERLUDE — THE SURFACE OF YOUR DATA</span>
          </div>
          <h3 className="font-serif-custom text-3xl md:text-5xl text-[#4A3728] font-semibold leading-tight">
            Every point <em className="italic text-[#F2765A] font-bold">yours.</em><br />
            Touch it.
          </h3>
          <p className="text-sm text-[#7a6a58] mt-2.5 font-light leading-relaxed">
            Domain-warped 4-octave FBM oil film with cosine-palette iridescence. Move your cursor to create a viscous bulge that warps the field and densifies golden speckle particles in real-time.
          </p>
          <div className="mt-3.5 inline-flex items-center gap-2 font-mono text-[11px] text-[#2E6E4E] bg-[#DFF3E4] px-2.5 py-1 rounded border border-[#2E6E4E]/30 font-semibold">
            <span>✓ 60FPS LOW-POWER SHADER · DPR CAPPED 1</span>
          </div>
        </div>
      </div>

      {/* Top Floating Control Bar */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2.5 pointer-events-auto">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 bg-[#FFF9F0]/95 backdrop-blur-md border-2 border-[#4A3728] rounded-xl text-[#4A3728] shadow-[4px_4px_0px_rgba(74,55,40,0.85)] hover:bg-white cursor-pointer transition-colors"
          title={soundEnabled ? 'Mute harmonic chime' : 'Unmute harmonic chime'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#F2765A]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#7a6a58]" />
          )}
        </button>
      </div>

      {/* Controls Tray */}
      <div className="absolute right-6 bottom-8 z-20 hidden md:block pointer-events-auto">
        <div className="bg-[#FFF9F0]/95 backdrop-blur-md border-2 border-[#4A3728] rounded-xl p-4 shadow-[6px_6px_0px_rgba(74,55,40,0.85)] space-y-3 w-64 text-xs font-mono">
          <div className="flex items-center justify-between text-[#4A3728] font-bold border-b border-[#4A3728]/20 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#F2765A]" />
              OIL FILM DYNAMICS
            </span>
            <span className="text-[10px] text-[#C96B4A]">FBM-4</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[#7a6a58]">
              <span>IRIDESCENCE:</span>
              <span className="font-bold text-[#4A3728]">{vibrancy.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.1"
              value={vibrancy}
              onChange={(e) => setVibrancy(parseFloat(e.target.value))}
              className="w-full accent-[#F2765A] cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[#7a6a58]">
              <span>VISCOSITY:</span>
              <span className="font-bold text-[#4A3728]">{filmViscosity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.0"
              step="0.1"
              value={filmViscosity}
              onChange={(e) => setFilmViscosity(parseFloat(e.target.value))}
              className="w-full accent-[#F2765A] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Floating Prompt */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <div className="font-mono text-xs tracking-widest text-[#FBEFD4] bg-[#4A3728]/85 backdrop-blur-sm px-4 py-1.5 rounded-full border border-[#FBEFD4]/40 shadow-lg">
          {isInteracting ? '✦ BULGE EXP(-D×3.2) ACTIVE' : 'DRAG TO BULGE & IRIDESCE OIL FILM'}
        </div>
      </div>
    </section>
  );
};
