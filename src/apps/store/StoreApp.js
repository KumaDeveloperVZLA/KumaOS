/**
 * StoreApp — Fase 5
 *
 * Catálogo de aplicaciones. Permite instalar aplicaciones dinámicas 
 * que luego se resolverán gracias al lazy loading de WindowManagerSystem.
 */

import { rtdbGet } from '../../firebase/rtdbREST.js';
import { getFirebaseApp }  from '../../firebase/firebaseConfig.js';
import { getFirebaseAuth } from '../../firebase/auth.js';
import { DEFAULT_APPS } from '../../renderer/ecs/systems/CloudSyncSystem.js';

let _container = null;
let _uid = null;
let _currentLayout = null;

export async function mountStoreApp(container, uid) {
  _container = container;
  _uid = uid;
  container.innerHTML = `
    <div class="store-app flex flex-col h-full bg-slate-900 text-white overflow-hidden">
      <div class="p-5 bg-blue-600 shadow-md z-10 flex-shrink-0 flex items-center gap-3">
         <span class="text-3xl">🛍️</span>
         <div>
            <h1 class="text-xl font-bold">App Store</h1>
            <p class="text-blue-200 text-sm">Ecosistema KumaOS</p>
         </div>
      </div>
      <div id="store-content" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div class="flex justify-center py-10"><div class="app-loading-spinner text-white/50">Cargando catálogo...</div></div>
      </div>
    </div>
  `;

  await loadCatalog();
}

export function unmountStoreApp() {
  _container = null;
}

async function loadCatalog() {
  const contentEl = _container.querySelector('#store-content');
  if (!contentEl) return;

  try {
    const data = await rtdbGet(`users/${_uid}/desktop/apps`);
    _currentLayout = { ...DEFAULT_APPS, ...(data || {}) };

    // Lista de todas las apps. Omitimos store, phone, camera, messages, gallery porque ya son Core.
    const coreApps = ['store', 'phone', 'camera', 'messages', 'gallery'];
    
    const availableApps = Object.entries(_currentLayout)
      .filter(([id]) => !coreApps.includes(id))
      .map(([id, appData]) => ({ id, ...appData }));

    if (availableApps.length === 0) {
      contentEl.innerHTML = `<p class="text-center text-white/50 mt-10">No hay nuevas aplicaciones disponibles.</p>`;
      return;
    }

    contentEl.innerHTML = availableApps.map(app => `
      <div class="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg border border-white/20 ${app.iconColorClass}">
             ${_appGlyph(app.id)}
          </div>
          <div>
            <h3 class="font-bold text-lg">${app.name}</h3>
            <p class="text-xs text-white/50">${app.enabled ? 'Instalada' : 'Utilidad del sistema'}</p>
          </div>
        </div>
        ${app.enabled 
          ? `<button class="px-4 py-2 bg-white/10 text-white/50 rounded-lg text-sm font-bold cursor-not-allowed" disabled>Instalado</button>`
          : `<button id="install-btn-${app.id}" data-appid="${app.id}" class="install-btn px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">Obtener</button>`
        }
      </div>
    `).join('');

    // Agregar listeners sin usar inline
    contentEl.querySelectorAll('.install-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
         const appId = btn.dataset.appid;
         _handleInstall(appId, btn);
      });
    });

  } catch (err) {
    console.error('[StoreApp] Error:', err);
    contentEl.innerHTML = `<p class="text-red-400 text-center mt-10">Error de red: ${err.message}</p>`;
  }
}

async function _handleInstall(appId, btn) {
  const originalText = btn.innerText;
  btn.innerText = 'Instalando...';
  btn.disabled = true;
  btn.classList.add('opacity-50', 'cursor-wait');

  try {
    // 1. Clonar layout y habilitarla
    const newLayout = { ..._currentLayout };
    newLayout[appId].enabled = true;

    // 2. Put it back to Firebase directly to user node
    const app = await getFirebaseApp();
    const auth = await getFirebaseAuth();
    const token = await auth.currentUser.getIdToken();
    const base = `${app.options.databaseURL.replace(/\/$/, '')}/users/${_uid}/desktop/apps.json?auth=${token}`;

    const res = await fetch(base, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLayout)
    });

    if (!res.ok) throw new Error('Error guardando en RTDB');

    _currentLayout = newLayout;

    // 3. Avisar al ECS globalmente mediante CustomEvent
    document.dispatchEvent(new CustomEvent('appstaller:installed', { detail: _currentLayout }));

    // 4. Actualizar UI
    btn.innerText = 'Instalado';
    btn.classList.remove('bg-blue-500', 'hover:bg-blue-400', 'cursor-wait', 'opacity-50');
    btn.classList.add('bg-white/10', 'text-white/50', 'cursor-not-allowed');

  } catch (err) {
    console.error('[StoreApp] Falla al instalar:', err);
    btn.innerText = 'Fallo';
    setTimeout(() => {
       btn.innerText = originalText;
       btn.disabled = false;
       btn.classList.remove('opacity-50', 'cursor-wait');
    }, 2000);
  }
}

function _appGlyph(id) {
  const glyphs = {
    browser:  '🌐',
    settings: '⚙️',
    contacts: '👥',
    clock:    '⏰',
    calculator:'🧮',
    calendar: '📅',
    notes:    '📝'
  };
  return glyphs[id] || '📱';
}
