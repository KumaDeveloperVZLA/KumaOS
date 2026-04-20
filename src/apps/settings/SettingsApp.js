/**
 * SettingsApp — Fase 6
 *
 * Permite cambiar el tema (Light/Dark) y el fondo de pantalla
 * (usando fondos predeterminados o eligiendo de la galería).
 */
import { rtdbGet } from '../../firebase/rtdbREST.js';
import { getFirebaseApp }  from '../../firebase/firebaseConfig.js';
import { getFirebaseAuth } from '../../firebase/auth.js';

let _container = null;
let _uid = null;
let _currentSettings = { theme: 'dark', wallpaper: '' };

const DEFAULT_WALLPAPERS = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80'
];

export async function mountSettingsApp(container, uid) {
  _container = container;
  _uid = uid;

  container.innerHTML = `
    <div class="settings-app flex flex-col h-full bg-[var(--window-bg)] text-[var(--text-primary)]">
      <div class="px-5 py-4 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] z-10 flex-shrink-0 flex items-center justify-between">
         <div class="flex items-center gap-3">
            <span class="text-2xl">⚙️</span>
            <h1 class="text-lg font-bold">Ajustes</h1>
         </div>
      </div>
      <div id="settings-content" class="flex-1 overflow-y-auto p-5 scroll-smooth">
         <div class="flex justify-center py-10"><div class="animate-pulse text-[var(--text-secondary)]">Cargando preferencias...</div></div>
      </div>
    </div>
  `;

  await loadSettings();
}

export function unmountSettingsApp() {
  _container = null;
}

async function loadSettings() {
  const contentEl = _container.querySelector('#settings-content');
  if (!contentEl) return;

  try {
    const data = await rtdbGet(`users/${_uid}/desktop/settings`);
    if (data) _currentSettings = { ..._currentSettings, ...data };

    // Fetch galería local
    const galleryData = await rtdbGet(`users/${_uid}/gallery`);
    let galleryHtml = '<p class="text-[var(--text-secondary)] text-sm">Tu galería está vacía.</p>';
    
    if (galleryData) {
      const photos = Object.values(galleryData).sort((a, b) => b.timestamp - a.timestamp);
      galleryHtml = `<div class="grid grid-cols-3 gap-2">` + photos.map(photo => `
        <div class="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all wallpaper-selector select-none" data-url="${photo.dataURL}">
           <img src="${photo.dataURL}" class="w-full h-full object-cover pointer-events-none" />
        </div>
      `).join('') + `</div>`;
    }

    const defaultWallpapersHtml = `<div class="grid grid-cols-3 gap-2">` + DEFAULT_WALLPAPERS.map(url => `
        <div class="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all wallpaper-selector select-none" data-url="${url}">
           <img src="${url}" class="w-full h-full object-cover pointer-events-none" />
        </div>
    `).join('') + `</div>`;

    const isLight = _currentSettings.theme === 'light';

    contentEl.innerHTML = `
      <div class="space-y-8 pb-10">
        <!-- SECCIÓN: APARIENCIA -->
        <section>
          <h2 class="text-sm font-bold text-[#007aff] uppercase mb-3 px-1">Apariencia UI</h2>
          <div class="bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-sm">
            <div class="p-4 flex items-center justify-between">
              <span class="font-medium">Modo Claro</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="theme-toggle" class="sr-only peer" ${isLight ? 'checked' : ''}>
                <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </section>

        <!-- SECCIÓN: FONDOS POR DEFECTO -->
        <section>
          <h2 class="text-sm font-bold text-[#007aff] uppercase mb-3 px-1">Fondos Predefinidos</h2>
          ${defaultWallpapersHtml}
        </section>

        <!-- SECCIÓN: MI GALERÍA -->
        <section>
          <h2 class="text-sm font-bold text-[#007aff] uppercase mb-3 px-1">Tus Fotos (Cámara)</h2>
          ${galleryHtml}
        </section>
      </div>
    `;

    // Bind events
    const toggle = contentEl.querySelector('#theme-toggle');
    toggle.addEventListener('change', async (e) => {
       const newTheme = e.target.checked ? 'light' : 'dark';
       await _updateSetting('theme', newTheme);
    });

    contentEl.querySelectorAll('.wallpaper-selector').forEach(el => {
       el.addEventListener('click', async () => {
          const url = el.getAttribute('data-url');
          await _updateSetting('wallpaper', url);
          
          // Efecto visual local de selección
          contentEl.querySelectorAll('.wallpaper-selector').forEach(w => w.classList.remove('ring-4', 'ring-blue-500'));
          el.classList.add('ring-4', 'ring-blue-500');
       });
    });

  } catch (err) {
    console.error('[SettingsApp] Error:', err);
    contentEl.innerHTML = `<p class="text-red-400 text-center mt-10">Error de red: ${err.message}</p>`;
  }
}

async function _updateSetting(key, value) {
  _currentSettings[key] = value;
  
  // Guardamos a firebase
  try {
    const app = await getFirebaseApp();
    const auth = await getFirebaseAuth();
    const token = await auth.currentUser.getIdToken();
    const base = `${app.options.databaseURL.replace(/\/$/, '')}/users/${_uid}/desktop/settings.json?auth=${token}`;

    await fetch(base, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(_currentSettings)
    });

    // Event broadcast 
    document.dispatchEvent(new CustomEvent('kumaos:settings_changed', { detail: _currentSettings }));

  } catch (e) {
    console.error("[SettingsApp] Failed to save setting", e);
  }
}
