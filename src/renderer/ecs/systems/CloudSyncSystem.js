import { System } from 'ape-ecs';
import { getFirebaseApp }  from '../../../firebase/firebaseConfig.js';
import { getFirebaseAuth } from '../../../firebase/auth.js';

// Default app layout written to Firebase on first login.
const DEFAULT_APPS = {
  camera:   { name: 'Camera',   iconColorClass: 'bg-red-500 shadow-red-500/50',      location: 'home', order: 0, enabled: true },
  messages: { name: 'Messages', iconColorClass: 'bg-green-500 shadow-green-500/50',  location: 'home', order: 1, enabled: true },
  gallery:  { name: 'Gallery',  iconColorClass: 'bg-purple-500 shadow-purple-500/50', location: 'home', order: 2, enabled: true },
  store:    { name: 'Store',    iconColorClass: 'bg-blue-500 shadow-blue-500/50',     location: 'home', order: 3, enabled: true },
  phone:    { name: 'Phone',    iconColorClass: 'bg-white/50', location: 'dock', order: 0, enabled: true },
  browser:  { name: 'Browser',  iconColorClass: 'bg-white/50', location: 'dock', order: 1, enabled: true },
  settings: { name: 'Settings', iconColorClass: 'bg-white/50', location: 'dock', order: 2, enabled: true },
  contacts: { name: 'Contacts', iconColorClass: 'bg-white/50', location: 'dock', order: 3, enabled: true },
};

export class CloudSyncSystem extends System {
  init(uid) {
    this.uid       = uid;
    this.syncActive = false;
    this.entityMap  = new Map();
  }

  update(tick) {
    if (!this.syncActive) {
      this.syncActive = true;
      this._startSync();
    }
  }

  async _startSync() {
    // Fallback inmediato: nunca dejamos el home screen vacío
    this._syncToECS(DEFAULT_APPS);

    try {
      const app   = await getFirebaseApp();
      const dbUrl = app.options.databaseURL;
      if (!dbUrl) throw new Error('databaseURL no encontrado en la configuración de Firebase.');

      const auth = await getFirebaseAuth();
      if (!auth.currentUser) throw new Error('No hay usuario autenticado.');
      const token = await auth.currentUser.getIdToken();

      const base = `${dbUrl.replace(/\/$/, '')}/users/${this.uid}/desktop/apps.json?auth=${token}`;

      const readRes = await fetch(base);
      if (!readRes.ok) throw new Error(`HTTP ${readRes.status} — verifica las Reglas de RTDB en Firebase Console.`);

      const data = await readRes.json();

      if (!data) {
        // Usuario nuevo: escribir layout por defecto
        const writeRes = await fetch(base, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(DEFAULT_APPS)
        });
        if (!writeRes.ok) throw new Error(`Escritura fallida HTTP ${writeRes.status}.`);
        console.log('[CloudSync] Layout por defecto escrito para nuevo usuario.');
      } else {
        // Usuario existente: MERGE con DEFAULT_APPS para que apps nuevas
        // (añadidas en fases posteriores) no desaparezcan para usuarios ya registrados.
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

    // Eliminar entidades obsoletas o deshabilitadas
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
        // Actualizar manifiesto
        const manifest = this.entityMap.get(appId).c.AppManifest;
        if (manifest) {
          manifest.update({
            name:           appData.name,
            iconColorClass: appData.iconColorClass,
            location:       appData.location
          });
        }
      } else {
        // Crear nueva entidad con AppManifest + ProcessState + WindowTransform
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
