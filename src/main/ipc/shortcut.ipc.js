const { requireAdmin } = require('../session');

function register(ipcMain, db) {
  ipcMain.handle('shortcut:getAll', () => {
    return db.prepare('SELECT * FROM shortcuts ORDER BY id').all();
  });

  ipcMain.handle('shortcut:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    if (data.id) {
      const existing = db.prepare('SELECT id FROM shortcuts WHERE keys = ? AND id != ?').get(data.keys, data.id);
      if (existing) return { success: false, error: 'Shortcut key already exists' };
      db.prepare('UPDATE shortcuts SET keys = ?, path = ?, action = ? WHERE id = ?').run(data.keys, data.path, data.action, data.id);
    } else {
      const existing = db.prepare('SELECT id FROM shortcuts WHERE keys = ?').get(data.keys);
      if (existing) return { success: false, error: 'Shortcut key already exists' };
      db.prepare('INSERT INTO shortcuts (keys, path, action) VALUES (?, ?, ?)').run(data.keys, data.path, data.action);
    }
    return { success: true };
  });

  ipcMain.handle('shortcut:delete', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    db.prepare('DELETE FROM shortcuts WHERE id = ?').run(id);
    return { success: true };
  });
}

module.exports = { register };
