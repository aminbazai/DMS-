import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';
import DataTable from '../../components/DataTable';

export default function Employee() {
  const db = useDB();
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', designation: '', phone: '', salary: 0, join_date: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => { setEmployees(await db.getEmployees() || []); };

  const handleSave = async () => {
    if (editId) await db.saveEmployee({ ...form, id: editId });
    else await db.saveEmployee(form);
    setShowForm(false); setEditId(null); loadData();
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({ name: row.name, designation: row.designation || '', phone: row.phone || '', salary: row.salary, join_date: row.join_date || '' });
    setShowForm(true);
  };

  const handleDelete = async (row) => {
    if (confirm('Delete this employee?')) { await db.deleteEmployee(row.id); loadData(); }
  };

  const columns = [
    { key: 'name', label: 'Name' }, { key: 'designation', label: 'Designation' },
    { key: 'phone', label: 'Phone' }, { key: 'salary', label: 'Salary', render: v => v?.toLocaleString() },
    { key: 'join_date', label: 'Join Date' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">Employees</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', designation: '', phone: '', salary: 0, join_date: '' }); }} className="btn-primary">+ Add Employee</button>
      </div>
      {showForm && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Designation</label><input type="text" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Phone</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Salary</label><input type="number" value={form.salary} onChange={e => setForm({...form, salary: parseFloat(e.target.value) || 0})} className="w-full" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Join Date</label><input type="date" value={form.join_date} onChange={e => setForm({...form, join_date: e.target.value})} className="w-full" /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
      <div className="card">
        <DataTable columns={columns} data={employees} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}
