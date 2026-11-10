import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useShortcuts() {
  const navigate = useNavigate();
  const mapRef = useRef([]);

  useEffect(() => {
    window.electronAPI.getShortcuts().then((list) => {
      mapRef.current = list || [];
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      for (const s of mapRef.current) {
        const parts = s.keys.toLowerCase().split('+').map(p => p.trim());
        const needsCtrl = parts.includes('ctrl');
        const matchKey = parts[parts.length - 1];

        if (matchKey === key && needsCtrl === ctrl) {
          e.preventDefault();
          navigate(s.path);
          return;
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate]);
}
