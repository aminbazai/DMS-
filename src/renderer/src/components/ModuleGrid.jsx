import { useNavigate } from 'react-router-dom';

const modules = [
  { path: '/purchase-invoice', label: 'Purchase Invoice', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z', color: 'emerald' },
  { path: '/purchase-return', label: 'Purchase Return', icon: 'M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z', color: 'emerald' },
  { path: '/sales-invoice', label: 'Sales Invoice', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z', color: 'blue' },
  { path: '/sales-return', label: 'Sales Return', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', color: 'blue' },
  { path: '/product', label: 'Items', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'purple' },
  { path: '/party', label: 'Party', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'purple' },
  { path: '/supplier-ledger', label: 'Supplier Ledger', icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', color: 'orange' },
  { path: '/customer-ledger', label: 'Customer Ledger', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: 'orange' },
  { path: '/bank-ledger', label: 'Bank Ledger', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'yellow' },
  { path: '/cash-ledger', label: 'Cash Ledger', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'yellow' },
  { path: '/journal-entry', label: 'Journal Entry', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'teal' },
  { path: '/expense-info', label: 'Expense Info', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: 'red' },
  { path: '/bank-info', label: 'Bank Info', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'yellow' },
  { path: '/profit-loss', label: 'Profit / Loss', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'emerald' },
  { path: '/trial-balance', label: 'Trial Balance', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3', color: 'blue' },
  { path: '/payable-receivable', label: 'Payable/Receivable', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', color: 'red' },
  { path: '/sale-report', label: 'Sale Report', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'blue' },
  { path: '/stock-report', label: 'Stock Report', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4', color: 'purple' },
  { path: '/daily-activity', label: 'Daily Activity', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'teal' },
  { path: '/warehouse', label: 'Ware House', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'gray' },
  { path: '/stock-adjustment', label: 'Stock Adjustment', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', color: 'orange' },
  { path: '/stock-transfer', label: 'Stock Transfer', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', color: 'blue' },
  { path: '/data-backup', label: 'Data Backup', icon: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4', color: 'emerald' },
  { path: '/account-setting', label: 'Account Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', color: 'gray' },
  { path: '/data-import', label: 'Data Import', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12', color: 'teal' },
];

const colorMap = {
  emerald: { border: 'border-emerald-500/10 hover:border-emerald-400/30', icon: 'text-emerald-400', bg: 'from-emerald-500/[0.03] to-emerald-600/[0.01]', glow: 'group-hover:shadow-emerald-500/10' },
  blue: { border: 'border-accent/10 hover:border-accent/30', icon: 'text-accent', bg: 'from-accent/[0.03] to-accent/[0.01]', glow: 'group-hover:shadow-accent/10' },
  purple: { border: 'border-purple-500/10 hover:border-purple-400/30', icon: 'text-purple-400', bg: 'from-purple-500/[0.03] to-purple-600/[0.01]', glow: 'group-hover:shadow-purple-500/10' },
  orange: { border: 'border-orange-500/10 hover:border-orange-400/30', icon: 'text-orange-400', bg: 'from-orange-500/[0.03] to-orange-600/[0.01]', glow: 'group-hover:shadow-orange-500/10' },
  yellow: { border: 'border-yellow-500/10 hover:border-yellow-400/30', icon: 'text-yellow-400', bg: 'from-yellow-500/[0.03] to-yellow-600/[0.01]', glow: 'group-hover:shadow-yellow-500/10' },
  teal: { border: 'border-teal-500/10 hover:border-teal-400/30', icon: 'text-teal-400', bg: 'from-teal-500/[0.03] to-teal-600/[0.01]', glow: 'group-hover:shadow-teal-500/10' },
  red: { border: 'border-rose-500/10 hover:border-rose-400/30', icon: 'text-rose-400', bg: 'from-rose-500/[0.03] to-rose-600/[0.01]', glow: 'group-hover:shadow-rose-500/10' },
  gray: { border: 'border-gray-500/10 hover:border-gray-400/30', icon: 'text-gray-400', bg: 'from-gray-500/[0.03] to-gray-600/[0.01]', glow: 'group-hover:shadow-gray-500/10' },
};

export default function ModuleGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {modules.map((mod, i) => {
        const cc = colorMap[mod.color] || colorMap.blue;
        return (
          <button
            key={mod.path}
            onClick={() => navigate(mod.path)}
            style={{ animationDelay: `${i * 40}ms` }}
            className={`glass-module bg-gradient-to-br ${cc.bg} ${cc.border} ${cc.glow} p-4 flex flex-col items-center justify-center gap-2.5 group`}
          >
            <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:scale-110 group-hover:bg-white/[0.06] transition-all duration-300">
              <svg className={`w-4.5 h-4.5 ${cc.icon} group-hover:${cc.icon} transition-all duration-300`} style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mod.icon} />
              </svg>
            </div>
            <span className="text-[11px] text-gray-400 group-hover:text-gray-200 text-center font-medium leading-tight transition-colors duration-300">
              {mod.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
