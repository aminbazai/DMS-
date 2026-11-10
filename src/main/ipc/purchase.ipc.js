const { requireAdmin } = require('../session');

function register(ipcMain, db) {
  ipcMain.handle('purchase:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const insertInvoice = db.prepare(`INSERT INTO purchase_invoices (invoice_no, party_id, date, subtotal, discount, tax, total, paid, balance, payment_type, warehouse_id, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const insertItem = db.prepare(`INSERT INTO purchase_items (invoice_id, product_id, quantity, rate, discount, total) VALUES (?, ?, ?, ?, ?, ?)`);
    const updateStock = db.prepare(`INSERT INTO stock (product_id, warehouse_id, quantity) VALUES (?, ?, ?) ON CONFLICT(product_id, warehouse_id) DO UPDATE SET quantity = quantity + ?`);
    const updatePartyBalance = db.prepare(`UPDATE parties SET opening_balance = opening_balance + ? WHERE id = ?`);

    const transaction = db.transaction(() => {
      const result = insertInvoice.run(data.invoice_no, data.party_id, data.date, data.subtotal, data.discount, data.tax, data.total, data.paid, data.balance, data.payment_type, data.warehouse_id, data.notes, data.created_by);
      const invoiceId = result.lastInsertRowid;

      for (const item of data.items) {
        insertItem.run(invoiceId, item.product_id, item.quantity, item.rate, item.discount || 0, item.total);
        const existing = db.prepare('SELECT id FROM stock WHERE product_id = ? AND (warehouse_id = ? OR warehouse_id IS NULL)').get(item.product_id, data.warehouse_id);
        if (existing) {
          updateStock.run(item.product_id, data.warehouse_id, item.quantity, item.quantity);
        } else {
          db.prepare('INSERT INTO stock (product_id, warehouse_id, quantity) VALUES (?, ?, ?)').run(item.product_id, data.warehouse_id, item.quantity);
        }
      }

      if (data.payment_type === 'credit' && data.balance > 0) {
        updatePartyBalance.run(data.balance, data.party_id);
      }

      return invoiceId;
    });

    try {
      const id = transaction();
      return { success: true, id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('purchase:getInvoices', (event, data) => {
    let query = `SELECT pi.*, p.name as party_name FROM purchase_invoices pi LEFT JOIN parties p ON pi.party_id = p.id`;
    const params = [];
    const conditions = [];
    if (data?.from) { conditions.push('pi.date >= ?'); params.push(data.from); }
    if (data?.to) { conditions.push('pi.date <= ?'); params.push(data.to); }
    if (data?.party_id) { conditions.push('pi.party_id = ?'); params.push(data.party_id); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY pi.created_at DESC LIMIT 100';
    return db.prepare(query).all(...params);
  });

  ipcMain.handle('purchase:getInvoice', (event, id) => {
    const invoice = db.prepare('SELECT pi.*, p.name as party_name FROM purchase_invoices pi LEFT JOIN parties p ON pi.party_id = p.id WHERE pi.id = ?').get(id);
    if (invoice) {
      invoice.items = db.prepare('SELECT pi.*, pr.name as product_name, pr.code as product_code FROM purchase_items pi LEFT JOIN products pr ON pi.product_id = pr.id WHERE pi.invoice_id = ?').all(id);
    }
    return invoice;
  });

  ipcMain.handle('purchase:deleteInvoice', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const transaction = db.transaction(() => {
      const items = db.prepare('SELECT * FROM purchase_items WHERE invoice_id = ?').all(id);
      for (const item of items) {
        db.prepare('UPDATE stock SET quantity = quantity - ? WHERE product_id = ?').run(item.quantity, item.product_id);
      }
      const invoice = db.prepare('SELECT * FROM purchase_invoices WHERE id = ?').get(id);
      if (invoice && invoice.payment_type === 'credit' && invoice.balance > 0) {
        db.prepare('UPDATE parties SET opening_balance = opening_balance - ? WHERE id = ?').run(invoice.balance, invoice.party_id);
      }
      db.prepare('DELETE FROM purchase_items WHERE invoice_id = ?').run(id);
      db.prepare('DELETE FROM purchase_invoices WHERE id = ?').run(id);
    });
    transaction();
    return { success: true };
  });

  ipcMain.handle('purchase:saveReturn', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const insertReturn = db.prepare(`INSERT INTO purchase_returns (return_no, original_invoice_id, party_id, date, total, notes) VALUES (?, ?, ?, ?, ?, ?)`);
    const insertItem = db.prepare(`INSERT INTO purchase_return_items (return_id, product_id, quantity, rate, total) VALUES (?, ?, ?, ?, ?)`);
    const updateStock = db.prepare('UPDATE stock SET quantity = quantity - ? WHERE product_id = ?');
    const updatePartyBalance = db.prepare('UPDATE parties SET opening_balance = opening_balance - ? WHERE id = ?');

    const transaction = db.transaction(() => {
      const result = insertReturn.run(data.return_no, data.original_invoice_id || null, data.party_id, data.date, data.total, data.notes);
      const returnId = result.lastInsertRowid;
      for (const item of data.items) {
        insertItem.run(returnId, item.product_id, item.quantity, item.rate, item.total);
        updateStock.run(item.quantity, item.product_id);
      }
      if (data.total > 0) updatePartyBalance.run(data.total, data.party_id);
      return returnId;
    });

    try {
      const id = transaction();
      return { success: true, id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('purchase:getReturns', (event, data) => {
    let query = `SELECT pr.*, p.name as party_name FROM purchase_returns pr LEFT JOIN parties p ON pr.party_id = p.id`;
    const params = [];
    const conditions = [];
    if (data?.from) { conditions.push('pr.date >= ?'); params.push(data.from); }
    if (data?.to) { conditions.push('pr.date <= ?'); params.push(data.to); }
    if (data?.party_id) { conditions.push('pr.party_id = ?'); params.push(data.party_id); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY pr.created_at DESC';
    return db.prepare(query).all(...params);
  });
}

module.exports = { register };
