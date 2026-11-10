import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';
import DataTable from '../../components/DataTable';

export default function PartyInfo() {
  const db = useDB();
  const [activeTab, setActiveTab] = useState('supplier');
  const [parties, setParties] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'supplier', phone: '', address: '', city: '', opening_balance: 0, balance_type: 'debit', salesman_id: '' });

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    const data = await db.getParties(activeTab);
    setParties(data || []);
    const sm = await db.getSalesmen();
    setSalesmen(sm || []);
  };

  const handleSave = async () => {
    if (editId) {
      await db.saveParty({ ...form, id: editId, salesman_id: form.salesman_id ? parseInt(form.salesman_id) : null });
    } else {
      await db.saveParty({ ...form, type: activeTab, salesman_id: form.salesman_id ? parseInt(form.salesman_id) : null });
    }
    setShowForm(false); setEditId(null); resetForm(); loadData();
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({ name: row.name, type: row.type, phone: row.phone || '', address: row.address || '', city: row.city || '', opening_balance: row.opening_balance, balance_type: row.balance_type, salesman_id: row.salesman_id || '' });
    setShowForm(true);
  };

  const handleDelete = async (row) => {
    if (confirm('Delete this party?')) {
      await db.deleteParty(row.id);
      loadData();
    }
  };

  const resetForm = () => setForm({ name: '', type: activeTab, phone: '', address: '', city: '', opening_balance: 0, balance_type: 'debit', salesman_id: '' });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'city', label: 'City' },
    { key: 'opening_balance', label: 'Balance', render: v => v?.toLocaleString() },
    { key: 'balance_type', label: 'Type' },
    { key: 'salesman_name', label: 'Salesman' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Party Info</h2>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('supplier')} className={`px-6 py-2 rounded-lg text-sm font-heading font-semibold transition-all ${activeTab === 'supplier' ? 'bg-accent text-navy' : 'bg-navy-lighter text-gray-400 hover:text-white'}`}>Suppliers</button>
        <button onClick={() => setActiveTab('customer')} className={`px-6 py-2 rounded-lg text-sm font-heading font-semibold transition-all ${activeTab === 'customer' ? 'bg-accent text-navy' : 'bg-navy-lighter text-gray-400 hover:text-white'}`}>Customers</button>
        <button onClick={() => { setShowForm(true); setEditId(null); resetForm(); }} className="btn-primary ml-auto">+ Add {activeTab === 'supplier' ? 'Supplier' : 'Customer'}</button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="font-heading font-semibold text-white mb-4">{editId ? 'Edit' : 'Add'} {activeTab === 'supplier' ? 'Supplier' : 'Customer'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Phone</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">City</label><input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Address</label><input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Opening Balance</label><input type="number" value={form.opening_balance} onChange={e => setForm({...form, opening_balance: parseFloat(e.target.value) || 0})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Balance Type</label>
              <select value={form.balance_type} onChange={e => setForm({...form, balance_type: e.target.value})} className="w-full">
                <option value="debit">Debit</option><option value="credit">Credit</option>
              </select>
            </div>
            <div><label className="block text-xs text-gray-400 mb-1">Salesman</label>
              <select value={form.salesman_id} onChange={e => setForm({...form, salesman_id: e.target.value})} className="w-full">
                <option value="">None</option>
                {salesmen.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
        <DataTable columns={columns} data={parties} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}
