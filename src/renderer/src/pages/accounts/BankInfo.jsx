import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';
import DataTable from '../../components/DataTable';

export default function BankInfo() {
  const db = useDB();
  const [banks, setBanks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', account_no: '', branch: '', opening_balance: 0 });
  const [showTxn, setShowTxn] = useState(false);
  const [txnBank, setTxnBank] = useState(null);
  const [txnForm, setTxnForm] = useState({ type: 'deposit', amount: 0, date: new Date().toISOString().split('T')[0], reference: '', notes: '' });
  const [txnHistory, setTxnHistory] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => { loadBanks(); }, []);

  const loadBanks = async () => { setBanks(await db.getBanks() || []); };

  const handleSave = async () => {
    if (editId) await db.saveBank({ ...form, id: editId });
    else await db.saveBank(form);
    setShowForm(false); setEditId(null); loadBanks(); setMessage('Bank saved!');
  };

  const handleEdit = (row) => {
    setEditId(row.id); setForm({ name: row.name, account_no: row.account_no || '', branch: row.branch || '', opening_balance: row.opening_balance });
    setShowForm(true);
  };

  const handleDelete = async (row) => {
    if (confirm('Delete this bank?')) { await db.deleteBank(row.id); loadBanks(); }
  };

  const handleAddTxn = async () => {
    if (!txnBank) return;
    await db.saveBankTransaction({ ...txnForm, amount: parseFloat(txnForm.amount), bank_id: txnBank.id });
    setTxnForm({ type: 'deposit', amount: 0, date: new Date().toISOString().split('T')[0], reference: '', notes: '' });
    loadTxnHistory(txnBank.id);
    loadBanks();
  };

  const openTxn = async (bank) => {
    setTxnBank(bank); setShowTxn(true);
    loadTxnHistory(bank.id);
  };

  const loadTxnHistory = async (bankId) => {
    setTxnHistory(await db.getBankTransactions(bankId) || []);
  };

  const columns = [
    { key: 'name', label: 'Bank Name' }, { key: 'account_no', label: 'Account No' },
    { key: 'branch', label: 'Branch' }, { key: 'opening_balance', label: 'Opening', render: v => v?.toLocaleString() },
    { key: 'id', label: 'Current Balance', render: (v, row) => {
      const txnBal = row.transaction_balance || 0;
      return ((row.opening_balance || 0) + txnBal).toLocaleString();
    }},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">Bank Info</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', account_no: '', branch: '', opening_balance: 0 }); }} className="btn-primary">+ Add Bank</button>
      </div>
      {message && <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-lg text-sm">{message}</div>}

      {showForm && (
        <div className="card">
          <h3 className="font-heading font-semibold text-white mb-4">{editId ? 'Edit' : 'Add'} Bank</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Bank Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Account No</label><input type="text" value={form.account_no} onChange={e => setForm({...form, account_no: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Branch</label><input type="text" value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Opening Balance</label><input type="number" value={form.opening_balance} onChange={e => setForm({...form, opening_balance: parseFloat(e.target.value) || 0})} className="w-full" /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto rounded-lg border border-navy-border mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">Bank Name</th>
                <th className="px-4 py-3 text-left">Account No</th>
                <th className="px-4 py-3 text-left">Branch</th>
                <th className="px-4 py-3 text-right">Opening</th>
                <th className="px-4 py-3 text-right">Current Balance</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banks.map((row, i) => {
                const txnBal = row.transaction_balance || 0;
                const currentBal = (row.opening_balance || 0) + txnBal;
                return (
                  <tr key={row.id || i} className="table-row">
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{row.account_no || '-'}</td>
                    <td className="px-4 py-3">{row.branch || '-'}</td>
                    <td className="px-4 py-3 text-right">{row.opening_balance?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">{currentBal.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => openTxn(row)} className="text-accent hover:text-accent-hover text-xs font-medium mr-2">Transactions</button>
                      <button onClick={() => handleEdit(row)} className="text-accent hover:text-accent-hover text-xs font-medium mr-2">Edit</button>
                      <button onClick={() => handleDelete(row)} className="text-red-400 hover:text-red-300 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                );
              })}
              {banks.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No banks found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showTxn && txnBank && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-white">{txnBank.name} - Transactions</h3>
            <button onClick={() => setShowTxn(false)} className="text-gray-400 hover:text-white">&times;</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
            <div><label className="block text-xs text-gray-400 mb-1">Type</label>
              <select value={txnForm.type} onChange={e => setTxnForm({...txnForm, type: e.target.value})} className="w-full">
                <option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option>
              </select>
            </div>
            <div><label className="block text-xs text-gray-400 mb-1">Amount</label><input type="number" value={txnForm.amount} onChange={e => setTxnForm({...txnForm, amount: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Date</label><input type="date" value={txnForm.date} onChange={e => setTxnForm({...txnForm, date: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Reference</label><input type="text" value={txnForm.reference} onChange={e => setTxnForm({...txnForm, reference: e.target.value})} className="w-full" /></div>
            <div className="flex items-end"><button onClick={handleAddTxn} className="btn-primary w-full">Add</button></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="table-header">
                <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2 text-left">Reference</th><th className="px-3 py-2 text-left">Notes</th>
              </tr></thead>
              <tbody>
                {txnHistory.map((t, i) => (
                  <tr key={i} className="table-row">
                    <td className="px-3 py-2">{t.date}</td>
                    <td className="px-3 py-2"><span className={t.type === 'deposit' ? 'text-green-400' : 'text-red-400'}>{t.type}</span></td>
                    <td className="px-3 py-2 text-right">{t.amount.toLocaleString()}</td>
                    <td className="px-3 py-2">{t.reference}</td>
                    <td className="px-3 py-2">{t.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
