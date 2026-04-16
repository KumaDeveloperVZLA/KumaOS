// Entry point para el Renderer process (la UI del OS)

console.log('[KumaOS] Renderer init');

import { mountShell } from './shell/Shell.js';
import { mountLockScreen } from './shell/LockScreen.js';
import { setupECS } from './ecs/world.js';

let ecsWorld = null;
let lastTime  = 0;

function ecsTick(time) {
  // requestAnimationFrame is scheduled before try-catch so errors never kill the loop
  requestAnimationFrame(ecsTick);
  try {
    if (ecsWorld) {
      ecsWorld.runSystems('sync');    // CloudSyncSystem: Firebase → ECS
      ecsWorld.runSystems('render');  // UIRenderSystem: ECS → DOM
      ecsWorld.tick();                // Advance clock, flush change queues
      lastTime = time;
    }
  } catch (err) {
    console.error('[ECS tick error]', err);
    document.getElementById('kuma-root').innerHTML +=
      `<div style="position:absolute;z-index:9999;background:red;color:white;padding:10px;font-family:monospace;font-size:12px;">
        <b>ECS Error</b><br/>${err.message}<br/>${err.stack}
      </div>`;
  }
}

async function initOS() {
  const root = document.getElementById('kuma-root');
  try {
    // 1. Mount the visual shell frame (status bar, containers)
    console.log('[Boot] Mounting shell...');
    mountShell(root);

    // 2. Show lock screen and wait for the user to authenticate
    console.log('[Boot] Waiting for authentication...');
    const user = await mountLockScreen(root);
    console.log('[Boot] Authenticated as:', user.uid);

    // 3. Initialize the ECS world with the authenticated user
    console.log('[Boot] Starting ECS...');
    ecsWorld = await setupECS(user);

    // 4. Start the game loop
    lastTime = performance.now();
    requestAnimationFrame(ecsTick);

    if (window.kumaAPI) {
      // window.kumaAPI.systemReady();
    }

    console.log('[Boot] KumaOS ready.');
  } catch (err) {
    console.error('[Boot] Fatal error:', err);
    root.innerHTML = `
      <div style="color:white;padding:20px;text-align:center;font-family:monospace;">
        <h1 style="color:red;">KERNEL PANIC</h1>
        <p>${err.message}</p>
        <pre style="font-size:11px;text-align:left;opacity:0.6;">${err.stack}</pre>
      </div>
    `;
  }
}

initOS();
