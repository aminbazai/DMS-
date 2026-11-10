import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function SaleReport() {
  const db = useDB();
  const [type, setType] = useState('date');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [counters, setCounters] = useState([]);
  const [filterId, setFilterId] = useState('');

  useEffect(() => {
    const d = new Date(); const f = new Date(d.getFullYear(), d.getMonth(), 1);
    setFrom(f.toISOString().split('T')[0]); setTo(d.toISOString().split('T')[0]);
    db.getParties('customer').then(setCustomers);
    db.getProducts().then(setProducts);
    db.getSalesmen().then(setSalesmen);
    db.getCounters().then(setCounters);
  }, []);

  useEffect(() => { if (from && to) loadReport(); }, [from, to, type, filterId]);

  const loadReport = async () => {
    const params = { type, from, to };
    if (type === 'customer') params.party_id = filterId;
    else if (type === 'product') params.product_id = filterId;
    else if (type === 'salesman') params.salesman_id = filterId;
    else if (type === 'counter') params.counter_id = filterId;
    const result = await db.getSaleReport(params);
    setData(result || []);
  };

  const total = data.reduce((s, r) => s + (r.total || 0), 0);

  const getHtml = () => {
    const rows = Object.keys(data[0] || {}).map(k => `<th>${k}</th>`).join('');
    const body = data.map(r => `<tr>${Object.values(r).map(v => `<td class="right">${v ?? '-'}</td>`).join('')}</tr>`).join('');
    return `<html><head><title>Sale Report</title><style>body{font-family:Arial;padding:30px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd;text-align:left}.right{text-align:right}</style></head><body><h2>Sale Report - ${type.toUpperCase()}</h2><p>${from} to ${to}</p><table><thead><tr>${rows}</tr></thead><tbody>${body}</tbody></table><p class="right">Total: ${total.toLocaleString()}</p></body></html>`;
  };

  const handlePrint = () => {
    const w = window.open('', '_blank'); w.document.write(getHtml()); w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  const handleExportPdf = async () => {
    await window.electronAPI.exportPdf({ html: getHtml(), filename: `Sale_Report_${from}_${to}.pdf` });
  };

  const renderFilter = () => {
    switch (type) {
      case 'customer': return <select value={filterId} onChange={e => setFilterId(e.target.value)} className="w-full"><option value="">All Customers</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>;
      case 'product': return <select value={filterId} onChange={e => setFilterId(e.target.value)} className="w-full"><option value="">All Products</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>;
      case 'salesman': return <select value={filterId} onChange={e => setFilterId(e.target.value)} className="w-full"><option value="">All Salesmen</option>{salesmen.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>;
      case 'counter': return <select value={filterId} onChange={e => setFilterId(e.target.value)} className="w-full"><option value="">All Counters</option>{counters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">Sale Report</h2>
        <div className="flex gap-2">
          <button onClick={handleExportPdf} className="btn-secondary">Export PDF</button>
          <button onClick={handlePrint} className="btn-secondary">Print</button>
        </div>
      </div>
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div><label className="block text-xs text-gray-400 mb-1">Report Type</label>
            <select value={type} onChange={e => { setType(e.target.value); setFilterId(''); }} className="w-full">
              <option value="date">By Date</option><option value="customer">By Customer</option>
              <option value="product">By Product</option><option value="salesman">By Salesman</option><option value="counter">By Counter</option>
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">From</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">To</label><input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Filter</label>{renderFilter()}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              {data.length > 0 && Object.keys(data[0]).map(k => <th key={k} className="px-3 py-2 text-left uppercase">{k.replace(/_/g, ' ')}</th>)}
            </tr></thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className="table-row">
                  {Object.entries(r).map(([key, val]) => (
                    <td key={key} className="px-3 py-2">{typeof val === 'number' ? val.toLocaleString() : (val ?? '-')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            {data.length > 0 && (
              <tfoot><tr className="bg-accent/5 font-bold text-accent">
                <td className="px-3 py-2" colSpan={Object.keys(data[0]).length - 1}>Total</td>
                <td className="px-3 py-2 text-right">{total.toLocaleString()}</td>
              </tr></tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
