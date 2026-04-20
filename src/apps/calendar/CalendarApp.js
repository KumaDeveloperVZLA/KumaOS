// CalendarApp.js
export function mountCalendarApp(container) {
  let currentDate = new Date(); 

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay(); // 0(Sun) - 6(Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long' });
    const today = new Date();

    let gridHtml = '';
    // Headers
    ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach(day => {
      gridHtml += `<div class="text-center text-xs font-bold text-gray-500 py-2">${day}</div>`;
    });

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
       gridHtml += `<div></div>`;
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
       const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
       const cls = isToday ? 'bg-red-500 text-white font-bold shadow-md' : 'text-gray-800 hover:bg-gray-200';
       gridHtml += `
         <div class="aspect-square flex items-center justify-center cursor-pointer p-1">
           <div class="w-full h-full rounded-full flex items-center justify-center transition-colors ${cls}">${i}</div>
         </div>
       `;
    }

    container.innerHTML = `
      <div class="h-full bg-white text-black flex flex-col animate-fade-in" id="calendar-root">
        <div class="pt-8 pb-4 px-6 bg-red-500 text-white shadow-sm flex items-center justify-between">
           <button id="cal-prev" class="w-10 h-10 flex items-center justify-center hover:bg-red-600 rounded-full transition font-bold text-xl">&lt;</button>
           <div class="text-center">
              <div class="text-xl font-bold uppercase tracking-wider">${monthName}</div>
              <div class="text-sm font-light opacity-90">${year}</div>
           </div>
           <button id="cal-next" class="w-10 h-10 flex items-center justify-center hover:bg-red-600 rounded-full transition font-bold text-xl">&gt;</button>
        </div>
        <div class="flex-1 p-4 bg-gray-50 flex flex-col">
           <div class="grid grid-cols-7 gap-x-1 gap-y-1 mb-4" id="cal-grid">
             ${gridHtml}
           </div>
           <div class="flex-1 border-t border-gray-200 pt-4 overflow-y-auto">
             <h3 class="text-sm font-bold text-gray-400 uppercase mb-3">Agenda</h3>
             <div class="flex flex-col gap-3">
                <p class="text-sm text-gray-500 italic text-center mt-4">Sin eventos próximos.</p>
             </div>
           </div>
        </div>
      </div>
    `;

    container.querySelector('#cal-prev').addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });

    container.querySelector('#cal-next').addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });
  };

  renderCalendar();
}

export function unmountCalendarApp(container) { container.innerHTML = ''; }
