import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function DataBackup() {
  const db = useDB();
  const [backups, setBackups] = useState([]);
  const [tables, setTables] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('backup');

  useEffect(() => { loadBackups(); loadTables(); }, []);

  const loadBackups = async () => {
    const data = await db.listDailyBackups();
    setBackups(data || []);
  };

  const loadTables = async () => {
    const data = await db.getExportTables();
    setTables(data || []);
  };

  const handleDailyBackup = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await db.createDailyBackup();
      if (result.success) {
        setMessage(`Backup saved: ${result.filename}`);
        setBackups(result.backups || []);
      } else {
        setMessage(result.error || 'Backup failed');
      }
    } catch (e) {
      setMessage('Error: ' + e.message);
    }
    setLoading(false);
  };

  const handleSaveBackup = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await db.backupDatabase();
      if (result.success) {
        setMessage(`Backup saved successfully!`);
      } else {
        setMessage(result.error || 'Backup cancelled');
      }
    } catch (e) {
      setMessage('Error: ' + e.message);
    }
    setLoading(false);
  };

  const handleDeleteBackup = async (backup) => {
    if (!confirm(`Delete backup "${backup.filename}"?`)) return;
    const result = await db.deleteBackup(backup.path);
    if (result.success) setBackups(result.backups || []);
  };

  const handleExportTable = async (table) => {
    setMessage('');
    const result = await db.exportTable(table);
    if (result.success) {
      setMessage(`Exported ${result.count} records from "${table}"`);
    } else if (result.error !== 'Cancelled') {
      setMessage(result.error);
    }
  };

  const handleImportCsv = async (table) => {
    setMessage('');
    const result = await db.importCsv(table);
    if (result.success) {
      setMessage(`Imported ${result.count} records into "${table}"`);
    } else if (result.error !== 'Cancelled') {
      setMessage(result.error);
    }
  };

  const handleClearAllData = async () => {
    setMessage('');
    const result = await db.clearAllData();
    if (result.success) {
      setMessage('All data cleared successfully!');
    } else if (result.error !== 'Cancelled') {
      setMessage('Error: ' + result.error);
    }
  };

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Data Backup &amp; Export</h2>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm animate-slide-down ${
          message.includes('Error') || message.includes('failed') || message.includes('Cancelled')
            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
            : 'bg-green-500/10 border border-green-500/20 text-green-400'
        }`}>
          {message}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-2 border-b border-navy-border pb-2">
        {['backup', 'export', 'import'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-heading font-semibold transition-all duration-200 ${
              activeTab === tab ? 'bg-accent text-navy' : 'text-gray-400 hover:text-white hover:bg-navy-lighter'
            }`}>
            {tab === 'backup' ? '💾 Backup' : tab === 'export' ? '📤 Export' : '📥 Import'}
          </button>
        ))}
      </div>

      {/* ── TAB: Backup ── */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <h3 className="font-heading font-semibold text-white text-lg">Create Backup</h3>
            <div className="bg-navy-lighter rounded-xl p-6 text-center">
              <div className="text-5xl mb-3">💾</div>
              <p className="text-gray-400 text-sm mb-4">One-click daily backup to Documents/DMS_Backups/</p>
              <button onClick={handleDailyBackup} disabled={loading}
                className="btn-primary text-base px-8 py-3 w-full">
                {loading ? 'Creating...' : 'Create Daily Backup'}
              </button>
            </div>
            <div className="bg-navy-lighter rounded-xl p-4 text-center">
              <p className="text-gray-500 text-xs mb-2">Or save backup to a custom location</p>
              <button onClick={handleSaveBackup} disabled={loading}
                className="btn-secondary text-sm px-6 py-2 w-full">
                Save Backup As...
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-heading font-semibold text-white text-lg mb-4">Backup History</h3>
            {backups.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No backups found</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {backups.map((b, i) => (
                  <div key={i} className="flex items-center justify-between bg-navy-lighter rounded-lg p-3 hover:bg-navy-border transition-colors duration-200 group">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{b.filename}</p>
                      <p className="text-xs text-gray-500">
                        {b.date} &middot; {formatSize(b.size)}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleDeleteBackup(b)}
                        className="text-red-400 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Export ── */}
      {activeTab === 'export' && (
        <div className="card">
          <h3 className="font-heading font-semibold text-white text-lg mb-2">Export Table Data to CSV</h3>
          <p className="text-gray-400 text-sm mb-4">Select a table to export its data as a CSV file.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {tables.map(table => (
              <button key={table} onClick={() => handleExportTable(table)}
                className="bg-navy-lighter hover:bg-navy-border border border-navy-border rounded-xl p-4 text-center group transition-all duration-200 hover:scale-[1.03]">
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                  {table.includes('purchase') ? '🛒' : table.includes('sale') ? '💰' : table.includes('party') ? '👥' : table.includes('product') ? '📦' : table.includes('stock') ? '📊' : table.includes('bank') ? '🏦' : table.includes('expense') ? '💸' : table.includes('user') ? '👤' : table.includes('journal') ? '📝' : '📋'}
                </div>
                <p className="text-xs text-gray-400 group-hover:text-white transition-colors font-medium truncate">{table}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Import CSV ── */}
      {activeTab === 'import' && (
        <div className="card">
          <h3 className="font-heading font-semibold text-white text-lg mb-2">Import CSV into Table</h3>
          <p className="text-yellow-400 text-xs mb-4">
            ⚠ Column headers in CSV must match table column names exactly. Existing rows with matching IDs will be replaced.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {tables.map(table => (
              <button key={table} onClick={() => handleImportCsv(table)}
                className="bg-navy-lighter hover:bg-navy-border border border-navy-border rounded-xl p-4 text-center group transition-all duration-200 hover:scale-[1.03]">
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">📥</div>
                <p className="text-xs text-gray-400 group-hover:text-white transition-colors font-medium truncate">{table}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Clear All Data ── */}
      <div className="card border-rose-500/20">
        <h3 className="font-heading font-semibold text-white text-lg mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All Data
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Permanently delete all business records. Users and settings will be preserved.
        </p>
        <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-5 text-center">
          <p className="text-xs text-rose-400/70 mb-4">This action cannot be undone. Create a backup first.</p>
          <button onClick={handleClearAllData}
            className="flex items-center justify-center gap-2 text-sm font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 rounded-lg py-2.5 px-6 w-full transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
