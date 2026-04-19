// CalculatorApp.js
export function mountCalculatorApp(container) {
  container.innerHTML = `
    <div class="h-full bg-black text-white flex flex-col p-4">
      <div class="flex-1 flex items-end justify-end pb-4 font-light text-6xl">0</div>
      <div class="grid grid-cols-4 gap-3">
         ${['C','±','%','÷', '7','8','9','×', '4','5','6','-', '1','2','3','+', '0','.','='].map(btn => {
           let cols = btn === '0' ? 'col-span-2' : '';
           let bg = ['÷','×','-','+','='].includes(btn) ? 'bg-orange-500' : (['C','±','%'].includes(btn) ? 'bg-gray-300 text-black' : 'bg-gray-800');
           return `<div class="${cols} ${bg} flex items-center justify-center rounded-full text-2xl font-medium aspect-square select-none cursor-pointer hover:opacity-80">${btn}</div>`
         }).join('')}
      </div>
    </div>
  `;
}
export function unmountCalculatorApp(container) { container.innerHTML = ''; }
