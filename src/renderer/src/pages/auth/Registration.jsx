import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Registration() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [branch, setBranch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (isAuthenticated && !isAdmin) { setError('Only admin users can create new accounts'); return; }
    const result = await window.electronAPI.register({ username, password, role, branch_name: branch });
    if (result.success) {
      setSuccess('User registered successfully!');
      setUsername(''); setPassword(''); setRole('user'); setBranch('');
      if (!isAuthenticated) {
        setTimeout(() => navigate('/login'), 1500);
      }
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="glass-card p-8 md:p-10 relative">
      {isAuthenticated && (
        <button
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 left-4 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg p-2 transition-all duration-200"
          title="Back to Dashboard"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      )}
      <h2 className="font-heading text-2xl font-bold text-gradient text-center mb-6 tracking-wide">
        {isAuthenticated ? 'Add User' : 'Register'}
      </h2>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full" required />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full" required />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Branch Name</label>
          <input type="text" value={branch} onChange={e => setBranch(e.target.value)} className="w-full" />
        </div>
        <button type="submit" className="btn-primary w-full">{isAuthenticated ? 'Add User' : 'Register'}</button>
        {!isAuthenticated && (
          <p className="text-center text-sm text-gray-400 mt-4">
            Already registered? <a href="#/login" className="text-accent hover:underline">Login</a>
          </p>
        )}
      </form>
    </div>
  );
}
