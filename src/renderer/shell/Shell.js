import { renderStatusBar } from './StatusBar.js';

export function mountShell(rootElement) {
  // Configuración de la estructura visual base de la shell
  
  const shellHTML = `
    <div id="status-bar-container" class="absolute top-0 w-full z-50"></div>
    <!-- HomeScreen ya no auto-renderiza hardcode. Se renderizará por el ECS. -->
    <div id="home-screen-container" class="w-full h-full flex flex-col items-center justify-center"></div>
    <div id="dock-container" class="absolute bottom-6 w-full flex justify-center z-40"></div>
    <!-- Áreas dinámicas como ventanas o notificaciones irán aquí -->
    <div id="window-manager" class="absolute inset-0 pointer-events-none z-30"></div>
  `;

  rootElement.innerHTML = shellHTML;

  const statusBarContainer = document.getElementById('status-bar-container');
  // StatusBar por ahora sigue estático (esto tocaría migrar en fase de cloud si se requiere reloj dinámico)
  renderStatusBar(statusBarContainer);
}
