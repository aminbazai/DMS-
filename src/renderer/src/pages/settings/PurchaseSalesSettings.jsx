import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function PurchaseSalesSettings() {
  const db = useDB();
  const [form, setForm] = useState({ default_warehouse_id: '', invoice_prefix: 'INV', tax_rate: 0, allow_discount: true, print_header: '', print_footer: '' });
  const [warehouses, setWarehouses] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    db.getWarehouses().then(setWarehouses);
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Settings are stored alongside general account info
    const info = await db.getGeneralInfo();
    if (info && info.id) {
      setForm(prev => ({
        ...prev,
        default_warehouse_id: info.default_warehouse_id || '',
        invoice_prefix: info.invoice_prefix || 'INV',
        tax_rate: info.tax_rate || 0,
        allow_discount: info.allow_discount !== 0,
        print_header: info.print_header || '',
        print_footer: info.print_footer || '',
      }));
    }
  };

  const handleSave = async () => {
    const info = await db.getGeneralInfo();
    await db.saveSettings({
      ...info,
      default_warehouse_id: form.default_warehouse_id ? parseInt(form.default_warehouse_id) : null,
      invoice_prefix: form.invoice_prefix,
      tax_rate: parseFloat(form.tax_rate) || 0,
      allow_discount: form.allow_discount ? 1 : 0,
      print_header: form.print_header,
      print_footer: form.print_footer,
    });
    setMessage('Settings saved!');
  };

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Purchase / Sales Settings</h2>
      {message && <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-lg text-sm">{message}</div>}

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-400 mb-1">Default Warehouse</label>
            <select value={form.default_warehouse_id} onChange={e => setForm({...form, default_warehouse_id: e.target.value})} className="w-full">
              <option value="">None</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">Invoice Prefix</label><input type="text" value={form.invoice_prefix} onChange={e => setForm({...form, invoice_prefix: e.target.value})} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Default Tax Rate (%)</label><input type="number" value={form.tax_rate} onChange={e => setForm({...form, tax_rate: e.target.value})} className="w-full" /></div>
          <div className="flex items-center gap-3 mt-6">
            <input type="checkbox" id="allowDiscount" checked={form.allow_discount} onChange={e => setForm({...form, allow_discount: e.target.checked})} className="w-4 h-4" />
            <label htmlFor="allowDiscount" className="text-sm text-gray-300">Allow Discount</label>
          </div>
          <div className="md:col-span-2"><label className="block text-xs text-gray-400 mb-1">Print Header</label>
            <textarea value={form.print_header} onChange={e => setForm({...form, print_header: e.target.value})} className="w-full h-20" placeholder="Header text for print" />
          </div>
          <div className="md:col-span-2"><label className="block text-xs text-gray-400 mb-1">Print Footer</label>
            <textarea value={form.print_footer} onChange={e => setForm({...form, print_footer: e.target.value})} className="w-full h-20" placeholder="Footer text for print" />
          </div>
        </div>
        <button onClick={handleSave} className="btn-primary mt-6">Save Settings</button>
      </div>
    </div>
  );
}
