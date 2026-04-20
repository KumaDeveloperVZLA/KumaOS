// NotesApp.js
import { getFirebaseAuth } from '../../firebase/auth.js';
import { rtdbGet, rtdbPost, rtdbPut, rtdbDelete } from '../../firebase/rtdbREST.js';

export async function mountNotesApp(container) {
  let notes = {};
  let currentNoteId = null;
  let cacheTitle = '';
  let cacheContent = '';
  let auth = await getFirebaseAuth();
  let uid = auth.currentUser.uid;
  let pathBase = `users/${uid}/apps/notes`;

  const loadNotes = async () => {
    try {
      const data = await rtdbGet(pathBase);
      notes = data || {};
      renderList();
    } catch(e) {
      console.error(e);
      notes = {};
      renderList();
    }
  };

  const renderList = () => {
    let listHtml = '';
    const noteKeys = Object.keys(notes).reverse();
    if(noteKeys.length === 0) {
      listHtml = `<div class="text-center text-gray-500 mt-10">No tienes notas. Crea una nueva.</div>`;
    } else {
      noteKeys.forEach(id => {
        const n = notes[id];
        listHtml += `
          <div class="p-4 bg-white/50 backdrop-blur rounded-2xl shadow-sm mb-3 cursor-pointer active:scale-95 transition-transform" data-id="${id}">
             <h3 class="font-bold text-gray-800 truncate">${n.title || 'Sin título'}</h3>
             <p class="text-sm text-gray-500 truncate mt-1">${n.content || 'Sin contenido'}</p>
          </div>
        `;
      });
    }

    container.innerHTML = `
      <div class="h-full bg-[#fdfaf6] text-black p-4 flex flex-col relative animate-fade-in">
        <h2 class="font-bold text-3xl mb-6 text-gray-800">Notas</h2>
        <div class="flex-1 overflow-y-auto pb-20" id="notes-list">
          ${listHtml}
        </div>
        <button id="btn-add" class="absolute bottom-6 right-6 w-14 h-14 bg-yellow-400 rounded-full shadow-lg flex items-center justify-center text-white text-3xl hover:bg-yellow-500 transition active:scale-90">+</button>
      </div>
    `;

    container.querySelectorAll('[data-id]').forEach(el => {
      el.addEventListener('click', () => {
        currentNoteId = el.getAttribute('data-id');
        openEditor(currentNoteId);
      });
    });

    container.querySelector('#btn-add').addEventListener('click', () => {
        currentNoteId = null;
        openEditor(null);
    });
  };

  const openEditor = (id) => {
    const isNew = !id;
    cacheTitle = isNew ? '' : notes[id].title;
    cacheContent = isNew ? '' : notes[id].content;

    container.innerHTML = `
      <div class="h-full bg-[#ffffe6] text-black flex flex-col animate-fade-in">
        <div class="flex items-center justify-between p-4 border-b border-black/5 bg-[#ffffe6] z-10 sticky top-0">
          <button id="btn-back" class="text-yellow-600 font-bold px-2 py-1 active:opacity-50 transition">← Volver</button>
          ${!isNew ? `<button id="btn-delete" class="text-red-500 font-bold text-sm px-2 py-1 active:opacity-50 transition">Eliminar</button>` : ''}
        </div>
        <div class="flex-1 overflow-y-auto p-4 flex flex-col">
           <input type="text" id="note-title" class="text-2xl font-bold bg-transparent outline-none mb-4 placeholder-gray-400" placeholder="Título" value="${cacheTitle}" />
           <textarea id="note-content" class="flex-1 bg-transparent resize-none outline-none text-lg placeholder-gray-400 leading-relaxed" placeholder="Escribe tu nota aquí...">${cacheContent}</textarea>
        </div>
      </div>
    `;

    const titleEl = container.querySelector('#note-title');
    const contentEl = container.querySelector('#note-content');

    const saveNote = async () => {
      const t = titleEl.value.trim();
      const c = contentEl.value.trim();
      if (!t && !c) return; // Vacio

      const noteData = { title: t, content: c, timestamp: Date.now() };

      if (isNew) {
        try {
           const res = await rtdbPost(pathBase, noteData);
           currentNoteId = res.name;
           notes[res.name] = noteData;
        } catch(e) { console.error(e); }
      } else {
        if(t !== cacheTitle || c !== cacheContent) {
           await rtdbPut(`${pathBase}/${id}`, noteData);
           notes[id] = noteData;
        }
      }
    };

    container.querySelector('#btn-back').addEventListener('click', async () => {
      await saveNote();
      renderList();
    });

    if(!isNew) {
      container.querySelector('#btn-delete').addEventListener('click', async () => {
         if(confirm('¿Seguro que deseas eliminar esta nota?')) {
            await rtdbDelete(`${pathBase}/${id}`);
            delete notes[id];
            renderList();
         }
      });
    }
  };

  container.innerHTML = `<div class="h-full bg-[#fdfaf6] flex items-center justify-center"><p class="text-gray-400 animate-pulse">Cargando notas...</p></div>`;
  loadNotes();
}

export function unmountNotesApp(container) { container.innerHTML = ''; }
