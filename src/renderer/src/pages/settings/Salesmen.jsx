import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';
import DataTable from '../../components/DataTable';

export default function Salesmen() {
  const db = useDB();
  const [salesmen, setSalesmen] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', area: '', commission_rate: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => { setSalesmen(await db.getSalesmen() || []); };

  const handleSave = async () => {
    if (editId) await db.saveSalesman({ ...form, id: editId });
    else await db.saveSalesman(form);
    setShowForm(false); setEditId(null); loadData();
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({ name: row.name, phone: row.phone || '', area: row.area || '', commission_rate: row.commission_rate });
    setShowForm(true);
  };

  const handleDelete = async (row) => {
    if (confirm('Delete this salesman?')) { await db.deleteSalesman(row.id); loadData(); }
  };

  const columns = [
    { key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' },
    { key: 'area', label: 'Area' }, { key: 'commission_rate', label: 'Commission %' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">Salesmen</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', phone: '', area: '', commission_rate: 0 }); }} className="btn-primary">+ Add Salesman</button>
      </div>
      {showForm && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Phone</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Area</label><input type="text" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Commission Rate (%)</label><input type="number" value={form.commission_rate} onChange={e => setForm({...form, commission_rate: parseFloat(e.target.value) || 0})} className="w-full" /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
      <div className="card">
        <DataTable columns={columns} data={salesmen} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}
