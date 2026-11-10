import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';

export default function AccountSetting() {
  const db = useDB();
  const { user, login } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [form, setForm] = useState({ company_name: 'SM Younas Traders', address: '', phone: '', email: '', ntn: '', strn: '', logo_path: '', financial_year_start: '', currency_id: '', idle_timeout: 0 });
  const [currencies, setCurrencies] = useState([]);
  const [message, setMessage] = useState('');

  // Change Password
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwMessage, setPwMessage] = useState('');

  // Change Username
  const [usernameForm, setUsernameForm] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const { theme, themes, setTheme } = useTheme();

  // User Management
  const [users, setUsers] = useState([]);
  const [userModal, setUserModal] = useState(null);
  const [userEditRole, setUserEditRole] = useState('');
  const [userEditBranch, setUserEditBranch] = useState('');
  const [resetPwId, setResetPwId] = useState(null);
  const [resetPwValue, setResetPwValue] = useState('');
  const [userMsg, setUserMsg] = useState('');

  // Update Settings
  const [updateUrl, setUpdateUrl] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [downloadResult, setDownloadResult] = useState(null);
  const [pendingDownloadUrl, setPendingDownloadUrl] = useState('');

  useEffect(() => {
    loadData();
    db.getCurrencies().then(setCurrencies);
    if (user) setUsernameForm(user.username);
    if (isAdmin) loadUsers();
    db.getUpdateUrl().then(url => setUpdateUrl(url || ''));
  }, []);

  const loadData = async () => {
    const info = await db.getGeneralInfo();
    if (info && info.id) setForm(info);
  };

  const handleSave = async () => {
    await db.saveGeneralInfo({ ...form, currency_id: form.currency_id ? parseInt(form.currency_id) : null });
    setMessage('Settings saved!');
  };

  const handleLogo = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setForm({...form, logo_path: ev.target.result});
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleChangePassword = async () => {
    setPwMessage('');
    if (!pwForm.new_password || pwForm.new_password.length < 3) { setPwMessage('Password must be at least 3 characters'); return; }
    if (pwForm.new_password !== pwForm.confirm_password) { setPwMessage('Passwords do not match'); return; }
    const result = await db.changePassword({ user_id: user?.id, current_password: pwForm.current_password, new_password: pwForm.new_password });
    if (result.success) {
      setPwMessage('Password changed successfully!');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } else {
      setPwMessage(result.error || 'Failed to change password');
    }
  };

  const handleChangeUsername = async () => {
    setUsernameMessage('');
    if (!usernameForm.trim()) { setUsernameMessage('Username cannot be empty'); return; }
    const result = await db.updateUsername({ user_id: user?.id, new_username: usernameForm.trim() });
    if (result.success) {
      setUsernameMessage('Username updated! Please login again.');
      login(usernameForm.trim(), ''); // Update local state
    } else {
      setUsernameMessage(result.error || 'Failed to update username');
    }
  };

  const loadUsers = async () => {
    const list = await db.getUsers();
    setUsers(list || []);
  };

  const handleEditUser = (u) => {
    setUserModal(u);
    setUserEditRole(u.role);
    setUserEditBranch(u.branch_name || '');
    setUserMsg('');
  };

  const handleSaveUser = async () => {
    setUserMsg('');
    const result = await db.adminUpdateUser({ user_id: userModal.id, role: userEditRole, branch_name: userEditBranch });
    if (result.success) {
      setUserMsg('User updated!');
      setUserModal(null);
      loadUsers();
    } else {
      setUserMsg(result.error || 'Failed');
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Delete user "${u.username}"?`)) return;
    const result = await db.deleteUser(u.id);
    if (result.success) {
      loadUsers();
    } else {
      alert(result.error || 'Failed to delete user');
    }
  };

  const handleResetPw = async (u) => {
    setResetPwId(u.id);
    setResetPwValue('');
    setUserMsg('');
  };

  const handleConfirmResetPw = async () => {
    if (!resetPwValue || resetPwValue.length < 3) { alert('Password must be at least 3 characters'); return; }
    const result = await db.adminResetPassword({ user_id: resetPwId, new_password: resetPwValue });
    if (result.success) {
      setResetPwId(null);
      setResetPwValue('');
      setUserMsg('Password reset successfully!');
    } else {
      alert(result.error || 'Failed');
    }
  };

  const handleSaveUpdateUrl = async () => {
    await db.saveUpdateUrl(updateUrl);
    setUpdateMsg('Update URL saved!');
  };

  const handleCheckUpdate = async () => {
    if (!updateUrl.trim()) { setUpdateStatus('Please enter an update URL first'); return; }
    setCheckingUpdate(true);
    setUpdateStatus('Checking...');
    setUpdateAvailable(false);
    const result = await db.checkUpdate(updateUrl);
    setCheckingUpdate(false);
    if (result.success && result.hasUpdate) {
      setUpdateStatus(`Update available: v${result.latestVersion} (current: v${result.currentVersion})`);
      setPendingDownloadUrl(result.downloadUrl || '');
      setUpdateAvailable(true);
    } else if (result.success && !result.hasUpdate) {
      setUpdateStatus(`No update available (v${result.currentVersion} is latest)`);
      setUpdateAvailable(false);
    } else {
      setUpdateStatus(`Error: ${result.error || 'Failed to check'}`);
      setUpdateAvailable(false);
    }
  };

  const handleDownloadUpdate = async () => {
    if (!updateAvailable || !pendingDownloadUrl) return;
    setDownloadingUpdate(true);
    setUpdateStatus('Downloading...');
    const result = await db.downloadUpdate(pendingDownloadUrl);
    setDownloadingUpdate(false);
    if (result.success) {
      setUpdateStatus('Downloaded! Installing...');
      setDownloadResult(result.filePath);
      await db.installUpdate(result.filePath);
    } else {
      setUpdateStatus(`Download failed: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Account Settings</h2>
      {message && <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-lg text-sm">{message}</div>}

      {/* Company Info */}
      <div className="card">
        <h3 className="font-heading font-semibold text-white text-lg mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className="block text-xs text-gray-400 mb-1">Company Name</label><input type="text" value={form.company_name || ''} onChange={e => setForm({...form, company_name: e.target.value})} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Address</label><input type="text" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Phone</label><input type="text" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Email</label><input type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">NTN</label><input type="text" value={form.ntn || ''} onChange={e => setForm({...form, ntn: e.target.value})} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">STRN</label><input type="text" value={form.strn || ''} onChange={e => setForm({...form, strn: e.target.value})} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Financial Year Start</label><input type="date" value={form.financial_year_start || ''} onChange={e => setForm({...form, financial_year_start: e.target.value})} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Default Currency</label>
            <select value={form.currency_id || ''} onChange={e => setForm({...form, currency_id: e.target.value})} className="w-full">
              <option value="">Select Currency</option>
              {currencies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Auto Logout (minutes)</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" max="999" value={form.idle_timeout ?? 0} onChange={e => setForm({...form, idle_timeout: parseInt(e.target.value) || 0})} className="w-full" />
              <span className="text-[10px] text-gray-500 shrink-0">0 = disabled</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Logo</label>
            <div className="flex items-center gap-2">
              <button onClick={handleLogo} className="btn-secondary text-sm">Upload Logo</button>
              {form.logo_path && (
                <>
                  <img src={form.logo_path} className="h-10 w-10 object-contain rounded" alt="Logo" />
                  <button onClick={() => setForm({...form, logo_path: ''})} className="text-red-400 hover:text-red-300 text-xs transition-colors" title="Remove Logo">
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <button onClick={handleSave} className="btn-primary mt-6">Save Settings</button>
      </div>

      {/* Change Username & Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change Username */}
        <div className="card">
          <h3 className="font-heading font-semibold text-white text-lg mb-4 flex items-center gap-2">👤 Change Username</h3>
          {usernameMessage && (
            <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${
              usernameMessage.includes('success') || usernameMessage.includes('updated')
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            }`}>{usernameMessage}</div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Current Username</label>
              <input type="text" value={user?.username || ''} disabled className="w-full opacity-60" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">New Username</label>
              <input type="text" value={usernameForm} onChange={e => setUsernameForm(e.target.value)} className="w-full" />
            </div>
            <button onClick={handleChangeUsername} className="btn-primary w-full">Update Username</button>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <h3 className="font-heading font-semibold text-white text-lg mb-4 flex items-center gap-2">🔒 Change Password</h3>
          {pwMessage && (
            <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${
              pwMessage.includes('success') || pwMessage.includes('changed')
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            }`}>{pwMessage}</div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Current Password</label>
              <input type="password" value={pwForm.current_password} onChange={e => setPwForm({...pwForm, current_password: e.target.value})} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">New Password</label>
              <input type="password" value={pwForm.new_password} onChange={e => setPwForm({...pwForm, new_password: e.target.value})} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Confirm New Password</label>
              <input type="password" value={pwForm.confirm_password} onChange={e => setPwForm({...pwForm, confirm_password: e.target.value})} className="w-full" />
            </div>
            <button onClick={handleChangePassword} className="btn-primary w-full">Change Password</button>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-semibold text-white text-lg">Theme</h3>
            <p className="text-xs text-gray-500 mt-0.5">Choose your theme</p>
          </div>
          <span className="text-[10px] text-gray-600 bg-white/[0.03] border border-white/[0.05] rounded-md px-2.5 py-1">
            {themes.find(t => t.id === theme)?.name || 'Navy'}
          </span>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={t.name}
              className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 ${
                theme === t.id ? 'bg-white/[0.06] ring-1 ring-white/[0.15]' : 'hover:bg-white/[0.03]'
              }`}
            >
              <span
                className={`w-full aspect-square rounded-lg transition-all duration-300 ${
                  theme === t.id ? 'scale-110 ring-2 ring-white shadow-lg' : 'group-hover:scale-105'
                }`}
                style={{ background: `linear-gradient(135deg, ${t.bg}, ${t.primary})` }}
              >
                {theme === t.id && (
                  <svg className="w-full h-full p-1.5 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={`text-[10px] font-medium text-center leading-tight transition-colors duration-200 ${
                theme === t.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
              }`}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Update Settings - Admin Only */}
      {isAdmin && (
        <div className="card">
          <h3 className="font-heading font-semibold text-white text-lg mb-4">Software Update</h3>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={updateUrl}
              onChange={e => setUpdateUrl(e.target.value)}
              placeholder="https://example.com/updates/"
              className="flex-1"
            />
            <button onClick={handleSaveUpdateUrl} className="btn-secondary text-sm">Save URL</button>
          </div>
          {updateMsg && <p className="text-xs text-green-400 mb-2">{updateMsg}</p>}
          <div className="flex items-center gap-2">
            <button onClick={handleCheckUpdate} className="btn-primary text-sm" disabled={checkingUpdate}>
              {checkingUpdate ? 'Checking...' : 'Check for Updates'}
            </button>
            {updateStatus && (
              <span className={`text-xs ${updateStatus.startsWith('Update available') ? 'text-yellow-400' : updateStatus.startsWith('No update') ? 'text-green-400' : updateStatus.startsWith('Error') || updateStatus.startsWith('Download failed') ? 'text-red-400' : 'text-blue-400'}`}>
                {updateStatus}
              </span>
            )}
            {updateAvailable && (
              <button onClick={handleDownloadUpdate} className="btn-primary text-sm" disabled={downloadingUpdate}>
                {downloadingUpdate ? 'Downloading...' : 'Download & Install'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* User Management - Admin Only */}
      {isAdmin && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-white text-lg">User Management</h3>
              <p className="text-xs text-gray-500 mt-0.5">Manage users, roles, and passwords</p>
            </div>
          </div>
          {userMsg && <div className="mb-4 bg-green-500/10 text-green-400 px-4 py-2 rounded-lg text-sm">{userMsg}</div>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-3 py-2 text-left">Username</th>
                  <th className="px-3 py-2 text-left">Role</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Branch</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Created</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={`table-row ${u.id === user?.id ? 'bg-accent/[0.03]' : ''}`}>
                    <td className="px-3 py-2">
                      <span className="text-white">{u.username}</span>
                      {u.id === user?.id && <span className="text-[10px] text-accent ml-2">(you)</span>}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-gray-500/10 text-gray-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-400 hidden md:table-cell">{u.branch_name || '-'}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs hidden md:table-cell">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                    <td className="px-3 py-2 text-right">
                      {u.id !== user?.id && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditUser(u)} className="text-accent hover:text-accent-light text-xs transition-colors">Edit</button>
                          <button onClick={() => handleResetPw(u)} className="text-amber-400 hover:text-amber-300 text-xs transition-colors">Reset Pw</button>
                          <button onClick={() => handleDeleteUser(u)} className="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button>
                        </div>
                      )}
                      {u.id === user?.id && <span className="text-[10px] text-gray-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {userModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setUserModal(null)}>
          <div className="bg-navy-light border border-white/[0.06] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold text-white mb-1">Edit User</h3>
            <p className="text-xs text-gray-500 mb-5">{userModal.username}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Role</label>
                <select value={userEditRole} onChange={e => setUserEditRole(e.target.value)} className="w-full">
                  <option value="user">User (Read-Only)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Branch</label>
                <input type="text" value={userEditBranch} onChange={e => setUserEditBranch(e.target.value)} className="w-full" placeholder="None" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setUserModal(null)} className="btn-secondary flex-1 min-h-[42px] text-sm">Cancel</button>
              <button onClick={handleSaveUser} className="btn-primary flex-1 min-h-[42px] text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPwId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setResetPwId(null); setResetPwValue(''); }}>
          <div className="bg-navy-light border border-white/[0.06] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold text-white mb-1">Reset Password</h3>
            <p className="text-xs text-gray-500 mb-5">Enter new password for this user</p>
            <input type="password" value={resetPwValue} onChange={e => setResetPwValue(e.target.value)} className="w-full" placeholder="New password" autoFocus />
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setResetPwId(null); setResetPwValue(''); }} className="btn-secondary flex-1 min-h-[42px] text-sm">Cancel</button>
              <button onClick={handleConfirmResetPw} className="btn-primary flex-1 min-h-[42px] text-sm">Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Current user info */}
      <div className="card text-center py-4">
        <p className="text-xs text-gray-500">
          Logged in as <span className="text-accent font-medium">{user?.username}</span>
          {' | '}Role: <span className="text-gray-300 font-medium">{user?.role}</span>
          {user?.branch_name && <>{' | '}Branch: <span className="text-gray-300 font-medium">{user?.branch_name}</span></>}
        </p>
      </div>
    </div>
  );
}
