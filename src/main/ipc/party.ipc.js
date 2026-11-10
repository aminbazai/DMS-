const { requireAdmin } = require('../session');

function register(ipcMain, db) {
  ipcMain.handle('party:getAll', (event, type) => {
    if (type) return db.prepare('SELECT p.*, s.name as salesman_name FROM parties p LEFT JOIN salesmen s ON p.salesman_id = s.id WHERE p.type = ? ORDER BY p.name').all(type);
    return db.prepare('SELECT p.*, s.name as salesman_name FROM parties p LEFT JOIN salesmen s ON p.salesman_id = s.id ORDER BY p.name').all();
  });

  ipcMain.handle('party:get', (event, id) => {
    return db.prepare('SELECT * FROM parties WHERE id = ?').get(id);
  });

  ipcMain.handle('party:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    if (data.id) {
      db.prepare('UPDATE parties SET name=?, type=?, phone=?, address=?, city=?, opening_balance=?, balance_type=?, salesman_id=? WHERE id=?').run(data.name, data.type, data.phone, data.address, data.city, data.opening_balance || 0, data.balance_type || 'debit', data.salesman_id || null, data.id);
      return { success: true, id: data.id };
    }
    const result = db.prepare('INSERT INTO parties (name, type, phone, address, city, opening_balance, balance_type, salesman_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(data.name, data.type, data.phone, data.address, data.city, data.opening_balance || 0, data.balance_type || 'debit', data.salesman_id || null);
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('party:delete', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    db.prepare('DELETE FROM parties WHERE id = ?').run(id);
    return { success: true };
  });
}

module.exports = { register };
