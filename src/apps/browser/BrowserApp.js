// BrowserApp.js
export function mountBrowserApp(container) {
  container.innerHTML = `
    <div class="h-full bg-white flex flex-col text-black" id="browser-root">
      <div class="flex items-center gap-2 p-2 bg-gray-200 border-b border-gray-300" id="browser-nav">
        <button class="px-2 font-bold text-gray-500 hover:text-black transition-colors" id="btn-back">←</button>
        <button class="px-2 font-bold text-gray-500 hover:text-black transition-colors" id="btn-forward">→</button>
        <form id="url-form" class="flex-1 flex">
          <input type="text" id="url-input" value="https://google.com" class="flex-1 rounded-full px-4 py-1 text-sm bg-white border outline-none focus:ring-2 focus:ring-blue-400" />
        </form>
      </div>
      <div id="browser-content" class="flex-1 w-full bg-white"></div>
    </div>
  `;

  const content = container.querySelector('#browser-content');
  const form = container.querySelector('#url-form');
  const input = container.querySelector('#url-input');

  const updateBounds = () => {
    if (!content) return;
    const rect = content.getBoundingClientRect();
    const bounds = {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
    if (window.kumaAPI && window.kumaAPI.browser) {
      window.kumaAPI.browser.resize(bounds);
    }
  };

  // Se necesita un tick para que el layout se calcule correctamente
  setTimeout(() => {
    if (!content) return;
    const rect = content.getBoundingClientRect();
    const bounds = {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
    if (window.kumaAPI && window.kumaAPI.browser) {
      window.kumaAPI.browser.open(bounds, input.value);
    }
  }, 100);

  // Reposicionar BrowserView si se redimensiona la ventana
  window.addEventListener('resize', updateBounds);
  container._browserResizeHandler = updateBounds;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (val !== '' && window.kumaAPI && window.kumaAPI.browser) {
      window.kumaAPI.browser.navigate(val);
    }
  });
}

export function unmountBrowserApp(container) { 
  if (container._browserResizeHandler) {
    window.removeEventListener('resize', container._browserResizeHandler);
  }
  if (window.kumaAPI && window.kumaAPI.browser) {
    window.kumaAPI.browser.close();
  }
  container.innerHTML = ''; 
}
