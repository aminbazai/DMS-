const iconPaths = {
  green: 'M3 3h1l4 16h10l4-16h1M7 11h10',
  blue: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  purple: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  red: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  orange: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z',
  yellow: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
};

const colorConfig = {
  green: { accent: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'before:bg-emerald-500/[0.04]', glow: 'neon-border-green', icon: 'text-emerald-400/80', shadow: 'shadow-emerald-500/5' },
  orange: { accent: 'text-orange-400', border: 'border-orange-500/20', bg: 'before:bg-orange-500/[0.04]', glow: 'neon-border-orange', icon: 'text-orange-400/80', shadow: 'shadow-orange-500/5' },
  purple: { accent: 'text-purple-400', border: 'border-purple-500/20', bg: 'before:bg-purple-500/[0.04]', glow: 'neon-border-purple', icon: 'text-purple-400/80', shadow: 'shadow-purple-500/5' },
  red: { accent: 'text-rose-400', border: 'border-rose-500/20', bg: 'before:bg-rose-500/[0.04]', glow: 'neon-border-red', icon: 'text-rose-400/80', shadow: 'shadow-rose-500/5' },
  blue: { accent: 'text-accent', border: 'border-accent/20', bg: 'before:bg-accent/[0.04]', glow: 'neon-border-blue', icon: 'text-accent/80', shadow: 'shadow-accent/5' },
  yellow: { accent: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'before:bg-yellow-500/[0.04]', glow: 'neon-border-yellow', icon: 'text-yellow-400/80', shadow: 'shadow-yellow-500/5' },
};

export default function KPICard({ title, amount, qty, color, icon: iconEmoji }) {
  const cc = colorConfig[color] || colorConfig.blue;

  return (
    <div className={`glass-kpi relative overflow-hidden p-5 ${cc.border} ${cc.glow} hover:${cc.border} group ${cc.bg}`}>
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] uppercase tracking-[0.12em] font-heading font-semibold ${cc.accent} opacity-70 group-hover:opacity-100 transition-opacity duration-300`}>
            {title}
          </p>
          <p className={`text-2xl font-heading font-bold text-white mt-2 tracking-tight group-hover:translate-x-0.5 transition-transform duration-300`}>
            {amount !== undefined ? amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '-'}
          </p>
          {qty !== undefined && (
            <p className={`text-xs ${cc.accent} opacity-60 mt-1 flex items-center gap-1`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Qty: {qty.toLocaleString()}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:scale-110 group-hover:${cc.border} transition-all duration-300 shrink-0 ml-3`}>
          <svg className={`w-5 h-5 ${cc.icon} group-hover:${cc.accent} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPaths[color] || iconPaths.blue} />
          </svg>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${cc.accent}`} />
    </div>
  );
}
