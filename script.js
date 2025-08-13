const container  = document.querySelector('.ceefax-container');
const pageInfo   = document.querySelector('.page-info');
const navItems   = document.querySelectorAll('.navigation li');

navItems.forEach(li => {
  li.addEventListener('click', () => {
    const target = parseInt(li.dataset.page, 10);
    goToPage(target);
  });
});

function goToPage(target) {
  let current = parseInt(pageInfo.textContent.substring(1), 10);
  if (current === target) return;

  const step = current < target ? 1 : -1;
  const interval = setInterval(() => {
    current += step;
    pageInfo.textContent = 'P' + String(current).padStart(3, '0');
    if (current === target) {
      clearInterval(interval);
      screenRefresh();
    }
  }, 40);
}

function screenRefresh() {
  const overlay = document.createElement('div');
  overlay.className = 'refresh-overlay';
  overlay.style.height = '0%';
  container.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.transition = 'height 200ms linear';
    overlay.style.height = '100%';
    overlay.addEventListener('transitionend', () => {
      overlay.style.transition = 'height 200ms linear';
      overlay.style.height = '0%';
      overlay.addEventListener('transitionend', () => {
        container.removeChild(overlay);
      }, { once: true });
    }, { once: true });
  });
}
