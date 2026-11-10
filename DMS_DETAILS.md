# Distribution Management System (DMS)

> **SM Younas Traders** — Desktop Distribution & Accounting Management Software

---

## 📌 Project Overview

**DMS (Distribution Management System)** is a full-featured desktop application built for **SM Younas Traders** to manage their complete distribution business lifecycle — from procurement and inventory to sales, accounting, HR, and reporting. It is a Windows desktop app (Electron) with an offline-first SQLite database, designed for reliability in environments with limited or no internet connectivity.

- **Project Name:** DMS - SM Younas Traders
- **Version:** 1.0.0
- **Platform:** Windows Desktop (Electron)
- **Owner:** Muhummad Amin Khan
- **Developed By:** Tech Solution Consultancy
- **Contact:** aminbazai118@gmail.com

---

## 🎯 Problem It Solves

Distribution businesses juggle purchases, sales, stock across multiple warehouses, supplier/customer ledgers, bank & cash books, expenses, and accounting — usually across scattered spreadsheets. DMS consolidates all of this into a single, fast, offline desktop application with role-based access, audit-friendly ledgers, and printable reports/PDFs.

---

## ✨ Key Features

### 📊 Dashboard
- Real-time KPI cards: Today's Purchase, Today's Sale, Available Stock, Total Payable, Total Receivable, Cash in Hand
- Quick module access grid
- Auto-refresh every 30s + on window focus
- Live clock & date (Asia/Karachi locale)

### 🛒 Purchase Management
- Purchase Invoice (with items, discount, tax, payment type, warehouse)
- Purchase Return
- Supplier Ledger with running balance
- Payable/Receivable summary

### 💰 Sales Management
- Sales Invoice (salesman, counter, warehouse, discount, tax)
- Sales Return
- Customer Ledger
- Sale Reports

### 📦 Inventory & Stock
- Items/Products (code, unit, category, price, min stock)
- Warehouses & multi-warehouse stock
- Stock Adjustment (increase/decrease with reason)
- Stock Transfer between warehouses
- Stock Reports

### 💵 Accounting & Finance
- Bank Info & Bank Ledger (transactions, opening balance)
- Cash Ledger
- Expense Info & Expense Ledger
- Journal Entries (double-entry lines)
- Profit & Loss statement
- Trial Balance
- Payable/Receivable

### 👥 Master Data
- Parties (customers/suppliers, opening balance, salesman link)
- Salesmen (area, commission rate)
- Counters
- Currencies (multi-currency with exchange rates)

### 🧑‍💼 HR
- Employee management (designation, salary, join date)
- Attendance (check-in/out, status, notes)

### ⚙️ Settings & Admin
- Account settings (company info, logo, NTN/STRN, idle timeout)
- Purchase/Sales settings
- User roles: Admin (full access) / User (read-only mode banner)
- Keyboard shortcuts (customizable, F1 help)
- Multi-theme UI (12 themes)

### 🔐 Auth & Security
- Login / Registration / Forgot Password
- First-run Setup Wizard
- bcrypt password hashing
- Role-based read-only mode for non-admins
- Idle timer auto-lock

### 💾 Data & Backup
- SQLite local database (WAL mode, foreign keys)
- Data Backup & Restore
- Data Import (bulk)
- Auto-update support
- PDF export (print-to-PDF via Electron)

### 🛠 Tools
- Built-in Calculator
- Word Paid (number to words)
- Data Import

### 📈 Reports
- Sale Report, Stock Report, Daily Activity
- Printable with PDF export

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Electron 33 |
| Frontend | React 18, React Router 6, React Hook Form |
| Styling | Tailwind CSS 3.4, custom glassmorphism theme |
| State | Zustand |
| Charts | Recharts |
| Database | better-sqlite3 (SQLite, WAL) |
| Security | bcryptjs |
| Build | Vite 6, electron-builder (NSIS installer) |
| Language | JavaScript (JSX) |

---

## 🏗 Architecture

```
src/
├── main/                  # Electron main process (Node.js)
│   ├── main.js            # App lifecycle, window, IPC registration
│   ├── database.js        # SQLite schema, migrations, seeding
│   ├── preload.js         # contextBridge (window.electronAPI)
│   ├── session.js
│   └── ipc/               # IPC handlers per domain
│       ├── auth, party, product, purchase, sale, ledger,
│       │   account, report, stock, backup, settings,
│       │   shortcut, update, import
├── renderer/              # React frontend (Vite)
│   ├── index.html
│   └── src/
│       ├── App.jsx        # Routing
│       ├── main.jsx
│       ├── components/    # Sidebar, Topbar, DataTable, InvoiceForm, ...
│       ├── hooks/         # useAuth, useDB, useCompanyInfo, useTheme, ...
│       ├── layouts/       # MainLayout, AuthLayout
│       └── pages/         # 40+ pages grouped by module
```

### Design Patterns
- **IPC bridge:** `contextIsolation: true`, `nodeIntegration: false`; renderer calls `window.electronAPI.*` exposed via preload.
- **Offline-first:** All data in local SQLite; no network dependency for core ops.
- **Role-based UI:** Admin vs read-only user; amber banner for read-only.
- **Theming:** CSS variables per theme (12 themes), switched via `data-theme`.
- **Glassmorphism:** Dark navy base with translucent cards, neon accents, backdrop blur.

---

## 📂 Module Map (Sidebar Groups)

1. **Main** — Dashboard
2. **Registration** — Registration, Daily Closing
3. **Master Data** — Items, Party, Bank, Expense, Employee, SalesMen, Counter, Currency, WareHouse, Stock
4. **Transactions** — Purchase Invoice, Purchase Return, Sales Invoice, Sales Return
5. **Ledgers** — Supplier, Customer, Bank, Cash, Expense
6. **Accounts** — Journal Entry, Profit/Loss, Trial Balance, Payable/Receivable
7. **Reports** — Sale Report, Stock Report, Daily Activity
8. **Inventory** — Stock Adjustment, Stock Transfer
9. **HR** — Attendance
10. **Settings** — Account Setting, Purchase/Sales
11. **Tools** — Calculator, Word Paid, Data Import
12. **Backup** — Data Backup, Data Restore
13. **Help** — Short Keys, About Us

---

## 🔑 Default Credentials

- **Username:** `admin`
- **Password:** `admin`
- (Created automatically on first run via setup wizard flow.)

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Dev mode (Vite + Electron)
npm run electron:dev

# Build production installer
npm run electron:build
```

Output: `dist-electron/DMS-SM-Younas-Traders-Setup-1.0.0.exe`

---

## 📸 UI Highlights

- Dark glassmorphism theme with 12 color themes (Navy, Midnight, Emerald, Ruby, Amber, Obsidian, Ocean, Lavender, Forest, Rose Gold, ...)
- Animated background orbs following mouse
- KPI cards with neon pulse indicators
- Module grid quick access
- Responsive-ish desktop layout (min 1200×700)

---

## 📝 Notes for Portfolio

- Fully offline desktop app; SQLite DB stored in user data dir.
- No external API dependencies for core functionality.
- Includes PDF export, backup/restore, and auto-update hooks.
- Single-tenant per company; company profile configurable.

---

*© Tech Solution Consultancy — All Rights Reserved*
