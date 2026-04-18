import { System } from 'ape-ecs';
import { AppManifest }   from '../components/AppManifest.js';
import { ProcessState }  from '../components/ProcessState.js';
import { renderHomeScreenApps } from '../../shell/HomeScreen.js';
import { renderDockApps }       from '../../shell/Dock.js';

/**
 * UIRenderSystem — tick 'render'
 *
 * Lee las entidades AppManifest y las distribuye al HomeScreen y al Dock.
 * Pasa la referencia de ProcessState a cada app para que los clicks
 * en los íconos puedan actualizar el estado del proceso.
 */
export class UIRenderSystem extends System {
  init() {
    this.appQuery = this.createQuery()
      .fromAll(AppManifest, ProcessState)
      .persist();
  }

  update(tick) {
    const entities = this.appQuery.execute();

    const homeApps = [];
    const dockApps = [];

    for (const entity of entities) {
      const manifest = entity.c.AppManifest;
      const proc     = entity.c.ProcessState;

      const appData = {
        id:             manifest.id,
        name:           manifest.name,
        iconColorClass: manifest.iconColorClass,
        location:       manifest.location,
        // Referencia al componente ProcessState para actualizarlo al hacer click
        processState:   proc,
      };

      if (manifest.location === 'home') {
        homeApps.push(appData);
      } else if (manifest.location === 'dock') {
        dockApps.push(appData);
      }
    }

    const homeContainer = document.getElementById('home-screen-container');
    const dockContainer = document.getElementById('dock-container');

    if (homeContainer) renderHomeScreenApps(homeContainer, homeApps);
    if (dockContainer) renderDockApps(dockContainer, dockApps);
  }
}
