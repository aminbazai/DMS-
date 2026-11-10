import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useTheme from '../hooks/useTheme';

export function DropdownTheme() {
  const { theme, themes, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const ddRef = useRef(null);
  const current = themes.find(t => t.id === theme);

  useEffect(() => {
    if (!open) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    const handle = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        ddRef.current && !ddRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.1] rounded-lg py-1.5 px-2.5 transition-all duration-200"
      >
        <span
          className="w-3.5 h-3.5 rounded-full shrink-0"
          style={{ background: `linear-gradient(135deg, ${current?.bg || '#060b18'}, ${current?.primary || '#38bdf8'})` }}
        />
        <span>{current?.name || 'Navy'}</span>
        <svg className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={ddRef}
          className="fixed w-52 rounded-xl shadow-2xl overflow-hidden py-1.5 animate-scale-fade-in"
          style={{
            top: pos.top,
            right: pos.right,
            zIndex: 2147483647,
            background: 'rgba(14, 22, 46, 0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs transition-all duration-200 ${
                theme === t.id
                  ? 'text-white bg-white/[0.06]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <span className="relative w-5 h-5 rounded-full shrink-0 overflow-hidden ring-1 ring-white/[0.1] flex items-center justify-center" style={{ background: t.bg }}>
                <span className="w-3 h-3 rounded-full" style={{ background: t.primary }} />
              </span>
              <span className="font-medium flex-1 text-left">{t.name}</span>
              {theme === t.id && (
                <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

export default function ThemeSwitcher() {
  const { theme, themes, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const ddRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    const handle = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        ddRef.current && !ddRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="relative text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg p-2 transition-all duration-200 group"
        title="Themes"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={ddRef}
          className="fixed w-[300px] rounded-xl shadow-2xl overflow-hidden animate-scale-fade-in"
          style={{
            top: pos.top,
            right: pos.right,
            zIndex: 2147483647,
            background: 'rgba(14, 22, 46, 0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="p-4 border-b border-white/[0.05]">
            <h3 className="font-heading font-semibold text-white text-sm">Theme</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Choose your theme</p>
          </div>
          <div className="p-3 grid grid-cols-5 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                title={t.name}
                className={`relative w-full aspect-square rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                  theme === t.id ? 'ring-2 ring-white scale-110 shadow-lg' : ''
                }`}
                style={{ background: `linear-gradient(135deg, ${t.bg}, ${t.primary})` }}
              >
                {theme === t.id && (
                  <svg className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="p-3 pt-0 text-center">
            <span className="text-[10px] text-gray-500 font-medium">
              {themes.find(t => t.id === theme)?.name || 'Navy'}
            </span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
