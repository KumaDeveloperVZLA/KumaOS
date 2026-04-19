// ContactsApp.js
export function mountContactsApp(container) {
  container.innerHTML = `
    <div class="h-full bg-white text-black flex flex-col">
      <div class="p-4 bg-gray-100 border-b border-gray-300">
         <h2 class="font-bold text-2xl">Contactos</h2>
      </div>
      <div class="flex-1 overflow-y-auto">
         ${['Ana', 'Beto', 'Carlos', 'Diana', 'Elena', 'Fernando'].map(name => `
           <div class="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
             <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">${name[0]}</div>
             <span class="text-lg">${name}</span>
           </div>
         `).join('')}
      </div>
    </div>
  `;
}
export function unmountContactsApp(container) { container.innerHTML = ''; }
