const EN_UNITS = [
  "One", "Two", "Three", "Four", "Five",
  "Six", "Seven", "Eight", "Nine", "Ten"
];

const AR_UNITS = [
  "الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة",
  "السادسة", "السابعة", "الثامنة", "التاسعة", "العاشرة"
];

export function getNextUnitOrder(units = []) {
  if (!units.length) return 1;

  return Math.max(...units.map(u => Number(u.order) || 0)) + 1;
}

export function getUnitBadge(order) {
  return `UNIT ${order}`;
}

export function getUnitTitle({ order, isArabic, customTitle }) {
  if (customTitle) return customTitle;

  if (isArabic) {
    return `الوحدة ${AR_UNITS[order - 1] || order}`;
  }

  return `Unit ${EN_UNITS[order - 1] || order}`;
}
