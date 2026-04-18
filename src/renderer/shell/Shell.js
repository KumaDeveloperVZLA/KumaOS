import { renderStatusBar } from './StatusBar.js';

export function mountShell(rootElement) {
  const shellHTML = `
    <div id="status-bar-container" class="absolute top-0 w-full z-50"></div>

    <!-- HomeScreen: renderizado por UIRenderSystem -->
    <div id="home-screen-container" class="w-full h-full flex flex-col items-center justify-center"></div>

    <!-- Dock inferior -->
    <div id="dock-container" class="absolute bottom-6 w-full flex justify-center z-40"></div>

    <!-- WindowManager: ventanas fullscreen de apps nativas (gestiona WindowManagerSystem) -->
    <div id="window-manager" class="absolute inset-0 pointer-events-none z-30"></div>

    <!-- Toasts de notificación: gestionados por ToastManager -->
    <div id="toast-container" class="toast-container"></div>
  `;

  rootElement.innerHTML = shellHTML;

  const statusBarContainer = document.getElementById('status-bar-container');
  renderStatusBar(statusBarContainer);
}
