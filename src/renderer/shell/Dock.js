// Dock.js — Fase 5
import { toggleRecentApps } from './RecentAppsScreen.js';

let previousDockHTML = '';

export function renderDockApps(container, apps) {
  const sorted = [...apps].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const appsHTML = sorted.map(app => `
    <div
      id="dock-icon-${app.id}"
      data-app-id="${app.id}"
      title="${app.name}"
      class="w-12 h-12 md:w-16 md:h-16 ${app.iconColorClass} rounded-2xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-lg border border-white/20"
    >
      <span class="text-2xl">${_appGlyph(app.id)}</span>
    </div>
  `).join('');

  // Botón fijo para Recientes
  const recentBtnHTML = `
    <div
      id="dock-btn-recents"
      title="Recientes"
      class="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-lg border border-white/30 ml-2"
    >
      <span class="text-2xl">🗂️</span>
    </div>
  `;

  const contentHTML = sorted.length > 0 ? appsHTML : '<div class="text-white/50 text-sm py-2">Dock vacío</div>';

  const fullHTML = `
    <div class="glass-panel rounded-[2rem] mx-auto flex justify-center items-center gap-3 px-5 py-3 w-auto max-w-2xl shadow-2xl">
      ${contentHTML}
      <div class="w-px h-10 bg-white/20 mx-1"></div>
      ${recentBtnHTML}
    </div>
  `;

  if (previousDockHTML !== fullHTML) {
    container.innerHTML = fullHTML;
    previousDockHTML = fullHTML;

    // Listeners apps del dock
    sorted.forEach(app => {
      const el = container.querySelector(`#dock-icon-${app.id}`);
      if (!el || !app.processState) return;
      el.addEventListener('click', () => {
        app.processState.update({ state: 'RUNNING' });
      });
    });

    // Listener recientes
    const recentsBtn = container.querySelector('#dock-btn-recents');
    if (recentsBtn) {
      recentsBtn.addEventListener('click', toggleRecentApps);
    }
  }
}

export function renderDock(container) {
  renderDockApps(container, []);
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
