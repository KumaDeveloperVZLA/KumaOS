import { renderStatusBar } from './StatusBar.js';

export function mountShell(rootElement) {
  const shellHTML = `
    <!-- Capa de Fondo (Wallpaper) -->
    <div id="wallpaper-layer" class="absolute inset-0 bg-cover bg-center bg-[#222] transition-colors duration-500 z-0"></div>

    <!-- UI Overlay (App Shell) con z-10 en adelante -->
    <div id="os-root" class="absolute inset-0 z-10 flex text-text-primary font-sans transition-colors duration-300">
      
      <div id="status-bar-container" class="absolute top-0 w-full z-50"></div>

      <!-- HomeScreen: renderizado por UIRenderSystem -->
      <div id="home-screen-container" class="w-full h-full flex flex-col items-center justify-center"></div>

      <!-- Dock inferior -->
      <div id="dock-container" class="absolute bottom-6 w-full flex justify-center z-40 pb-4"></div>

      <!-- WindowManager: ventanas fullscreen de apps nativas (gestiona WindowManagerSystem) -->
      <div id="window-manager" class="absolute inset-0 pointer-events-none z-30"></div>

      <!-- Toasts de notificación: gestionados por ToastManager -->
      <div id="toast-container" class="toast-container"></div>

      <!-- Visor de Recientes (Multitarea) -->
      <div id="recent-apps-container" class="recent-apps flex items-center justify-center" style="display:none;"></div>
      
    </div>
  `;

  rootElement.innerHTML = shellHTML;

  const statusBarContainer = document.getElementById('status-bar-container');
  renderStatusBar(statusBarContainer);
}
