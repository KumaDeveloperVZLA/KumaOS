const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,  // Default Desktop width
    height: 768,  // Default Desktop height
    resizable: true, // Permitir redimenizón para testear responsividad
    frame: true, // Mostrar borde nativo del PC de momento para facilitar manipulación
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools in dev mode
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  // Conceder permiso de cámara automáticamente (el OS simulado lo requiere).
  // El usuario ya autorizó el uso de la cámara al instalar la app.
  mainWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const allowedPermissions = ['media', 'mediaKeySystem', 'camera'];
      callback(allowedPermissions.includes(permission));
    }
  );

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Firebase config: served securely via IPC so credentials never land in bundle.js
ipcMain.handle('firebase:getConfig', () => ({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
}));

// Import and initialize IPC handlers
require('./ipc/ipcHandler');
