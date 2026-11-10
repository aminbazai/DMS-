import { create } from 'zustand';

const themes = [
  { id: 'navy', name: 'Navy', primary: '#38bdf8', bg: '#060b18' },
  { id: 'midnight', name: 'Midnight', primary: '#a855f7', bg: '#0a0a1a' },
  { id: 'emerald', name: 'Emerald', primary: '#10b981', bg: '#0a1a0a' },
  { id: 'ruby', name: 'Ruby', primary: '#ef4444', bg: '#1a0a0a' },
  { id: 'amber', name: 'Amber', primary: '#f59e0b', bg: '#1a140a' },
  { id: 'obsidian', name: 'Obsidian', primary: '#22d3ee', bg: '#000000' },
  { id: 'ocean', name: 'Ocean', primary: '#14b8a6', bg: '#0a0d1a' },
  { id: 'lavender', name: 'Lavender', primary: '#c084fc', bg: '#0e0a1a' },
  { id: 'forest', name: 'Forest', primary: '#84cc16', bg: '#0a1a0e' },
  { id: 'rosegold', name: 'Rose Gold', primary: '#fb7185', bg: '#1a0a14' },
];

const saved = localStorage.getItem('dms-theme');
const initialTheme = saved && themes.find(t => t.id === saved) ? saved : 'navy';

const useTheme = create((set) => ({
  theme: initialTheme,
  themes,
  setTheme: (id) => {
    localStorage.setItem('dms-theme', id);
    document.documentElement.setAttribute('data-theme', id);
    set({ theme: id });
  },
}));

export default useTheme;
