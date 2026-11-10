import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { DropdownTheme } from './ThemeSwitcher';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';
  const [dateTime, setDateTime] = useState(new Date());
  const [pcName, setPcName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [notifPos, setNotifPos] = useState({ top: 0, right: 0 });
  const notifBtnRef = useRef(null);
  const notifDdRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    window.electronAPI.getComputerName().then(setPcName);
    loadNotifications();
    return () => clearInterval(timer);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await window.electronAPI.getNotifications();
      setNotifications(data || []);
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!showNotif) return;
    const rect = notifBtnRef.current.getBoundingClientRect();
    setNotifPos({ top: rect.bottom + 12, right: window.innerWidth - rect.right });
    const handle = (e) => {
      if (
        notifBtnRef.current && !notifBtnRef.current.contains(e.target) &&
        notifDdRef.current && !notifDdRef.current.contains(e.target)
      ) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showNotif]);

  const handleLogout = () => {
    logout();
    window.location.hash = '#/login';
  };

  const handleExit = () => {
    window.close();
  };

  return (
    <header className="glass-header px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-gray-400 hover:text-accent hover:bg-white/[0.05] rounded-lg p-2 transition-all duration-200 group"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

          {!isDashboard && (
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-accent hover:bg-white/[0.05] rounded-lg p-2 transition-all duration-200"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}

          <div className="h-6 w-px bg-white/[0.06]" />

        <div className="font-heading">
          <div className="text-base font-semibold text-white/90 tracking-wide">
            {dateTime.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
          </div>
          <div className="text-xs text-gray-500 tracking-wider flex items-center gap-2">
            <svg className="w-3 h-3 text-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {dateTime.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] text-gray-600 hidden md:inline-flex items-center gap-1.5">
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {pcName}
        </span>

        {user?.branch_name && (
          <span className="text-[11px] text-accent/80 font-medium bg-accent/[0.06] border border-accent/[0.1] rounded-md px-2.5 py-1 hidden sm:inline-flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {user.branch_name}
          </span>
        )}

        <div className="h-6 w-px bg-white/[0.06]" />

        <div>
          <button
            ref={notifBtnRef}
            onClick={() => setShowNotif(!showNotif)}
            className="relative text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg p-2 transition-all duration-200 group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-lg shadow-rose-500/25">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotif && createPortal(
            <div
              ref={notifDdRef}
              className="fixed w-80 rounded-xl shadow-2xl overflow-hidden animate-scale-fade-in"
              style={{
                top: notifPos.top,
                right: notifPos.right,
                zIndex: 2147483647,
                background: 'rgba(14, 22, 46, 0.95)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="p-4 border-b border-white/[0.05] flex items-center justify-between">
                <h3 className="font-heading font-semibold text-white text-sm">Notifications</h3>
                <span className="text-[10px] text-gray-500">{notifications.length} total</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-8 h-8 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 text-xs">No notifications</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-4 border-b border-white/[0.03] transition-colors duration-200 ${n.is_read ? '' : 'bg-accent/[0.03]'}`}>
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 text-base ${n.type === 'warning' ? 'text-yellow-400' : n.type === 'alert' ? 'text-rose-400' : 'text-accent'}`}>
                          {n.type === 'warning' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : n.type === 'alert' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white/90 truncate">{n.title}</p>
                          {n.message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>,
            document.body
          )}
        </div>

        <DropdownTheme />

        <div className="h-6 w-px bg-white/[0.06]" />

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2.5 pr-2 border-r border-white/[0.05]">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent/20 to-indigo/20 flex items-center justify-center border border-white/[0.06]">
              <svg className="w-3.5 h-3.5 text-accent/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-sm text-gray-300 font-medium">{user?.username || 'User'}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${user?.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-amber-500/10 text-amber-400'}`}>
              {user?.role === 'admin' ? 'Admin' : 'Read-Only'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-400 bg-white/[0.03] hover:bg-amber-500/[0.08] border border-white/[0.05] hover:border-amber-500/20 rounded-lg py-1.5 px-3 transition-all duration-300 group"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>

          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-rose-400 bg-white/[0.03] hover:bg-rose-500/[0.08] border border-white/[0.05] hover:border-rose-500/20 rounded-lg py-1.5 px-3 transition-all duration-300 group"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit
          </button>
        </div>
      </div>
    </header>
  );
}
