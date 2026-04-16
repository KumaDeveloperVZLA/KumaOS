import { System } from 'ape-ecs';
import { AppManifest } from '../components/AppManifest.js';
import { renderHomeScreenApps } from '../../shell/HomeScreen.js';
import { renderDockApps } from '../../shell/Dock.js';

export class UIRenderSystem extends System {
  init() {
    this.appQuery = this.createQuery().fromAll(AppManifest).persist();
  }

  update(tick) {
    const entities = this.appQuery.execute();
    
    const homeApps = [];
    const dockApps = [];

    for (const entity of entities) {
      const manifest = entity.c.AppManifest;
      if (manifest.location === 'home') {
        homeApps.push(manifest);
      } else if (manifest.location === 'dock') {
        dockApps.push(manifest);
      }
    }

    const homeContainer = document.getElementById('home-screen-container');
    const dockContainer = document.getElementById('dock-container');

    if (homeContainer) {
      renderHomeScreenApps(homeContainer, homeApps);
    }
    
    if (dockContainer) {
      renderDockApps(dockContainer, dockApps);
    }
  }
}
