// RecentAppsScreen.js — Fase 5
// Visor de tareas recientes. Muestra las apps en estado PAUSED o RUNNING.

let isRecentAppsOpen = false;
let previousRecentHTML = '';

/**
 * toggleRecentApps() es llamado por el botón del Dock.
 */
export function toggleRecentApps() {
  const container = document.getElementById('recent-apps-container');
  if (!container) return;

  isRecentAppsOpen = !isRecentAppsOpen;
  
  if (isRecentAppsOpen) {
    container.style.display = 'flex';
    // Pequeño timeout para permitir que display flex se aplique antes de animar opacidad
    setTimeout(() => {
      container.classList.add('recent-apps--open');
    }, 10);
  } else {
    container.classList.remove('recent-apps--open');
    // Esperar transición antes de ocultar
    setTimeout(() => {
      container.style.display = 'none';
    }, 300);
  }
}

export function closeRecentApps() {
  if (isRecentAppsOpen) toggleRecentApps();
}

/**
 * @param {HTMLElement} container
 * @param {Array<{id, name, iconColorClass, processState, state}>} recentApps
 */
export function renderRecentApps(container, recentApps) {
  // Filtramos: queremos mostrar las apps que NO están STOPPED.
  const apps = recentApps.filter(app => app.state === 'PAUSED' || app.state === 'RUNNING');

  const appsHTML = apps.map(app => `
    <div class="recent-app-card flex flex-col items-center gap-2 group relative">
      <!-- Botón para matar (STOP) -->
      <button 
        id="recent-kill-${app.id}"
        class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500/80 text-white z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-md transform hover:scale-110"
        aria-label="Cerrar ${app.name}"
      >✕</button>

      <!-- App Snapshot / Icon -->
      <div 
        id="recent-resume-${app.id}"
        class="w-32 h-48 sm:w-40 sm:h-56 rounded-2xl ${app.iconColorClass} flex items-center justify-center cursor-pointer shadow-xl transition-transform transform hover:-translate-y-2 border-2 border-white/10"
      >
         <span class="text-4xl">${_appGlyph(app.id)}</span>
      </div>
      <span class="text-white text-sm font-medium drop-shadow">${app.name}</span>
    </div>
  `).join('');

  const fullHTML = `
    <!-- Overlay click interceptor para cerrar -->
    <div id="recent-apps-overlay" class="absolute inset-0 z-0"></div>
    
    <div class="relative z-10 w-full overflow-x-auto pb-8 pt-4 px-8 hide-scrollbar">
      <div class="flex items-center gap-6 justify-start sm:justify-center min-w-max">
        ${apps.length > 0 ? appsHTML : '<p class="text-white/50 text-lg">No hay apps recientes</p>'}
      </div>
    </div>
  `;

  if (previousRecentHTML !== fullHTML) {
    container.innerHTML = fullHTML;
    previousRecentHTML = fullHTML;

    // Attach listeners a todos los items del DOM (Seguridad Electron Strict CSP)
    const overlay = container.querySelector('#recent-apps-overlay');
    if (overlay) overlay.addEventListener('click', closeRecentApps);

    apps.forEach(app => {
      const resumeBtn = container.querySelector(`#recent-resume-${app.id}`);
      const killBtn = container.querySelector(`#recent-kill-${app.id}`);

      if (resumeBtn) {
        resumeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (app.processState) {
            app.processState.update({ state: 'RUNNING' });
            closeRecentApps();
          }
        });
      }

      if (killBtn) {
        killBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (app.processState) {
            app.processState.update({ state: 'STOPPED' });
          }
        });
      }
    });
  }
}


function _appGlyph(id) {
  const glyphs = {
    camera:   '📷',
    messages: '💬',
    gallery:  '🖼️',
    store:    '🛍️',
    phone:    '📞',
    browser:  '🌐',
    settings: '⚙️',
    contacts: '👥',
    clock:    '⏰',
    build:    '🔨',
    calendar: '📅',
    calculator:'🧮',
    notes:    '📝'
  };
  return glyphs[id] || '📱';
}
