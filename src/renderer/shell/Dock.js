let previousDockHTML = '';

export function renderDockApps(container, apps) {
  const appsHTML = apps.map(app => `
    <div onclick="console.log('Dock app clikeada: ${app.id}')" title="${app.name}" class="w-12 h-12 md:w-16 md:h-16 ${app.iconColorClass} rounded-xl transition-colors cursor-pointer shadow-sm"></div>
  `).join('');

  const fullHTML = `
    <div class="glass-panel rounded-3xl mx-auto flex justify-center items-center gap-4 px-6 md:px-8 py-4 w-[90%] max-w-2xl shadow-2xl">
      ${appsHTML || '<div class="text-white/50 text-sm">Empty</div>'}
    </div>
  `;

  if (previousDockHTML !== fullHTML) {
    container.innerHTML = fullHTML;
    previousDockHTML = fullHTML;
  }
}

export function renderDock(container) {
  renderDockApps(container, []);
}
