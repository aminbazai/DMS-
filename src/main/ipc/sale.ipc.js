const { requireAdmin } = require('../session');

function register(ipcMain, db) {
  ipcMain.handle('sale:save', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const insertInvoice = db.prepare(`INSERT INTO sale_invoices (invoice_no, party_id, salesman_id, counter_id, date, subtotal, discount, tax, total, paid, balance, payment_type, warehouse_id, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const insertItem = db.prepare(`INSERT INTO sale_items (invoice_id, product_id, quantity, rate, discount, total) VALUES (?, ?, ?, ?, ?, ?)`);
    const updateStock = db.prepare('UPDATE stock SET quantity = quantity - ? WHERE product_id = ?');
    const updatePartyBalance = db.prepare('UPDATE parties SET opening_balance = opening_balance - ? WHERE id = ? AND type = ?');
    const insertCash = db.prepare('INSERT INTO cash_transactions (type, party_id, amount, date, reference, counter_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)');

    const transaction = db.transaction(() => {
      const result = insertInvoice.run(data.invoice_no, data.party_id, data.salesman_id || null, data.counter_id || null, data.date, data.subtotal, data.discount, data.tax, data.total, data.paid, data.balance, data.payment_type, data.warehouse_id, data.notes, data.created_by);
      const invoiceId = result.lastInsertRowid;

      for (const item of data.items) {
        insertItem.run(invoiceId, item.product_id, item.quantity, item.rate, item.discount || 0, item.total);
        updateStock.run(item.quantity, item.product_id);
      }

      if (data.payment_type === 'credit' && data.balance > 0) {
        updatePartyBalance.run(data.balance, data.party_id, 'customer');
      }

      if (data.paid > 0) {
        insertCash.run('receipt', data.party_id, data.paid, data.date, `Sale Inv: ${data.invoice_no}`, data.counter_id, data.created_by);
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

  ipcMain.handle('sale:getInvoices', (event, data) => {
    let query = `SELECT si.*, p.name as party_name, s.name as salesman_name, c.name as counter_name FROM sale_invoices si LEFT JOIN parties p ON si.party_id = p.id LEFT JOIN salesmen s ON si.salesman_id = s.id LEFT JOIN counters c ON si.counter_id = c.id`;
    const params = [];
    const conditions = [];
    if (data?.from) { conditions.push('si.date >= ?'); params.push(data.from); }
    if (data?.to) { conditions.push('si.date <= ?'); params.push(data.to); }
    if (data?.party_id) { conditions.push('si.party_id = ?'); params.push(data.party_id); }
    if (data?.salesman_id) { conditions.push('si.salesman_id = ?'); params.push(data.salesman_id); }
    if (data?.counter_id) { conditions.push('si.counter_id = ?'); params.push(data.counter_id); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY si.created_at DESC LIMIT 100';
    return db.prepare(query).all(...params);
  });

  ipcMain.handle('sale:getInvoice', (event, id) => {
    const invoice = db.prepare('SELECT si.*, p.name as party_name, p.address as party_address, p.phone as party_phone, s.name as salesman_name, c.name as counter_name FROM sale_invoices si LEFT JOIN parties p ON si.party_id = p.id LEFT JOIN salesmen s ON si.salesman_id = s.id LEFT JOIN counters c ON si.counter_id = c.id WHERE si.id = ?').get(id);
    if (invoice) {
      invoice.items = db.prepare('SELECT si.*, pr.name as product_name, pr.code as product_code FROM sale_items si LEFT JOIN products pr ON si.product_id = pr.id WHERE si.invoice_id = ?').all(id);
    }
    return invoice;
  });

  ipcMain.handle('sale:deleteInvoice', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const transaction = db.transaction(() => {
      const items = db.prepare('SELECT * FROM sale_items WHERE invoice_id = ?').all(id);
      for (const item of items) {
        db.prepare('UPDATE stock SET quantity = quantity + ? WHERE product_id = ?').run(item.quantity, item.product_id);
      }
      const invoice = db.prepare('SELECT * FROM sale_invoices WHERE id = ?').get(id);
      if (invoice && invoice.payment_type === 'credit' && invoice.balance > 0) {
        db.prepare('UPDATE parties SET opening_balance = opening_balance + ? WHERE id = ?').run(invoice.balance, invoice.party_id);
      }
      db.prepare('DELETE FROM sale_items WHERE invoice_id = ?').run(id);
      db.prepare('DELETE FROM sale_invoices WHERE id = ?').run(id);
    });
    transaction();
    return { success: true };
  });

  ipcMain.handle('sale:saveReturn', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const insertReturn = db.prepare(`INSERT INTO sale_returns (return_no, original_invoice_id, party_id, date, total, notes) VALUES (?, ?, ?, ?, ?, ?)`);
    const insertItem = db.prepare(`INSERT INTO sale_return_items (return_id, product_id, quantity, rate, total) VALUES (?, ?, ?, ?, ?)`);
    const updateStock = db.prepare('UPDATE stock SET quantity = quantity + ? WHERE product_id = ?');
    const updatePartyBalance = db.prepare('UPDATE parties SET opening_balance = opening_balance + ? WHERE id = ? AND type = ?');

    const transaction = db.transaction(() => {
      const result = insertReturn.run(data.return_no, data.original_invoice_id || null, data.party_id, data.date, data.total, data.notes);
      const returnId = result.lastInsertRowid;
      for (const item of data.items) {
        insertItem.run(returnId, item.product_id, item.quantity, item.rate, item.total);
        updateStock.run(item.quantity, item.product_id);
      }
      if (data.total > 0) updatePartyBalance.run(data.total, data.party_id, 'customer');
      return returnId;
    });

    try {
      const id = transaction();
      return { success: true, id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('sale:getReturns', (event, data) => {
    let query = `SELECT sr.*, p.name as party_name FROM sale_returns sr LEFT JOIN parties p ON sr.party_id = p.id`;
    const params = [];
    const conditions = [];
    if (data?.from) { conditions.push('sr.date >= ?'); params.push(data.from); }
    if (data?.to) { conditions.push('sr.date <= ?'); params.push(data.to); }
    if (data?.party_id) { conditions.push('sr.party_id = ?'); params.push(data.party_id); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY sr.created_at DESC';
    return db.prepare(query).all(...params);
  });
}

module.exports = { register };
