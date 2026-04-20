// CalculatorApp.js
export function mountCalculatorApp(container) {
  container.innerHTML = `
    <div class="h-full bg-black text-white flex flex-col p-4 animate-fade-in" id="calc-root">
      <div class="flex-1 flex flex-col items-end justify-end pb-4 font-light overflow-hidden">
         <div id="calc-history" class="text-2xl text-gray-500 min-h-[32px] break-all"></div>
         <div id="calc-display" class="text-6xl truncate w-full text-right transition-all">0</div>
      </div>
      <div class="grid grid-cols-4 gap-3 select-none" id="calc-keypad"></div>
    </div>
  `;

  const displayEl = container.querySelector('#calc-display');
  const historyEl = container.querySelector('#calc-history');
  const keypad = container.querySelector('#calc-keypad');

  let currentVal = '0';
  let previousVal = null;
  let operation = null;
  let resetNext = false;

  const buttons = [
    { label: 'C', type: 'action', color: 'bg-gray-300 text-black active:bg-gray-200' },
    { label: '±', type: 'action', color: 'bg-gray-300 text-black active:bg-gray-200' },
    { label: '%', type: 'action', color: 'bg-gray-300 text-black active:bg-gray-200' },
    { label: '÷', type: 'operator', color: 'bg-orange-500 active:bg-orange-400' },
    { label: '7', type: 'number', color: 'bg-gray-800 active:bg-gray-700' },
    { label: '8', type: 'number', color: 'bg-gray-800 active:bg-gray-700' },
    { label: '9', type: 'number', color: 'bg-gray-800 active:bg-gray-700' },
    { label: '×', type: 'operator', color: 'bg-orange-500 active:bg-orange-400' },
    { label: '4', type: 'number', color: 'bg-gray-800 active:bg-gray-700' },
    { label: '5', type: 'number', color: 'bg-gray-800 active:bg-gray-700' },
    { label: '6', type: 'number', color: 'bg-gray-800 active:bg-gray-700' },
    { label: '-', type: 'operator', color: 'bg-orange-500 active:bg-orange-400' },
    { label: '1', type: 'number', color: 'bg-gray-800 active:bg-gray-700' },
    { label: '2', type: 'number', color: 'bg-gray-800 active:bg-gray-700' },
    { label: '3', type: 'number', color: 'bg-gray-800 active:bg-gray-700' },
    { label: '+', type: 'operator', color: 'bg-orange-500 active:bg-orange-400' },
    { label: '0', type: 'number', color: 'col-span-2 bg-gray-800 active:bg-gray-700 text-left pl-[25%]' },
    { label: '.', type: 'number', color: 'bg-gray-800 active:bg-gray-700' },
    { label: '=', type: 'equals', color: 'bg-orange-500 active:bg-orange-400' }
  ];

  buttons.forEach(btn => {
    const el = document.createElement('div');
    el.className = `${btn.color} flex items-center justify-center rounded-full text-3xl font-medium cursor-pointer transition-all active:scale-95`;
    if(btn.label !== '0') el.classList.add('aspect-square');
    else el.style.aspectRatio = "2 / 0.95";
    el.innerText = btn.label;
    el.addEventListener('click', () => handleInput(btn.label, btn.type));
    keypad.appendChild(el);
  });

  const updateUI = () => {
    displayEl.innerText = formatNumber(currentVal);
    if(previousVal !== null && operation) {
      historyEl.innerText = `${formatNumber(previousVal)} ${operation}`;
    } else {
      historyEl.innerText = '';
    }
    
    // Cambiar etiqueta dinámica de AC/C
    const firstButton = keypad.firstChild;
    if (currentVal !== '0') {
      firstButton.innerText = "C";
    } else {
      firstButton.innerText = "AC";
    }
  };

  const formatNumber = (numStr) => {
    if(numStr === 'Error') return numStr;
    const parts = numStr.toString().split('.');
    parts[0] = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
    return parts.join('.');
  };

  const compute = () => {
    let p = parseFloat(previousVal);
    let c = parseFloat(currentVal);
    if(isNaN(p) || isNaN(c)) return;
    let res = 0;
    switch(operation) {
      case '+': res = p + c; break;
      case '-': res = p - c; break;
      case '×': res = p * c; break;
      case '÷': res = c === 0 ? 'Error' : p / c; break;
    }
    currentVal = res.toString();
    if(currentVal.length > 12) currentVal = res.toPrecision(10).replace(/\\.0+$/, '');
    operation = null;
    previousVal = null;
    resetNext = true;
  };

  const handleInput = (val, type) => {
    if(currentVal === 'Error') {
      currentVal = '0';
      previousVal = null;
      operation = null;
    }

    if(type === 'number') {
      if(resetNext) { currentVal = '0'; resetNext = false; }
      if(val === '.' && currentVal.includes('.')) return;
      if(currentVal === '0' && val !== '.') currentVal = val;
      else if(currentVal.length < 12) currentVal += val;
    } 
    else if(type === 'action') {
      if(val === 'C' || val === 'AC') {
        if(val === 'C' && currentVal !== '0') { currentVal = '0'; }
        else { currentVal = '0'; previousVal = null; operation = null; }
      }
      else if(val === '±') {
        currentVal = (parseFloat(currentVal) * -1).toString();
      }
      else if(val === '%') {
        currentVal = (parseFloat(currentVal) / 100).toString();
      }
    }
    else if(type === 'operator') {
      if(operation && !resetNext) {
         compute();
      }
      previousVal = currentVal;
      operation = val;
      resetNext = true;
    }
    else if(type === 'equals') {
      if(operation) {
        compute();
      }
    }
    updateUI();
  };

  updateUI();
}

export function unmountCalculatorApp(container) { container.innerHTML = ''; }
