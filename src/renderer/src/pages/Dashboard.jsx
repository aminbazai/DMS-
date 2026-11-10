import { useState, useEffect } from 'react';
import KPICard from '../components/KPICard';
import ModuleGrid from '../components/ModuleGrid';
import useAuth from '../hooks/useAuth';
import useCompanyInfo from '../hooks/useCompanyInfo';

export default function Dashboard() {
  const { user } = useAuth();
  const { companyName, logo, address, phone } = useCompanyInfo();
  const [data, setData] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
    const timer = setInterval(() => setToday(new Date()), 1000);
    const dataTimer = setInterval(loadData, 30000);
    const onFocus = () => loadData();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      clearInterval(dataTimer);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const loadData = async () => {
    try { setData(await window.electronAPI.getDashboardData()); } catch {}
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <div className="w-10 h-10 border-2 border-accent/10 border-t-accent/50 rounded-full animate-spin absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>
      </div>
    );
  }

  const kpis = [
    { title: 'Today Purchase', amount: data.todayPurchase?.amount, qty: data.todayPurchase?.qty, color: 'green', icon: '🛒', index: 0 },
    { title: 'Today Sale', amount: data.todaySale?.amount, qty: data.todaySale?.qty, color: 'orange', icon: '💰', index: 1 },
    { title: 'Available Stock', amount: data.availableStock?.amount, qty: data.availableStock?.qty, color: 'purple', icon: '📦', index: 2 },
    { title: 'Total Payable', amount: data.totalPayable, color: 'red', icon: '📋', index: 3 },
    { title: 'Total Receivable', amount: data.totalReceivable, color: 'blue', icon: '📋', index: 4 },
    { title: 'Cash in Hands', amount: data.cashInHand, color: 'yellow', icon: '💵', index: 5 },
  ];

  const currentTime = today.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const currentDate = today.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={`space-y-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {logo && (
            <div className="w-14 h-14 rounded-xl bg-navy-lighter border border-white/[0.06] overflow-hidden shrink-0 hidden sm:flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-full h-full object-contain p-1.5" />
            </div>
          )}
          <div>
            <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-gradient">{companyName}</span>
            </h1>
            {address && <p className="text-gray-500 text-xs mt-0.5">{address}{phone ? ` | ${phone}` : ''}</p>}
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
              <span className="text-gray-400">Welcome,</span>
              <span className="text-accent font-medium">{user?.username || 'User'}</span>
              <span className="text-gray-600">•</span>
              <svg className="w-4 h-4 text-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {currentDate}
              <span className="text-gray-600">|</span>
              <svg className="w-4 h-4 text-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {currentTime}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-accent bg-white/[0.03] hover:bg-accent/[0.08] border border-white/[0.05] hover:border-accent/20 rounded-lg py-1.5 px-3 transition-all duration-300 group disabled:opacity-50"
            title="Refresh Dashboard Data"
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-500 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="w-2 h-2 rounded-full bg-emerald-400/80 animate-neon-pulse" />
            <span className="text-xs text-gray-500 tracking-wider">System Operational</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.index} style={{ animationDelay: `${kpi.index * 100}ms` }} className="animate-fade-in-up">
            <KPICard title={kpi.title} amount={kpi.amount} qty={kpi.qty} color={kpi.color} icon={kpi.icon} />
          </div>
        ))}
      </div>

      {/* Quick Modules Section */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2.5">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Quick Modules
          </h2>
          <span className="text-[11px] text-gray-500 tracking-wider bg-white/[0.03] border border-white/[0.05] rounded-md px-3 py-1">
            Quick Access
          </span>
        </div>
        <ModuleGrid />
      </div>
    </div>
  );
}
