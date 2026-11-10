import { useState, useEffect, useRef } from 'react';

export default function DataImport() {
  const db = window.electronAPI;
  const [importTypes, setImportTypes] = useState({});
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [preview, setPreview] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [mapping, setMapping] = useState({});
  const [allRows, setAllRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    db.importGetTypes().then(setImportTypes);
  }, []);

  const handleUpload = async () => {
    setError('');
    setFileInfo(null);
    const result = await db.importUpload();
    if (!result.success) { if (result.error !== 'Cancelled') setError(result.error); return; }
    setFileInfo(result.fileName);
    setHeaders(result.headers);
    setPreview(result.preview);
    setTotalRows(result.totalRows);
    setAllRows(result.rows || []);
    setResult(null);
    setStep(2);
  };

  const handleAutoMap = async () => {
    const m = await db.importAutoMap({ importType: selectedType, headers });
    setMapping(m);
  };

  const handleExecute = async () => {
    if (!selectedType) { setError('Select import type'); return; }
    if (!allRows.length) { setError('No data to import'); return; }
    setImporting(true);
    setResult(null);
    setError('');
    const res = await db.importExecute({ importType: selectedType, mapping, rows: allRows });
    setImporting(false);
    setResult(res);
  };

  const typeDef = importTypes[selectedType];

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Data Import</h2>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs">
        <span className={`px-2.5 py-1 rounded-full ${step === 0 ? 'bg-accent text-white' : 'bg-white/[0.05] text-gray-500'}`}>1. Select Type</span>
        <div className="w-6 h-px bg-white/[0.08]" />
        <span className={`px-2.5 py-1 rounded-full ${step === 1 ? 'bg-accent text-white' : step > 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.05] text-gray-500'}`}>2. Upload File</span>
        <div className="w-6 h-px bg-white/[0.08]" />
        <span className={`px-2.5 py-1 rounded-full ${step === 2 ? 'bg-accent text-white' : step > 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.05] text-gray-500'}`}>3. Map Columns</span>
        <div className="w-6 h-px bg-white/[0.08]" />
        <span className={`px-2.5 py-1 rounded-full ${step === 3 ? 'bg-accent text-white' : 'bg-white/[0.05] text-gray-500'}`}>4. Import</span>
      </div>

      {/* Step 1: Select Type */}
      {step === 0 && (
        <div className="card">
          <h3 className="font-heading font-semibold text-white text-lg mb-4">What do you want to import?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(importTypes).map(([key, t]) => (
              <button
                key={key}
                onClick={() => { setSelectedType(key); setStep(1); }}
                className="glass-module p-6 text-left group hover:border-accent/30 transition-all duration-300"
              >
                <h4 className="text-white font-semibold mb-1">{t.label}</h4>
                <p className="text-xs text-gray-500">{t.fields.length} fields</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Upload */}
      {step === 1 && (
        <div className="card">
          <h3 className="font-heading font-semibold text-white text-lg mb-4">Upload CSV File</h3>
          <p className="text-sm text-gray-400 mb-4">Importing: <span className="text-accent font-medium">{typeDef?.label}</span></p>
          <button onClick={handleUpload} className="btn-primary">Select CSV File</button>
          {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
          <div className="mt-6 border border-white/[0.06] rounded-lg p-4 bg-white/[0.01]">
            <p className="text-xs text-gray-500 mb-2">Expected columns:</p>
            <div className="flex flex-wrap gap-2">
              {typeDef?.fields.map(f => (
                <span key={f.key} className={`px-2 py-1 rounded text-[10px] border ${f.required ? 'border-accent/30 text-accent' : 'border-white/[0.06] text-gray-500'}`}>
                  {f.label} {f.required && '*'}
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => setStep(0)} className="btn-secondary mt-4 text-sm">Back</button>
        </div>
      )}

      {/* Step 3: Preview + Map */}
      {step === 2 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-white text-lg">Preview & Column Mapping</h3>
            <span className="text-xs text-gray-500">{fileInfo} • {totalRows} rows</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2">CSV Columns Detected:</label>
              <div className="flex flex-wrap gap-1.5">
                {headers.map((h, i) => (
                  <span key={i} className="px-2 py-1 rounded text-[10px] bg-white/[0.04] border border-white/[0.06] text-gray-300">{h}</span>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={handleAutoMap} className="btn-secondary text-sm">Auto-Map Columns</button>
            </div>
          </div>

          <div className="overflow-x-auto mb-4 border border-white/[0.06] rounded-lg max-h-60">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="text-left px-3 py-2 text-gray-500 font-medium">#</th>
                  {headers.map((h, i) => (
                    <th key={i} className="text-left px-3 py-2 text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, ri) => (
                  <tr key={ri} className="border-t border-white/[0.04]">
                    <td className="px-3 py-1.5 text-gray-600">{ri + 1}</td>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-1.5 text-gray-300 max-w-[200px] truncate">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="text-xs text-gray-400 font-medium mb-3">Map CSV columns to database fields:</h4>
          <div className="space-y-2 mb-4">
            {typeDef?.fields.map(f => {
              const csvIdx = mapping[f.key];
              return (
                <div key={f.key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 w-40 shrink-0">
                    {f.label} {f.required && <span className="text-accent">*</span>}
                  </span>
                  <select
                    value={csvIdx !== undefined && csvIdx >= 0 ? csvIdx : ''}
                    onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value !== '' ? parseInt(e.target.value) : -1 })}
                    className="text-xs flex-1"
                  >
                    <option value="">— Skip —</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>{h}</option>
                    ))}
                  </select>
                  {csvIdx >= 0 && csvIdx < headers.length && (
                    <span className="text-[10px] text-emerald-400">✓ {headers[csvIdx]}</span>
                  )}
                </div>
              );
            })}
          </div>

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary text-sm">Back</button>
            <button onClick={handleUpload} className="btn-secondary text-sm">Re-upload</button>
            <button
              onClick={async () => {
                if (!allRows.length) { setError('No rows to import'); return; }
                setStep(3);
                setError('');
                await handleExecute();
              }}
              className="btn-primary text-sm"
              disabled={!allRows.length}
            >
              Import {totalRows} Rows
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 3 && (
        <div className="card">
          <h3 className="font-heading font-semibold text-white text-lg mb-4">Import Results</h3>
          {importing ? (
            <div className="flex items-center gap-3 py-8">
              <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Importing data...</span>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {result.success ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <p className="text-emerald-400 font-medium">✅ Import successful!</p>
                  <p className="text-xs text-gray-400 mt-1">{result.imported} of {result.total} rows imported</p>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 font-medium">❌ Import failed</p>
                  <p className="text-xs text-red-300 mt-1">{result.error}</p>
                </div>
              )}
              {result.errors?.length > 0 && (
                <div>
                  <p className="text-xs text-yellow-400 mb-2">{result.errors.length} rows skipped:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.errors.map((e, i) => (
                      <p key={i} className="text-[11px] text-gray-400">Row {e.row}: {e.error}</p>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setStep(0); setResult(null); setFileInfo(null); setAllRows([]); }} className="btn-primary text-sm">
                  Import Another File
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Something went wrong. Please try again.</p>
              <button onClick={() => setStep(0)} className="btn-primary mt-4 text-sm">Start Over</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
