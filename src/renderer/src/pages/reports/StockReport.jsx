import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function StockReport() {
  const db = useDB();
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState('');
  const [data, setData] = useState({ stock: [], lowStock: [], totalValue: 0 });
  const [view, setView] = useState('all');

  useEffect(() => {
    db.getWarehouses().then(setWarehouses);
    loadData();
  }, []);

  useEffect(() => { loadData(); }, [warehouseId]);

  const loadData = async () => {
    const result = await db.getStockReport(warehouseId || null);
    setData(result);
  };

  const displayStock = view === 'low' ? data.lowStock : data.stock;

  const handlePrint = () => {
    const content = getHtml();
    const w = window.open('', '_blank'); w.document.write(content); w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  const handleExportPdf = async () => {
    await window.electronAPI.exportPdf({ html: getHtml(), filename: 'Stock_Report.pdf' });
  };

  const getHtml = () => `<html><head><title>Stock Report</title><style>body{font-family:Arial;padding:30px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd;text-align:left}.right{text-align:right}</style></head><body>
      <h2>Stock Report</h2><p>Total Value: ${data.totalValue.toLocaleString()}</p>
      <table><thead><tr><th>Product</th><th>Code</th><th class="right">Qty</th><th class="right">Purchase Price</th><th class="right">Value</th></tr></thead>
      <tbody>${displayStock.map(s => `<tr><td>${s.name}</td><td>${s.code || '-'}</td><td class="right">${s.quantity}</td><td class="right">${s.purchase_price?.toLocaleString()}</td><td class="right">${((s.quantity || 0) * (s.purchase_price || 0)).toLocaleString()}</td></tr>`).join('')}</tbody>
      </table></body></html>`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">Stock Report</h2>
        <div className="flex gap-2">
          <button onClick={handleExportPdf} className="btn-secondary">Export PDF</button>
          <button onClick={handlePrint} className="btn-secondary">Print</button>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-64">
            <label className="block text-xs text-gray-400 mb-1">Warehouse</label>
            <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} className="w-full">
              <option value="">All Warehouses</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={() => setView('all')} className={`px-4 py-2 rounded-lg text-sm ${view === 'all' ? 'bg-accent text-navy' : 'bg-navy-lighter text-gray-400'}`}>All Stock</button>
            <button onClick={() => setView('low')} className={`px-4 py-2 rounded-lg text-sm relative ${view === 'low' ? 'bg-accent text-navy' : 'bg-navy-lighter text-gray-400'}`}>
              Low Stock {data.lowStock.length > 0 && <span className="ml-1 text-red-400">({data.lowStock.length})</span>}
            </button>
          </div>
          <div className="mt-5 ml-auto text-right">
            <p className="text-xs text-gray-400">Total Value</p>
            <p className="font-heading font-bold text-lg text-white">{data.totalValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="px-3 py-2 text-left">Product</th><th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Purchase Price</th><th className="px-3 py-2 text-right">Sale Price</th>
              <th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-left">Status</th>
            </tr></thead>
            <tbody>
              {displayStock.map((s, i) => {
                const val = (s.quantity || 0) * (s.purchase_price || 0);
                const isLow = s.min_stock > 0 && s.quantity <= s.min_stock;
                return (
                  <tr key={i} className={`table-row ${isLow ? 'bg-red-500/5' : ''}`}>
                    <td className="px-3 py-2">{s.name}</td><td className="px-3 py-2">{s.code || '-'}</td>
                    <td className="px-3 py-2">{s.category}</td>
                    <td className="px-3 py-2 text-right font-medium">{s.quantity}</td>
                    <td className="px-3 py-2 text-right">{s.purchase_price?.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{s.sale_price?.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{val.toLocaleString()}</td>
                    <td className="px-3 py-2">{isLow ? <span className="text-red-400 text-xs font-medium">⚠ Low</span> : <span className="text-green-400 text-xs">OK</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
