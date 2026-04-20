const { ipcMain, app } = require('electron');

// Ejemplo de manejadores de procesos del sistema
ipcMain.handle('system:closeDevice', () => {
  app.quit();
});

ipcMain.handle('system:getBatteryInfo', async () => {
  // Aquí se podría implementar la lectura de la batería del host
  return { level: 100, isCharging: true };
});

// Los manejadores de hardware específicos se pueden importar y registrar aquí
require('../hardware/camera')(ipcMain);

// ---- BROWSER VIEW MANAGER ----
const { BrowserView, BrowserWindow } = require('electron');

let browserView = null;

ipcMain.handle('browser:open', (event, bounds, url) => {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (!mainWindow) return;

  if (!browserView) {
    browserView = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
  }

  mainWindow.setBrowserView(browserView);
  browserView.setBounds(bounds);
  browserView.webContents.loadURL(url || 'https://www.google.com');
  
  // Opcionalmente podemos configurar un color de fondo para que no se vea transparente antes de cargar
  browserView.setBackgroundColor('#ffffff');
});

ipcMain.handle('browser:close', () => {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow && browserView) {
    mainWindow.removeBrowserView(browserView);
    // Nota: en versiones futuras WebContentsView toma control de la limpieza más explícita
  }
});

ipcMain.handle('browser:resize', (event, bounds) => {
  if (browserView) {
    browserView.setBounds(bounds);
  }
});

ipcMain.handle('browser:navigate', (event, url) => {
  if (browserView) {
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = 'https://' + url;
    }
    browserView.webContents.loadURL(finalUrl);
  }
});

