// ==================== DATE HELPERS ====================

function dateToKey(d) {
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function getDaysInRange(start, end) {
  const days = [];
  const d = new Date(start);
  while (d <= end) { days.push(new Date(d)); d.setDate(d.getDate()+1); }
  return days;
}

function getMonthsInRange(start, end) {
  const months = [];
  const d = new Date(start.getFullYear(), start.getMonth(), 1);
  while (d <= end) { months.push(new Date(d)); d.setMonth(d.getMonth()+1); }
  return months;
}
