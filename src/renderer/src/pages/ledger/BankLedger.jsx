import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function BankLedger() {
  const db = useDB();
  const [banks, setBanks] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [ledger, setLedger] = useState({ opening_balance: 0, transactions: [] });

  useEffect(() => {
    db.getBanks().then(setBanks);
    const d = new Date(); const f = new Date(d.getFullYear(), d.getMonth(), 1);
    setFrom(f.toISOString().split('T')[0]); setTo(d.toISOString().split('T')[0]);
  }, []);

  useEffect(() => { if (selectedId) loadLedger(); }, [selectedId, from, to]);

  const loadLedger = async () => {
    const data = await db.getBankLedger(parseInt(selectedId), from, to);
    setLedger(data);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Bank Ledger</h2>
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div><label className="block text-xs text-gray-400 mb-1">Bank</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full">
              <option value="">Select Bank</option>
              {banks.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">From</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">To</label><input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full" /></div>
        </div>
        {selectedId && (
          <div className="overflow-x-auto">
            <div className="text-sm text-gray-400 mb-2">Opening Balance: <span className="text-white font-semibold">{ledger.opening_balance.toLocaleString()}</span></div>
            <table className="w-full text-sm">
              <thead><tr className="table-header">
                <th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Deposit</th><th className="px-4 py-3 text-right">Withdrawal</th><th className="px-4 py-3 text-right">Balance</th>
              </tr></thead>
              <tbody>
                {ledger.transactions.map((t, i) => (
                  <tr key={i} className="table-row">
                    <td className="px-4 py-3">{t.date}</td><td className="px-4 py-3">{t.description}</td>
                    <td className="px-4 py-3 text-right text-green-400">{t.debit > 0 ? t.debit.toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-right text-red-400">{t.credit > 0 ? t.credit.toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-right font-medium">{t.balance?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
