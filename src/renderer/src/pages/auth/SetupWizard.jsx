import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const BoxIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function SetupWizard() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    company_name: 'SM Younas Traders',
    address: '',
    phone: '',
    username: '',
    password: '',
    confirm_password: '',
  });

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleNext = () => {
    if (step === 0) {
      if (!form.company_name.trim()) { setError('Company name is required'); return; }
    }
    if (step === 1) {
      if (!form.username.trim()) { setError('Username is required'); return; }
      if (!form.password || form.password.length < 3) { setError('Password must be at least 3 characters'); return; }
      if (form.password !== form.confirm_password) { setError('Passwords do not match'); return; }
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      // Save company info
      await window.electronAPI.saveGeneralInfo({
        company_name: form.company_name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
      });

      // Register admin user
      const regResult = await window.electronAPI.register({
        username: form.username.trim(),
        password: form.password,
        role: 'admin',
        branch_name: 'Main',
      });

      if (regResult.success) {
        // Auto-login
        const loginResult = await login(form.username.trim(), form.password);
        if (loginResult.success) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } else {
        setError(regResult.error || 'Registration failed');
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const steps = [
    { num: 1, label: 'Company' },
    { num: 2, label: 'Admin' },
    { num: 3, label: 'Done' },
  ];

  return (
    <div className="relative min-h-screen bg-navy flex items-center justify-center overflow-hidden select-none p-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[550px] h-[550px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)', animation: 'float-slow 18s ease-in-out -2s infinite' }} />
        <div className="absolute -bottom-48 -right-48 w-[550px] h-[550px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%)', animation: 'float-slow 20s ease-in-out -6s infinite' }} />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.018]" style={{ backgroundImage: 'linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      <div className={`relative z-10 w-full max-w-lg transition-all duration-700 ease-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.96]'}`}>
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all duration-300 ${
                i === step ? 'bg-accent text-navy' : i < step ? 'bg-green-500/20 text-green-400' : 'bg-navy-lighter text-gray-500'
              }`}>
                {i < step ? <CheckIcon /> : <span>{s.num}</span>}
                <span>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-8 h-px mx-1 ${i < step ? 'bg-green-500/50' : 'bg-navy-border'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-navy-light/85 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Step 0: Company Info */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-indigo-light/10 border border-accent/10">
                    <BoxIcon className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <h1 className="font-heading text-2xl font-bold text-white">Welcome to DMS</h1>
                <p className="text-gray-400 text-sm mt-1">Let's set up your company first</p>
              </div>

              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">{error}</div>}

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Company Name *</label>
                <input type="text" value={form.company_name} onChange={handleChange('company_name')} className="w-full bg-navy-lighter/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent/50" autoFocus />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Address</label>
                <input type="text" value={form.address} onChange={handleChange('address')} className="w-full bg-navy-lighter/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Phone</label>
                <input type="text" value={form.phone} onChange={handleChange('phone')} className="w-full bg-navy-lighter/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent/50" />
              </div>

              <button onClick={handleNext} className="btn-gradient w-full">Continue</button>
            </div>
          )}

          {/* Step 1: Admin Account */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-indigo-light/10 border border-accent/10">
                    <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>
                <h1 className="font-heading text-2xl font-bold text-white">Create Admin Account</h1>
                <p className="text-gray-400 text-sm mt-1">This will be the primary administrator</p>
              </div>

              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">{error}</div>}

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Username *</label>
                <input type="text" value={form.username} onChange={handleChange('username')} className="w-full bg-navy-lighter/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent/50" autoFocus />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Password *</label>
                <input type="password" value={form.password} onChange={handleChange('password')} className="w-full bg-navy-lighter/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Confirm Password *</label>
                <input type="password" value={form.confirm_password} onChange={handleChange('confirm_password')} className="w-full bg-navy-lighter/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent/50" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleBack} className="btn-secondary flex-1">Back</button>
                <button onClick={handleNext} className="btn-gradient flex-1">Continue</button>
              </div>
            </div>
          )}

          {/* Step 2: Done */}
          {step === 2 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center mb-2">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20">
                  <svg className="w-10 h-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <h1 className="font-heading text-2xl font-bold text-white">Setup Complete!</h1>
              <p className="text-gray-400 text-sm">Your DMS is ready to use.</p>

              <div className="bg-navy-lighter rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Company</span>
                  <span className="text-white font-medium">{form.company_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Admin</span>
                  <span className="text-white font-medium">{form.username}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Role</span>
                  <span className="text-accent font-medium">Administrator</span>
                </div>
              </div>

              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">{error}</div>}

              <button onClick={handleFinish} disabled={loading} className="btn-gradient w-full flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>Setting up...</>
                ) : (
                  'Launch Dashboard'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
