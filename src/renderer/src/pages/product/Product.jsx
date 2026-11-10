import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';
import DataTable from '../../components/DataTable';

export default function Product() {
  const db = useDB();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', unit: 'PCS', category: '', purchase_price: 0, sale_price: 0, min_stock: 0, warehouse_id: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadWarehouses();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await db.getProducts(search || null);
    setProducts(data || []);
  };

  const loadWarehouses = async () => {
    const data = await db.getWarehouses();
    setWarehouses(data || []);
  };

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSave = async () => {
    const payload = { ...form, warehouse_id: form.warehouse_id ? parseInt(form.warehouse_id) : null };
    if (editId) {
      await db.saveProduct({ ...payload, id: editId });
    } else {
      await db.saveProduct(payload);
    }
    setShowForm(false); setEditId(null); resetForm(); loadProducts();
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({ name: row.name, code: row.code || '', unit: row.unit, category: row.category || '', purchase_price: row.purchase_price, sale_price: row.sale_price, min_stock: row.min_stock, warehouse_id: row.warehouse_id || '' });
    setShowForm(true);
  };

  const handleDelete = async (row) => {
    if (confirm('Delete this product?')) {
      await db.deleteProduct(row.id);
      loadProducts();
    }
  };

  const resetForm = () => setForm({ name: '', code: '', unit: 'PCS', category: '', purchase_price: 0, sale_price: 0, min_stock: 0, warehouse_id: '' });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'unit', label: 'Unit' },
    { key: 'category', label: 'Category' },
    { key: 'purchase_price', label: 'Purchase Price', render: v => v?.toLocaleString() },
    { key: 'sale_price', label: 'Sale Price', render: v => v?.toLocaleString() },
    { key: 'min_stock', label: 'Min Stock' },
    { key: 'warehouse_name', label: 'Warehouse' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">Products</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); resetForm(); }} className="btn-primary">+ Add Product</button>
      </div>

      <div className="flex gap-2">
        <input type="text" placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-md" />
      </div>

      {showForm && (
        <div className="card">
          <h3 className="font-heading font-semibold text-white mb-4">{editId ? 'Edit' : 'Add'} Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full" required /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Code</label><input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Unit</label>
              <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full">
                <option value="PCS">PCS</option><option value="KG">KG</option><option value="MTR">MTR</option><option value="LTR">LTR</option><option value="BOX">BOX</option>
              </select>
            </div>
            <div><label className="block text-xs text-gray-400 mb-1">Category</label><input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Purchase Price</label><input type="number" value={form.purchase_price} onChange={e => setForm({...form, purchase_price: parseFloat(e.target.value) || 0})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Sale Price</label><input type="number" value={form.sale_price} onChange={e => setForm({...form, sale_price: parseFloat(e.target.value) || 0})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Min Stock Level</label><input type="number" value={form.min_stock} onChange={e => setForm({...form, min_stock: parseFloat(e.target.value) || 0})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Warehouse</label>
              <select value={form.warehouse_id} onChange={e => setForm({...form, warehouse_id: e.target.value})} className="w-full">
                <option value="">None</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <DataTable columns={columns} data={products} onEdit={handleEdit} onDelete={handleDelete} searchable={false} />
      </div>
    </div>
  );
}
