// Config
const SCAN_DELAY_MS = 10;
const MIN_PAGE = 100;
const MAX_PAGE = 999;

// State
let currentPage = 100;
let scanTimer = null;
let inputBuffer = '';

const elWrapper  = document.getElementById('ceefax');
const elPageInfo = document.getElementById('pageInfo');
const elDate     = document.getElementById('datePart');
const elTime     = document.getElementById('timePart');

// Clock
function updateClock() {
  const now = new Date();
  const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  const dayName = days[now.getDay()];
  const dayNum  = String(now.getDate()).padStart(2, '0');
  const month   = months[now.getMonth()];
  const hours   = String(now.getHours()).padStart(2, '0');
  const mins    = String(now.getMinutes()).padStart(2, '0');
  const secs    = String(now.getSeconds()).padStart(2, '0');

  elDate.textContent = `${dayName} ${dayNum} ${month}`;
  elTime.textContent = `${hours}:${mins}:${secs}`;
}
setInterval(updateClock, 1000);
updateClock();

function renderPage(targetPage = null) {
  if (targetPage && scanTimer) {
    const isHit = currentPage === targetPage;
    elPageInfo.innerHTML = 
      `P${String(currentPage).padStart(3, '0')} <span class="target-page${isHit ? ' hit' : ''}">${String(targetPage).padStart(3, '0')}</span>`;
  } else {
    elPageInfo.textContent = `P${String(currentPage).padStart(3, '0')}`;
  }
}



function startPageScan(targetPage) {
  targetPage = Math.max(MIN_PAGE, Math.min(MAX_PAGE, targetPage));

  // Kill any existing scan
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }

  if (targetPage === currentPage) {
    elWrapper.classList.remove('scanning');
    renderPage();
    return;
  }

  elWrapper.classList.add('scanning');

  scanTimer = setInterval(() => {
    currentPage++;
    if (currentPage > MAX_PAGE) currentPage = MIN_PAGE;

    renderPage(targetPage); // show both current & target

    if (currentPage === targetPage) {
      clearInterval(scanTimer);
      scanTimer = null;
      elWrapper.classList.remove('scanning');
      renderPage(); // revert to normal view
    }
  }, SCAN_DELAY_MS);
}


window.gotoPage = function(n) {
  startPageScan(parseInt(n, 10));
};

// Keyboard handling
window.addEventListener('keydown', (e) => {
  if (!/^\d$/.test(e.key)) return;

  // Cancel scanning if 4th digit pressed
  if (inputBuffer.length >= 3) {
    inputBuffer = '';
    if (scanTimer) {
      clearInterval(scanTimer);
      scanTimer = null;
      elWrapper.classList.remove('scanning');
      renderPage();
    }
    return;
  }

  inputBuffer += e.key;
  const display = inputBuffer.padEnd(3, ' ');
  elPageInfo.textContent = `P${display}`;

  if (inputBuffer.length === 3) {
    const target = parseInt(inputBuffer, 10);
    inputBuffer = '';
    startPageScan(target);
  }
});


renderPage();
