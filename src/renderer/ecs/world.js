import { World } from 'ape-ecs';
import { AppManifest } from './components/AppManifest.js';
import { ProcessState } from './components/ProcessState.js';
import { UserSession } from './components/user.js';
import { UIRenderSystem } from './systems/UIRenderSystem.js';
import { CloudSyncSystem } from './systems/CloudSyncSystem.js';

// Receives the authenticated Firebase User object.
// Apps are no longer mock entities — they come from Firebase via CloudSyncSystem.
export async function setupECS(user) {
  console.log('[ECS] Initializing world for user:', user.uid);

  const world = new World();

  // Register Components
  world.registerComponent(AppManifest);
  world.registerComponent(ProcessState);
  world.registerComponent(UserSession);

  // Register Systems
  // 'sync' runs before 'render' so Firebase changes are reflected in the same frame
  world.registerSystem('sync', CloudSyncSystem, [user.uid]);
  world.registerSystem('render', UIRenderSystem);

  // Global entity that holds the current user session
  world.createEntity({
    c: {
      UserSession: {
        uid: user.uid,
        email: user.email || '',
        status: 'online'
      }
    }
  });

  return world;
}
