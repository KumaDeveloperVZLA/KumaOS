// ClockApp.js
export function mountClockApp(container) {
  const updateTime = () => {
     const el = container.querySelector('#clock-time');
     if(el) el.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  container.innerHTML = `
    <div class="h-full bg-black text-white flex flex-col items-center justify-center">
      <h2 class="text-gray-500 mb-2">Hora Local</h2>
      <div id="clock-time" class="text-6xl font-light font-mono">--:--:--</div>
    </div>
  `;
  const interval = setInterval(updateTime, 1000);
  updateTime();
  container._clockInterval = interval;
}
export function unmountClockApp(container) {
  clearInterval(container._clockInterval);
  container.innerHTML = '';
}
