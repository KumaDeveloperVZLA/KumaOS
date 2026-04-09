import { renderStatusBar } from './StatusBar.js';
import { renderHomeScreen } from './HomeScreen.js';
import { renderDock } from './Dock.js';

export function mountShell(rootElement) {
  // Configuración de la estructura visual base de la shell
  
  const shellHTML = `
    <div id="status-bar-container"></div>
    <div id="home-screen-container"></div>
    <div id="dock-container"></div>
    <!-- Áreas dinámicas como ventanas o notificaciones irán aquí -->
    <div id="window-manager"></div>
  `;

  rootElement.innerHTML = shellHTML;

  // Montar componentes individuales
  const statusBarContainer = document.getElementById('status-bar-container');
  const homeScreenContainer = document.getElementById('home-screen-container');
  const dockContainer = document.getElementById('dock-container');

  renderStatusBar(statusBarContainer);
  renderHomeScreen(homeScreenContainer);
  renderDock(dockContainer);
}

