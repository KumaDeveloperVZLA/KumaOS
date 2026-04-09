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
