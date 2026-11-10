export default function PrintPreview({ content, onClose }) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-8">
      <div className="bg-navy-light border border-navy-border rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-navy-border">
          <h3 className="font-heading font-semibold text-white">Print Preview</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn-primary text-sm">Print</button>
            <button onClick={onClose} className="btn-secondary text-sm">Close</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-white text-black">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
}
