const { net, app } = require('electron');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { requireAdmin } = require('../session');

function register(ipcMain, db) {
  ipcMain.handle('update:check', async (event, serverUrl) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    try {
      const url = serverUrl.replace(/\/+$/, '') + '/latest.json';
      const response = await net.fetch(url, { method: 'GET' });
      if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
      const data = await response.json();
      if (!data.version) return { success: false, error: 'Invalid latest.json format' };
      const current = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('app_version');
      const currentVersion = current?.value || '0.0.0';
      const hasUpdate = compareVersions(data.version, currentVersion) > 0;
      return { success: true, hasUpdate, currentVersion, latestVersion: data.version, releaseDate: data.releaseDate || '', downloadUrl: data.downloadUrl || '' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('update:download', async (event, downloadUrl) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    try {
      const tempDir = require('os').tmpdir();
      const fileName = path.basename(new URL(downloadUrl).pathname) || 'update-setup.exe';
      const destPath = path.join(tempDir, fileName);
      const response = await net.fetch(downloadUrl, { method: 'GET' });
      if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(destPath, buffer);
      return { success: true, filePath: destPath };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('update:install', async (event, filePath) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    try {
      exec(`"${filePath}" /S`, (err) => {
        if (err) console.error('Install exec error:', err);
        app.quit();
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('update:saveUrl', (event, url) => {
    const denied = requireAdmin(event);
    if (denied) return denied;
    const existing = db.prepare('SELECT id FROM app_settings WHERE key = ?').get('update_server_url');
    if (existing) {
      db.prepare('UPDATE app_settings SET value = ? WHERE key = ?').run(url, 'update_server_url');
    } else {
      db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?)').run('update_server_url', url);
    }
    return { success: true };
  });

  ipcMain.handle('update:getUrl', () => {
    const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('update_server_url');
    return row?.value || '';
  });
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

module.exports = { register };
