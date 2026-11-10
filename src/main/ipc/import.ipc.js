const { dialog } = require('electron');
const fs = require('fs');
const { requireAdmin } = require('../session');

const IMPORT_TYPES = {
  products: {
    table: 'products',
    label: 'Products',
    fields: [
      { key: 'name', label: 'Product Name', required: true },
      { key: 'code', label: 'Code', required: false },
      { key: 'category', label: 'Category', required: false },
      { key: 'unit', label: 'Unit', required: false },
      { key: 'purchase_price', label: 'Purchase Price', required: false, type: 'number' },
      { key: 'sale_price', label: 'Sale Price', required: false, type: 'number' },
      { key: 'min_stock', label: 'Min Stock', required: false, type: 'number' },
    ],
    sql: 'INSERT INTO products (name, code, category, unit, purchase_price, sale_price, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
  },
  parties: {
    table: 'parties',
    label: 'Parties',
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'type', label: 'Type (supplier/customer)', required: true },
      { key: 'phone', label: 'Phone', required: false },
      { key: 'address', label: 'Address', required: false },
      { key: 'city', label: 'City', required: false },
      { key: 'opening_balance', label: 'Opening Balance', required: false, type: 'number' },
      { key: 'balance_type', label: 'Balance Type (debit/credit)', required: false },
    ],
    sql: 'INSERT INTO parties (name, type, phone, address, city, opening_balance, balance_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
  },
};

const aliases = {
  name: ['name', 'product name', 'item name', 'party name', 'customer', 'supplier', 'full name'],
  code: ['code', 'product code', 'sku', 'item code', 'part no'],
  category: ['category', 'cat', 'product category', 'type'],
  unit: ['unit', 'uom', 'measurement', 'qty unit'],
  purchase_price: ['purchase price', 'cost price', 'buying price', 'cost', 'pp', 'purchase rate'],
  sale_price: ['sale price', 'selling price', 'retail price', 'sales price', 'sp', 'sale rate'],
  min_stock: ['min stock', 'min qty', 'minimum stock', 'reorder level', 'alert qty'],
  type: ['type', 'party type', 'party category', 'category'],
  phone: ['phone', 'mobile', 'contact', 'tel', 'telephone', 'phone no', 'cell'],
  address: ['address', 'addr', 'location'],
  city: ['city', 'town', 'area', 'district'],
  opening_balance: ['opening balance', 'balance', 'open bal', 'op bal', 'initial balance'],
  balance_type: ['balance type', 'debit/credit', 'dr/cr', 'type'],
};

function findAlias(header, key) {
  const lower = header.toLowerCase().trim();
  return (aliases[key] || []).some(a => lower === a || lower.includes(a));
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { result.push(current.trim()); current = ''; }
      else current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function register(ipcMain, db) {
  ipcMain.handle('import:upload', async (event) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select CSV File to Import',
        filters: [{ name: 'CSV Files', extensions: ['csv'] }, { name: 'All Files', extensions: ['*'] }],
        properties: ['openFile'],
      });
      if (result.canceled) return { success: false, error: 'Cancelled' };

      const raw = fs.readFileSync(result.filePaths[0], 'utf-8').replace(/^\uFEFF/, '');
      const lines = raw.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) return { success: false, error: 'File is empty or has only headers' };

      const headers = parseCsvLine(lines[0]);
      const rows = lines.slice(1).map(l => parseCsvLine(l)).filter(r => r.length === headers.length && r.some(c => c.trim()));
      const preview = rows.slice(0, 10);

      return { success: true, headers, totalRows: rows.length, preview, rows, fileName: result.filePaths[0].split('\\').pop().split('/').pop() };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('import:getTypes', () => {
    const types = {};
    for (const [key, val] of Object.entries(IMPORT_TYPES)) {
      types[key] = { label: val.label, fields: val.fields };
    }
    return types;
  });

  ipcMain.handle('import:autoMap', (event, { importType, headers }) => {
    const def = IMPORT_TYPES[importType];
    if (!def) return { success: false, error: 'Invalid import type' };

    const mapping = {};
    for (const field of def.fields) {
      const match = headers.findIndex(h => findAlias(h, field.key));
      mapping[field.key] = match >= 0 ? match : -1;
    }
    return mapping;
  });

  ipcMain.handle('import:execute', (event, { importType, mapping, rows }) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const def = IMPORT_TYPES[importType];
    if (!def) return { success: false, error: 'Invalid import type' };

    let imported = 0;
    const errors = [];

    try {
      const transaction = db.transaction(() => {
        const stmt = db.prepare(def.sql);
        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const row = rows[rIdx];
          const values = def.fields.map((field) => {
            const colIdx = mapping[field.key];
            if (colIdx < 0 || colIdx >= row.length) return field.required ? '' : null;
            const val = row[colIdx];
            if (field.type === 'number') {
              if (val === '' || val === null || val === undefined) return field.required ? 0 : null;
              const num = parseFloat(String(val).replace(/,/g, ''));
              return isNaN(num) ? 0 : num;
            }
            return val || null;
          });

          const missing = def.fields.filter((f, i) => f.required && (values[i] === null || values[i] === undefined || values[i] === ''));
          if (missing.length > 0) {
            errors.push({ row: rIdx + 2, error: `Missing: ${missing.map(f => f.label).join(', ')}` });
            continue;
          }

          stmt.run(...values);
          imported++;
        }
      });

      transaction();
      return { success: true, imported, total: rows.length, errors };
    } catch (e) {
      return { success: false, error: e.message, imported, total: rows.length, errors };
    }
  });
}

module.exports = { register };
