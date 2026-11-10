import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function SupplierLedger() {
  const db = useDB();
  const [suppliers, setSuppliers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [ledger, setLedger] = useState({ opening_balance: 0, transactions: [] });

  useEffect(() => {
    db.getParties('supplier').then(setSuppliers);
    const d = new Date(); const f = new Date(d.getFullYear(), d.getMonth(), 1);
    setFrom(f.toISOString().split('T')[0]);
    setTo(d.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedId) loadLedger();
  }, [selectedId, from, to]);

  const loadLedger = async () => {
    const data = await db.getSupplierLedger(parseInt(selectedId), from, to);
    setLedger(data);
  };

  const handlePrint = () => {
    const content = `
      <html><head><title>Supplier Ledger</title>
      <style>body{font-family:Arial;padding:30px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd;text-align:left}.right{text-align:right}</style>
      </head><body>
      <h2>Supplier Ledger</h2>
      <p>Opening Balance: ${ledger.opening_balance.toLocaleString()}</p>
      <table><thead><tr><th>Date</th><th>Description</th><th class="right">Debit</th><th class="right">Credit</th><th class="right">Balance</th></tr></thead>
      <tbody>${ledger.transactions.map(t => `<tr><td>${t.date}</td><td>${t.description}</td><td class="right">${t.debit || '-'}</td><td class="right">${t.credit || '-'}</td><td class="right">${t.balance?.toLocaleString()}</td></tr>`).join('')}</tbody>
      </table></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(content);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Supplier Ledger</h2>
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Supplier</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full">
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">From</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">To</label><input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full" /></div>
          <div className="flex items-end"><button onClick={handlePrint} className="btn-secondary">Print</button></div>
        </div>

        {selectedId && (
          <div className="overflow-x-auto">
            <div className="text-sm text-gray-400 mb-2">
              Opening Balance: <span className="text-white font-semibold">{ledger.opening_balance.toLocaleString()}</span>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="table-header">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr></thead>
              <tbody>
                {ledger.transactions.map((t, i) => (
                  <tr key={i} className="table-row">
                    <td className="px-4 py-3">{t.date}</td>
                    <td className="px-4 py-3">{t.description}</td>
                    <td className="px-4 py-3 text-right">{t.debit > 0 ? t.debit.toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-right">{t.credit > 0 ? t.credit.toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-right font-medium">{t.balance?.toLocaleString()}</td>
                  </tr>
                ))}
                {ledger.transactions.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No transactions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
