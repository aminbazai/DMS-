import { useState, useEffect, useRef, useCallback } from 'react';

const ROUTES = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/daily-closing', label: 'Daily Closing' },
  { path: '/purchase-invoice', label: 'Purchase Invoice' },
  { path: '/purchase-return', label: 'Purchase Return' },
  { path: '/sales-invoice', label: 'Sales Invoice' },
  { path: '/sales-return', label: 'Sales Return' },
  { path: '/party', label: 'Party Info' },
  { path: '/product', label: 'Products' },
  { path: '/supplier-ledger', label: 'Supplier Ledger' },
  { path: '/customer-ledger', label: 'Customer Ledger' },
  { path: '/bank-ledger', label: 'Bank Ledger' },
  { path: '/cash-ledger', label: 'Cash Ledger' },
  { path: '/expense-ledger', label: 'Expense Ledger' },
  { path: '/journal-entry', label: 'Journal Entry' },
  { path: '/expense-info', label: 'Expense Info' },
  { path: '/bank-info', label: 'Bank Info' },
  { path: '/profit-loss', label: 'Profit & Loss' },
  { path: '/trial-balance', label: 'Trial Balance' },
  { path: '/payable-receivable', label: 'Payable / Receivable' },
  { path: '/sale-report', label: 'Sale Report' },
  { path: '/daily-activity', label: 'Daily Activity' },
  { path: '/stock-report', label: 'Stock Report' },
  { path: '/warehouse', label: 'Warehouse' },
  { path: '/stock-adjustment', label: 'Stock Adjustment' },
  { path: '/stock-transfer', label: 'Stock Transfer' },
  { path: '/counter-info', label: 'Counter Info' },
  { path: '/short-keys', label: 'Short Keys' },
  { path: '/about-us', label: 'About Us' },
  { path: '/employee', label: 'Employees' },
  { path: '/attendance', label: 'Attendance' },
  { path: '/salesmen', label: 'Salesmen' },
  { path: '/currency', label: 'Currency' },
  { path: '/account-setting', label: 'Account Settings' },
  { path: '/purchase-sales-settings', label: 'Purchase / Sales Settings' },
  { path: '/data-backup', label: 'Data Backup' },
  { path: '/data-restore', label: 'Data Restore' },
  { path: '/calculator', label: 'Calculator' },
  { path: '/word-paid', label: 'Word / Paid' },
];

function KeyCaptureInput({ value, onChange }) {
  const [display, setDisplay] = useState(value || '');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setDisplay(value || '');
  }, [value]);

  const handleKeyDown = useCallback((e) => {
    e.preventDefault();
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    const key = e.key;
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      parts.push(key.length === 1 ? key.toUpperCase() : key);
    }
    if (parts.length > 0) {
      const combo = parts.join(' + ');
      setDisplay(combo);
      onChange(parts.join('+'));
    }
  }, [onChange]);

  return (
    <div className="relative">
      <input
        type="text"
        readOnly
        value={display}
        placeholder="Click here and press keys..."
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        className={`w-full bg-navy-lighter/80 border rounded-xl py-3 px-4 text-sm text-white outline-none transition-all duration-300 ${
          focused ? 'border-accent ring-1 ring-accent/50' : 'border-white/10'
        }`}
      />
      {!display && !focused && (
        <p className="text-[10px] text-gray-500 mt-1.5">Press your desired key combination</p>
      )}
    </div>
  );
}

export default function ShortKeys() {
  const [shortcuts, setShortcuts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ keys: '', path: '/dashboard', action: '' });
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  const load = async () => {
    const list = await window.electronAPI.getShortcuts();
    setShortcuts(list || []);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (showModal && modalRef.current) {
      const input = modalRef.current.querySelector('input, select');
      if (input) setTimeout(() => input.focus(), 100);
    }
  }, [showModal]);

  const openAdd = () => {
    setEditing(null);
    setForm({ keys: '', path: '/dashboard', action: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ keys: s.keys, path: s.path, action: s.action });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    if (!form.keys) { setError('Please press a key combination'); return; }
    if (!form.action.trim()) { setError('Please enter an action description'); return; }

    const result = await window.electronAPI.saveShortcut({
      id: editing?.id,
      keys: form.keys,
      path: form.path,
      action: form.action.trim(),
    });

    if (result.success) {
      setShowModal(false);
      await load();
    } else {
      setError(result.error || 'Failed to save shortcut');
    }
  };

  const handleDelete = async (id, keys) => {
    if (!window.confirm(`Delete shortcut "${keys}"?`)) return;
    await window.electronAPI.deleteShortcut(id);
    await load();
  };

  const renderKey = (keys) => {
    const parts = keys.split('+').map(p => p.trim());
    return parts.map((p, i) => (
      <span key={i}>
        {i > 0 && <span className="text-gray-500 mx-1">+</span>}
        <kbd className="bg-navy-lighter text-accent px-2.5 py-1 rounded text-sm font-mono border border-navy-border">
          {p === 'ctrl' ? 'Ctrl' : p === 'F1' ? 'F1' : p}
        </kbd>
      </span>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Short Keys</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage your custom keyboard shortcuts</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Shortcut
        </button>
      </div>

      <div className="card">
        {shortcuts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No shortcuts defined. Click "Add Shortcut" to create one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left w-56">Shortcut</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Route</th>
                  <th className="px-4 py-3 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className="px-4 py-3">{renderKey(s.keys)}</td>
                    <td className="px-4 py-3 text-gray-300">{s.action}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono hidden md:table-cell">{s.path}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(s)} className="text-accent hover:text-accent-light text-xs mr-3 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(s.id, s.keys)} className="text-red-400 hover:text-red-300 text-xs transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div ref={modalRef} className="bg-navy-light border border-white/[0.06] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 md:p-8" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-xl font-bold text-white mb-1">
              {editing ? 'Edit Shortcut' : 'Add Shortcut'}
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              {editing ? 'Modify the shortcut key combination' : 'Create a new keyboard shortcut'}
            </p>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Key Combination</label>
                <KeyCaptureInput value={form.keys} onChange={(v) => { setForm(f => ({ ...f, keys: v })); setError(''); }} />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Route</label>
                <select value={form.path} onChange={e => setForm(f => ({ ...f, path: e.target.value }))} className="w-full">
                  {ROUTES.map(r => <option key={r.path} value={r.path}>{r.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Action Description</label>
                <input
                  type="text"
                  value={form.action}
                  onChange={e => { setForm(f => ({ ...f, action: e.target.value })); setError(''); }}
                  placeholder="e.g. Go to Dashboard"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 min-h-[44px] text-sm">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary flex-1 min-h-[44px] text-sm">
                {editing ? 'Save Changes' : 'Add Shortcut'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
