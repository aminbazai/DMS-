import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function Currency() {
  const db = useDB();
  const [currencies, setCurrencies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', symbol: '', exchange_rate: 1, is_default: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => { setCurrencies(await db.getCurrencies() || []); };

  const handleSave = async () => {
    if (editId) await db.saveCurrency({ ...form, id: editId });
    else await db.saveCurrency(form);
    setShowForm(false); setEditId(null); loadData();
  };

  const handleSetDefault = async (id) => {
    await db.setDefaultCurrency(id);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">Currencies</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', symbol: '', exchange_rate: 1, is_default: 0 }); }} className="btn-primary">+ Add Currency</button>
      </div>

      {showForm && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Currency Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full" placeholder="e.g. US Dollar" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Symbol</label><input type="text" value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value})} className="w-full" placeholder="e.g. $" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Exchange Rate</label><input type="number" value={form.exchange_rate} onChange={e => setForm({...form, exchange_rate: parseFloat(e.target.value) || 1})} className="w-full" step="0.01" /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currencies.map(c => (
          <div key={c.id} className={`card flex items-center justify-between ${c.is_default ? 'border-accent/50' : ''}`}>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-semibold text-white">{c.name}</h3>
                {c.is_default && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">Default</span>}
              </div>
              <p className="text-sm text-gray-400">{c.symbol} | Rate: {c.exchange_rate}</p>
            </div>
            <div className="flex gap-2">
              {!c.is_default && (
                <button onClick={() => handleSetDefault(c.id)} className="text-accent text-xs font-medium">Set Default</button>
              )}
              <button onClick={() => { setEditId(c.id); setForm({ name: c.name, symbol: c.symbol, exchange_rate: c.exchange_rate, is_default: c.is_default }); setShowForm(true); }} className="text-gray-400 text-xs">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
