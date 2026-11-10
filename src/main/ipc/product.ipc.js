const { requireAdmin } = require('../session');

function register(ipcMain, db) {
  ipcMain.handle('product:getAll', (event, search) => {
    if (search) {
      return db.prepare("SELECT p.*, w.name as warehouse_name FROM products p LEFT JOIN warehouses w ON p.warehouse_id = w.id WHERE p.name LIKE ? OR p.code LIKE ? ORDER BY p.name").all(`%${search}%`, `%${search}%`);
    }
    return db.prepare('SELECT p.*, w.name as warehouse_name FROM products p LEFT JOIN warehouses w ON p.warehouse_id = w.id ORDER BY p.name').all();
  });

  ipcMain.handle('product:get', (event, id) => {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  });

  ipcMain.handle('product:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    if (data.id) {
      db.prepare('UPDATE products SET name=?, code=?, unit=?, category=?, purchase_price=?, sale_price=?, min_stock=?, warehouse_id=?, is_active=? WHERE id=?').run(data.name, data.code, data.unit || 'PCS', data.category, data.purchase_price || 0, data.sale_price || 0, data.min_stock || 0, data.warehouse_id || null, data.is_active !== undefined ? data.is_active : 1, data.id);
      return { success: true, id: data.id };
    }
    try {
      const result = db.prepare('INSERT INTO products (name, code, unit, category, purchase_price, sale_price, min_stock, warehouse_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(data.name, data.code, data.unit || 'PCS', data.category, data.purchase_price || 0, data.sale_price || 0, data.min_stock || 0, data.warehouse_id || null);
      if (data.warehouse_id) {
        const existing = db.prepare('SELECT id FROM stock WHERE product_id = ? AND warehouse_id = ?').get(result.lastInsertRowid, data.warehouse_id);
        if (!existing) {
          db.prepare('INSERT INTO stock (product_id, warehouse_id, quantity) VALUES (?, ?, 0)').run(result.lastInsertRowid, data.warehouse_id);
        }
      }
      return { success: true, id: result.lastInsertRowid };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('product:delete', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    db.prepare('DELETE FROM stock WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return { success: true };
  });
}

module.exports = { register };
