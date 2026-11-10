const { requireAdmin } = require('../session');

function register(ipcMain, db) {
  // Salesmen
  ipcMain.handle('salesman:getAll', () => {
    return db.prepare('SELECT * FROM salesmen WHERE is_active = 1 ORDER BY name').all();
  });

  ipcMain.handle('salesman:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    if (data.id) {
      db.prepare('UPDATE salesmen SET name=?, phone=?, area=?, commission_rate=?, is_active=? WHERE id=?').run(data.name, data.phone, data.area, data.commission_rate || 0, data.is_active !== undefined ? data.is_active : 1, data.id);
      return { success: true, id: data.id };
    }
    const result = db.prepare('INSERT INTO salesmen (name, phone, area, commission_rate) VALUES (?, ?, ?, ?)').run(data.name, data.phone, data.area, data.commission_rate || 0);
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('salesman:delete', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    db.prepare('DELETE FROM salesmen WHERE id = ?').run(id);
    return { success: true };
  });

  // Counters
  ipcMain.handle('counter:getAll', () => {
    return db.prepare('SELECT * FROM counters WHERE is_active = 1 ORDER BY name').all();
  });

  ipcMain.handle('counter:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    if (data.id) {
      db.prepare('UPDATE counters SET name=?, location=?, is_active=? WHERE id=?').run(data.name, data.location, data.is_active !== undefined ? data.is_active : 1, data.id);
      return { success: true, id: data.id };
    }
    const result = db.prepare('INSERT INTO counters (name, location) VALUES (?, ?)').run(data.name, data.location);
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('counter:delete', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    db.prepare('DELETE FROM counters WHERE id = ?').run(id);
    return { success: true };
  });

  // Employees
  ipcMain.handle('employee:getAll', () => {
    return db.prepare('SELECT * FROM employees WHERE is_active = 1 ORDER BY name').all();
  });

  ipcMain.handle('employee:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    if (data.id) {
      db.prepare('UPDATE employees SET name=?, designation=?, phone=?, salary=?, join_date=?, is_active=? WHERE id=?').run(data.name, data.designation, data.phone, data.salary || 0, data.join_date, data.is_active !== undefined ? data.is_active : 1, data.id);
      return { success: true, id: data.id };
    }
    const result = db.prepare('INSERT INTO employees (name, designation, phone, salary, join_date) VALUES (?, ?, ?, ?, ?)').run(data.name, data.designation, data.phone, data.salary || 0, data.join_date);
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('employee:delete', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    db.prepare('DELETE FROM employees WHERE id = ?').run(id);
    return { success: true };
  });

  // Attendance
  ipcMain.handle('attendance:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const existing = db.prepare('SELECT id FROM attendance WHERE employee_id = ? AND date = ?').get(data.employee_id, data.date);
    if (existing) {
      db.prepare('UPDATE attendance SET status=?, check_in=?, check_out=?, notes=? WHERE id=?').run(data.status, data.check_in, data.check_out, data.notes, existing.id);
    } else {
      db.prepare('INSERT INTO attendance (employee_id, date, status, check_in, check_out, notes) VALUES (?, ?, ?, ?, ?, ?)').run(data.employee_id, data.date, data.status, data.check_in, data.check_out, data.notes);
    }
    return { success: true };
  });

  ipcMain.handle('attendance:get', (event, data) => {
    let query = `SELECT a.*, e.name as employee_name FROM attendance a LEFT JOIN employees e ON a.employee_id = e.id`;
    const params = [];
    const conditions = [];
    if (data?.employee_id) { conditions.push('a.employee_id = ?'); params.push(data.employee_id); }
    if (data?.from) { conditions.push('a.date >= ?'); params.push(data.from); }
    if (data?.to) { conditions.push('a.date <= ?'); params.push(data.to); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY a.date DESC';
    return db.prepare(query).all(...params);
  });

  // Currencies
  ipcMain.handle('currency:getAll', () => {
    return db.prepare('SELECT * FROM currencies ORDER BY is_default DESC, name ASC').all();
  });

  ipcMain.handle('currency:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    if (data.id) {
      db.prepare('UPDATE currencies SET name=?, symbol=?, exchange_rate=?, is_default=? WHERE id=?').run(data.name, data.symbol, data.exchange_rate || 1, data.is_default || 0, data.id);
    } else {
      if (data.is_default) db.prepare('UPDATE currencies SET is_default = 0').run();
      const result = db.prepare('INSERT INTO currencies (name, symbol, exchange_rate, is_default) VALUES (?, ?, ?, ?)').run(data.name, data.symbol, data.exchange_rate || 1, data.is_default || 0);
      return { success: true, id: result.lastInsertRowid };
    }
    return { success: true };
  });

  ipcMain.handle('currency:setDefault', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    db.prepare('UPDATE currencies SET is_default = 0').run();
    db.prepare('UPDATE currencies SET is_default = 1 WHERE id = ?').run(id);
    return { success: true };
  });

  // General Account Info
  ipcMain.handle('generalInfo:get', () => {
    return db.prepare('SELECT * FROM general_account_info LIMIT 1').get() || {};
  });

  ipcMain.handle('generalInfo:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const existing = db.prepare('SELECT id FROM general_account_info LIMIT 1').get();
    if (existing) {
      db.prepare('UPDATE general_account_info SET company_name=?, address=?, phone=?, email=?, ntn=?, strn=?, logo_path=?, financial_year_start=?, currency_id=?, idle_timeout=? WHERE id=?').run(data.company_name, data.address, data.phone, data.email, data.ntn, data.strn, data.logo_path, data.financial_year_start, data.currency_id || null, data.idle_timeout ?? 0, existing.id);
    } else {
      db.prepare('INSERT INTO general_account_info (company_name, address, phone, email, ntn, strn, logo_path, financial_year_start, currency_id, idle_timeout) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(data.company_name, data.address, data.phone, data.email, data.ntn, data.strn, data.logo_path, data.financial_year_start, data.currency_id || null, data.idle_timeout ?? 0);
    }
    return { success: true };
  });

  // Settings
  ipcMain.handle('settings:get', () => {
    return db.prepare('SELECT * FROM general_account_info LIMIT 1').get() || {};
  });

  ipcMain.handle('settings:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const existing = db.prepare('SELECT id FROM general_account_info LIMIT 1').get();
    if (existing) {
      db.prepare('UPDATE general_account_info SET company_name=?, address=?, phone=?, email=?, ntn=?, strn=?, logo_path=?, financial_year_start=?, currency_id=?, idle_timeout=? WHERE id=?').run(data.company_name, data.address, data.phone, data.email, data.ntn, data.strn, data.logo_path, data.financial_year_start, data.currency_id || null, data.idle_timeout ?? 0, existing.id);
    } else {
      db.prepare('INSERT INTO general_account_info (company_name, address, phone, email, ntn, strn, logo_path, financial_year_start, currency_id, idle_timeout) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(data.company_name, data.address, data.phone, data.email, data.ntn, data.strn, data.logo_path, data.financial_year_start, data.currency_id || null, data.idle_timeout ?? 0);
    }
    return { success: true };
  });

  // Notifications
  ipcMain.handle('notification:getAll', () => {
    return db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20').all();
  });

  ipcMain.handle('notification:markRead', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    return { success: true };
  });

  // Dashboard
  ipcMain.handle('dashboard:getData', () => {
    const today = new Date().toISOString().split('T')[0];

    const todayPurchase = db.prepare(`SELECT COALESCE(SUM(total), 0) as amount, COALESCE(SUM((SELECT COALESCE(SUM(quantity), 0) FROM purchase_items WHERE invoice_id = pi.id)), 0) as qty FROM purchase_invoices pi WHERE date = ?`).get(today);
    const todaySale = db.prepare(`SELECT COALESCE(SUM(total), 0) as amount, COALESCE(SUM((SELECT COALESCE(SUM(quantity), 0) FROM sale_items WHERE invoice_id = si.id)), 0) as qty FROM sale_invoices si WHERE date = ?`).get(today);
    const stockData = db.prepare(`SELECT COALESCE(SUM(s.quantity * p.purchase_price), 0) as amount, COALESCE(SUM(s.quantity), 0) as qty FROM stock s LEFT JOIN products p ON s.product_id = p.id`).get();
    const totalPayable = db.prepare("SELECT COALESCE(SUM(opening_balance), 0) as total FROM parties WHERE type = 'supplier' AND balance_type = 'debit'").get();
    const totalReceivable = db.prepare("SELECT COALESCE(SUM(opening_balance), 0) as total FROM parties WHERE type = 'customer' AND balance_type = 'debit'").get();
    const cashInHand = db.prepare(`SELECT COALESCE(SUM(CASE WHEN type='receipt' THEN amount ELSE -amount END), 0) as total FROM cash_transactions`).get();
    const expenseCash = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE payment_mode = 'cash'").get();
    const cashBalance = (cashInHand.total || 0) - (expenseCash.total || 0);

    const unreadNotifications = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0').get();

    return {
      todayPurchase: { amount: todayPurchase.amount, qty: todayPurchase.qty },
      todaySale: { amount: todaySale.amount, qty: todaySale.qty },
      availableStock: { amount: stockData.amount, qty: stockData.qty },
      totalPayable: totalPayable.total,
      totalReceivable: totalReceivable.total,
      cashInHand: cashBalance,
      unreadNotifications: unreadNotifications.count,
    };
  });
}

module.exports = { register };
