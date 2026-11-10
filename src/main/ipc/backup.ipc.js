const path = require('path');
const fs = require('fs');
const { dialog, app } = require('electron');
const { requireAdmin } = require('../session');

function getBackupDir() {
  const dir = path.join(app.getPath('documents'), 'DMS_Backups');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function register(ipcMain, db) {
  // ──────────────────────────────────────────────
  // 1. Create daily backup to dedicated folder
  // ──────────────────────────────────────────────
  ipcMain.handle('backup:createDaily', (event) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    try {
      const dbPath = db.name;
      const backupDir = getBackupDir();
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `DMS_Backup_${dateStr}_${timeStr}.db`;
      const filePath = path.join(backupDir, filename);
      fs.copyFileSync(dbPath, filePath);
      const stats = fs.statSync(filePath);
      const allBackups = listBackupFiles(backupDir);
      return { success: true, path: filePath, filename, date: dateStr, size: stats.size, backups: allBackups };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // ──────────────────────────────────────────────
  // 2. List all daily backups
  // ──────────────────────────────────────────────
  ipcMain.handle('backup:listDaily', () => {
    try {
      const backupDir = getBackupDir();
      return listBackupFiles(backupDir);
    } catch (e) {
      return [];
    }
  });

  function listBackupFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.db') && f.startsWith('DMS_Backup_'))
      .map(f => {
        const fp = path.join(dir, f);
        try {
          const stats = fs.statSync(fp);
          const datePart = f.replace('DMS_Backup_', '').split('_')[0];
          return {
            filename: f,
            path: fp,
            date: datePart,
            size: stats.size,
            created: stats.birthtime || stats.mtime,
          };
        } catch { return null; }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.created) - new Date(a.created));
  }

  // ──────────────────────────────────────────────
  // 3. Save backup to custom location (manual)
  // ──────────────────────────────────────────────
  ipcMain.handle('backup:create', async (event) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    try {
      const dbPath = db.name;
      const result = await dialog.showSaveDialog({
        title: 'Save Database Backup',
        defaultPath: path.join(app.getPath('documents'), `DMS_Backup_${new Date().toISOString().split('T')[0]}.db`),
        filters: [{ name: 'Database Files', extensions: ['db'] }],
      });
      if (!result.canceled && result.filePath) {
        fs.copyFileSync(dbPath, result.filePath);
        return { success: true, path: result.filePath };
      }
      return { success: false, error: 'Backup cancelled' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // ──────────────────────────────────────────────
  // 4. Restore from backup file
  // ──────────────────────────────────────────────
  ipcMain.handle('backup:restore', async (event, filePath) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    try {
      if (!filePath) {
        const result = await dialog.showOpenDialog({
          title: 'Select Backup File',
          filters: [{ name: 'Database Files', extensions: ['db'] }],
          properties: ['openFile'],
        });
        if (result.canceled) return { success: false, error: 'Restore cancelled' };
        filePath = result.filePaths[0];
      }
      const dbPath = db.name;
      db.close();
      fs.copyFileSync(filePath, dbPath);
      return { success: true, restart: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // ──────────────────────────────────────────────
  // 5. Select external backup file
  // ──────────────────────────────────────────────
  ipcMain.handle('backup:selectFile', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select Backup File',
      filters: [{ name: 'Database Files', extensions: ['db'] }],
      properties: ['openFile'],
    });
    if (!result.canceled) return result.filePaths[0];
    return null;
  });

  // ──────────────────────────────────────────────
  // 6. Delete a backup file
  // ──────────────────────────────────────────────
  ipcMain.handle('backup:delete', (event, filePath) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      const backupDir = getBackupDir();
      return { success: true, backups: listBackupFiles(backupDir) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // ──────────────────────────────────────────────
  // 7. Export specific table data as CSV
  // ──────────────────────────────────────────────
  ipcMain.handle('backup:exportTable', async (event, tableName) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    try {
      const result = await dialog.showSaveDialog({
        title: `Export ${tableName} Data`,
        defaultPath: path.join(app.getPath('documents'), `${tableName}_${new Date().toISOString().split('T')[0]}.csv`),
        filters: [{ name: 'CSV Files', extensions: ['csv'] }],
      });
      if (result.canceled) return { success: false, error: 'Cancelled' };

      const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
      if (rows.length === 0) return { success: false, error: 'No data to export' };

      const headers = Object.keys(rows[0]);
      const csvLines = [headers.join(',')];
      for (const row of rows) {
        const values = headers.map(h => {
          const v = row[h];
          if (v === null || v === undefined) return '';
          const s = String(v);
          return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
        });
        csvLines.push(values.join(','));
      }

      fs.writeFileSync(result.filePath, '\uFEFF' + csvLines.join('\r\n'), 'utf-8');
      return { success: true, path: result.filePath, count: rows.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // ──────────────────────────────────────────────
  // 8. Get exportable tables list
  // ──────────────────────────────────────────────
  ipcMain.handle('backup:getTables', () => {
    return db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(t => t.name);
  });

  // ──────────────────────────────────────────────
  // 9. Import CSV data into table
  // ──────────────────────────────────────────────
  ipcMain.handle('backup:importCsv', async (event, tableName) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    try {
      const result = await dialog.showOpenDialog({
        title: `Import CSV into ${tableName}`,
        filters: [{ name: 'CSV Files', extensions: ['csv'] }],
        properties: ['openFile'],
      });
      if (result.canceled) return { success: false, error: 'Cancelled' };

      const csvData = fs.readFileSync(result.filePaths[0], 'utf-8').replace(/^\uFEFF/, '');
      const lines = csvData.split(/\r?\n/).filter(l => l.trim());

      if (lines.length < 2) return { success: false, error: 'CSV file is empty' };

      const headers = parseCsvLine(lines[0]);
      const insertCols = headers.join(', ');
      const placeholders = headers.map(() => '?').join(', ');
      const stmt = db.prepare(`INSERT OR REPLACE INTO ${tableName} (${insertCols}) VALUES (${placeholders})`);

      let imported = 0;
      const transaction = db.transaction(() => {
        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvLine(lines[i]);
          if (values.length !== headers.length) continue;
          const typedValues = values.map((v, idx) => {
            if (v === '' || v === null) return null;
            const num = Number(v);
            return !isNaN(num) && v.trim() !== '' ? num : v;
          });
          stmt.run(...typedValues);
          imported++;
        }
      });

      transaction();
      return { success: true, count: imported, table: tableName };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else current += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { result.push(current); current = ''; }
        else current += ch;
      }
    }
    result.push(current);
    return result;
  }

  // ──────────────────────────────────────────────
  // 10. Clear All Data
  // ──────────────────────────────────────────────
  ipcMain.handle('backup:clearAllData', async (event) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    try {
      const result = await dialog.showMessageBox({
        type: 'warning',
        title: 'Clear All Data',
        message: 'Are you sure you want to clear all data?',
        detail: 'This will permanently delete all business records (parties, products, sales, purchases, stock, accounts, etc.).\n\nUsers and settings will be preserved.\n\nThis action cannot be undone!',
        buttons: ['Cancel', 'Clear All Data'],
        defaultId: 0,
        cancelId: 0,
        icon: null,
      });
      if (result.response === 0) return { success: false, error: 'Cancelled' };

      db.exec(`
        PRAGMA foreign_keys = OFF;
        DELETE FROM purchase_items;
        DELETE FROM purchase_invoices;
        DELETE FROM purchase_return_items;
        DELETE FROM purchase_returns;
        DELETE FROM sale_items;
        DELETE FROM sale_invoices;
        DELETE FROM sale_return_items;
        DELETE FROM sale_returns;
        DELETE FROM parties;
        DELETE FROM products;
        DELETE FROM stock_adjustments;
        DELETE FROM stock_transfers;
        DELETE FROM stock;
        DELETE FROM warehouses;
        DELETE FROM banks;
        DELETE FROM bank_transactions;
        DELETE FROM expenses;
        DELETE FROM expense_categories;
        DELETE FROM journal_entry_lines;
        DELETE FROM journal_entries;
        DELETE FROM cash_transactions;
        DELETE FROM salesmen;
        DELETE FROM counters;
        DELETE FROM employees;
        DELETE FROM attendance;
        DELETE FROM notifications;
        DELETE FROM stock_adjustment_items;
        DELETE FROM stock_transfer_items;
        PRAGMA foreign_keys = ON;
      `);

      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // ──────────────────────────────────────────────
  // Utility handlers (invoice no, app version, etc.)
  // ──────────────────────────────────────────────
  ipcMain.handle('util:generateInvoiceNo', (event, prefix) => {
    const today = new Date().toISOString().split('T')[0];
    const seqPrefix = prefix || 'INV';
    const todayStr = today.replace(/-/g, '');
    const last = db.prepare(`SELECT invoice_no FROM purchase_invoices WHERE invoice_no LIKE ? ORDER BY id DESC LIMIT 1`).get(`${seqPrefix}-${todayStr}-%`);
    let seq = 1;
    if (last) {
      const parts = last.invoice_no.split('-');
      seq = parseInt(parts[parts.length - 1]) + 1;
    }
    return `${seqPrefix}-${todayStr}-${String(seq).padStart(3, '0')}`;
  });

  ipcMain.handle('util:getAppVersion', () => app.getVersion());
  ipcMain.handle('util:getComputerName', () => require('os').hostname());
  ipcMain.handle('util:print', async () => ({ success: true }));
}

module.exports = { register };
