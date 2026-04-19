// NotesApp.js
export function mountNotesApp(container) {
  container.innerHTML = `
    <div class="h-full bg-[#ffffe6] text-black p-4 flex flex-col">
      <h2 class="font-bold text-xl border-b border-black/10 pb-2 mb-4">Notas Rápidas</h2>
      <textarea class="flex-1 bg-transparent resize-none outline-none text-lg" placeholder="Escribe aquí..."></textarea>
    </div>
  `;
}
export function unmountNotesApp(container) { container.innerHTML = ''; }
