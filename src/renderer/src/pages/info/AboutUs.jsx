import useCompanyInfo from '../../hooks/useCompanyInfo';

export default function AboutUs() {
  const { companyName, address, phone, email, ntn, strn, logo } = useCompanyInfo();

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">About</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Software Info */}
        <div className="card">
          <div className="flex justify-center mb-4">
            {logo ? (
              <div className="w-20 h-20 rounded-2xl bg-navy-lighter border border-white/[0.06] overflow-hidden flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
              </div>
            ) : (
              <div className="text-4xl text-center">📦</div>
            )}
          </div>
          <h2 className="font-heading text-2xl font-bold text-white text-center mb-1">
            Distribution Management System
          </h2>
          <p className="text-accent font-heading text-base font-semibold text-center mb-5">
            {companyName}
          </p>
          <div className="space-y-3 text-sm text-gray-400">
            {address && (
              <div className="flex justify-between items-center py-2 border-b border-navy-border">
                <span className="text-gray-500">Address</span>
                <span className="text-white font-medium text-right max-w-[250px]">{address}</span>
              </div>
            )}
            {phone && (
              <div className="flex justify-between items-center py-2 border-b border-navy-border">
                <span className="text-gray-500">Phone</span>
                <span className="text-white font-medium">{phone}</span>
              </div>
            )}
            {email && (
              <div className="flex justify-between items-center py-2 border-b border-navy-border">
                <span className="text-gray-500">Email</span>
                <span className="text-accent font-medium">{email}</span>
              </div>
            )}
            {ntn && (
              <div className="flex justify-between items-center py-2 border-b border-navy-border">
                <span className="text-gray-500">NTN</span>
                <span className="text-white font-medium">{ntn}</span>
              </div>
            )}
            {strn && (
              <div className="flex justify-between items-center py-2 border-b border-navy-border">
                <span className="text-gray-500">STRN</span>
                <span className="text-white font-medium">{strn}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-navy-border">
              <span className="text-gray-500">Version</span>
              <span className="text-white font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-navy-border">
              <span className="text-gray-500">Platform</span>
              <span className="text-white font-medium">Windows (Electron)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-navy-border">
              <span className="text-gray-500">Database</span>
              <span className="text-white font-medium">SQLite</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-navy-border">
              <span className="text-gray-500">Frontend</span>
              <span className="text-white font-medium">React + Tailwind CSS</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-navy-border">
              <span className="text-gray-500">Backend</span>
              <span className="text-white font-medium">Electron (Node.js)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500">Architecture</span>
              <span className="text-white font-medium">Desktop App</span>
            </div>
          </div>
        </div>

        {/* Owner & Developer */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-heading font-semibold text-white text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Owner
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <p className="text-white font-medium text-base">Muhummad Amin Khan</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <p className="text-accent text-sm">aminbazai118@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-heading font-semibold text-white text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Developed By
            </h3>
            <p className="font-heading font-bold text-white text-lg">Tech Solution Consultancy</p>
            <p className="text-xs text-gray-500 mt-2">&copy; {new Date().getFullYear()} All Rights Reserved</p>
          </div>
        </div>

      </div>
    </div>
  );
}
