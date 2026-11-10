import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/*  Floating geometric shapes used in the animated background         */
/*  — 5 shapes: circle, diamond, triangle, hexagon, small circle     */
/* ------------------------------------------------------------------ */
const SHAPES = [
  { Component: CircleShape,  props: { size: 180, x: 6,  y: 10, delay: 0,   duration: 17 } },
  { Component: DiamondShape, props: { size: 110, x: 86, y: 16, delay: 2.5, duration: 19 } },
  { Component: TriangleShape,props: { size: 130, x: 84, y: 74, delay: 4.5, duration: 14 } },
  { Component: HexagonShape, props: { size: 95,  x: 4,  y: 80, delay: 1.5, duration: 16 } },
  { Component: CircleShape,  props: { size: 75,  x: 50, y: 50, delay: 3,   duration: 20 } },
];

/* ------------------------------------------------------------------ */
/*  Individual shape SVG components                                   */
/* ------------------------------------------------------------------ */
function CircleShape({ size, x, y, delay, duration }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animation: `float-slow ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 1}
          stroke="rgba(56,189,248,0.08)"
          strokeWidth="1"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 4}
          fill="rgba(56,189,248,0.03)"
        />
      </svg>
    </div>
  );
}

function DiamondShape({ size, x, y, delay, duration }) {
  const half = size / 2;
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animation: `float-slow ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <rect
          x="2" y="2"
          width={size - 4}
          height={size - 4}
          rx={size * 0.12}
          transform={`rotate(45 ${half} ${half})`}
          stroke="rgba(56,189,248,0.07)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

function TriangleShape({ size, x, y, delay, duration }) {
  const s = size;
  const points = `${s / 2},4 ${s - 4},${s - 4} 4,${s - 4}`;
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animation: `float-slow ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <polygon points={points} stroke="rgba(56,189,248,0.07)" strokeWidth="1" />
      </svg>
    </div>
  );
}

function HexagonShape({ size, x, y, delay, duration }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const ang = ((i * 60) - 30) * (Math.PI / 180);
    return `${cx + r * Math.cos(ang)},${cy + r * Math.sin(ang)}`;
  }).join(' ');
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animation: `float-slow ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <polygon points={pts} stroke="rgba(56,189,248,0.07)" strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AuthLayout — Multi-Layer Animated Background + Centered Content   */
/* ------------------------------------------------------------------ */
export default function AuthLayout() {
  /* ---- Stable random particles across renders ---- */
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        duration: Math.random() * 14 + 10,    // 10 – 24s
        delay: Math.random() * 8,
        opacity: Math.random() * 0.35 + 0.08,
      })),
    []
  );

  return (
    <div className="relative min-h-screen bg-navy flex items-center justify-center overflow-hidden select-none">

      {/* ========================================================
          LAYER 1: Gradient Mesh — 3 radial blobs
          ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left accent blob */}
        <div
          className="absolute -top-48 -left-48 w-[550px] h-[550px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)',
            animation: 'float-slow 18s ease-in-out -2s infinite',
          }}
        />
        {/* Bottom-right indigo blob */}
        <div
          className="absolute -bottom-48 -right-48 w-[550px] h-[550px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%)',
            animation: 'float-slow 20s ease-in-out -6s infinite',
          }}
        />
        {/* Center-right accent blob */}
        <div
          className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.035) 0%, transparent 70%)',
            animation: 'float-slow 16s ease-in-out -10s infinite',
          }}
        />
      </div>

      {/* ========================================================
          LAYER 2: Floating Geometric Shapes
          ======================================================== */}
      <div className="absolute inset-0 pointer-events-none">
        {SHAPES.map(({ Component, props }, i) => (
          <Component key={i} {...props} />
        ))}
      </div>

      {/* ========================================================
          LAYER 3: Particle Dots (~30)
          ======================================================== */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-accent"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ========================================================
          LAYER 4: Subtle Grid Overlay
          ======================================================== */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />


      {/* ========================================================
          LAYER 5: Content (z-10)
          ======================================================== */}
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <Outlet />
      </div>

    </div>
  );
}
