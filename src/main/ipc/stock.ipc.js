const { requireAdmin } = require('../session');

function register(ipcMain, db) {
  ipcMain.handle('stock:get', (event, product_id, warehouse_id) => {
    const params = [product_id];
    let query = 'SELECT * FROM stock WHERE product_id = ?';
    if (warehouse_id) { query += ' AND warehouse_id = ?'; params.push(warehouse_id); }
    return db.prepare(query).get(...params) || { quantity: 0 };
  });

  ipcMain.handle('stock:getAll', (event, warehouse_id) => {
    let query = `SELECT s.*, p.name as product_name, p.code as product_code, p.unit, p.purchase_price, p.sale_price, p.min_stock, w.name as warehouse_name FROM stock s LEFT JOIN products p ON s.product_id = p.id LEFT JOIN warehouses w ON s.warehouse_id = w.id`;
    const params = [];
    if (warehouse_id) { query += ' WHERE s.warehouse_id = ?'; params.push(warehouse_id); }
    query += ' ORDER BY p.name';
    return db.prepare(query).all(...params);
  });

  ipcMain.handle('stock:adjustment', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const insertAdjustment = db.prepare('INSERT INTO stock_adjustments (product_id, warehouse_id, adjustment_type, quantity, reason, date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const updateStock = db.prepare(`INSERT INTO stock (product_id, warehouse_id, quantity) VALUES (?, ?, ?) ON CONFLICT(product_id, warehouse_id) DO UPDATE SET quantity = quantity + ?`);

    const transaction = db.transaction(() => {
      const qty = data.adjustment_type === 'add' ? data.quantity : -data.quantity;
      const existing = db.prepare('SELECT id FROM stock WHERE product_id = ? AND (warehouse_id = ? OR warehouse_id IS NULL)').get(data.product_id, data.warehouse_id);
      if (existing) {
        updateStock.run(data.product_id, data.warehouse_id, qty, qty);
      } else {
        db.prepare('INSERT INTO stock (product_id, warehouse_id, quantity) VALUES (?, ?, ?)').run(data.product_id, data.warehouse_id, qty);
      }
      insertAdjustment.run(data.product_id, data.warehouse_id, data.adjustment_type, data.quantity, data.reason, data.date, data.created_by);
    });

    transaction();
    return { success: true };
  });

  ipcMain.handle('stock:getAdjustments', (event, data) => {
    let query = `SELECT sa.*, p.name as product_name, p.code as product_code, w.name as warehouse_name FROM stock_adjustments sa LEFT JOIN products p ON sa.product_id = p.id LEFT JOIN warehouses w ON sa.warehouse_id = w.id`;
    const params = [];
    const conditions = [];
    if (data?.from) { conditions.push('sa.date >= ?'); params.push(data.from); }
    if (data?.to) { conditions.push('sa.date <= ?'); params.push(data.to); }
    if (data?.product_id) { conditions.push('sa.product_id = ?'); params.push(data.product_id); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY sa.created_at DESC';
    return db.prepare(query).all(...params);
  });

  ipcMain.handle('stock:transfer', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const insertTransfer = db.prepare('INSERT INTO stock_transfers (product_id, from_warehouse_id, to_warehouse_id, quantity, date, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const deductFrom = db.prepare('UPDATE stock SET quantity = quantity - ? WHERE product_id = ? AND warehouse_id = ?');
    const addTo = db.prepare(`INSERT INTO stock (product_id, warehouse_id, quantity) VALUES (?, ?, ?) ON CONFLICT(product_id, warehouse_id) DO UPDATE SET quantity = quantity + ?`);

    const transaction = db.transaction(() => {
      insertTransfer.run(data.product_id, data.from_warehouse_id, data.to_warehouse_id, data.quantity, data.date, data.notes, data.created_by);
      deductFrom.run(data.quantity, data.product_id, data.from_warehouse_id);
      addTo.run(data.product_id, data.to_warehouse_id, data.quantity, data.quantity);
    });

    transaction();
    return { success: true };
  });

  ipcMain.handle('stock:getTransfers', (event, data) => {
    let query = `SELECT st.*, p.name as product_name, fw.name as from_warehouse_name, tw.name as to_warehouse_name FROM stock_transfers st LEFT JOIN products p ON st.product_id = p.id LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id`;
    const params = [];
    const conditions = [];
    if (data?.from) { conditions.push('st.date >= ?'); params.push(data.from); }
    if (data?.to) { conditions.push('st.date <= ?'); params.push(data.to); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY st.created_at DESC';
    return db.prepare(query).all(...params);
  });

  // Warehouse
  ipcMain.handle('warehouse:getAll', () => {
    return db.prepare('SELECT * FROM warehouses WHERE is_active = 1 ORDER BY name').all();
  });

  ipcMain.handle('warehouse:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    if (data.id) {
      db.prepare('UPDATE warehouses SET name=?, location=?, is_active=? WHERE id=?').run(data.name, data.location, data.is_active !== undefined ? data.is_active : 1, data.id);
    } else {
      db.prepare('INSERT INTO warehouses (name, location) VALUES (?, ?)').run(data.name, data.location);
    }
    return { success: true };
  });

  ipcMain.handle('warehouse:delete', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    db.prepare('DELETE FROM warehouses WHERE id = ?').run(id);
    return { success: true };
  });
}

module.exports = { register };
