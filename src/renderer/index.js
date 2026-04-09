// Entry point para el Renderer process (la UI del OS)

console.log("🚀 KumaOS Renderer init");

import { mountShell } from './shell/Shell.js';
import { setupECS } from './ecs/world.js';

async function initOS() {
  try {
    // 1. Inicializar el motor ECS (Gestión de estado y lógica)
    console.log("Inicializando motor ECS...");
    const world = await setupECS();

    // 2. Montar la Shell visual
    console.log("Montando UI (Shell)...");
    mountShell(document.getElementById('kuma-root'));

    // 3. (Opcional) Notificar al Kernel que el booteo terminó
    if (window.kumaAPI) {
      // window.kumaAPI.systemReady();
    }
  } catch (err) {
    console.error("OS Fatal Error:", err);
    document.getElementById('kuma-root').innerHTML = `
      <div style="color: white; padding: 20px; text-align: center; font-family: monospace;">
        <h1>KERNEL PANIC</h1>
        <p>${err.message}</p>
      </div>
    `;
  }
}

// Iniciar secuecia de booteo
initOS();
