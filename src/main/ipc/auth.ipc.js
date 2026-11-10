const bcrypt = require('bcryptjs');
const { setSession, requireAdmin } = require('../session');

function register(ipcMain, db) {
  ipcMain.handle('auth:login', async (event, data) => {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(data.username);
    if (!user) return { success: false, error: 'User not found' };
    const valid = bcrypt.compareSync(data.password, user.password);
    if (!valid) return { success: false, error: 'Invalid password' };
    setSession(event.sender.id, { id: user.id, username: user.username, role: user.role, branch_name: user.branch_name });
    return { success: true, user: { id: user.id, username: user.username, role: user.role, branch_name: user.branch_name } };
  });

  ipcMain.handle('auth:register', async (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(data.username);
    if (exists) return { success: false, error: 'Username already exists' };
    const hashed = bcrypt.hashSync(data.password, 10);
    const result = db.prepare('INSERT INTO users (username, password, role, branch_name) VALUES (?, ?, ?, ?)').run(data.username, hashed, data.role || 'user', data.branch_name || null);
    if (result.changes === 0) return { success: false, error: 'Registration failed' };
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('auth:changePassword', (event, data) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(data.user_id);
    if (!user) return { success: false, error: 'User not found' };
    if (!bcrypt.compareSync(data.current_password, user.password)) return { success: false, error: 'Current password is incorrect' };
    const hashed = bcrypt.hashSync(data.new_password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, data.user_id);
    return { success: true };
  });

  ipcMain.handle('auth:updateUsername', (event, data) => {
    const exists = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(data.new_username, data.user_id);
    if (exists) return { success: false, error: 'Username already taken' };
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(data.new_username, data.user_id);
    return { success: true, username: data.new_username };
  });

  ipcMain.handle('auth:getUsers', () => {
    return db.prepare('SELECT id, username, role, branch_name, created_at FROM users').all();
  });

  ipcMain.handle('auth:adminUpdateUser', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(data.user_id);
    if (!user) return { success: false, error: 'User not found' };
    db.prepare('UPDATE users SET role = ?, branch_name = ? WHERE id = ?').run(data.role, data.branch_name || null, data.user_id);
    return { success: true };
  });

  ipcMain.handle('auth:adminResetPassword', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(data.user_id);
    if (!user) return { success: false, error: 'User not found' };
    const hashed = bcrypt.hashSync(data.new_password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, data.user_id);
    return { success: true };
  });

  ipcMain.handle('auth:deleteUser', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(data.user_id);
    if (!user) return { success: false, error: 'User not found' };
    if (user.role === 'admin') {
      const adminCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get();
      if (adminCount.c <= 1) return { success: false, error: 'Cannot delete the last admin user' };
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(data.user_id);
    return { success: true };
  });

  ipcMain.handle('auth:resetPasswordByCity', async (event, data) => {
    const answer = (data.answer || '').trim().toLowerCase();
    if (answer !== 'quetta') return { success: false, error: 'Incorrect answer' };
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(data.username);
    if (!user) return { success: false, error: 'User not found' };
    const hashed = bcrypt.hashSync(data.new_password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, user.id);
    return { success: true };
  });

  ipcMain.handle('auth:dailyClosing', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const existing = db.prepare('SELECT id FROM daily_closings WHERE date = ?').get(data.date);
    if (existing) {
      db.prepare('UPDATE daily_closings SET closing_cash = ?, notes = ?, closed_by = ? WHERE date = ?').run(data.closing_cash, data.notes, data.closed_by, data.date);
    } else {
      db.prepare('INSERT INTO daily_closings (date, closing_cash, notes, closed_by) VALUES (?, ?, ?, ?)').run(data.date, data.closing_cash, data.notes, data.closed_by);
    }
    return { success: true };
  });

  ipcMain.handle('auth:getDailyClosings', (event, data) => {
    let query = 'SELECT dc.*, u.username as closed_by_name FROM daily_closings dc LEFT JOIN users u ON dc.closed_by = u.id';
    const params = [];
    if (data?.from && data?.to) {
      query += ' WHERE dc.date BETWEEN ? AND ?';
      params.push(data.from, data.to);
    }
    query += ' ORDER BY dc.date DESC';
    return db.prepare(query).all(...params);
  });
}

module.exports = { register };
