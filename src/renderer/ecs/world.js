import { World } from 'ape-ecs';
import { AppManifest }      from './components/AppManifest.js';
import { ProcessState }     from './components/ProcessState.js';
import { WindowTransform }  from './components/WindowTransform.js';
import { UserSession }      from './components/user.js';
import { UIRenderSystem }       from './systems/UIRenderSystem.js';
import { CloudSyncSystem }      from './systems/CloudSyncSystem.js';
import { WindowManagerSystem }  from './systems/WindowManagerSystem.js';
import { startMessagesBackgroundSync } from '../../apps/messages/MessagesApp.js';

// Recibe el objeto Firebase User autenticado.
export async function setupECS(user) {
  console.log('[ECS] Initializing world for user:', user.uid);

  const world = new World();

  // ── Registrar Componentes ────────────────────────────────────────────────
  world.registerComponent(AppManifest);
  world.registerComponent(ProcessState);
  world.registerComponent(WindowTransform);
  world.registerComponent(UserSession);

  // ── Registrar Sistemas ───────────────────────────────────────────────────
  // 'sync'   → CloudSyncSystem: Firebase RTDB → ECS entities
  // 'render' → UIRenderSystem:  ECS → HomeScreen / Dock DOM
  //            WindowManagerSystem: ECS ProcessState → app windows DOM
  world.registerSystem('sync',   CloudSyncSystem,     [user.uid]);
  world.registerSystem('render', UIRenderSystem);
  world.registerSystem('render', WindowManagerSystem, [user.uid]);

  // ── Entidad de sesión global ─────────────────────────────────────────────
  world.createEntity({
    c: {
      UserSession: {
        uid:    user.uid,
        email:  user.email || '',
        status: 'online'
      }
    }
  });

  // ── Notificaciones en background (mensajes nuevos) ───────────────────────
  await startMessagesBackgroundSync(user.uid);

  return world;
}
