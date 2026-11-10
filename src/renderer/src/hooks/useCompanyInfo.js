import { useState, useEffect } from 'react';

export default function useCompanyInfo() {
  const [info, setInfo] = useState(null);

  const load = async () => {
    try {
      const data = await window.electronAPI.getGeneralInfo();
      if (data && data.id) setInfo(data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  return {
    companyName: info?.company_name || 'SM Younas Traders',
    address: info?.address || '',
    phone: info?.phone || '',
    email: info?.email || '',
    ntn: info?.ntn || '',
    strn: info?.strn || '',
    logo: info?.logo_path || '',
    financialYearStart: info?.financial_year_start || '',
    currencyId: info?.currency_id || '',
    refresh: load,
  };
}
