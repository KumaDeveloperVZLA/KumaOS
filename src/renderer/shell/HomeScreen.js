// HomeScreen.js — Fase 4
// Los clicks en íconos ahora actualizan el ProcessState de la entidad a 'RUNNING'.

let previousHomeHTML = '';

/**
 * @param {HTMLElement} container
 * @param {Array<{id, name, iconColorClass, location, processState}>} apps
 */
export function renderHomeScreenApps(container, apps) {
  // Ordenar por campo `order` si existe
  const sorted = [...apps].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const appsHTML = sorted.map(app => `
    <div
      id="app-icon-${app.id}"
      class="app-icon flex flex-col items-center cursor-pointer group transition-transform hover:scale-105"
      data-app-id="${app.id}"
      role="button"
      tabindex="0"
      aria-label="Abrir ${app.name}"
    >
      <div class="w-16 h-16 sm:w-20 sm:h-20 ${app.iconColorClass} rounded-[22px] shadow-xl border border-[var(--glass-border)] mb-2 transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] flex items-center justify-center">
        <span class="app-icon-glyph">${_appGlyph(app.id)}</span>
      </div>
      <span class="text-text-primary text-xs sm:text-sm font-medium drop-shadow-sm">${app.name}</span>
    </div>
  `).join('');

  const fullHTML = `
    <div class="w-full max-w-6xl px-10 flex-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6 md:gap-8 auto-rows-max items-start pt-10">
      ${appsHTML}
    </div>
  `;

  if (previousHomeHTML !== fullHTML) {
    container.innerHTML = fullHTML;
    previousHomeHTML = fullHTML;

    // Adjuntar listeners de click para lanzar apps
    sorted.forEach(app => {
      const el = container.querySelector(`#app-icon-${app.id}`);
      if (!el || !app.processState) return;

      const launch = () => {
        console.log(`[HomeScreen] Lanzando: ${app.id}`);
        app.processState.update({ state: 'RUNNING' });
      };

      el.addEventListener('click', launch);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') launch();
      });
    });
  }
}

// Deprecado de la fase 1, mantenido para retrocompatibilidad
export function renderHomeScreen(container) {
  renderHomeScreenApps(container, []);
}

// Emojis/glyphs para cada app conocida
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
    calculator:'🧮',
    calendar: '📅',
    notes:    '📝'
  };
  return glyphs[id] || '📱';
}
