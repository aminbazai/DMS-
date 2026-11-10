import { useState } from 'react';

export default function DataTable({ columns, data, onEdit, onDelete, searchable = true, pageSize = 20 }) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  const filtered = data.filter(row =>
    !search || Object.values(row).some(v =>
      String(v || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const va = a[sortField], vb = b[sortField];
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
    return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div>
      {searchable && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full max-w-sm"
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-navy-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left cursor-pointer hover:text-white" onClick={() => handleSort(col.key)}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortField === col.key && <span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-4 py-3 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">No data found</td></tr>
            ) : (
              paged.map((row, i) => (
                <tr key={row.id || i} className="table-row animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 transition-colors duration-200">
                      {col.render ? col.render(row[col.key], row) : row[col.key] != null ? String(row[col.key]) : '-'}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <button onClick={() => onEdit(row)} className="text-accent hover:text-white text-xs font-medium transition-all duration-200 hover:scale-105">Edit</button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(row)} className="text-red-400 hover:text-red-300 text-xs font-medium transition-all duration-200 hover:scale-105">Delete</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
          <span>{sorted.length} records</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1 px-3 text-xs disabled:opacity-50">Prev</button>
            <span>{page + 1} / {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1 px-3 text-xs disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
