// ContactsApp.js
import { getFirebaseAuth } from '../../firebase/auth.js';
import { rtdbGet, rtdbPost, rtdbDelete } from '../../firebase/rtdbREST.js';

export async function mountContactsApp(container) {
  let contacts = {};
  let auth = await getFirebaseAuth();
  let uid = auth.currentUser.uid;
  let pathBase = `users/${uid}/apps/contacts`;

  const loadContacts = async () => {
    try {
      const data = await rtdbGet(pathBase);
      contacts = data || {};
      renderList();
    } catch(e) {
       console.error(e);
       contacts = {};
       renderList();
    }
  };

  const renderList = () => {
    let listHtml = '';
    const keys = Object.keys(contacts).sort((a,b) => contacts[a].name.localeCompare(contacts[b].name));
    
    if(keys.length === 0) {
      listHtml = `<div class="text-center text-gray-500 mt-20">Tu agenda está vacía.</div>`;
    } else {
      keys.forEach(id => {
        const c = contacts[id];
        listHtml += `
          <div class="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition relative group">
            <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-sm">${c.name[0].toUpperCase()}</div>
            <div class="flex-1 min-w-0">
              <span class="text-lg font-medium text-gray-800 tracking-tight truncate block">${c.name}</span>
              <p class="text-sm text-gray-500 truncate mt-0.5">${c.contactInfo}</p>
            </div>
            <button data-delete="${id}" class="text-red-400 opacity-0 group-hover:opacity-100 transition px-3 py-1 text-sm font-semibold hover:text-red-600 active:scale-95 bg-red-50 rounded-full">Borrar</button>
          </div>
        `;
      });
    }

    container.innerHTML = `
      <div class="h-full bg-white text-black flex flex-col relative animate-fade-in" id="contacts-root">
        <div class="p-6 bg-gray-50 border-b border-gray-200">
           <h2 class="font-bold text-3xl tracking-tight text-gray-800">Contactos</h2>
        </div>
        <div class="flex-1 overflow-y-auto">
           ${listHtml}
           <div class="h-20"></div> 
        </div>
        <button id="btn-add-contact" class="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full shadow-blue-500/30 shadow-lg flex items-center justify-center text-white text-3xl hover:bg-blue-600 transition active:scale-95">+</button>
      </div>
    `;

    container.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-delete');
        if(confirm(`¿Eliminar a ${contacts[id].name}?`)) {
           try {
             const originalHtml = btn.innerHTML;
             btn.innerText = '...';
             await rtdbDelete(`${pathBase}/${id}`);
             delete contacts[id];
             renderList();
           } catch(e) {
             btn.innerText = 'Error';
           }
        }
      });
    });

    container.querySelector('#btn-add-contact').addEventListener('click', () => {
      renderForm();
    });
  };

  const renderForm = () => {
    container.innerHTML = `
      <div class="h-full bg-white text-black flex flex-col animate-fade-in" id="contacts-form">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <button id="btn-cancel" class="text-gray-500 font-medium px-2 py-1 active:opacity-50 transition">Cancelar</button>
          <span class="font-bold text-lg">Nuevo Contacto</span>
          <button id="btn-save" class="text-blue-600 font-bold px-2 py-1 active:opacity-50 transition">Guardar</button>
        </div>
        <div class="p-6 flex flex-col gap-6">
           <div class="flex justify-center mb-4">
              <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center shadow-inner">
                 <span class="text-4xl text-gray-400">👤</span>
              </div>
           </div>
           <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Nombre Completo</label>
              <input type="text" id="contact-name" class="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition" placeholder="Ej. Ana García" />
           </div>
           <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Teléfono o Correo</label>
              <input type="text" id="contact-info" class="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition" placeholder="Ej. ana@mail.com" />
           </div>
           <p id="contact-error" class="text-red-500 text-sm hidden text-center mt-2"></p>
        </div>
      </div>
    `;

    container.querySelector('#btn-cancel').addEventListener('click', () => {
      renderList();
    });

    container.querySelector('#btn-save').addEventListener('click', async () => {
      const name = container.querySelector('#contact-name').value.trim();
      const info = container.querySelector('#contact-info').value.trim();
      const err = container.querySelector('#contact-error');
      
      if(!name || !info) {
         err.innerText = "Debes ingresar el nombre y un dato de contacto.";
         err.classList.remove('hidden');
         return;
      }
      
      const btn = container.querySelector('#btn-save');
      btn.innerText = "Guardando...";
      btn.disabled = true;

      try {
        const payload = { name, contactInfo: info, timestamp: Date.now() };
        const res = await rtdbPost(pathBase, payload);
        contacts[res.name] = payload;
        renderList();
      } catch(e) {
        err.innerText = "Error al guardar en la nube.";
        err.classList.remove('hidden');
        btn.innerText = "Guardar";
        btn.disabled = false;
      }
    });
  };

  container.innerHTML = `<div class="h-full bg-white flex items-center justify-center"><p class="text-gray-400 animate-pulse">Cargando contactos...</p></div>`;
  loadContacts();
}

export function unmountContactsApp(container) { container.innerHTML = ''; }
