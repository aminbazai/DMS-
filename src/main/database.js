const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db = null;

function getDbPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'dms_database.db');
}

function initDatabase() {
  const dbPath = getDbPath();
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  createTables();
  migrateSchema();
  seedDefaultUser();
  return db;
}

function migrateSchema() {
  const cols = db.prepare("PRAGMA table_info('general_account_info')").all().map(c => c.name);
  if (!cols.includes('idle_timeout')) {
    db.exec("ALTER TABLE general_account_info ADD COLUMN idle_timeout INTEGER DEFAULT 0");
  }
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      branch_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS parties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT,
      opening_balance REAL DEFAULT 0,
      balance_type TEXT DEFAULT 'debit',
      salesman_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (salesman_id) REFERENCES salesmen(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE,
      unit TEXT DEFAULT 'PCS',
      category TEXT,
      purchase_price REAL DEFAULT 0,
      sale_price REAL DEFAULT 0,
      min_stock REAL DEFAULT 0,
      warehouse_id INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    );

    CREATE TABLE IF NOT EXISTS warehouses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      warehouse_id INTEGER,
      quantity REAL DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    );

    CREATE TABLE IF NOT EXISTS purchase_invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no TEXT NOT NULL UNIQUE,
      party_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      subtotal REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL DEFAULT 0,
      paid REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      payment_type TEXT DEFAULT 'cash',
      warehouse_id INTEGER,
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (party_id) REFERENCES parties(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES purchase_invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS purchase_returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_no TEXT NOT NULL UNIQUE,
      original_invoice_id INTEGER,
      party_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      total REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (original_invoice_id) REFERENCES purchase_invoices(id),
      FOREIGN KEY (party_id) REFERENCES parties(id)
    );

    CREATE TABLE IF NOT EXISTS purchase_return_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (return_id) REFERENCES purchase_returns(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS sale_invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no TEXT NOT NULL UNIQUE,
      party_id INTEGER NOT NULL,
      salesman_id INTEGER,
      counter_id INTEGER,
      date TEXT NOT NULL,
      subtotal REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL DEFAULT 0,
      paid REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      payment_type TEXT DEFAULT 'cash',
      warehouse_id INTEGER,
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (party_id) REFERENCES parties(id),
      FOREIGN KEY (salesman_id) REFERENCES salesmen(id),
      FOREIGN KEY (counter_id) REFERENCES counters(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES sale_invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS sale_returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_no TEXT NOT NULL UNIQUE,
      original_invoice_id INTEGER,
      party_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      total REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (original_invoice_id) REFERENCES sale_invoices(id),
      FOREIGN KEY (party_id) REFERENCES parties(id)
    );

    CREATE TABLE IF NOT EXISTS sale_return_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (return_id) REFERENCES sale_returns(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS banks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      account_no TEXT,
      branch TEXT,
      opening_balance REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS bank_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bank_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      reference TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bank_id) REFERENCES banks(id)
    );

    CREATE TABLE IF NOT EXISTS expense_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      payment_mode TEXT DEFAULT 'cash',
      bank_id INTEGER,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES expense_categories(id),
      FOREIGN KEY (bank_id) REFERENCES banks(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_no TEXT UNIQUE,
      date TEXT NOT NULL,
      description TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS journal_entry_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL,
      account_type TEXT NOT NULL,
      account_id INTEGER,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      narration TEXT,
      FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cash_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      party_id INTEGER,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      reference TEXT,
      notes TEXT,
      counter_id INTEGER,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (party_id) REFERENCES parties(id),
      FOREIGN KEY (counter_id) REFERENCES counters(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS salesmen (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      area TEXT,
      commission_rate REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS counters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      designation TEXT,
      phone TEXT,
      salary REAL DEFAULT 0,
      join_date TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'present',
      check_in TEXT,
      check_out TEXT,
      notes TEXT,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS stock_adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      warehouse_id INTEGER,
      adjustment_type TEXT NOT NULL,
      quantity REAL NOT NULL,
      reason TEXT,
      date TEXT NOT NULL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS stock_transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      from_warehouse_id INTEGER NOT NULL,
      to_warehouse_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id),
      FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS currencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      exchange_rate REAL DEFAULT 1,
      is_default INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS general_account_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      ntn TEXT,
      strn TEXT,
      logo_path TEXT,
      financial_year_start TEXT,
      currency_id INTEGER,
      idle_timeout INTEGER DEFAULT 0,
      FOREIGN KEY (currency_id) REFERENCES currencies(id)
    );

    CREATE TABLE IF NOT EXISTS daily_closings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      closing_cash REAL DEFAULT 0,
      notes TEXT,
      closed_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (closed_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shortcuts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keys TEXT NOT NULL,
      path TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  seedAppSettings();
  seedDefaultShortcuts();
}

function seedDefaultUser() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (count.c === 0) {
    const bcrypt = require('bcryptjs');
    const hashed = bcrypt.hashSync('admin', 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hashed, 'admin');
  }
}

function seedDefaultShortcuts() {
  const count = db.prepare('SELECT COUNT(*) as c FROM shortcuts').get();
  if (count.c === 0) {
    const insert = db.prepare('INSERT INTO shortcuts (keys, path, action) VALUES (?, ?, ?)');
    const defaults = [
      ['F1', '/short-keys', 'Open Short Keys help'],
      ['ctrl+d', '/dashboard', 'Go to Dashboard'],
      ['ctrl+p', '/purchase-invoice', 'Go to Purchase Invoice'],
      ['ctrl+r', '/purchase-return', 'Go to Purchase Return'],
      ['ctrl+s', '/sales-invoice', 'Go to Sales Invoice'],
      ['ctrl+t', '/sales-return', 'Go to Sales Return'],
      ['ctrl+k', '/party', 'Go to Party'],
      ['ctrl+i', '/product', 'Go to Items / Product'],
      ['ctrl+b', '/bank-info', 'Go to Bank Info'],
      ['ctrl+e', '/expense-info', 'Go to Expense Info'],
      ['ctrl+l', '/supplier-ledger', 'Go to Supplier Ledger'],
      ['ctrl+u', '/customer-ledger', 'Go to Customer Ledger'],
      ['ctrl+g', '/bank-ledger', 'Go to Bank Ledger'],
      ['ctrl+h', '/cash-ledger', 'Go to Cash Ledger'],
      ['ctrl+j', '/journal-entry', 'Go to Journal Entry'],
      ['ctrl+1', '/dashboard', 'Dashboard'],
      ['ctrl+2', '/purchase-invoice', 'Purchase Invoice'],
      ['ctrl+3', '/sales-invoice', 'Sales Invoice'],
      ['ctrl+4', '/party', 'Party'],
      ['ctrl+5', '/product', 'Products'],
      ['ctrl+6', '/account-setting', 'Account Settings'],
    ];
    for (const [keys, path, action] of defaults) {
      insert.run(keys, path, action);
    }
  }
}

function seedAppSettings() {
  const versionRow = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('app_version');
  if (!versionRow) {
    db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?)').run('app_version', app.getVersion());
  }
  const urlRow = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('update_server_url');
  if (!urlRow) {
    db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?)').run('update_server_url', '');
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
}

module.exports = { initDatabase, getDb, getDbPath };
