import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function TrialBalance() {
  const db = useDB();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const d = new Date(); const f = new Date(d.getFullYear(), d.getMonth(), 1);
    setFrom(f.toISOString().split('T')[0]); setTo(d.toISOString().split('T')[0]);
  }, []);

  useEffect(() => { if (from && to) loadData(); }, [from, to]);

  const loadData = async () => {
    const result = await db.getTrialBalance(from, to);
    setAccounts(result || []);
  };

  const totalDebit = accounts.reduce((s, a) => s + a.opening, 0);
  const totalCredit = accounts.reduce((s, a) => s + a.openingCredit, 0);

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Trial Balance</h2>
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><label className="block text-xs text-gray-400 mb-1">From</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">To</label><input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full" /></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="px-4 py-3 text-left">Account</th><th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-right">Debit</th><th className="px-4 py-3 text-right">Credit</th>
            </tr></thead>
            <tbody>
              {accounts.map((a, i) => (
                <tr key={i} className="table-row">
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-navy-lighter">{a.type}</span></td>
                  <td className="px-4 py-3 text-right text-green-400">{a.opening > 0 ? a.opening.toLocaleString() : '-'}</td>
                  <td className="px-4 py-3 text-right text-red-400">{a.openingCredit > 0 ? a.openingCredit.toLocaleString() : '-'}</td>
                </tr>
              ))}
              <tr className="bg-accent/5 font-bold">
                <td className="px-4 py-3 text-accent" colSpan={2}>Total</td>
                <td className="px-4 py-3 text-right text-accent">{totalDebit.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-accent">{totalCredit.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
