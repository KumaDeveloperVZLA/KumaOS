const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kumaAPI', {
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
  }
});
