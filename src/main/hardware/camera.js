module.exports = (ipcMain) => {
  ipcMain.handle('hardware:camera:takePhoto', async () => {
    // Aquí iría la lógica para interactuar con la cámara usando Node.js 
    // o APIs del host. Por ahora es un stub.
    console.log('[Kernel] Simulando captura de foto...');
    return 'base64_encoded_image_placeholder';
  });

  ipcMain.handle('hardware:camera:startStream', async () => {
    // Stub
    console.log('[Kernel] Iniciando stream de cámara...');
    return true;
  });
};
