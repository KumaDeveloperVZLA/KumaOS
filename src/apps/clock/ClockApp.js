// ClockApp.js
export function mountClockApp(container) {
  container.innerHTML = `
    <div class="h-full bg-black text-white flex flex-col pt-8 animate-fade-in">
      <div class="flex justify-center space-x-6 mb-8 text-sm font-semibold">
        <button id="tab-clock" class="text-orange-500 uppercase tracking-widest border-b-2 border-orange-500 pb-1 transition-colors">Reloj</button>
        <button id="tab-stopwatch" class="text-gray-500 uppercase tracking-widest border-b-2 border-transparent pb-1 transition-colors hover:text-gray-300">Cronómetro</button>
      </div>

      <div id="view-clock" class="flex-1 flex flex-col items-center justify-center">
        <div id="clock-time" class="text-7xl font-light font-mono">--:--</div>
        <div id="clock-sec" class="text-2xl text-gray-400 mt-2 font-mono">--</div>
      </div>

      <div id="view-stopwatch" class="hidden flex-1 flex flex-col items-center justify-center">
        <div id="sw-time" class="text-6xl font-light font-mono tabular-nums">00:00.00</div>
        <div class="flex gap-4 mt-10">
          <button id="sw-reset" class="w-20 h-20 rounded-full bg-gray-800 text-white font-medium hover:bg-gray-700 transition">Reiniciar</button>
          <button id="sw-start" class="w-20 h-20 rounded-full bg-green-900/50 text-green-500 font-medium hover:bg-green-800/60 transition">Iniciar</button>
        </div>
      </div>
    </div>
  `;

  // Clock Logic
  const clockSec = container.querySelector('#clock-sec');
  const clockTime = container.querySelector('#clock-time');
  const updateClock = () => {
    const d = new Date();
    clockTime.innerText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    clockSec.innerText = d.getSeconds().toString().padStart(2, '0');
  };
  const clockInterval = setInterval(updateClock, 1000);
  updateClock();

  // Stopwatch Logic
  const swTime = container.querySelector('#sw-time');
  const swStart = container.querySelector('#sw-start');
  const swReset = container.querySelector('#sw-reset');
  let startTime = 0;
  let elapsedTime = 0;
  let timerInterval = null;
  let isRunning = false;

  const updateSwUI = () => {
    const tempTime = elapsedTime + (isRunning ? Date.now() - startTime : 0);
    const ms = Math.floor((tempTime % 1000) / 10).toString().padStart(2, '0');
    const totalSecs = Math.floor(tempTime / 1000);
    const s = (totalSecs % 60).toString().padStart(2, '0');
    const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    swTime.innerText = `${m}:${s}.${ms}`;
  };

  swStart.addEventListener('click', () => {
    if (isRunning) {
      clearInterval(timerInterval);
      elapsedTime += Date.now() - startTime;
      isRunning = false;
      swStart.innerText = 'Iniciar';
      swStart.className = 'w-20 h-20 rounded-full bg-green-900/50 text-green-500 font-medium hover:bg-green-800/60 transition';
      swReset.innerText = 'Reiniciar';
    } else {
      startTime = Date.now();
      timerInterval = setInterval(updateSwUI, 30);
      isRunning = true;
      swStart.innerText = 'Pausar';
      swStart.className = 'w-20 h-20 rounded-full bg-red-900/50 text-red-500 font-medium hover:bg-red-800/60 transition';
      swReset.innerText = 'Vuelta'; 
    }
  });

  swReset.addEventListener('click', () => {
    if (!isRunning) {
      elapsedTime = 0;
      updateSwUI();
    }
  });

  updateSwUI();

  // Tabs Logic
  const tabClock = container.querySelector('#tab-clock');
  const tabStopwatch = container.querySelector('#tab-stopwatch');
  const viewClock = container.querySelector('#view-clock');
  const viewStopwatch = container.querySelector('#view-stopwatch');

  tabClock.addEventListener('click', () => {
    tabClock.className = "text-orange-500 uppercase tracking-widest border-b-2 border-orange-500 pb-1 transition-colors";
    tabStopwatch.className = "text-gray-500 uppercase tracking-widest border-b-2 border-transparent pb-1 transition-colors hover:text-gray-300";
    viewClock.classList.remove('hidden');
    viewStopwatch.classList.add('hidden');
  });

  tabStopwatch.addEventListener('click', () => {
    tabStopwatch.className = "text-orange-500 uppercase tracking-widest border-b-2 border-orange-500 pb-1 transition-colors";
    tabClock.className = "text-gray-500 uppercase tracking-widest border-b-2 border-transparent pb-1 transition-colors hover:text-gray-300";
    viewStopwatch.classList.remove('hidden');
    viewClock.classList.add('hidden');
  });

  container._clockIntervals = { clock: clockInterval, timer: timerInterval };
}

export function unmountClockApp(container) {
  if(container._clockIntervals) {
    clearInterval(container._clockIntervals.clock);
    clearInterval(container._clockIntervals.timer);
  }
  container.innerHTML = '';
}
