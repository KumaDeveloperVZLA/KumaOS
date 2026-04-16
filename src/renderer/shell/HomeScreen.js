let previousHomeHTML = '';

export function renderHomeScreenApps(container, apps) {
  const appsHTML = apps.map(app => `
    <div class="flex flex-col items-center cursor-pointer group transition-transform hover:scale-105" onclick="console.log('App clikeada: ${app.id}')">
      <div class="w-16 h-16 sm:w-20 sm:h-20 ${app.iconColorClass} rounded-2xl shadow-lg border border-white/20 mb-2 transition-shadow group-hover:shadow-white/20"></div>
      <span class="text-white text-xs sm:text-sm font-medium drop-shadow-md">${app.name}</span>
    </div>
  `).join('');

  const fullHTML = `
    <div class="w-full max-w-6xl px-10 flex-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6 md:gap-8 auto-rows-max items-start pt-10">
      ${appsHTML}
    </div>
  `;

  // Mini-optimización para no recrear el DOM cada tick a menos que cambie
  if (previousHomeHTML !== fullHTML) {
    container.innerHTML = fullHTML;
    previousHomeHTML = fullHTML;
  }
}

// Deprecado de la fase 1, pero exportado en caso de retrocompatibilidad
export function renderHomeScreen(container) {
  renderHomeScreenApps(container, []);
}
