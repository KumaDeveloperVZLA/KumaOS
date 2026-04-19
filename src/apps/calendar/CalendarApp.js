// CalendarApp.js
export function mountCalendarApp(container) {
  const d = new Date();
  container.innerHTML = `
    <div class="h-full bg-white text-black flex flex-col">
      <div class="p-4 bg-red-500 text-white text-center">
         <div class="text-xl font-bold uppercase">${d.toLocaleDateString('es-ES', { month: 'long' })}</div>
         <div class="text-6xl font-light">${d.getDate()}</div>
         <div class="text-sm mt-1">${d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric' })}</div>
      </div>
      <div class="flex-1 flex items-center justify-center bg-gray-50">
         <p class="text-gray-400">Sin eventos próximos.</p>
      </div>
    </div>
  `;
}
export function unmountCalendarApp(container) { container.innerHTML = ''; }
