const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onNavigate: (callback) => ipcRenderer.on('navigate', (event, path) => callback(path)),
  // Auth
  login: (data) => ipcRenderer.invoke('auth:login', data),
  register: (data) => ipcRenderer.invoke('auth:register', data),
  changePassword: (data) => ipcRenderer.invoke('auth:changePassword', data),
  updateUsername: (data) => ipcRenderer.invoke('auth:updateUsername', data),
  getUsers: () => ipcRenderer.invoke('auth:getUsers'),
  resetPasswordByCity: (data) => ipcRenderer.invoke('auth:resetPasswordByCity', data),
  adminUpdateUser: (data) => ipcRenderer.invoke('auth:adminUpdateUser', data),
  adminResetPassword: (data) => ipcRenderer.invoke('auth:adminResetPassword', data),
  deleteUser: (user_id) => ipcRenderer.invoke('auth:deleteUser', { user_id }),
  dailyClosing: (data) => ipcRenderer.invoke('auth:dailyClosing'),
  getDailyClosings: (data) => ipcRenderer.invoke('auth:getDailyClosings'),

  // Parties
  getParties: (type) => ipcRenderer.invoke('party:getAll', type),
  getParty: (id) => ipcRenderer.invoke('party:get', id),
  saveParty: (data) => ipcRenderer.invoke('party:save', data),
  deleteParty: (id) => ipcRenderer.invoke('party:delete', id),

  // Products
  getProducts: (search) => ipcRenderer.invoke('product:getAll', search),
  getProduct: (id) => ipcRenderer.invoke('product:get', id),
  saveProduct: (data) => ipcRenderer.invoke('product:save', data),
  deleteProduct: (id) => ipcRenderer.invoke('product:delete', id),

  // Warehouses
  getWarehouses: () => ipcRenderer.invoke('warehouse:getAll'),
  saveWarehouse: (data) => ipcRenderer.invoke('warehouse:save', data),
  deleteWarehouse: (id) => ipcRenderer.invoke('warehouse:delete', id),

  // Stock
  getStock: (product_id, warehouse_id) => ipcRenderer.invoke('stock:get', product_id, warehouse_id),
  getAllStock: (warehouse_id) => ipcRenderer.invoke('stock:getAll', warehouse_id),
  stockAdjustment: (data) => ipcRenderer.invoke('stock:adjustment', data),
  stockTransfer: (data) => ipcRenderer.invoke('stock:transfer', data),
  getStockAdjustments: (data) => ipcRenderer.invoke('stock:getAdjustments', data),
  getStockTransfers: (data) => ipcRenderer.invoke('stock:getTransfers', data),

  // Purchase
  savePurchase: (data) => ipcRenderer.invoke('purchase:save', data),
  getPurchaseInvoices: (data) => ipcRenderer.invoke('purchase:getInvoices', data),
  getPurchaseInvoice: (id) => ipcRenderer.invoke('purchase:getInvoice', id),
  deletePurchaseInvoice: (id) => ipcRenderer.invoke('purchase:deleteInvoice', id),
  savePurchaseReturn: (data) => ipcRenderer.invoke('purchase:saveReturn', data),
  getPurchaseReturns: (data) => ipcRenderer.invoke('purchase:getReturns', data),

  // Sale
  saveSale: (data) => ipcRenderer.invoke('sale:save', data),
  getSaleInvoices: (data) => ipcRenderer.invoke('sale:getInvoices', data),
  getSaleInvoice: (id) => ipcRenderer.invoke('sale:getInvoice', id),
  deleteSaleInvoice: (id) => ipcRenderer.invoke('sale:deleteInvoice', id),
  saveSaleReturn: (data) => ipcRenderer.invoke('sale:saveReturn', data),
  getSaleReturns: (data) => ipcRenderer.invoke('sale:getReturns', data),

  // Ledgers
  getSupplierLedger: (party_id, from, to) => ipcRenderer.invoke('ledger:supplier', party_id, from, to),
  getCustomerLedger: (party_id, from, to) => ipcRenderer.invoke('ledger:customer', party_id, from, to),
  getBankLedger: (bank_id, from, to) => ipcRenderer.invoke('ledger:bank', bank_id, from, to),
  getCashLedger: (from, to) => ipcRenderer.invoke('ledger:cash', from, to),
  getExpenseLedger: (from, to, category_id) => ipcRenderer.invoke('ledger:expense', from, to, category_id),

  // Accounts
  saveJournalEntry: (data) => ipcRenderer.invoke('account:saveJournal', data),
  getJournalEntries: (from, to) => ipcRenderer.invoke('account:getJournalEntries', from, to),
  getJournalEntry: (id) => ipcRenderer.invoke('account:getJournalEntry', id),
  saveExpense: (data) => ipcRenderer.invoke('account:saveExpense', data),
  getExpenses: (data) => ipcRenderer.invoke('account:getExpenses', data),
  deleteExpense: (id) => ipcRenderer.invoke('account:deleteExpense', id),
  getExpenseCategories: () => ipcRenderer.invoke('account:getExpenseCategories'),
  saveExpenseCategory: (data) => ipcRenderer.invoke('account:saveExpenseCategory', data),
  saveBank: (data) => ipcRenderer.invoke('account:saveBank', data),
  getBanks: () => ipcRenderer.invoke('account:getBanks'),
  deleteBank: (id) => ipcRenderer.invoke('account:deleteBank', id),
  saveBankTransaction: (data) => ipcRenderer.invoke('account:saveBankTransaction', data),
  getBankTransactions: (bank_id) => ipcRenderer.invoke('account:getBankTransactions', bank_id),
  getProfitLoss: (from, to) => ipcRenderer.invoke('account:profitLoss', from, to),
  getTrialBalance: (from, to) => ipcRenderer.invoke('account:trialBalance', from, to),
  getPayableReceivable: () => ipcRenderer.invoke('account:payableReceivable'),
  getAgingReport: (type) => ipcRenderer.invoke('account:agingReport', type),

  // Reports
  getSaleReport: (data) => ipcRenderer.invoke('report:sale', data),
  getDailyActivity: (data) => ipcRenderer.invoke('report:dailyActivity', data),
  getStockReport: (warehouse_id) => ipcRenderer.invoke('report:stock', warehouse_id),

  // Dashboard
  getDashboardData: () => ipcRenderer.invoke('dashboard:getData'),

  // Salesmen
  getSalesmen: () => ipcRenderer.invoke('salesman:getAll'),
  saveSalesman: (data) => ipcRenderer.invoke('salesman:save', data),
  deleteSalesman: (id) => ipcRenderer.invoke('salesman:delete', id),

  // Counters
  getCounters: () => ipcRenderer.invoke('counter:getAll'),
  saveCounter: (data) => ipcRenderer.invoke('counter:save', data),
  deleteCounter: (id) => ipcRenderer.invoke('counter:delete', id),

  // Employees
  getEmployees: () => ipcRenderer.invoke('employee:getAll'),
  saveEmployee: (data) => ipcRenderer.invoke('employee:save', data),
  deleteEmployee: (id) => ipcRenderer.invoke('employee:delete', id),

  // Attendance
  saveAttendance: (data) => ipcRenderer.invoke('attendance:save', data),
  getAttendance: (data) => ipcRenderer.invoke('attendance:get', data),

  // Currencies
  getCurrencies: () => ipcRenderer.invoke('currency:getAll'),
  saveCurrency: (data) => ipcRenderer.invoke('currency:save', data),
  setDefaultCurrency: (id) => ipcRenderer.invoke('currency:setDefault', id),

  // General Account Info
  getGeneralInfo: () => ipcRenderer.invoke('generalInfo:get'),
  saveGeneralInfo: (data) => ipcRenderer.invoke('generalInfo:save', data),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (data) => ipcRenderer.invoke('settings:save', data),

  // Notifications
  getNotifications: () => ipcRenderer.invoke('notification:getAll'),
  markNotificationRead: (id) => ipcRenderer.invoke('notification:markRead', id),

  // Backup
  backupDatabase: () => ipcRenderer.invoke('backup:create'),
  createDailyBackup: () => ipcRenderer.invoke('backup:createDaily'),
  listDailyBackups: () => ipcRenderer.invoke('backup:listDaily'),
  restoreDatabase: (filePath) => ipcRenderer.invoke('backup:restore', filePath),
  selectBackupFile: () => ipcRenderer.invoke('backup:selectFile'),
  deleteBackup: (filePath) => ipcRenderer.invoke('backup:delete', filePath),
  getExportTables: () => ipcRenderer.invoke('backup:getTables'),
  exportTable: (tableName) => ipcRenderer.invoke('backup:exportTable', tableName),
  importCsv: (tableName) => ipcRenderer.invoke('backup:importCsv', tableName),
  clearAllData: () => ipcRenderer.invoke('backup:clearAllData'),

  // Utils
  generateInvoiceNo: (prefix) => ipcRenderer.invoke('util:generateInvoiceNo', prefix),
  getAppVersion: () => ipcRenderer.invoke('util:getAppVersion'),
  getComputerName: () => ipcRenderer.invoke('util:getComputerName'),
  printContent: (html) => ipcRenderer.invoke('util:print', html),
  exportPdf: (data) => ipcRenderer.invoke('util:exportPdf', data),

  // Shortcuts
  getShortcuts: () => ipcRenderer.invoke('shortcut:getAll'),
  saveShortcut: (data) => ipcRenderer.invoke('shortcut:save', data),
  deleteShortcut: (id) => ipcRenderer.invoke('shortcut:delete', id),

  // Updates
  checkUpdate: (url) => ipcRenderer.invoke('update:check', url),
  downloadUpdate: (url) => ipcRenderer.invoke('update:download', url),
  installUpdate: (filePath) => ipcRenderer.invoke('update:install', filePath),
  saveUpdateUrl: (url) => ipcRenderer.invoke('update:saveUrl', url),
  getUpdateUrl: () => ipcRenderer.invoke('update:getUrl'),

  // Data Import
  importUpload: () => ipcRenderer.invoke('import:upload'),
  importGetTypes: () => ipcRenderer.invoke('import:getTypes'),
  importAutoMap: (data) => ipcRenderer.invoke('import:autoMap', data),
  importExecute: (data) => ipcRenderer.invoke('import:execute', data),
});
