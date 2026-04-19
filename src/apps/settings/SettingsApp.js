// SettingsApp.js
export function mountSettingsApp(container) {
  container.innerHTML = `
    <div class="h-full bg-gray-100 text-black flex flex-col">
      <div class="p-4 bg-gray-200 border-b border-gray-300">
         <h2 class="font-bold text-xl text-center">Configuración</h2>
      </div>
      <div class="p-4 space-y-2 flex-1 overflow-y-auto">
         <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex justify-between"><span>Wi-Fi</span> <span class="text-blue-500">KumaNet</span></div>
         <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex justify-between"><span>Bluetooth</span> <span class="text-gray-400">Desactivado</span></div>
         <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex justify-between"><span>Pantalla</span> <span>Brillo 80%</span></div>
      </div>
    </div>
  `;
}
export function unmountSettingsApp(container) { container.innerHTML = ''; }
