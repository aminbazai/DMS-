const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const { initDatabase, getDb } = require('./database');

let mainWindow = null;
let db = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'DMS - SM Younas Traders',
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#0a0f1e',
    show: false,
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    checkFirstRun();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function checkFirstRun() {
  const db = getDb();
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.send('navigate', '/setup');
    });
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  db = initDatabase();
  createWindow();

  const ipcModules = [
    require('./ipc/auth.ipc'),
    require('./ipc/party.ipc'),
    require('./ipc/product.ipc'),
    require('./ipc/purchase.ipc'),
    require('./ipc/sale.ipc'),
    require('./ipc/ledger.ipc'),
    require('./ipc/account.ipc'),
    require('./ipc/report.ipc'),
    require('./ipc/stock.ipc'),
    require('./ipc/backup.ipc'),
    require('./ipc/settings.ipc'),
    require('./ipc/shortcut.ipc'),
    require('./ipc/update.ipc'),
    require('./ipc/import.ipc'),
  ];

  ipcModules.forEach(mod => mod.register(ipcMain, db));

  ipcMain.handle('util:exportPdf', async (event, { html, filename }) => {
    const pdfWindow = new BrowserWindow({
      show: false,
      webPreferences: { contextIsolation: true, nodeIntegration: false },
    });
    try {
      await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      const pdfBuffer = await pdfWindow.webContents.printToPDF({
        printBackground: true,
        margin: { top: 20, bottom: 20, left: 15, right: 15 },
      });
      pdfWindow.close();
      const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: filename || 'report.pdf',
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      });
      if (canceled || !filePath) return { success: false, canceled: true };
      fs.writeFileSync(filePath, pdfBuffer);
      return { success: true, path: filePath };
    } catch (err) {
      pdfWindow.close();
      return { success: false, error: err.message };
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (db) db.close();
  if (process.platform !== 'darwin') app.quit();
});
