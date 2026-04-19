import { System } from 'ape-ecs';
import { AppManifest }   from '../components/AppManifest.js';
import { ProcessState }  from '../components/ProcessState.js';
import { renderHomeScreenApps } from '../../shell/HomeScreen.js';
import { renderDockApps }       from '../../shell/Dock.js';
import { renderRecentApps }     from '../../shell/RecentAppsScreen.js';

/**
 * UIRenderSystem — tick 'render'
 *
 * Lee las entidades AppManifest y las distribuye al HomeScreen, Dock,
 * y Visor de Recientes. Pasa la referencia de ProcessState a cada app.
 */
export class UIRenderSystem extends System {
  init() {
    this.appQuery = this.createQuery()
      .fromAll(AppManifest, ProcessState)
      .persist();
  }

  update(tick) {
    const entities = this.appQuery.execute();

    const homeApps   = [];
    const dockApps   = [];
    const recentApps = [];
    const appsMap    = new Map();

    for (const entity of entities) {
      const manifest = entity.c.AppManifest;
      const proc     = entity.c.ProcessState;

      const appData = {
        id:             manifest.id,
        name:           manifest.name,
        iconColorClass: manifest.iconColorClass,
        location:       manifest.location,
        state:          proc.state,
        processState:   proc,
      };

      appsMap.set(manifest.id, appData);
      recentApps.push(appData);

      if (manifest.location === 'home') {
        homeApps.push(appData);
      } else if (manifest.location === 'dock') {
        dockApps.push(appData);
      }
    }

    const homeContainer   = document.getElementById('home-screen-container');
    const dockContainer   = document.getElementById('dock-container');
    const recentContainer = document.getElementById('recent-apps-container');

    if (homeContainer)   renderHomeScreenApps(homeContainer, homeApps);
    if (dockContainer)   renderDockApps(dockContainer, dockApps);
    if (recentContainer) renderRecentApps(recentContainer, recentApps);
  }
}
