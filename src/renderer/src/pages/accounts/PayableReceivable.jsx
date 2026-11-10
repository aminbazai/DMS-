import { useState, useEffect } from 'react';
import useDB from '../../hooks/useDB';

export default function PayableReceivable() {
  const db = useDB();
  const [data, setData] = useState({ suppliers: [], customers: [] });
  const [agingData, setAgingData] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    db.getPayableReceivable().then(setData);
  }, []);

  const loadAging = async (type) => {
    const result = await db.getAgingReport(type);
    setAgingData(result || []);
    setActiveTab('aging');
  };

  const totalPayable = data.suppliers.reduce((s, p) => s + p.balance, 0);
  const totalReceivable = data.customers.reduce((s, p) => s + p.balance, 0);

  const agingBuckets = { '0-30': 0, '30-60': 0, '60-90': 0, '90+': 0 };
  agingData.forEach(a => { agingBuckets[a.aging] = (agingBuckets[a.aging] || 0) + a.balance; });

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Payable / Receivable</h2>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 rounded-lg text-sm font-heading ${activeTab === 'summary' ? 'bg-accent text-navy' : 'bg-navy-lighter text-gray-400'}`}>Summary</button>
        <button onClick={() => loadAging('supplier')} className={`px-4 py-2 rounded-lg text-sm font-heading ${activeTab === 'aging' ? 'bg-accent text-navy' : 'bg-navy-lighter text-gray-400'}`}>Supplier Aging</button>
        <button onClick={() => loadAging('customer')} className={`px-4 py-2 rounded-lg text-sm font-heading ${activeTab === 'aging' ? 'bg-accent text-navy' : 'bg-navy-lighter text-gray-400'}`}>Customer Aging</button>
      </div>

      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-red-400">Payable (Suppliers)</h3>
              <span className="font-heading text-xl font-bold text-red-400">{totalPayable.toLocaleString()}</span>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="table-header"><th className="px-3 py-2 text-left">Supplier</th><th className="px-3 py-2 text-right">Balance</th></tr></thead>
              <tbody>
                {data.suppliers.map((p, i) => (
                  <tr key={i} className="table-row"><td className="px-3 py-2">{p.name}</td><td className="px-3 py-2 text-right text-red-400">{p.balance.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-green-400">Receivable (Customers)</h3>
              <span className="font-heading text-xl font-bold text-green-400">{totalReceivable.toLocaleString()}</span>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="table-header"><th className="px-3 py-2 text-left">Customer</th><th className="px-3 py-2 text-right">Balance</th></tr></thead>
              <tbody>
                {data.customers.map((p, i) => (
                  <tr key={i} className="table-row"><td className="px-3 py-2">{p.name}</td><td className="px-3 py-2 text-right text-green-400">{p.balance.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'aging' && (
        <div className="card">
          <h3 className="font-heading font-semibold text-white mb-4">Aging Report</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {Object.entries(agingBuckets).map(([bucket, total]) => (
              <div key={bucket} className="bg-navy-lighter rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">{bucket} days</p>
                <p className="font-heading font-bold text-lg text-white">{total.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-right">Balance</th>
              <th className="px-3 py-2 text-right">Days</th><th className="px-3 py-2 text-left">Bucket</th>
            </tr></thead>
            <tbody>
              {agingData.map((a, i) => (
                <tr key={i} className="table-row">
                  <td className="px-3 py-2">{a.name}</td>
                  <td className="px-3 py-2 text-right">{a.balance.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{a.days}</td>
                  <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded ${
                    a.aging === '0-30' ? 'bg-green-500/20 text-green-400' :
                    a.aging === '30-60' ? 'bg-yellow-500/20 text-yellow-400' :
                    a.aging === '60-90' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
                  }`}>{a.aging}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
