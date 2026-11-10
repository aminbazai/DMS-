import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useCompanyInfo from '../../hooks/useCompanyInfo';

const UserIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const BoxIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const Spinner = ({ className }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

function FloatingInput({ id, label, type: initialType, value, onChange, icon: Icon, error, autoFocus }) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = initialType === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : initialType;
  const hasValue = value && value.length > 0;
  const isFloating = focused || hasValue;

  return (
    <div className="relative">
      <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm z-10 pointer-events-none transition-all duration-200 ${isFloating ? 'text-accent' : 'text-gray-500'}`} aria-hidden="true">
        {Icon && <Icon className="w-[18px] h-[18px]" />}
      </span>
      <input
        id={id}
        type={inputType}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoComplete={isPassword ? 'current-password' : 'username'}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full bg-navy-lighter/80 border rounded-xl pt-6 pb-2 text-sm text-white placeholder-transparent transition-all duration-300 outline-none ${
          error
            ? 'border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
            : 'border-white/10 focus:border-accent focus:ring-1 focus:ring-accent/50 hover:border-white/20'
        } ${isPassword ? 'pl-11 pr-12' : 'pl-11 pr-4'}`}
      />
      <label
        htmlFor={id}
        className={`absolute left-11 pointer-events-none transition-all duration-200 ${
          isFloating
            ? 'top-2 text-xs text-accent'
            : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
        } ${error ? 'text-red-400' : ''}`}
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(p => !p)}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-200 p-1 rounded-lg hover:bg-white/5"
        >
          {showPassword ? <EyeOffIcon className="w-[18px] h-[18px]" /> : <EyeIcon className="w-[18px] h-[18px]" />}
        </button>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400 animate-slide-down">
          <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function RippleButton({ children, onClick, isLoading, disabled, type = 'submit' }) {
  const [ripples, setRipples] = useState([]);
  const handleClick = useCallback((e) => {
    if (isLoading || disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    onClick?.(e);
  }, [isLoading, disabled, onClick]);

  return (
    <button type={type} onClick={handleClick} disabled={disabled || isLoading} className="btn-gradient w-full flex items-center justify-center gap-2 min-h-[48px]">
      {isLoading && <Spinner className="w-5 h-5" />}
      <span>{isLoading ? 'Signing in\u2026' : children}</span>
      <div className="ripple-container">
        {ripples.map(r => <span key={r.id} className="ripple-effect" style={{ left: r.x, top: r.y }} />)}
      </div>
    </button>
  );
}

function validate(values) {
  const errors = {};
  if (!values.username.trim()) errors.username = 'Username is required';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 3) errors.password = 'Password must be at least 3 characters';
  return errors;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { companyName, logo } = useCompanyInfo();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (serverError && cardRef.current) {
      const el = cardRef.current;
      el.classList.remove('animate-shake');
      void el.offsetWidth;
      el.classList.add('animate-shake');
    }
  }, [serverError]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setIsLoading(true);
    try {
      const result = await login(form.username.trim(), form.password);
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setServerError(result.error || 'Invalid username or password. Please try again.');
      }
    } catch {
      setServerError('Connection error. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`bg-navy-light/85 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl p-8 md:p-10 w-full transition-all duration-700 ease-out ${
        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.96]'
      }`}
      role="region"
      aria-label="Login form"
    >

      <div className="flex justify-center mb-5">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/10 to-indigo-light/10 border border-accent/10 animate-logo-pulse overflow-hidden" aria-hidden="true">
          {logo ? (
            <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
          ) : (
            <BoxIcon className="w-10 h-10 text-accent" />
          )}
        </div>
      </div>
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-gradient text-center tracking-wide">{companyName}</h1>
      <p className="text-center text-gray-400 text-sm mt-1.5 font-body">Distribution Management System</p>
      <p className="text-center mt-4 text-[10px] uppercase tracking-[0.15em] text-gray-500/60 font-medium">Powered by Tech Solution Consultancy</p>

      <div className="my-7">
        <div className="flex items-center gap-3">
          <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500/40 font-medium">Sign In</span>
          <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div className="mb-5 animate-slide-down" role="alert">
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>{serverError}</span>
            </div>
          </div>
        )}

        <FloatingInput id="username" label="Username" type="text" value={form.username} onChange={handleChange('username')} icon={UserIcon} error={errors.username} autoFocus />
        <div className="mt-4">
          <FloatingInput id="password" label="Password" type="password" value={form.password} onChange={handleChange('password')} icon={LockIcon} error={errors.password} />
        </div>

        <div className="flex justify-end mt-2.5">
          <button type="button" onClick={() => navigate('/forgot-password')} className="relative text-xs font-medium text-gray-500 hover:text-accent transition-colors duration-300 after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-0 after:bg-gradient-to-r after:from-accent after:to-indigo-light after:transition-all after:duration-300 hover:after:w-full">
            Forgot Password?
          </button>
        </div>

        <div className="mt-6">
          <RippleButton isLoading={isLoading}>Sign In</RippleButton>
        </div>
      </form>

      <div className="mt-6 text-center">
        <div className="flex items-center gap-3 mb-5">
          <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500/40 font-medium">New Here?</span>
          <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <Link to="/register" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-light transition-colors duration-300 group">
          Create Account
          <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <p className="text-[10px] text-gray-500/40 font-medium tracking-wide">v1.0.0 &nbsp;&middot;&nbsp; Built with Electron + React</p>
        <p className="text-[10px] text-gray-500/30 mt-1.5">&copy; {new Date().getFullYear()} Tech Solution Consultancy. All rights reserved.</p>
      </div>
    </div>
  );
}
