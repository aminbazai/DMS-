import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import useTheme from './hooks/useTheme';
import './index.css';

const saved = localStorage.getItem('dms-theme') || 'navy';
document.documentElement.setAttribute('data-theme', saved);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
