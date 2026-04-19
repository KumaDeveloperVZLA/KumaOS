import { System } from 'ape-ecs';
import { getFirebaseApp }  from '../../../firebase/firebaseConfig.js';
import { getFirebaseAuth } from '../../../firebase/auth.js';
import { rtdbGet, rtdbPost } from '../../../firebase/rtdbREST.js';

// Exportado para que StoreApp pueda leer el catálogo base
export const DEFAULT_APPS = {
  camera:     { name: 'Camera',     iconColorClass: 'bg-red-500 shadow-red-500/50',       location: 'home', order: 0, enabled: true },
  messages:   { name: 'Messages',   iconColorClass: 'bg-green-500 shadow-green-500/50',   location: 'home', order: 1, enabled: true },
  gallery:    { name: 'Gallery',    iconColorClass: 'bg-purple-500 shadow-purple-500/50', location: 'home', order: 2, enabled: true },
  phone:      { name: 'Phone',      iconColorClass: 'bg-white/50',                        location: 'dock', order: 0, enabled: true },
  store:      { name: 'Store',      iconColorClass: 'bg-blue-500 shadow-blue-500/50',     location: 'dock', order: 1, enabled: true },
  // Apps desinstaladas por defecto
  browser:    { name: 'Browser',    iconColorClass: 'bg-orange-500 shadow-orange-500/50', location: 'home', order: 4, enabled: false },
  settings:   { name: 'Settings',   iconColorClass: 'bg-slate-500 shadow-slate-500/50',   location: 'home', order: 5, enabled: false },
  contacts:   { name: 'Contacts',   iconColorClass: 'bg-blue-400 shadow-blue-400/50',     location: 'home', order: 6, enabled: false },
  clock:      { name: 'Clock',      iconColorClass: 'bg-black shadow-black/50',           location: 'home', order: 7, enabled: false },
  calculator: { name: 'Calculator', iconColorClass: 'bg-orange-600 shadow-orange-600/50', location: 'home', order: 8, enabled: false },
  calendar:   { name: 'Calendar',   iconColorClass: 'bg-red-400 shadow-red-400/50',       location: 'home', order: 9, enabled: false },
  notes:      { name: 'Notes',      iconColorClass: 'bg-yellow-400 shadow-yellow-400/50', location: 'home', order: 10, enabled: false },
};

export class CloudSyncSystem extends System {
  init(uid) {
    this.uid        = uid;
    this.syncActive = false;
    this.entityMap  = new Map();
    
    // Escuchar el evento de instalación para refrescar ECS al momento
    document.addEventListener('appstaller:installed', (e) => {
       const userApps = e.detail;
       this._syncToECS(userApps);
    });
  }

  update(tick) {
    if (!this.syncActive) {
      this.syncActive = true;
      this._startSync();
    }
  }

  async _startSync() {
    this._syncToECS(DEFAULT_APPS);

    try {
      const data = await rtdbGet(`users/${this.uid}/desktop/apps`);

      if (!data) {
        // Fetch to root, because rtdbREST returns data
        // Here we need PUT, but rtdbPost is POST.
        // It's actually easier to just manually PUT with fetch as before
        const app   = await getFirebaseApp();
        const dbUrl = app.options.databaseURL;
        const auth = await getFirebaseAuth();
        const token = await auth.currentUser.getIdToken();
        const base = `${dbUrl.replace(/\/$/, '')}/users/${this.uid}/desktop/apps.json?auth=${token}`;

        const writeRes = await fetch(base, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(DEFAULT_APPS)
        });
        if (!writeRes.ok) throw new Error(`Escritura fallida HTTP ${writeRes.status}.`);
        console.log('[CloudSync] Layout por defecto escrito para nuevo usuario.');
      } else {
        const merged = { ...DEFAULT_APPS, ...data };
        this._syncToECS(merged);
        console.log('[CloudSync] Layout cargado y mergeado desde Firebase RTDB.');
      }
    } catch (err) {
      console.error('[CloudSync] Error de RTDB:', err.message);
      this._showError(err.message);
    }
  }

  _showError(msg) {
    const el = document.getElementById('home-screen-container');
    if (!el) return;
    el.insertAdjacentHTML('afterbegin', `
      <div style="
        position:absolute; top:60px; left:50%; transform:translateX(-50%);
        background:rgba(180,40,40,0.9); color:white; padding:10px 18px;
        border-radius:10px; font-family:monospace; font-size:11px;
        max-width:85%; text-align:center; z-index:999; line-height:1.5;">
        <b>Firebase RTDB Error</b><br/>${msg}
      </div>
    `);
  }

  _syncToECS(appsData) {
    const incoming = new Set(Object.keys(appsData));

    // Eliminar entidades obsoletas o deshabilitadas (desinstaladas)
    for (const [appId, entity] of this.entityMap) {
      if (!incoming.has(appId) || !appsData[appId].enabled) {
        entity.destroy();
        this.entityMap.delete(appId);
      }
    }

    // Crear o actualizar entidades
    for (const [appId, appData] of Object.entries(appsData)) {
      if (!appData.enabled) continue;

      if (this.entityMap.has(appId)) {
        const manifest = this.entityMap.get(appId).c.AppManifest;
        if (manifest) {
          manifest.update({
            name:           appData.name,
            iconColorClass: appData.iconColorClass,
            location:       appData.location
          });
        }
      } else {
        const entity = this.world.createEntity({
          c: {
            AppManifest: {
              id:             appId,
              name:           appData.name,
              iconColorClass: appData.iconColorClass,
              location:       appData.location
            },
            ProcessState: {
              state: 'STOPPED'
            },
            WindowTransform: {
              isOpen:     false,
              zIndex:     10,
              fullscreen: true
            }
          }
        });
        this.entityMap.set(appId, entity);
      }
    }
  }
}
