import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';
import DataTable from '../../components/DataTable';

export default function Attendance() {
  const db = useDB();
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'present', check_in: '', check_out: '', notes: '' });
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState({ employee_id: '', from: '', to: '' });

  useEffect(() => {
    loadEmployees();
    const d = new Date(); const f = new Date(d.getFullYear(), d.getMonth(), 1);
    setFilter(prev => ({ ...prev, from: f.toISOString().split('T')[0], to: d.toISOString().split('T')[0] }));
  }, []);

  useEffect(() => { loadRecords(); }, [filter]);

  const loadEmployees = async () => { setEmployees(await db.getEmployees() || []); };
  const loadRecords = async () => {
    const data = await db.getAttendance({ employee_id: filter.employee_id || null, from: filter.from, to: filter.to });
    setRecords(data || []);
  };

  const handleSave = async () => {
    if (!form.employee_id) { setMessage('Select employee'); return; }
    await db.saveAttendance({ ...form, employee_id: parseInt(form.employee_id) });
    setMessage('Attendance saved!');
    loadRecords();
  };

  const columns = [
    { key: 'date', label: 'Date' }, { key: 'employee_name', label: 'Employee' },
    { key: 'status', label: 'Status', render: v => {
      const colors = { present: 'text-green-400', absent: 'text-red-400', leave: 'text-yellow-400' };
      return <span className={colors[v] || ''}>{v}</span>;
    }},
    { key: 'check_in', label: 'Check In' }, { key: 'check_out', label: 'Check Out' }, { key: 'notes', label: 'Notes' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Attendance</h2>
      {message && <div className="text-green-400 text-sm bg-green-500/10 px-4 py-2 rounded-lg">{message}</div>}

      <div className="card">
        <h3 className="font-heading font-semibold text-white mb-4">Mark Attendance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className="block text-xs text-gray-400 mb-1">Employee</label>
            <select value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} className="w-full">
              <option value="">Select Employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full">
              <option value="present">Present</option><option value="absent">Absent</option><option value="leave">Leave</option>
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">Notes</label><input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full" /></div>
        </div>
        <button onClick={handleSave} className="btn-primary mt-4">Save Attendance</button>
      </div>

      <div className="card">
        <h3 className="font-heading font-semibold text-white mb-4">Attendance Records</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><label className="block text-xs text-gray-400 mb-1">Filter Employee</label>
            <select value={filter.employee_id} onChange={e => setFilter({...filter, employee_id: e.target.value})} className="w-full">
              <option value="">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">From</label><input type="date" value={filter.from} onChange={e => setFilter({...filter, from: e.target.value})} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">To</label><input type="date" value={filter.to} onChange={e => setFilter({...filter, to: e.target.value})} className="w-full" /></div>
        </div>
        <DataTable columns={columns} data={records} searchable={false} />
      </div>
    </div>
  );
}
