import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function ExpenseLedger() {
  const db = useDB();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [data, setData] = useState({ expenses: [], totals: [] });

  useEffect(() => {
    const d = new Date(); const f = new Date(d.getFullYear(), d.getMonth(), 1);
    setFrom(f.toISOString().split('T')[0]); setTo(d.toISOString().split('T')[0]);
    db.getExpenseCategories().then(setCategories);
  }, []);

  useEffect(() => { loadData(); }, [from, to, categoryId]);

  const loadData = async () => {
    const result = await db.getExpenseLedger(from, to, categoryId || null);
    setData(result);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Expense Ledger</h2>
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div><label className="block text-xs text-gray-400 mb-1">From</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">To</label><input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-heading font-semibold text-white mb-3">Expense Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="table-header">
                  <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2 text-left">Payment</th>
                </tr></thead>
                <tbody>
                  {data.expenses.map((e, i) => (
                    <tr key={i} className="table-row">
                      <td className="px-3 py-2">{e.date}</td><td className="px-3 py-2">{e.category_name}</td>
                      <td className="px-3 py-2">{e.description}</td>
                      <td className="px-3 py-2 text-right text-red-400">{e.amount.toLocaleString()}</td>
                      <td className="px-3 py-2">{e.payment_mode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-white mb-3">Category Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="table-header">
                  <th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-right">Total</th>
                </tr></thead>
                <tbody>
                  {data.totals.map((t, i) => (
                    <tr key={i} className="table-row">
                      <td className="px-3 py-2">{t.name}</td>
                      <td className="px-3 py-2 text-right text-red-400 font-medium">{t.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
