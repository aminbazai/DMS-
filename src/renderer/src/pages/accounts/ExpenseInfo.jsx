import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import useDB from '../../hooks/useDB';
import DataTable from '../../components/DataTable';

export default function ExpenseInfo() {
  const { user } = useAuth();
  const db = useDB();
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ category_id: '', amount: 0, date: new Date().toISOString().split('T')[0], description: '', payment_mode: 'cash', bank_id: '' });
  const [banks, setBanks] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setCategories(await db.getExpenseCategories() || []);
    setExpenses(await db.getExpenses({}) || []);
    setBanks(await db.getBanks() || []);
  };

  const handleSaveExpense = async () => {
    const payload = { ...form, category_id: parseInt(form.category_id), bank_id: form.bank_id ? parseInt(form.bank_id) : null, created_by: user?.id };
    if (editId) await db.saveExpense({ ...payload, id: editId });
    else await db.saveExpense(payload);
    setShowForm(false); setEditId(null); loadData(); setMessage('Expense saved!');
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;
    await db.saveExpenseCategory({ name: newCategory });
    setNewCategory(''); loadData(); setMessage('Category added!');
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({ category_id: row.category_id || '', amount: row.amount, date: row.date, description: row.description || '', payment_mode: row.payment_mode, bank_id: row.bank_id || '' });
    setShowForm(true);
  };

  const handleDelete = async (row) => {
    if (confirm('Delete this expense?')) {
      await db.deleteExpense(row.id);
      loadData();
    }
  };

  const columns = [
    { key: 'date', label: 'Date' }, { key: 'category_name', label: 'Category' },
    { key: 'description', label: 'Description' }, { key: 'amount', label: 'Amount', render: v => v?.toLocaleString() },
    { key: 'payment_mode', label: 'Payment' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">Expense Info</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ category_id: '', amount: 0, date: new Date().toISOString().split('T')[0], description: '', payment_mode: 'cash', bank_id: '' }); }} className="btn-primary">+ Add Expense</button>
      </div>
      {message && <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-lg text-sm">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-heading font-semibold text-white mb-4">Add Category</h3>
          <div className="flex gap-2">
            <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Category name" className="flex-1" />
            <button onClick={handleAddCategory} className="btn-primary text-sm">Add</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map(c => <span key={c.id} className="bg-navy-lighter text-gray-300 px-3 py-1 rounded-full text-xs">{c.name}</span>)}
          </div>
        </div>

        {showForm && (
          <div className="card">
            <h3 className="font-heading font-semibold text-white mb-4">{editId ? 'Edit' : 'Add'} Expense</h3>
            <div className="space-y-3">
              <div><label className="block text-xs text-gray-400 mb-1">Category</label>
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full">
                  <option value="">Select</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="block text-xs text-gray-400 mb-1">Amount</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})} className="w-full" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">Description</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">Payment Mode</label>
                <select value={form.payment_mode} onChange={e => setForm({...form, payment_mode: e.target.value, bank_id: e.target.value === 'bank' ? form.bank_id : ''})} className="w-full">
                  <option value="cash">Cash</option><option value="bank">Bank</option>
                </select>
              </div>
              {form.payment_mode === 'bank' && (
                <div><label className="block text-xs text-gray-400 mb-1">Bank</label>
                  <select value={form.bank_id} onChange={e => setForm({...form, bank_id: e.target.value})} className="w-full">
                    <option value="">Select Bank</option>
                    {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={handleSaveExpense} className="btn-primary">Save</button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <DataTable columns={columns} data={expenses} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}
