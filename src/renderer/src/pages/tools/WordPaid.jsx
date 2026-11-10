import { useState } from 'react';

export default function WordPaid() {
  const [text, setText] = useState('PAID');
  const [size, setSize] = useState(72);
  const [color, setColor] = useState('#38bdf8');
  const [stampText, setStampText] = useState('');

  const handlePrint = () => {
    const content = `
      <html><head><title>Print Stamp</title>
      <style>
        body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .stamp {
          font-size: ${size}px;
          font-weight: bold;
          color: ${color};
          border: 4px solid ${color};
          padding: 20px 40px;
          transform: rotate(-15deg);
          font-family: Arial, sans-serif;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 5px;
        }
      </style></head>
      <body><div class="stamp">${stampText || text}</div></body>
    </html>`;
    const w = window.open('', '_blank');
    w.document.write(content);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-white">Word Paid</h2>
      <div className="card max-w-lg mx-auto">
        <div className="space-y-4">
          <div><label className="block text-xs text-gray-400 mb-1">Stamp Text</label>
            <input type="text" value={text} onChange={e => setText(e.target.value)} className="w-full" placeholder="PAID" />
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">Font Size</label>
            <input type="range" min="24" max="200" value={size} onChange={e => setSize(parseInt(e.target.value))} className="w-full" />
            <span className="text-xs text-gray-400">{size}px</span>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">Color</label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
          </div>

          <div className="flex justify-center py-8">
            <div
              className="font-bold border-4 rounded-lg px-8 py-4 opacity-80 select-none"
              style={{ fontSize: `${size}px`, color, borderColor: color, transform: 'rotate(-15deg)', letterSpacing: '5px' }}
            >
              {stampText || text}
            </div>
          </div>

          <div><label className="block text-xs text-gray-400 mb-1">Custom Print Text (optional)</label>
            <input type="text" value={stampText} onChange={e => setStampText(e.target.value)} className="w-full" placeholder="Leave empty to use above" />
          </div>

          <button onClick={handlePrint} className="btn-primary w-full">Print Stamp</button>
        </div>
      </div>
    </div>
  );
}
