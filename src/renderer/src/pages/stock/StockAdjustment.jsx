import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import useDB from '../../hooks/useDB';
import DataTable from '../../components/DataTable';

export default function StockAdjustment() {
  const { user } = useAuth();
  const db = useDB();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ product_id: '', warehouse_id: '', adjustment_type: 'add', quantity: 1, reason: '', date: new Date().toISOString().split('T')[0] });
  const [adjustments, setAdjustments] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    db.getProducts().then(setProducts);
    db.getWarehouses().then(setWarehouses);
    loadAdjustments();
  }, []);

  const loadAdjustments = async () => {
    const data = await db.getStockAdjustments({});
    setAdjustments(data || []);
  };

  const handleSave = async () => {
    if (!form.product_id) { setMessage('Select product'); return; }
    await db.stockAdjustment({ ...form, product_id: parseInt(form.product_id), warehouse_id: form.warehouse_id ? parseInt(form.warehouse_id) : null, quantity: parseFloat(form.quantity), created_by: user?.id });
    setMessage('Adjustment saved!');
    loadAdjustments();
  };

  const columns = [
    { key: 'date', label: 'Date' }, { key: 'product_name', label: 'Product' },
    { key: 'adjustment_type', label: 'Type', render: v => <span className={v === 'add' ? 'text-green-400' : 'text-red-400'}>{v}</span> },
    { key: 'quantity', label: 'Qty' }, { key: 'reason', label: 'Reason' }, { key: 'warehouse_name', label: 'Warehouse' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Stock Adjustment</h2>
      {message && <div className="text-green-400 text-sm bg-green-500/10 px-4 py-2 rounded-lg">{message}</div>}

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="block text-xs text-gray-400 mb-1">Product</label>
            <select value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} className="w-full">
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">Warehouse</label>
            <select value={form.warehouse_id} onChange={e => setForm({...form, warehouse_id: e.target.value})} className="w-full">
              <option value="">Select Warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Adjustment Type</label>
            <select value={form.adjustment_type} onChange={e => setForm({...form, adjustment_type: e.target.value})} className="w-full">
              <option value="add">Add Stock</option><option value="subtract">Subtract Stock</option>
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">Quantity</label><input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full" min="0" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Reason</label><input type="text" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full" /></div>
        </div>
        <button onClick={handleSave} className="btn-primary mt-4">Save Adjustment</button>
      </div>

      <div className="card">
        <h3 className="font-heading font-semibold text-white mb-4">Adjustment History</h3>
        <DataTable columns={columns} data={adjustments} searchable={false} />
      </div>
    </div>
  );
}
