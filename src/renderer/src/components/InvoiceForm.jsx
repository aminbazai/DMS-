import { useState, useEffect } from 'react';

export default function InvoiceForm({
  title,
  invoiceNo,
  date, setDate,
  partyLabel, parties, partyId, setPartyId,
  items, setItems,
  productSearch, setProductSearch,
  productResults, onSelectProduct,
  subtotal, discount, setDiscount,
  tax, setTax,
  grandTotal,
  paymentType, setPaymentType,
  paid, setPaid,
  balance,
  onSave, onPrint, onNew, onDelete,
  invoiceNoPrefix,
  extraFields,
}) {
  const addRow = () => {
    setItems([...items, { product_id: '', product_name: '', quantity: 1, rate: 0, discount: 0, total: 0 }]);
  };

  const removeRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    const qty = parseFloat(newItems[index].quantity) || 0;
    const rate = parseFloat(newItems[index].rate) || 0;
    const disc = parseFloat(newItems[index].discount) || 0;
    newItems[index].total = qty * rate - disc;
    setItems(newItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">{title}</h2>
        <span className="text-accent font-heading text-lg font-semibold">{invoiceNo}</span>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">{partyLabel}</label>
            <select value={partyId} onChange={e => setPartyId(e.target.value)} className="w-full">
              <option value="">Select {partyLabel}</option>
              {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {extraFields}
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Search product..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="flex-1"
            />
            <button type="button" onClick={addRow} className="btn-primary text-sm">+ Add Row</button>
          </div>
          {productResults.length > 0 && (
            <div className="absolute z-10 bg-navy-lighter border border-navy-border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-xl">
              {productResults.map(p => (
                <button
                  key={p.id}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-navy-light text-gray-300 hover:text-white"
                  onClick={() => onSelectProduct(p)}
                >
                  {p.code && <span className="text-gray-500 mr-2">[{p.code}]</span>}
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Rate</th>
                <th className="px-3 py-2 text-right">Disc</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="table-row">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.product_name}
                      onChange={e => updateItem(i, 'product_name', e.target.value)}
                      className="w-full text-sm"
                      placeholder="Type product name..."
                    />
                    <input type="hidden" value={item.product_id} />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="w-20 text-right text-sm" min="0" step="0.01" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={item.rate} onChange={e => updateItem(i, 'rate', e.target.value)} className="w-24 text-right text-sm" min="0" step="0.01" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={item.discount} onChange={e => updateItem(i, 'discount', e.target.value)} className="w-20 text-right text-sm" min="0" step="0.01" />
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {item.total.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-300 text-lg">&times;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-end mt-4 space-y-2">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400">Subtotal:</label>
            <span className="text-lg font-heading font-bold text-white w-32 text-right">
              {subtotal.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400">Discount:</label>
            <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-32 text-right" min="0" />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400">Tax:</label>
            <input type="number" value={tax} onChange={e => setTax(e.target.value)} className="w-32 text-right" min="0" />
          </div>
          <div className="flex items-center gap-4 border-t border-navy-border pt-2">
            <label className="text-sm font-semibold text-accent">Grand Total:</label>
            <span className="text-xl font-heading font-bold text-accent w-32 text-right">
              {grandTotal.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-navy-lighter rounded-lg">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Payment Type</label>
            <select value={paymentType} onChange={e => setPaymentType(e.target.value)} className="w-full">
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Paid Amount</label>
            <input type="number" value={paid} onChange={e => setPaid(e.target.value)} className="w-full" min="0" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Balance</label>
            <input type="number" value={balance} readOnly className="w-full text-accent font-bold" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onSave} className="btn-primary">Save</button>
        <button onClick={onPrint} className="btn-secondary">Print</button>
        <button onClick={onNew} className="btn-secondary">New</button>
        {onDelete && <button onClick={onDelete} className="btn-danger">Delete</button>}
      </div>
    </div>
  );
}
