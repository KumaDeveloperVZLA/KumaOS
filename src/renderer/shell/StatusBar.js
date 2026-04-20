export function renderStatusBar(container) {
  const updateTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeEl = container.querySelector('.time-display');
    if (timeEl) timeEl.textContent = timeString;
  };

  container.innerHTML = `
    <div class="flex justify-between items-center w-full px-6 py-3 text-text-primary text-sm font-medium drop-shadow-sm transition-colors duration-300">
      <div class="time-display text-lg tracking-wider">--:--</div>
      <div class="flex items-center space-x-3 text-base">
          <span class="opacity-80">📶</span>
          <span>WiFi</span>
          <span>🔋 100%</span>
      </div>
    </div>
  `;

  updateTime();
  setInterval(updateTime, 1000);
}
