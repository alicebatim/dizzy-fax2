// Config
const SCAN_DELAY_MS = 100; // 0.1s between increments (adjust to taste)
const MIN_PAGE = 100;
const MAX_PAGE = 999;

// State
let currentPage = 100;
let scanTimer = null;
let inputBuffer = '';

// Elements
const elWrapper  = document.getElementById('ceefax');
const elPageInfo = document.getElementById('pageInfo');
const elDate     = document.getElementById('datePart');
const elTime     = document.getElementById('timePart');
const elTitle    = document.querySelector('.page-title');

// Clock (yellow time, white date handled in CSS)
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

// Render helpers
function renderNormal() {
  elPageInfo.textContent = `P${String(currentPage).padStart(3, '0')}`;
}

function renderPartial(buffer) {
  // Show incomplete entry as underscores (P1__, P12_)
  const partial = buffer.padEnd(3, '_');
  elPageInfo.textContent = `P${partial}`;
}

function renderScanning(targetPage) {
  // Show current and target, target stays green
  elPageInfo.innerHTML =
    `P${String(currentPage).padStart(3, '0')} ` +
    `<span id="targetPageSpan" class="scan-green">${String(targetPage).padStart(3, '0')}</span>`;
}

// Start scan after 3 digits are entered
function startPageScan(targetPage) {
  targetPage = Math.max(MIN_PAGE, Math.min(MAX_PAGE, targetPage));

  // Stop any existing scan
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }

  // If already on target, just normalize UI
  if (targetPage === currentPage) {
    cleanupScanUI();
    renderNormal();
    return;
  }

  // Begin scan visuals
  elWrapper.classList.add('scanning');
  elTitle.classList.add('scan-green');
  renderScanning(targetPage);

  scanTimer = setInterval(() => {
    currentPage++;
    if (currentPage > MAX_PAGE) currentPage = MIN_PAGE;

    renderScanning(targetPage);

 if (currentPage === targetPage) {
  clearInterval(scanTimer);
  scanTimer = null;

  // Stop scanning visuals
  elWrapper.classList.remove('scanning');
  elTitle.classList.remove('scan-green');

  // Remove green and immediately match title/date colour
  const targetEl = document.getElementById('targetPageSpan');
  if (targetEl) {
    targetEl.classList.remove('scan-green');
    targetEl.style.color = window.getComputedStyle(elTitle).color;
  }

  // Keep showing current & target together
  renderScanning(targetPage);
}
  }, SCAN_DELAY_MS);
}

function cleanupScanUI() {
  elWrapper.classList.remove('scanning');
  elTitle.classList.remove('scan-green');
  const targetEl = document.getElementById('targetPageSpan');
  if (targetEl) targetEl.classList.remove('scan-green');
}

// Public API (optional)
window.gotoPage = function(n) {
  inputBuffer = ''; // ensure we don't mix buffered entry with programmatic nav
  startPageScan(parseInt(n, 10));
};

// Keyboard: wait for exactly three digits
window.addEventListener('keydown', (e) => {
  if (!/^\d$/.test(e.key)) return;

  // If a digit arrives while scanning, treat it as the "4th" and cancel
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
    cleanupScanUI();
    renderNormal();
    inputBuffer = ''; // reset buffer
    return; // ignore this digit
  }

  // Build the three-digit buffer
  if (inputBuffer.length < 3) {
    inputBuffer += e.key;
    if (inputBuffer.length < 3) {
      // Show partial entry, do not scan
      renderPartial(inputBuffer);
      return;
    }
  }

  // Exactly three digits entered: turn title & target green, then scan
  const target = parseInt(inputBuffer, 10);
  inputBuffer = '';

  // Pre-render target in green immediately
  elTitle.classList.add('scan-green');
  elPageInfo.innerHTML =
    `P${String(currentPage).padStart(3, '0')} ` +
    `<span id="targetPageSpan" class="scan-green">${String(target).padStart(3, '0')}</span>`;

  startPageScan(target);
});
// FAST TEXT BUTTON HANDLERS
document.querySelectorAll('.fasttext').forEach(btn => {
  btn.addEventListener('click', () => {
    const pageNum = parseInt(btn.getAttribute('data-page'), 10);

    // Cancel any ongoing scan first
    if (scanTimer) {
      clearInterval(scanTimer);
      scanTimer = null;
      cleanupScanUI();
    }

    // Clear any partial typed input
    inputBuffer = '';

    // Jump straight into scanning to the target page
    startPageScan(pageNum);
  });
});
// Initial render
renderNormal();
