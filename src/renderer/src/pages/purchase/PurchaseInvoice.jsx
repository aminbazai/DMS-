import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import useDB from '../../hooks/useDB';
import InvoiceForm from '../../components/InvoiceForm';

export default function PurchaseInvoice() {
  const { user } = useAuth();
  const db = useDB();
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [suppliers, setSuppliers] = useState([]);
  const [partyId, setPartyId] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState('');
  const [items, setItems] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [paid, setPaid] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadInvoiceNo();
    loadSuppliers();
    loadWarehouses();
  }, []);

  const loadInvoiceNo = async () => {
    const no = await db.generateInvoiceNo('PUR');
    setInvoiceNo(no);
  };

  const loadSuppliers = async () => {
    const data = await db.getParties('supplier');
    setSuppliers(data || []);
  };

  const loadWarehouses = async () => {
    const data = await db.getWarehouses();
    setWarehouses(data || []);
  };

  const searchProducts = useCallback(async (q) => {
    if (!q) { setProductResults([]); return; }
    const data = await db.getProducts(q);
    setProductResults(data || []);
  }, [db]);

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(productSearch), 300);
    return () => clearTimeout(timer);
  }, [productSearch, searchProducts]);

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.total) || 0), 0);
  const discAmt = parseFloat(discount) || 0;
  const taxAmt = parseFloat(tax) || 0;
  const grandTotal = subtotal - discAmt + taxAmt;
  const balance = grandTotal - (parseFloat(paid) || 0);

  const handleSave = async () => {
    if (!partyId) { setMessage('Select a supplier'); return; }
    if (items.length === 0) { setMessage('Add at least one item'); return; }
    const result = await db.savePurchase({
      invoice_no: invoiceNo, party_id: parseInt(partyId), date, subtotal, discount: discAmt, tax: taxAmt,
      total: grandTotal, paid: parseFloat(paid) || 0, balance, payment_type: paymentType,
      warehouse_id: warehouseId ? parseInt(warehouseId) : null, notes, created_by: user?.id, items: items.map(i => ({
        product_id: i.product_id, quantity: parseFloat(i.quantity) || 0, rate: parseFloat(i.rate) || 0,
        discount: parseFloat(i.discount) || 0, total: i.total,
      })),
    });
    if (result.success) {
      setMessage('Purchase invoice saved!');
      handleNew();
    } else setMessage('Error: ' + (result.error || 'Save failed'));
  };

  const handleNew = () => {
    setItems([]);
    setDiscount(0); setTax(0); setPaid(0); setNotes(''); setPartyId(''); setWarehouseId('');
    setProductSearch('');
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    loadInvoiceNo();
  };

  const handlePrint = () => {
    const content = generatePrintHTML();
    const w = window.open('', '_blank');
    w.document.write(content);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  const generatePrintHTML = () => `
    <html><head><title>Purchase Invoice</title>
    <style>body{font-family:Arial;padding:40px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd;text-align:left}.right{text-align:right}.total{font-weight:bold;font-size:16px}</style>
    </head><body>
    <h2>PURCHASE INVOICE</h2>
    <p>Invoice: ${invoiceNo} | Date: ${date}</p>
    <table><thead><tr><th>Product</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Disc</th><th class="right">Total</th></tr></thead>
    <tbody>${items.map(i => `<tr><td>${i.product_name}</td><td class="right">${i.quantity}</td><td class="right">${i.rate}</td><td class="right">${i.discount || 0}</td><td class="right">${i.total}</td></tr>`).join('')}</tbody>
    </table>
    <p class="right">Subtotal: ${subtotal}</p>
    <p class="right">Discount: ${discAmt}</p>
    <p class="right">Tax: ${taxAmt}</p>
    <p class="total right">Grand Total: ${grandTotal}</p>
    <p>Paid: ${paid} | Balance: ${balance}</p>
    </body></html>`;

  const handleSelectProduct = (p) => {
    setItems([...items, { product_id: p.id, product_name: p.name, quantity: 1, rate: p.purchase_price || 0, discount: 0, total: p.purchase_price || 0 }]);
    setProductSearch('');
    setProductResults([]);
  };

  return (
    <div className="space-y-6">
      {message && <div className={`px-4 py-2 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{message}</div>}

      <InvoiceForm
        title="Purchase Invoice"
        invoiceNo={invoiceNo}
        date={date} setDate={setDate}
        partyLabel="Supplier" parties={suppliers} partyId={partyId} setPartyId={setPartyId}
        items={items} setItems={setItems}
        productSearch={productSearch} setProductSearch={setProductSearch}
        productResults={productResults} onSelectProduct={handleSelectProduct}
        subtotal={subtotal} discount={discount} setDiscount={setDiscount}
        tax={tax} setTax={setTax}
        grandTotal={grandTotal}
        paymentType={paymentType} setPaymentType={setPaymentType}
        paid={paid} setPaid={setPaid}
        balance={balance}
        onSave={handleSave} onPrint={handlePrint} onNew={handleNew}
        extraFields={
          <div>
            <label className="block text-xs text-gray-400 mb-1">Warehouse</label>
            <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} className="w-full">
              <option value="">Select Warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        }
      />
    </div>
  );
}
