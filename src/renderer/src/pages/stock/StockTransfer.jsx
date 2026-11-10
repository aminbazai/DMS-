import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import useDB from '../../hooks/useDB';
import DataTable from '../../components/DataTable';

export default function StockTransfer() {
  const { user } = useAuth();
  const db = useDB();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ product_id: '', from_warehouse_id: '', to_warehouse_id: '', quantity: 1, date: new Date().toISOString().split('T')[0], notes: '' });
  const [transfers, setTransfers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    db.getProducts().then(setProducts);
    db.getWarehouses().then(setWarehouses);
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    const data = await db.getStockTransfers({});
    setTransfers(data || []);
  };

  const handleSave = async () => {
    if (!form.product_id || !form.from_warehouse_id || !form.to_warehouse_id) {
      setMessage('Fill all required fields'); return;
    }
    if (form.from_warehouse_id === form.to_warehouse_id) {
      setMessage('Source and destination must be different'); return;
    }
    await db.stockTransfer({ ...form, product_id: parseInt(form.product_id), from_warehouse_id: parseInt(form.from_warehouse_id), to_warehouse_id: parseInt(form.to_warehouse_id), quantity: parseFloat(form.quantity), created_by: user?.id });
    setMessage('Transfer completed!');
    loadTransfers();
  };

  const columns = [
    { key: 'date', label: 'Date' }, { key: 'product_name', label: 'Product' },
    { key: 'from_warehouse', label: 'From' }, { key: 'to_warehouse', label: 'To' },
    { key: 'quantity', label: 'Qty' }, { key: 'notes', label: 'Notes' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Stock Transfer</h2>
      {message && <div className={`px-4 py-2 rounded-lg text-sm ${message === 'Transfer completed!' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{message}</div>}

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="block text-xs text-gray-400 mb-1">Product</label>
            <select value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} className="w-full">
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">From Warehouse</label>
            <select value={form.from_warehouse_id} onChange={e => setForm({...form, from_warehouse_id: e.target.value})} className="w-full">
              <option value="">Select Source</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">To Warehouse</label>
            <select value={form.to_warehouse_id} onChange={e => setForm({...form, to_warehouse_id: e.target.value})} className="w-full">
              <option value="">Select Destination</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">Quantity</label><input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full" min="0" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Notes</label><input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full" /></div>
        </div>
        <button onClick={handleSave} className="btn-primary mt-4">Transfer Stock</button>
      </div>

      <div className="card">
        <h3 className="font-heading font-semibold text-white mb-4">Transfer History</h3>
        <DataTable columns={columns} data={transfers} searchable={false} />
      </div>
    </div>
  );
}
