import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

const rows = (arr) => {
  if (!arr || arr.length === 0) return '';
  const keys = Object.keys(arr[0]);
  const thead = keys.map(k => `<th>${k.replace(/_/g, ' ')}</th>`).join('');
  const tbody = arr.map(r => `<tr>${keys.map(k => `<td class="right">${typeof r[k] === 'number' ? r[k].toLocaleString() : (r[k] ?? '-')}</td>`).join('')}</tr>`).join('');
  return `<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
};

export default function DailyActivity() {
  const db = useDB();
  const [type, setType] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState({});

  useEffect(() => {
    const d = new Date(); const f = new Date(d.getFullYear(), d.getMonth(), 1);
    setFrom(f.toISOString().split('T')[0]); setTo(d.toISOString().split('T')[0]);
  }, []);

  useEffect(() => { if (from && to) loadData(); }, [from, to, type]);

  const loadData = async () => {
    const result = await db.getDailyActivity({ type, from, to });
    setData(result);
  };

  const getHtml = () => {
    const sections = [
      { title: 'Supplier Activity (Purchases)', arr: data.suppliers },
      { title: 'Supplier Returns', arr: data.supplierReturns },
      { title: 'Customer Activity (Sales)', arr: data.customers },
      { title: 'Bank Transactions', arr: data.bankTxns },
      { title: 'Expenses', arr: data.expenses },
      { title: 'Stock Adjustments', arr: data.stockAdjustments },
      { title: 'Stock Transfers', arr: data.stockTransfers },
    ];
    let body = sections.map(s => s.arr && s.arr.length > 0 ? `<h3>${s.title}</h3>${rows(s.arr)}` : '').join('');
    if (data.profitSummary) {
      body += `<h3>Profit Summary</h3>
        <table><tbody>
          <tr><td>Sales</td><td class="right">${data.profitSummary.sales.toLocaleString()}</td></tr>
          <tr><td>Purchases</td><td class="right">${data.profitSummary.purchases.toLocaleString()}</td></tr>
          <tr><td>Expenses</td><td class="right">${data.profitSummary.expenses.toLocaleString()}</td></tr>
        </tbody></table>`;
    }
    return `<html><head><title>Daily Activity</title>
      <style>body{font-family:Arial;padding:30px}h2{color:#333}h3{color:#555;margin-top:20px}table{width:100%;border-collapse:collapse;margin-bottom:15px}th,td{padding:8px;border:1px solid #ddd;text-align:left}.right{text-align:right}</style>
      </head><body><h2>Daily Activity - ${type.toUpperCase()}</h2><p>${from} to ${to}</p>${body}</body></html>`;
  };

  const handlePrint = () => {
    const w = window.open('', '_blank'); w.document.write(getHtml()); w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  const handleExportPdf = async () => {
    await window.electronAPI.exportPdf({ html: getHtml(), filename: `Daily_Activity_${from}_${to}.pdf` });
  };

  const types = [
    { value: 'all', label: 'Full Activity' }, { value: 'supplier', label: 'Supplier Activity' },
    { value: 'customer', label: 'Customer Activity' }, { value: 'bank', label: 'Bank Activity' },
    { value: 'expense', label: 'Expense Activity' }, { value: 'stock', label: 'Stock Activity' },
    { value: 'profit', label: 'Profit Summary' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">Daily Activity</h2>
        <div className="flex gap-2">
          <button onClick={handleExportPdf} className="btn-secondary">Export PDF</button>
          <button onClick={handlePrint} className="btn-secondary">Print</button>
        </div>
      </div>
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div><label className="block text-xs text-gray-400 mb-1">Activity Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full">
              {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">From</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">To</label><input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full" /></div>
        </div>

        <div className="space-y-6">
          {data.suppliers && (
            <div>
              <h3 className="font-heading font-semibold text-green-400 mb-2">Supplier Activity (Purchases)</h3>
              <Table data={data.suppliers} />
            </div>
          )}
          {data.customerReturns && data.customerReturns.length > 0 && (
            <div>
              <h3 className="font-heading font-semibold text-orange-400 mb-2">Supplier Returns</h3>
              <Table data={data.supplierReturns} />
            </div>
          )}
          {data.customers && (
            <div>
              <h3 className="font-heading font-semibold text-blue-400 mb-2">Customer Activity (Sales)</h3>
              <Table data={data.customers} />
            </div>
          )}
          {data.bankTxns && (
            <div>
              <h3 className="font-heading font-semibold text-yellow-400 mb-2">Bank Transactions</h3>
              <Table data={data.bankTxns} />
            </div>
          )}
          {data.expenses && (
            <div>
              <h3 className="font-heading font-semibold text-red-400 mb-2">Expenses</h3>
              <Table data={data.expenses} />
            </div>
          )}
          {data.stockAdjustments && (
            <div>
              <h3 className="font-heading font-semibold text-purple-400 mb-2">Stock Adjustments</h3>
              <Table data={data.stockAdjustments} />
            </div>
          )}
          {data.stockTransfers && (
            <div>
              <h3 className="font-heading font-semibold text-purple-400 mb-2">Stock Transfers</h3>
              <Table data={data.stockTransfers} />
            </div>
          )}
          {data.profitSummary && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-navy-lighter p-4 rounded-lg text-center">
                <p className="text-xs text-gray-400">Sales</p>
                <p className="text-green-400 font-heading font-bold text-xl">{data.profitSummary.sales.toLocaleString()}</p>
              </div>
              <div className="bg-navy-lighter p-4 rounded-lg text-center">
                <p className="text-xs text-gray-400">Purchases</p>
                <p className="text-red-400 font-heading font-bold text-xl">{data.profitSummary.purchases.toLocaleString()}</p>
              </div>
              <div className="bg-navy-lighter p-4 rounded-lg text-center">
                <p className="text-xs text-gray-400">Expenses</p>
                <p className="text-orange-400 font-heading font-bold text-xl">{data.profitSummary.expenses.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Table({ data }) {
  if (!data || data.length === 0) return <p className="text-gray-500 text-sm">No records</p>;
  const keys = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="table-header">
          {keys.map(k => <th key={k} className="px-3 py-2 text-left uppercase">{k.replace(/_/g, ' ')}</th>)}
        </tr></thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i} className="table-row">
              {keys.map(k => <td key={k} className="px-3 py-2">{typeof r[k] === 'number' ? r[k].toLocaleString() : (r[k] ?? '-')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
