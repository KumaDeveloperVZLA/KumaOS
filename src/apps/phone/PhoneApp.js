// PhoneApp.js
export function mountPhoneApp(container) {
  container.innerHTML = `
    <div class="h-full bg-black text-white flex flex-col p-8 items-center justify-center">
      <div class="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <div class="text-4xl mb-12 border-b border-gray-700 w-full text-center pb-2 px-4 whitespace-pre h-14" id="phone-display"> </div>
        <div class="grid grid-cols-3 gap-6 w-full max-w-[280px]">
          ${[1,2,3,4,5,6,7,8,9,'*',0,'#'].map(n => `
            <div class="phone-btn rounded-full bg-gray-800 text-3xl font-light w-20 h-20 flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-700 active:bg-gray-600 select-none">
              ${n}
            </div>
          `).join('')}
        </div>
        <div class="mt-12">
            <button class="w-20 h-20 rounded-full bg-green-500 hover:bg-green-400 text-white text-3xl flex items-center justify-center cursor-pointer transition-colors shadow-lg active:scale-95">
              📞
            </button>
        </div>
      </div>
    </div>
  `;

  const display = container.querySelector('#phone-display');
  container.querySelectorAll('.phone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
       let val = btn.innerText.trim();
       if (display.innerText === ' ') display.innerText = val;
       else display.innerText += val;
    });
  });
}
export function unmountPhoneApp(container) { container.innerHTML = ''; }
