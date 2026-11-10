import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import DataTable from '../../components/DataTable';

export default function DailyClosing() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [closingCash, setClosingCash] = useState(0);
  const [notes, setNotes] = useState('');
  const [closings, setClosings] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => { loadClosings(); }, []);

  const loadClosings = async () => {
    const data = await window.electronAPI.getDailyClosings({});
    setClosings(data || []);
  };

  const handleSave = async () => {
    const result = await window.electronAPI.dailyClosing({ date, closing_cash: closingCash, notes, closed_by: user?.id });
    if (result.success) {
      setMessage('Daily closing saved successfully!');
      loadClosings();
    }
  };

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'closing_cash', label: 'Closing Cash', render: v => v?.toLocaleString() },
    { key: 'notes', label: 'Notes' },
    { key: 'closed_by_name', label: 'Closed By' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Daily Closing</h2>
      {message && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-2 rounded-lg">{message}</div>}

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Closing Cash Balance</label>
            <input type="number" value={closingCash} onChange={e => setClosingCash(parseFloat(e.target.value) || 0)} className="w-full" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full" placeholder="Any notes..." />
          </div>
        </div>
        <button onClick={handleSave} className="btn-primary">Save Closing</button>
      </div>

      <div className="card">
        <h3 className="font-heading font-semibold text-white mb-4">Closing History</h3>
        <DataTable columns={columns} data={closings} searchable={false} />
      </div>
    </div>
  );
}
