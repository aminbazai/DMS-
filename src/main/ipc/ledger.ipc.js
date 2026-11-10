function register(ipcMain, db) {
  ipcMain.handle('ledger:supplier', (event, party_id, from, to) => {
    const party = db.prepare('SELECT * FROM parties WHERE id = ?').get(party_id);
    if (!party) return { opening_balance: 0, transactions: [] };

    let transactions = [];
    const params = [party_id];
    let dateFilter = '';
    if (from && to) { dateFilter = ' AND date BETWEEN ? AND ?'; params.push(from, to); }

    const purchases = db.prepare(`SELECT date, invoice_no as ref, total as debit, 0 as credit FROM purchase_invoices WHERE party_id = ?${dateFilter} ORDER BY date`).all(...params);
    purchases.forEach(p => transactions.push({ date: p.date, description: `Purchase - ${p.ref}`, debit: p.debit, credit: p.credit }));

    const returns = db.prepare(`SELECT date, return_no as ref, total as credit, 0 as debit FROM purchase_returns WHERE party_id = ?${dateFilter} ORDER BY date`).all(...params);
    returns.forEach(r => transactions.push({ date: r.date, description: `Purchase Return - ${r.ref}`, debit: r.debit, credit: r.credit }));

    const cashPayments = db.prepare(`SELECT date, reference, amount FROM cash_transactions WHERE party_id = ? AND type = 'payment'${dateFilter ? ' AND date BETWEEN ? AND ?' : ''} ORDER BY date`).all(...params);
    cashPayments.forEach(c => transactions.push({ date: c.date, description: `Payment - ${c.reference || ''}`, debit: 0, credit: c.amount }));

    transactions.sort((a, b) => a.date.localeCompare(b.date));

    let runningBalance = party.balance_type === 'debit' ? party.opening_balance : -party.opening_balance;
    transactions = transactions.map(t => {
      runningBalance = runningBalance + t.debit - t.credit;
      return { ...t, balance: runningBalance };
    });

    return { opening_balance: party.balance_type === 'debit' ? party.opening_balance : -party.opening_balance, transactions };
  });

  ipcMain.handle('ledger:customer', (event, party_id, from, to) => {
    const party = db.prepare('SELECT * FROM parties WHERE id = ?').get(party_id);
    if (!party) return { opening_balance: 0, transactions: [] };

    let transactions = [];
    const params = [party_id];
    let dateFilter = '';
    if (from && to) { dateFilter = ' AND date BETWEEN ? AND ?'; params.push(from, to); }

    const sales = db.prepare(`SELECT date, invoice_no as ref, total as debit, 0 as credit FROM sale_invoices WHERE party_id = ?${dateFilter} ORDER BY date`).all(...params);
    sales.forEach(s => transactions.push({ date: s.date, description: `Sale - ${s.ref}`, debit: s.debit, credit: s.credit }));

    const returns = db.prepare(`SELECT date, return_no as ref, total as credit, 0 as debit FROM sale_returns WHERE party_id = ?${dateFilter} ORDER BY date`).all(...params);
    returns.forEach(r => transactions.push({ date: r.date, description: `Sale Return - ${r.ref}`, debit: r.debit, credit: r.credit }));

    const cashReceipts = db.prepare(`SELECT date, reference, amount FROM cash_transactions WHERE party_id = ? AND type = 'receipt'${dateFilter ? ' AND date BETWEEN ? AND ?' : ''} ORDER BY date`).all(...params);
    cashReceipts.forEach(c => transactions.push({ date: c.date, description: `Receipt - ${c.reference || ''}`, debit: 0, credit: c.amount }));

    transactions.sort((a, b) => a.date.localeCompare(b.date));

    let runningBalance = party.balance_type === 'debit' ? party.opening_balance : -party.opening_balance;
    transactions = transactions.map(t => {
      runningBalance = runningBalance + t.debit - t.credit;
      return { ...t, balance: runningBalance };
    });

    return { opening_balance: party.balance_type === 'debit' ? party.opening_balance : -party.opening_balance, transactions };
  });

  ipcMain.handle('ledger:bank', (event, bank_id, from, to) => {
    const bank = db.prepare('SELECT * FROM banks WHERE id = ?').get(bank_id);
    if (!bank) return { opening_balance: 0, transactions: [] };

    let transactions = [];
    const params = [bank_id];
    let dateFilter = '';
    if (from && to) { dateFilter = ' AND date BETWEEN ? AND ?'; params.push(from, to); }

    const txns = db.prepare(`SELECT date, type, amount, reference, notes FROM bank_transactions WHERE bank_id = ?${dateFilter} ORDER BY date`).all(...params);
    txns.forEach(t => {
      transactions.push({
        date: t.date,
        description: `${t.type === 'deposit' ? 'Deposit' : 'Withdrawal'} - ${t.reference || ''} ${t.notes || ''}`,
        debit: t.type === 'deposit' ? t.amount : 0,
        credit: t.type === 'withdrawal' ? t.amount : 0,
      });
    });

    transactions.sort((a, b) => a.date.localeCompare(b.date));
    let runningBalance = bank.opening_balance;
    transactions = transactions.map(t => {
      runningBalance = runningBalance + t.debit - t.credit;
      return { ...t, balance: runningBalance };
    });

    return { opening_balance: bank.opening_balance, transactions };
  });

  ipcMain.handle('ledger:cash', (event, from, to) => {
    let transactions = [];
    const params = [];
    let dateFilter = '';
    if (from && to) { dateFilter = ' WHERE date BETWEEN ? AND ?'; params.push(from, to); }

    const cashTxns = db.prepare(`SELECT date, type, amount, reference, notes FROM cash_transactions${dateFilter} ORDER BY date`).all(...params);
    cashTxns.forEach(t => {
      transactions.push({
        date: t.date,
        description: `${t.type === 'receipt' ? 'Receipt' : 'Payment'} - ${t.reference || ''} ${t.notes || ''}`,
        debit: t.type === 'receipt' ? t.amount : 0,
        credit: t.type === 'payment' ? t.amount : 0,
      });
    });

    const expenses = db.prepare(`SELECT e.date, ec.name as category, e.amount, e.description FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id WHERE e.payment_mode = 'cash'${dateFilter.replace('WHERE', 'AND')} ORDER BY e.date`).all(...params);
    expenses.forEach(e => {
      transactions.push({
        date: e.date,
        description: `Expense - ${e.category} ${e.description || ''}`,
        debit: 0,
        credit: e.amount,
      });
    });

    transactions.sort((a, b) => a.date.localeCompare(b.date));
    let runningBalance = 0;
    transactions = transactions.map(t => {
      runningBalance = runningBalance + t.debit - t.credit;
      return { ...t, balance: runningBalance };
    });

    return { opening_balance: 0, transactions };
  });

  ipcMain.handle('ledger:expense', (event, from, to, category_id) => {
    let query = `SELECT e.*, ec.name as category_name FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id`;
    const params = [];
    const conditions = [];

    if (from && to) { conditions.push('e.date BETWEEN ? AND ?'); params.push(from, to); }
    if (category_id) { conditions.push('e.category_id = ?'); params.push(category_id); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY e.date DESC';

    const expenses = db.prepare(query).all(...params);
    const totals = db.prepare(`SELECT ec.name, SUM(e.amount) as total FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id${conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''} GROUP BY e.category_id ORDER BY total DESC`).all(...params);

    return { expenses, totals };
  });
}

module.exports = { register };
