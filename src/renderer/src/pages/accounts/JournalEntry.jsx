import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import useDB from '../../hooks/useDB';
import DataTable from '../../components/DataTable';

export default function JournalEntry() {
  const { user } = useAuth();
  const db = useDB();
  const [entryNo, setEntryNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([{ account_type: 'cash', account_id: '', debit: 0, credit: 0, narration: '' }]);
  const [message, setMessage] = useState('');
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntryNo('JRN-' + Date.now());
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await db.getJournalEntries(null, null);
    setEntries(data || []);
  };

  const addLine = () => setLines([...lines, { account_type: 'cash', account_id: '', debit: 0, credit: 0, narration: '' }]);
  const removeLine = (idx) => setLines(lines.filter((_, i) => i !== idx));

  const updateLine = (idx, field, value) => {
    const newLines = [...lines];
    newLines[idx][field] = value;
    setLines(newLines);
  };

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);

  const handleSave = async () => {
    if (totalDebit !== totalCredit) { setMessage('Debit and Credit totals must be equal!'); return; }
    if (totalDebit === 0) { setMessage('Add at least one line'); return; }
    const result = await db.saveJournalEntry({
      entry_no: entryNo, date, description, created_by: user?.id,
      lines: lines.map(l => ({ account_type: l.account_type, account_id: l.account_id ? parseInt(l.account_id) : null, debit: parseFloat(l.debit) || 0, credit: parseFloat(l.credit) || 0, narration: l.narration })),
    });
    if (result.success) {
      setMessage('Journal entry saved!');
      setLines([{ account_type: 'cash', account_id: '', debit: 0, credit: 0, narration: '' }]);
      setDescription(''); setEntryNo('JRN-' + Date.now()); loadEntries();
    } else setMessage('Error: ' + (result.error || ''));
  };

  const columns = [
    { key: 'entry_no', label: 'Entry No' }, { key: 'date', label: 'Date' },
    { key: 'description', label: 'Description' }, { key: 'created_by_name', label: 'Created By' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Journal Entry</h2>
      {message && <div className={`px-4 py-2 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : message === 'Journal entry saved!' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{message}</div>}

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><label className="block text-xs text-gray-400 mb-1">Entry No</label><input type="text" value={entryNo} readOnly className="w-full text-accent font-medium" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Description</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full" /></div>
        </div>

        <div className="mb-4">
          <button onClick={addLine} className="btn-primary text-sm mb-2">+ Add Line</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="px-3 py-2 text-left">Account Type</th><th className="px-3 py-2 text-left">Account ID</th>
              <th className="px-3 py-2 text-right">Debit</th><th className="px-3 py-2 text-right">Credit</th>
              <th className="px-3 py-2 text-left">Narration</th><th className="px-3 py-2"></th>
            </tr></thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="table-row">
                  <td className="px-3 py-2">
                    <select value={line.account_type} onChange={e => updateLine(i, 'account_type', e.target.value)} className="w-full text-sm">
                      <option value="cash">Cash</option><option value="bank">Bank</option><option value="party">Party</option><option value="expense">Expense</option><option value="other">Other</option>
                    </select>
                  </td>
                  <td className="px-3 py-2"><input type="number" value={line.account_id} onChange={e => updateLine(i, 'account_id', e.target.value)} className="w-full text-sm" placeholder="ID" /></td>
                  <td className="px-3 py-2"><input type="number" value={line.debit} onChange={e => updateLine(i, 'debit', e.target.value)} className="w-full text-right text-sm" /></td>
                  <td className="px-3 py-2"><input type="number" value={line.credit} onChange={e => updateLine(i, 'credit', e.target.value)} className="w-full text-right text-sm" /></td>
                  <td className="px-3 py-2"><input type="text" value={line.narration} onChange={e => updateLine(i, 'narration', e.target.value)} className="w-full text-sm" /></td>
                  <td className="px-3 py-2 text-center"><button onClick={() => removeLine(i)} className="text-red-400">&times;</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 p-3 bg-navy-lighter rounded-lg">
          <div className="flex gap-6">
            <span className="text-sm">Total Debit: <span className="text-green-400 font-bold font-heading text-lg">{totalDebit.toLocaleString()}</span></span>
            <span className="text-sm">Total Credit: <span className="text-blue-400 font-bold font-heading text-lg">{totalCredit.toLocaleString()}</span></span>
            {totalDebit !== totalCredit && <span className="text-red-400 text-sm font-medium">⚠ Not balanced!</span>}
          </div>
          <button onClick={handleSave} className="btn-primary">Save Entry</button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-heading font-semibold text-white mb-4">Journal Entries</h3>
        <DataTable columns={columns} data={entries} searchable={false} />
      </div>
    </div>
  );
}
