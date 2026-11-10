import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function DataRestore() {
  const db = useDB();
  const [backups, setBackups] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadBackups(); }, []);

  const loadBackups = async () => {
    const data = await db.listDailyBackups();
    setBackups(data || []);
  };

  const handleRestoreFromList = async (backup) => {
    if (!confirm(`Restore database from "${backup.filename}"?\n\n⚠ This will REPLACE all current data. The app will restart.`)) return;
    setLoading(true);
    setMessage('');
    try {
      const result = await db.restoreDatabase(backup.path);
      if (result.success) {
        setMessage('Database restored successfully! Restarting...');
        if (result.restart) setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage(result.error || 'Restore failed');
      }
    } catch (e) {
      setMessage('Error: ' + e.message);
    }
    setLoading(false);
  };

  const handleSelectAndRestore = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await db.restoreDatabase(null);
      if (result.success) {
        setMessage('Database restored successfully! Restarting...');
        if (result.restart) setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage(result.error || 'Restore cancelled');
      }
    } catch (e) {
      setMessage('Error: ' + e.message);
    }
    setLoading(false);
  };

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Data Restore</h2>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm animate-slide-down ${
          message.includes('Error') || message.includes('failed') || message.includes('cancelled')
            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
            : 'bg-green-500/10 border border-green-500/20 text-green-400'
        }`}>
          {message}
        </div>
      )}

      {/* Restore from daily backups */}
      <div className="card">
        <h3 className="font-heading font-semibold text-white text-lg mb-2">Restore from Daily Backup</h3>
        <p className="text-red-400 text-xs mb-4">⚠ This will replace your current database with the selected backup. The application will restart.</p>

        {backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No daily backups found. Create a backup first.</div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {backups.map((b, i) => (
              <div key={i} className="flex items-center justify-between bg-navy-lighter rounded-lg p-3 hover:bg-navy-border transition-colors duration-200">
                <div>
                  <p className="text-sm font-medium text-white">{b.filename}</p>
                  <p className="text-xs text-gray-500">{b.date} &middot; {formatSize(b.size)}</p>
                </div>
                <button
                  onClick={() => handleRestoreFromList(b)}
                  disabled={loading}
                  className="btn-danger text-xs px-4 py-1.5">
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restore from external file */}
      <div className="card">
        <h3 className="font-heading font-semibold text-white text-lg mb-2">Restore from External File</h3>
        <p className="text-gray-400 text-sm mb-4">Select a .db backup file from any location on your computer.</p>
        <button onClick={handleSelectAndRestore} disabled={loading}
          className="btn-secondary text-base px-8 py-3">
          {loading ? 'Restoring...' : 'Browse & Restore Backup'}
        </button>
      </div>
    </div>
  );
}
