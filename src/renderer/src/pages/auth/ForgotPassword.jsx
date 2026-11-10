import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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

const Spinner = ({ className }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const HelpCircleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const BoxIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
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
        autoComplete={isPassword ? 'new-password' : 'off'}
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
  const handleClick = (e) => {
    if (isLoading || disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    onClick?.(e);
  };

  return (
    <button type={type} onClick={handleClick} disabled={disabled || isLoading} className="btn-gradient w-full flex items-center justify-center gap-2 min-h-[48px]">
      {isLoading && <Spinner className="w-5 h-5" />}
      <span>{isLoading ? 'Please wait\u2026' : children}</span>
      <div className="ripple-container">
        {ripples.map(r => <span key={r.id} className="ripple-effect" style={{ left: r.x, top: r.y }} />)}
      </div>
    </button>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleNext = () => {
    setError('');
    if (!username.trim()) { setError('Please enter your username'); return; }
    setStep(1);
  };

  const handleVerify = () => {
    setError('');
    if (!answer.trim()) { setError('Please enter your answer'); return; }
    if (answer.trim().toLowerCase() !== 'quetta') { setError('Incorrect answer. Please try again.'); return; }
    setStep(2);
  };

  const handleReset = async () => {
    setError('');
    if (!newPassword) { setError('Please enter a new password'); return; }
    if (newPassword.length < 3) { setError('Password must be at least 3 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }

    setIsLoading(true);
    try {
      const result = await window.electronAPI.resetPasswordByCity({
        username: username.trim(),
        answer: answer.trim(),
        new_password: newPassword,
      });
      if (result.success) {
        setSuccess('Password reset successfully!');
        setStep(3);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepIndicator = (s) => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i === step ? 'w-8 bg-accent' : i < step ? 'w-4 bg-accent/50' : 'w-4 bg-white/10'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div
      className={`bg-navy-light/85 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl p-8 md:p-10 w-full transition-all duration-700 ease-out ${
        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.96]'
      }`}
      role="region"
      aria-label="Forgot password"
    >
      <div className="flex justify-center mb-5">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-indigo-light/10 border border-accent/10 animate-logo-pulse" aria-hidden="true">
          <HelpCircleIcon className="w-8 h-8 text-accent" />
        </div>
      </div>
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-gradient text-center tracking-wide">Forgot Password</h1>
      <p className="text-center text-gray-400 text-sm mt-1.5 font-body">Reset your account password</p>

      <div className="my-7">
        <div className="flex items-center gap-3">
          <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500/40 font-medium">
            {step === 0 ? 'Step 1 of 3' : step === 1 ? 'Step 2 of 3' : step === 2 ? 'Step 3 of 3' : 'Done'}
          </span>
          <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      {stepIndicator(step)}

      {error && (
        <div className="mb-5 animate-slide-down" role="alert">
          <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-5 animate-slide-down" role="alert">
          <div className="flex items-center gap-2.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-4 py-3 rounded-xl">
            <CheckIcon className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {step === 0 && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 text-center">Enter your username to get started</p>
          <FloatingInput id="username" label="Username" type="text" value={username} onChange={e => { setUsername(e.target.value); setError(''); }} icon={UserIcon} autoFocus />
          <RippleButton onClick={handleNext}>Continue</RippleButton>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-slide-down">
          <p className="text-xs text-gray-400 text-center">
            Username: <span className="text-accent font-medium">{username}</span>
          </p>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 text-center">
            <HelpCircleIcon className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Which city are you from?</p>
            <p className="text-[10px] text-gray-500 mt-1">Security Question</p>
          </div>
          <FloatingInput id="answer" label="Your answer" type="text" value={answer} onChange={e => { setAnswer(e.target.value); setError(''); }} icon={HelpCircleIcon} autoFocus />
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1 min-h-[48px] flex items-center justify-center gap-2 text-sm">
              <ArrowLeftIcon className="w-4 h-4" /> Back
            </button>
            <RippleButton onClick={handleVerify}>Verify</RippleButton>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-slide-down">
          <p className="text-xs text-gray-400 text-center">Enter your new password</p>
          <FloatingInput id="new-password" label="New Password" type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(''); }} icon={LockIcon} autoFocus />
          <FloatingInput id="confirm-password" label="Confirm New Password" type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }} icon={LockIcon} />
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 min-h-[48px] flex items-center justify-center gap-2 text-sm">
              <ArrowLeftIcon className="w-4 h-4" /> Back
            </button>
            <RippleButton onClick={handleReset} isLoading={isLoading}>Reset Password</RippleButton>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center space-y-5 animate-slide-down">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <p className="text-sm text-gray-300">Your password has been reset successfully!</p>
          <Link to="/login" className="btn-gradient inline-flex items-center justify-center gap-2 px-8 py-3 min-h-[48px] text-sm font-semibold rounded-xl no-underline">
            Back to Login
          </Link>
        </div>
      )}

      <div className="mt-6 text-center">
        <div className="flex items-center gap-3 mb-5">
          <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500/40 font-medium">Remember your password?</span>
          <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-light transition-colors duration-300 group">
          <ArrowLeftIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Back to Login
        </Link>
      </div>

      <div className="mt-8 text-center">
        <p className="text-[10px] text-gray-500/40 font-medium tracking-wide">v1.0.0 &nbsp;&middot;&nbsp; Built with Electron + React</p>
        <p className="text-[10px] text-gray-500/30 mt-1.5">&copy; {new Date().getFullYear()} Tech Solution Consultancy. All rights reserved.</p>
      </div>
    </div>
  );
}
