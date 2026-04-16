export function renderStatusBar(container) {
  const updateTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeEl = container.querySelector('.time-display');
    if (timeEl) timeEl.textContent = timeString;
  };

  container.innerHTML = `
    <div class="flex justify-between items-center w-full px-6 py-3 text-white text-sm font-medium drop-shadow-md">
      <div class="time-display">--:--</div>
      <div class="flex items-center space-x-3">
          <span>📶</span>
          <span>WiFi</span>
          <span>🔋 100%</span>
      </div>
    </div>
  `;

  updateTime();
  setInterval(updateTime, 1000);
}
