const { requireAdmin } = require('../session');

function register(ipcMain, db) {
  // Journal Entries
  ipcMain.handle('account:saveJournal', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const insertEntry = db.prepare('INSERT INTO journal_entries (entry_no, date, description, created_by) VALUES (?, ?, ?, ?)');
    const insertLine = db.prepare('INSERT INTO journal_entry_lines (entry_id, account_type, account_id, debit, credit, narration) VALUES (?, ?, ?, ?, ?, ?)');

    const transaction = db.transaction(() => {
      const result = insertEntry.run(data.entry_no, data.date, data.description, data.created_by);
      const entryId = result.lastInsertRowid;
      for (const line of data.lines) {
        insertLine.run(entryId, line.account_type, line.account_id || null, line.debit || 0, line.credit || 0, line.narration || null);
      }
      return entryId;
    });

    try {
      const id = transaction();
      return { success: true, id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('account:getJournalEntries', (event, from, to) => {
    let query = 'SELECT je.*, u.username as created_by_name FROM journal_entries je LEFT JOIN users u ON je.created_by = u.id';
    const params = [];
    if (from && to) { query += ' WHERE je.date BETWEEN ? AND ?'; params.push(from, to); }
    query += ' ORDER BY je.created_at DESC LIMIT 100';
    return db.prepare(query).all(...params);
  });

  ipcMain.handle('account:getJournalEntry', (event, id) => {
    const entry = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(id);
    if (entry) {
      entry.lines = db.prepare('SELECT * FROM journal_entry_lines WHERE entry_id = ?').all(id);
    }
    return entry;
  });

  // Expense Categories
  ipcMain.handle('account:getExpenseCategories', () => {
    return db.prepare('SELECT * FROM expense_categories ORDER BY name').all();
  });

  ipcMain.handle('account:saveExpenseCategory', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const result = db.prepare('INSERT INTO expense_categories (name) VALUES (?)').run(data.name);
    return { success: true, id: result.lastInsertRowid };
  });

  // Expenses
  ipcMain.handle('account:saveExpense', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    if (data.id) {
      db.prepare('UPDATE expenses SET category_id=?, amount=?, date=?, description=?, payment_mode=?, bank_id=? WHERE id=?').run(data.category_id, data.amount, data.date, data.description, data.payment_mode, data.bank_id || null, data.id);
      return { success: true, id: data.id };
    }
    const result = db.prepare('INSERT INTO expenses (category_id, amount, date, description, payment_mode, bank_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)').run(data.category_id, data.amount, data.date, data.description, data.payment_mode, data.bank_id || null, data.created_by);
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('account:getExpenses', (event, data) => {
    let query = `SELECT e.*, ec.name as category_name FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id`;
    const params = [];
    const conditions = [];
    if (data?.from) { conditions.push('e.date >= ?'); params.push(data.from); }
    if (data?.to) { conditions.push('e.date <= ?'); params.push(data.to); }
    if (data?.category_id) { conditions.push('e.category_id = ?'); params.push(data.category_id); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY e.date DESC, e.created_at DESC';
    return db.prepare(query).all(...params);
  });

  ipcMain.handle('account:deleteExpense', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    return { success: true };
  });

  // Banks
  ipcMain.handle('account:saveBank', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    if (data.id) {
      db.prepare('UPDATE banks SET name=?, account_no=?, branch=?, opening_balance=?, is_active=? WHERE id=?').run(data.name, data.account_no, data.branch, data.opening_balance || 0, data.is_active !== undefined ? data.is_active : 1, data.id);
      return { success: true, id: data.id };
    }
    const result = db.prepare('INSERT INTO banks (name, account_no, branch, opening_balance) VALUES (?, ?, ?, ?)').run(data.name, data.account_no, data.branch, data.opening_balance || 0);
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('account:getBanks', () => {
    return db.prepare(`SELECT b.*, (SELECT COALESCE(SUM(CASE WHEN type='deposit' THEN amount ELSE -amount END), 0) FROM bank_transactions WHERE bank_id = b.id) as transaction_balance FROM banks b ORDER BY b.name`).all();
  });

  ipcMain.handle('account:deleteBank', (event, id) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    db.prepare('DELETE FROM bank_transactions WHERE bank_id = ?').run(id);
    db.prepare('DELETE FROM banks WHERE id = ?').run(id);
    return { success: true };
  });

  ipcMain.handle('account:saveBankTransaction', (event, data) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const result = db.prepare('INSERT INTO bank_transactions (bank_id, type, amount, date, reference, notes) VALUES (?, ?, ?, ?, ?, ?)').run(data.bank_id, data.type, data.amount, data.date, data.reference, data.notes);
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('account:getBankTransactions', (event, bank_id) => {
    return db.prepare('SELECT * FROM bank_transactions WHERE bank_id = ? ORDER BY date DESC, created_at DESC').all(bank_id);
  });

  // Profit & Loss
  ipcMain.handle('account:profitLoss', (event, from, to) => {
    const params = [from, to];
    const sales = db.prepare(`SELECT COALESCE(SUM(total), 0) as total FROM sale_invoices WHERE date BETWEEN ? AND ?`).get(...params);
    const saleReturns = db.prepare(`SELECT COALESCE(SUM(total), 0) as total FROM sale_returns WHERE date BETWEEN ? AND ?`).get(...params);
    const purchases = db.prepare(`SELECT COALESCE(SUM(total), 0) as total FROM purchase_invoices WHERE date BETWEEN ? AND ?`).get(...params);
    const expenses = db.prepare(`SELECT e.*, ec.name as category_name FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id WHERE e.date BETWEEN ? AND ? ORDER BY e.date DESC`).all(...params);
    const expenseTotals = db.prepare(`SELECT ec.name, SUM(e.amount) as total FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id WHERE e.date BETWEEN ? AND ? GROUP BY e.category_id ORDER BY total DESC`).all(...params);

    const revenue = sales.total - saleReturns.total;
    const cogs = purchases.total;
    const grossProfit = revenue - cogs;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    return { revenue, cogs, grossProfit, totalExpenses, netProfit, expenses, expenseTotals };
  });

  // Trial Balance
  ipcMain.handle('account:trialBalance', (event, from, to) => {
    const accounts = [];
    const partyDebits = db.prepare("SELECT id, name, 'Party' as type, opening_balance as balance, balance_type FROM parties").all();
    partyDebits.forEach(p => {
      accounts.push({
        name: p.name,
        type: `${p.balance_type === 'debit' ? 'Supplier' : 'Customer'}`,
        opening: p.balance_type === 'debit' ? p.balance : 0,
        openingCredit: p.balance_type === 'credit' ? p.balance : 0,
      });
    });

    const banks = db.prepare('SELECT name, opening_balance FROM banks').all();
    banks.forEach(b => accounts.push({ name: `Bank - ${b.name}`, type: 'Bank', opening: b.opening_balance, openingCredit: 0 }));

    const sales = db.prepare(`SELECT COALESCE(SUM(total), 0) as total FROM sale_invoices WHERE date BETWEEN ? AND ?`).get(from, to);
    const purchases = db.prepare(`SELECT COALESCE(SUM(total), 0) as total FROM purchase_invoices WHERE date BETWEEN ? AND ?`).get(from, to);
    const expenses = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date BETWEEN ? AND ?`).get(from, to);

    accounts.push({ name: 'Sales Revenue', type: 'Revenue', opening: 0, openingCredit: sales.total });
    accounts.push({ name: 'Purchases', type: 'Expense', opening: purchases.total, openingCredit: 0 });
    accounts.push({ name: 'Expenses', type: 'Expense', opening: expenses.total, openingCredit: 0 });

    return accounts;
  });

  // Payable / Receivable
  ipcMain.handle('account:payableReceivable', () => {
    const suppliers = db.prepare("SELECT id, name, opening_balance as balance FROM parties WHERE type = 'supplier' AND opening_balance > 0 ORDER BY opening_balance DESC").all();
    const customers = db.prepare("SELECT id, name, opening_balance as balance FROM parties WHERE type = 'customer' AND opening_balance > 0 ORDER BY opening_balance DESC").all();
    return { suppliers, customers };
  });

  ipcMain.handle('account:agingReport', (event, type) => {
    const parties = db.prepare("SELECT id, name, opening_balance as balance FROM parties WHERE type = ? AND opening_balance > 0").all(type);
    const today = new Date().toISOString().split('T')[0];
    return parties.map(p => {
      const lastInvoice = db.prepare(`SELECT date FROM ${type === 'supplier' ? 'purchase_invoices' : 'sale_invoices'} WHERE party_id = ? ORDER BY date DESC LIMIT 1`).get(p.id);
      const days = lastInvoice ? Math.floor((new Date(today) - new Date(lastInvoice.date)) / (1000 * 60 * 60 * 24)) : 0;
      let aging;
      if (days <= 30) aging = '0-30';
      else if (days <= 60) aging = '30-60';
      else if (days <= 90) aging = '60-90';
      else aging = '90+';
      return { ...p, days, aging };
    });
  });
}

module.exports = { register };
