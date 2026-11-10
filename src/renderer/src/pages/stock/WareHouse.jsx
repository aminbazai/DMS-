import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function WareHouse() {
  const db = useDB();
  const [warehouses, setWarehouses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', location: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const data = await db.getWarehouses();
    setWarehouses(data || []);
  };

  const handleSave = async () => {
    if (editId) await db.saveWarehouse({ ...form, id: editId });
    else await db.saveWarehouse(form);
    setShowForm(false); setEditId(null); loadData();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this warehouse?')) { await db.deleteWarehouse(id); loadData(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">Ware House</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', location: '' }); }} className="btn-primary">+ Add Warehouse</button>
      </div>

      {showForm && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Location</label><input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full" /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouses.map(w => (
          <div key={w.id} className="card flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-white">{w.name}</h3>
              <p className="text-xs text-gray-400">{w.location || 'No location'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditId(w.id); setForm({ name: w.name, location: w.location || '' }); setShowForm(true); }} className="text-accent text-sm">Edit</button>
              <button onClick={() => handleDelete(w.id)} className="text-red-400 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
