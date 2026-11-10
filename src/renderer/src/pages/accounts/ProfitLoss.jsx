import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function ProfitLoss() {
  const db = useDB();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const d = new Date(); const f = new Date(d.getFullYear(), d.getMonth(), 1);
    setFrom(f.toISOString().split('T')[0]); setTo(d.toISOString().split('T')[0]);
  }, []);

  useEffect(() => { if (from && to) loadData(); }, [from, to]);

  const loadData = async () => {
    setLoading(true);
    const result = await db.getProfitLoss(from, to);
    setData(result);
    setLoading(false);
  };

  const handlePrint = () => {
    if (!data) return;
    const content = `<html><head><title>Profit & Loss</title><style>body{font-family:Arial;padding:30px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd;text-align:left}.right{text-align:right}.total{font-weight:bold;font-size:16px}</style></head><body>
      <h2>Profit & Loss Statement</h2><p>${from} to ${to}</p>
      <table><tr><td>Sales Revenue</td><td class="right">${data.revenue.toLocaleString()}</td></tr>
      <tr><td>Cost of Goods Sold</td><td class="right">${data.cogs.toLocaleString()}</td></tr>
      <tr class="total"><td>Gross Profit</td><td class="right">${data.grossProfit.toLocaleString()}</td></tr>
      <tr><td>Total Expenses</td><td class="right">${data.totalExpenses.toLocaleString()}</td></tr>
      <tr class="total"><td>Net Profit</td><td class="right">${data.netProfit.toLocaleString()}</td></tr></table>
      <h3>Expense Breakdown</h3>
      <table>${data.expenseTotals.map(e => `<tr><td>${e.name}</td><td class="right">${e.total.toLocaleString()}</td></tr>`).join('')}</table></body></html>`;
    const w = window.open('', '_blank'); w.document.write(content); w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">Profit / Loss</h2>
        <button onClick={handlePrint} className="btn-secondary">Print</button>
      </div>
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div><label className="block text-xs text-gray-400 mb-1">From</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">To</label><input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full" /></div>
        </div>

        {loading ? <div className="text-center py-8 text-gray-500">Loading...</div> : data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between p-3 bg-navy-lighter rounded-lg"><span className="text-gray-400">Sales Revenue</span><span className="text-green-400 font-heading font-bold text-lg">{data.revenue.toLocaleString()}</span></div>
              <div className="flex justify-between p-3 bg-navy-lighter rounded-lg"><span className="text-gray-400">Cost of Goods Sold</span><span className="text-red-400 font-heading font-bold text-lg">({data.cogs.toLocaleString()})</span></div>
              <div className="flex justify-between p-4 bg-accent/10 border border-accent/30 rounded-lg"><span className="text-accent font-heading font-bold">Gross Profit</span><span className="text-accent font-heading font-bold text-xl">{data.grossProfit.toLocaleString()}</span></div>
              <div className="flex justify-between p-3 bg-navy-lighter rounded-lg"><span className="text-gray-400">Total Expenses</span><span className="text-red-400 font-heading font-bold text-lg">({data.totalExpenses.toLocaleString()})</span></div>
              <div className={`flex justify-between p-4 rounded-lg ${data.netProfit >= 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <span className="font-heading font-bold text-lg">Net Profit</span>
                <span className={`font-heading font-bold text-xl ${data.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {data.netProfit >= 0 ? '' : '('}{Math.abs(data.netProfit).toLocaleString()}{data.netProfit >= 0 ? '' : ')'}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-white mb-3">Expense Breakdown</h3>
              <table className="w-full text-sm">
                <thead><tr className="table-header"><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-right">Amount</th></tr></thead>
                <tbody>
                  {data.expenseTotals.map((e, i) => (
                    <tr key={i} className="table-row"><td className="px-3 py-2">{e.name}</td><td className="px-3 py-2 text-right text-red-400">{e.total.toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
