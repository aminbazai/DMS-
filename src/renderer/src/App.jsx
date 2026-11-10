import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import useShortcuts from './hooks/useShortcuts';
import useCompanyInfo from './hooks/useCompanyInfo';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/auth/Login';
import Registration from './pages/auth/Registration';
import ForgotPassword from './pages/auth/ForgotPassword';
import SetupWizard from './pages/auth/SetupWizard';
import DailyClosing from './pages/auth/DailyClosing';
import Dashboard from './pages/Dashboard';
import PurchaseInvoice from './pages/purchase/PurchaseInvoice';
import PurchaseReturn from './pages/purchase/PurchaseReturn';
import SalesInvoice from './pages/sale/SalesInvoice';
import SalesReturn from './pages/sale/SalesReturn';
import PartyInfo from './pages/party/PartyInfo';
import Product from './pages/product/Product';
import SupplierLedger from './pages/ledger/SupplierLedger';
import CustomerLedger from './pages/ledger/CustomerLedger';
import BankLedger from './pages/ledger/BankLedger';
import CashLedger from './pages/ledger/CashLedger';
import ExpenseLedger from './pages/ledger/ExpenseLedger';
import JournalEntry from './pages/accounts/JournalEntry';
import ExpenseInfo from './pages/accounts/ExpenseInfo';
import BankInfo from './pages/accounts/BankInfo';
import ProfitLoss from './pages/accounts/ProfitLoss';
import TrialBalance from './pages/accounts/TrialBalance';
import PayableReceivable from './pages/accounts/PayableReceivable';
import SaleReport from './pages/reports/SaleReport';
import DailyActivity from './pages/reports/DailyActivity';
import StockReport from './pages/reports/StockReport';
import WareHouse from './pages/stock/WareHouse';
import StockAdjustment from './pages/stock/StockAdjustment';
import StockTransfer from './pages/stock/StockTransfer';
import CounterInfo from './pages/info/CounterInfo';
import ShortKeys from './pages/info/ShortKeys';
import AboutUs from './pages/info/AboutUs';
import Employee from './pages/hr/Employee';
import Attendance from './pages/hr/Attendance';
import Salesmen from './pages/settings/Salesmen';
import Currency from './pages/settings/Currency';
import AccountSetting from './pages/settings/AccountSetting';
import PurchaseSalesSettings from './pages/settings/PurchaseSalesSettings';
import DataBackup from './pages/backup/DataBackup';
import DataRestore from './pages/backup/DataRestore';
import Calculator from './pages/tools/Calculator';
import WordPaid from './pages/tools/WordPaid';
import DataImport from './pages/tools/DataImport';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  useShortcuts();
  const { companyName } = useCompanyInfo();

  useEffect(() => {
    document.title = `DMS - ${companyName}`;
  }, [companyName]);
  return (
    <Routes>
      <Route path="/setup" element={<SetupWizard />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/daily-closing" element={<DailyClosing />} />
        <Route path="/purchase-invoice" element={<PurchaseInvoice />} />
        <Route path="/purchase-return" element={<PurchaseReturn />} />
        <Route path="/sales-invoice" element={<SalesInvoice />} />
        <Route path="/sales-return" element={<SalesReturn />} />
        <Route path="/party" element={<PartyInfo />} />
        <Route path="/product" element={<Product />} />
        <Route path="/supplier-ledger" element={<SupplierLedger />} />
        <Route path="/customer-ledger" element={<CustomerLedger />} />
        <Route path="/bank-ledger" element={<BankLedger />} />
        <Route path="/cash-ledger" element={<CashLedger />} />
        <Route path="/expense-ledger" element={<ExpenseLedger />} />
        <Route path="/journal-entry" element={<JournalEntry />} />
        <Route path="/expense-info" element={<ExpenseInfo />} />
        <Route path="/bank-info" element={<BankInfo />} />
        <Route path="/profit-loss" element={<ProfitLoss />} />
        <Route path="/trial-balance" element={<TrialBalance />} />
        <Route path="/payable-receivable" element={<PayableReceivable />} />
        <Route path="/sale-report" element={<SaleReport />} />
        <Route path="/daily-activity" element={<DailyActivity />} />
        <Route path="/stock-report" element={<StockReport />} />
        <Route path="/warehouse" element={<WareHouse />} />
        <Route path="/stock-adjustment" element={<StockAdjustment />} />
        <Route path="/stock-transfer" element={<StockTransfer />} />
        <Route path="/counter-info" element={<CounterInfo />} />
        <Route path="/short-keys" element={<ShortKeys />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/salesmen" element={<Salesmen />} />
        <Route path="/currency" element={<Currency />} />
        <Route path="/account-setting" element={<AccountSetting />} />
        <Route path="/purchase-sales-settings" element={<PurchaseSalesSettings />} />
        <Route path="/data-backup" element={<DataBackup />} />
        <Route path="/data-restore" element={<DataRestore />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/word-paid" element={<WordPaid />} />
        <Route path="/data-import" element={<DataImport />} />
      </Route>
    </Routes>
  );
}
