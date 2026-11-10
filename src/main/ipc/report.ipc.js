function register(ipcMain, db) {
  ipcMain.handle('report:sale', (event, data) => {
    let query;
    const params = [data.from, data.to];

    switch (data.type) {
      case 'customer':
        query = `SELECT si.invoice_no, si.date, p.name as party_name, si.total, si.paid, si.balance FROM sale_invoices si LEFT JOIN parties p ON si.party_id = p.id WHERE si.date BETWEEN ? AND ?`;
        if (data.party_id) { query += ' AND si.party_id = ?'; params.push(data.party_id); }
        query += ' ORDER BY si.date DESC';
        break;
      case 'product':
        query = `SELECT si.date, si.invoice_no, p.name as product_name, si2.quantity, si2.rate, si2.total FROM sale_items si2 LEFT JOIN sale_invoices si ON si2.invoice_id = si.id LEFT JOIN products p ON si2.product_id = p.id WHERE si.date BETWEEN ? AND ?`;
        if (data.product_id) { query += ' AND si2.product_id = ?'; params.push(data.product_id); }
        query += ' ORDER BY si.date DESC';
        break;
      case 'salesman':
        query = `SELECT si.invoice_no, si.date, s.name as salesman_name, si.total FROM sale_invoices si LEFT JOIN salesmen s ON si.salesman_id = s.id WHERE si.date BETWEEN ? AND ?`;
        if (data.salesman_id) { query += ' AND si.salesman_id = ?'; params.push(data.salesman_id); }
        query += ' ORDER BY si.date DESC';
        break;
      case 'counter':
        query = `SELECT si.invoice_no, si.date, c.name as counter_name, si.total FROM sale_invoices si LEFT JOIN counters c ON si.counter_id = c.id WHERE si.date BETWEEN ? AND ?`;
        if (data.counter_id) { query += ' AND si.counter_id = ?'; params.push(data.counter_id); }
        query += ' ORDER BY si.date DESC';
        break;
      default:
        query = `SELECT si.invoice_no, si.date, p.name as party_name, si.total, si.paid, si.balance, s.name as salesman_name, c.name as counter_name FROM sale_invoices si LEFT JOIN parties p ON si.party_id = p.id LEFT JOIN salesmen s ON si.salesman_id = s.id LEFT JOIN counters c ON si.counter_id = c.id WHERE si.date BETWEEN ? AND ? ORDER BY si.date DESC`;
    }

    return db.prepare(query).all(...params);
  });

  ipcMain.handle('report:dailyActivity', (event, data) => {
    const from = data.from;
    const to = data.to;
    const result = {};

    if (!data.type || data.type === 'supplier' || data.type === 'all') {
      result.suppliers = db.prepare(`SELECT pi.invoice_no, pi.date, p.name as party_name, pi.total FROM purchase_invoices pi LEFT JOIN parties p ON pi.party_id = p.id WHERE pi.date BETWEEN ? AND ? ORDER BY pi.date DESC`).all(from, to);
      result.supplierReturns = db.prepare(`SELECT pr.return_no, pr.date, p.name as party_name, pr.total FROM purchase_returns pr LEFT JOIN parties p ON pr.party_id = p.id WHERE pr.date BETWEEN ? AND ? ORDER BY pr.date DESC`).all(from, to);
    }

    if (!data.type || data.type === 'customer' || data.type === 'all') {
      result.customers = db.prepare(`SELECT si.invoice_no, si.date, p.name as party_name, si.total FROM sale_invoices si LEFT JOIN parties p ON si.party_id = p.id WHERE si.date BETWEEN ? AND ? ORDER BY si.date DESC`).all(from, to);
      result.customerReturns = db.prepare(`SELECT sr.return_no, sr.date, p.name as party_name, sr.total FROM sale_returns sr LEFT JOIN parties p ON sr.party_id = p.id WHERE sr.date BETWEEN ? AND ? ORDER BY sr.date DESC`).all(from, to);
    }

    if (!data.type || data.type === 'bank' || data.type === 'all') {
      result.bankTxns = db.prepare(`SELECT bt.*, b.name as bank_name FROM bank_transactions bt LEFT JOIN banks b ON bt.bank_id = b.id WHERE bt.date BETWEEN ? AND ? ORDER BY bt.date DESC`).all(from, to);
    }

    if (!data.type || data.type === 'expense' || data.type === 'all') {
      result.expenses = db.prepare(`SELECT e.*, ec.name as category_name FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id WHERE e.date BETWEEN ? AND ? ORDER BY e.date DESC`).all(from, to);
    }

    if (!data.type || data.type === 'stock' || data.type === 'all') {
      result.stockAdjustments = db.prepare(`SELECT sa.*, p.name as product_name FROM stock_adjustments sa LEFT JOIN products p ON sa.product_id = p.id WHERE sa.date BETWEEN ? AND ? ORDER BY sa.date DESC`).all(from, to);
      result.stockTransfers = db.prepare(`SELECT st.*, p.name as product_name, fw.name as from_warehouse, tw.name as to_warehouse FROM stock_transfers st LEFT JOIN products p ON st.product_id = p.id LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id WHERE st.date BETWEEN ? AND ? ORDER BY st.date DESC`).all(from, to);
    }

    if (!data.type || data.type === 'profit' || data.type === 'all') {
      const salesTotal = db.prepare(`SELECT COALESCE(SUM(total), 0) as total FROM sale_invoices WHERE date BETWEEN ? AND ?`).get(from, to);
      const purchaseTotal = db.prepare(`SELECT COALESCE(SUM(total), 0) as total FROM purchase_invoices WHERE date BETWEEN ? AND ?`).get(from, to);
      const expenseTotal = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date BETWEEN ? AND ?`).get(from, to);
      result.profitSummary = { sales: salesTotal.total, purchases: purchaseTotal.total, expenses: expenseTotal.total };
    }

    return result;
  });

  ipcMain.handle('report:stock', (event, warehouse_id) => {
    let query = `SELECT p.id, p.name, p.code, p.unit, p.purchase_price, p.sale_price, p.min_stock, p.category, p.warehouse_id, w.name as warehouse_name, COALESCE(s.quantity, 0) as quantity FROM products p LEFT JOIN warehouses w ON p.warehouse_id = w.id LEFT JOIN stock s ON s.product_id = p.id`;
    const params = [];
    if (warehouse_id) {
      query += ' WHERE (p.warehouse_id = ? OR s.warehouse_id = ?)';
      params.push(warehouse_id, warehouse_id);
    }
    query += ' ORDER BY p.name';
    const stock = db.prepare(query).all(...params);
    const lowStock = stock.filter(s => s.min_stock > 0 && s.quantity <= s.min_stock);
    const totalValue = stock.reduce((sum, s) => sum + (s.quantity * s.purchase_price), 0);
    return { stock, lowStock, totalValue };
  });
}

module.exports = { register };
