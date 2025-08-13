function updateClock() {
  const now = new Date();
  const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  const dayName = days[now.getDay()];
  const dayNum  = String(now.getDate()).padStart(2, '0');
  const month   = months[now.getMonth()];
  const hours   = String(now.getHours()).padStart(2, '0');
  const mins    = String(now.getMinutes()).padStart(2, '0');
  const secs    = Math.floor(now.getSeconds() / 10); // Ceefax style

  document.getElementById('timestamp').textContent =
    `${dayName} ${dayNum} ${month} ${hours}:${mins}/${secs}`;
}

setInterval(updateClock, 1000);
updateClock();
