// BrowserApp.js
export function mountBrowserApp(container) {
  container.innerHTML = `
    <div class="h-full bg-white flex flex-col text-black">
      <div class="flex items-center gap-2 p-2 bg-gray-200 border-b border-gray-300">
        <button class="px-2 font-bold text-gray-500">←</button>
        <button class="px-2 font-bold text-gray-500">→</button>
        <input type="text" value="https://kumaos.dev" class="flex-1 rounded-full px-4 py-1 text-sm bg-white" readonly />
      </div>
      <div class="flex-1 flex items-center justify-center bg-gray-50">
         <div class="text-center">
            <span class="text-5xl">🌐</span>
            <p class="mt-4 text-gray-500 font-medium">Buscador Web Mok</p>
         </div>
      </div>
    </div>
  `;
}
export function unmountBrowserApp(container) { container.innerHTML = ''; }
