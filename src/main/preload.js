const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kumaAPI', {
  // Firebase config — fetched from main process so credentials stay out of bundle.js
  firebase: {
    getConfig: () => ipcRenderer.invoke('firebase:getConfig')
  },

  // Hardware capabilities
  camera: {
    takePhoto: () => ipcRenderer.invoke('hardware:camera:takePhoto'),
    startStream: () => ipcRenderer.invoke('hardware:camera:startStream')
  },
  
  // OS System calls
  system: {
    closeDevice: () => ipcRenderer.invoke('system:closeDevice'),
    getBatteryInfo: () => ipcRenderer.invoke('system:getBatteryInfo')
  },
  
  // Storage capabilities (si las apps necesitan guardar persistencia localmente fuera de firebase)
  storage: {
    readData: (key) => ipcRenderer.invoke('storage:read', key),
    writeData: (key, data) => ipcRenderer.invoke('storage:write', key, data)
  },

  // Browser API - Para incrustar una vista nativa del navegador
  browser: {
    open: (bounds, url) => ipcRenderer.invoke('browser:open', bounds, url),
    close: () => ipcRenderer.invoke('browser:close'),
    resize: (bounds) => ipcRenderer.invoke('browser:resize', bounds),
    navigate: (url) => ipcRenderer.invoke('browser:navigate', url)
  }
});
