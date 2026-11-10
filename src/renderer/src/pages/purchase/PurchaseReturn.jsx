import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import useDB from '../../hooks/useDB';
import DataTable from '../../components/DataTable';

export default function PurchaseReturn() {
  const { user } = useAuth();
  const db = useDB();
  const [returnNo, setReturnNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [suppliers, setSuppliers] = useState([]);
  const [partyId, setPartyId] = useState('');
  const [items, setItems] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    loadSuppliers();
    loadReturns();
    setReturnNo('RET-PUR-' + Date.now());
  }, []);

  const loadSuppliers = async () => {
    const data = await db.getParties('supplier');
    setSuppliers(data || []);
  };

  const loadReturns = async () => {
    const data = await db.getPurchaseReturns({});
    setReturns(data || []);
  };

  const searchProducts = async (q) => {
    if (!q) { setProductResults([]); return; }
    const data = await db.getProducts(q);
    setProductResults(data || []);
  };

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(productSearch), 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const total = items.reduce((s, i) => s + (parseFloat(i.total) || 0), 0);

  const handleSave = async () => {
    if (!partyId) { setMessage('Select supplier'); return; }
    if (items.length === 0) { setMessage('Add items'); return; }
    const result = await db.savePurchaseReturn({
      return_no: returnNo, party_id: parseInt(partyId), date, total, notes,
      items: items.map(i => ({ product_id: i.product_id, quantity: parseFloat(i.quantity), rate: parseFloat(i.rate), total: i.total })),
    });
    if (result.success) {
      setMessage('Purchase return saved!');
      setItems([]); setPartyId(''); setProductSearch(''); setNotes('');
      setReturnNo('RET-PUR-' + Date.now());
      loadReturns();
    } else setMessage('Error: ' + (result.error || ''));
  };

  const addItem = (p) => {
    setItems([...items, { product_id: p.id, product_name: p.name, quantity: 1, rate: p.purchase_price || 0, total: p.purchase_price || 0 }]);
    setProductSearch(''); setProductResults([]);
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    const qty = parseFloat(newItems[idx].quantity) || 0;
    const rate = parseFloat(newItems[idx].rate) || 0;
    newItems[idx].total = qty * rate;
    setItems(newItems);
  };

  const columns = [
    { key: 'return_no', label: 'Return No' },
    { key: 'date', label: 'Date' },
    { key: 'party_name', label: 'Supplier' },
    { key: 'total', label: 'Total', render: v => v?.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Purchase Return</h2>
      {message && <div className={`px-4 py-2 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{message}</div>}

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Return No</label>
            <input type="text" value={returnNo} readOnly className="w-full text-accent font-medium" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Supplier</label>
            <select value={partyId} onChange={e => setPartyId(e.target.value)} className="w-full">
              <option value="">Select Supplier</option>
              {suppliers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <input type="text" placeholder="Search product..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="flex-1" />
          </div>
          {productResults.length > 0 && (
            <div className="bg-navy-lighter border border-navy-border rounded-lg max-h-40 overflow-y-auto">
              {productResults.map(p => (
                <button key={p.id} className="block w-full text-left px-4 py-2 text-sm hover:bg-navy-light text-gray-300" onClick={() => addItem(p)}>
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Rate</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="table-row">
                  <td className="px-3 py-2">{item.product_name}</td>
                  <td className="px-3 py-2"><input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="w-20 text-right" min="0" /></td>
                  <td className="px-3 py-2"><input type="number" value={item.rate} onChange={e => updateItem(i, 'rate', e.target.value)} className="w-24 text-right" min="0" /></td>
                  <td className="px-3 py-2 text-right font-medium">{item.total.toLocaleString()}</td>
                  <td className="px-3 py-2 text-center"><button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300">&times;</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-heading text-lg font-bold text-accent">Total: {total.toLocaleString()}</div>
          <button onClick={handleSave} className="btn-primary">Save Return</button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-heading font-semibold text-white mb-4">Return History</h3>
        <DataTable columns={columns} data={returns} />
      </div>
    </div>
  );
}
