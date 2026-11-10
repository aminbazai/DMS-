/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{html,jsx,js}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: 'var(--color-navy)',
          light: 'var(--color-navy-light)',
          lighter: 'var(--color-navy-lighter)',
          border: 'var(--color-navy-border)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          light: 'var(--color-accent-light)',
          dark: 'var(--color-accent-dark)',
          neon: 'var(--color-accent-neon)',
        },
        indigo: {
          DEFAULT: 'var(--color-indigo)',
          light: 'var(--color-indigo-light)',
          dark: 'var(--color-indigo-dark)',
          neon: 'var(--color-indigo-neon)',
        },
        purple: {
          neon: 'var(--color-purple-neon)',
        },
        glass: {
          border: 'rgba(56, 189, 248, 0.08)',
          light: 'rgba(255, 255, 255, 0.03)',
          medium: 'rgba(13, 20, 38, 0.6)',
          white: 'rgba(255, 255, 255, 0.05)',
          dark: 'rgba(6, 11, 24, 0.7)',
        },
        neon: {
          cyan: '#00d4ff',
          blue: '#38bdf8',
          indigo: '#6366f1',
          purple: '#a855f7',
          green: '#10b981',
          orange: '#f97316',
          red: '#ef4444',
          yellow: '#eab308',
        },
      },
      fontFamily: {
        heading: ['Rajdhani', 'sans-serif'],
        body: ['Noto Sans', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '20px',
        strong: '32px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 212, 255, 0.15), 0 0 45px rgba(0, 212, 255, 0.05)',
        'neon-blue': '0 0 15px rgba(56, 189, 248, 0.15), 0 0 45px rgba(56, 189, 248, 0.05)',
        'neon-indigo': '0 0 15px rgba(99, 102, 241, 0.15), 0 0 45px rgba(99, 102, 241, 0.05)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.15), 0 0 45px rgba(168, 85, 247, 0.05)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        'neon-glow': '0 0 20px rgba(56, 189, 248, 0.1), 0 0 60px rgba(56, 189, 248, 0.03), inset 0 0 20px rgba(56, 189, 248, 0.03)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(56, 189, 248, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        'input': '0 2px 8px rgba(0, 0, 0, 0.2)',
        'input-focus': '0 0 0 1px rgba(56, 189, 248, 0.2), 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 30px rgba(56, 189, 248, 0.04)',
        'dropdown': '0 12px 48px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)',
        'button-glow': '0 4px 16px rgba(56, 189, 248, 0.25), 0 0 40px rgba(56, 189, 248, 0.08)',
        'table': '0 2px 12px rgba(0, 0, 0, 0.2)',
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },
      animation: {
        'float-slow': 'float-slow 16s ease-in-out infinite',
        'float-particle': 'float-particle 18s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'scale-fade-in': 'scale-fade-in 0.5s ease-out forwards',
        'shake': 'shake 0.4s ease-in-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'ripple': 'ripple 0.6s ease-out',
        'logo-pulse': 'logo-pulse 3s ease-in-out infinite',
        'card-float': 'card-float 8s ease-in-out infinite',
        'spin-slow': 'spin-slow 30s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'border-glow': 'border-glow 2s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 3s ease-in-out infinite',
        'sidebar-glow': 'sidebar-glow 4s ease-in-out infinite',
        'glass-shine': 'glass-shine 5s ease-in-out infinite',
        'float-up': 'float-up 6s ease-in-out infinite',
        'drift': 'drift 12s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translate(0,0) rotate(0deg)' },
          '33%': { transform: 'translate(30px,-30px) rotate(120deg)' },
          '66%': { transform: 'translate(-20px,20px) rotate(240deg)' },
        },
        'float-particle': {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.6' },
          '50%': { transform: 'translateY(-100px) scale(1.2)', opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '50%': { transform: 'translateX(8px)' },
          '75%': { transform: 'translateX(-4px)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'logo-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(56,189,248,0.2)' },
          '50%': { boxShadow: '0 0 0 15px rgba(56,189,248,0)' },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(15)', opacity: '0' },
        },
        'card-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(56, 189, 248, 0.15), 0 0 60px rgba(56, 189, 248, 0)' },
          '50%': { boxShadow: '0 0 30px rgba(56, 189, 248, 0.3), 0 0 80px rgba(56, 189, 248, 0.1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(56, 189, 248, 0.1)' },
          '50%': { borderColor: 'rgba(56, 189, 248, 0.3)' },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '0.6', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.3)' },
        },
        'sidebar-glow': {
          '0%, 100%': { borderColor: 'rgba(56, 189, 248, 0.06)' },
          '50%': { borderColor: 'rgba(56, 189, 248, 0.15)' },
        },
        'glass-shine': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'float-up': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'drift': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(10px, -10px) rotate(2deg)' },
          '50%': { transform: 'translate(-5px, -15px) rotate(-1deg)' },
          '75%': { transform: 'translate(-10px, -5px) rotate(1deg)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
};
