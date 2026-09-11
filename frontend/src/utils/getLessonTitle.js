/* =========================================================
   GET LESSON TITLE
   مسؤول عن تسمية الدروس فى كل المنصة
   (قديم + جديد + مستقبل)
========================================================= */

/* =========================
   المواد الأجنبية (حساسة للاسم)
========================= */
const englishSubjects = [
  "english",
  "secondLanguageFrench",
  "secondLanguageGerman",
  "secondLanguageItalian",
  "secondLanguageSpanish",
];

/* =========================
   أرقام عربية لفظياً
========================= */
const arabicNumbers = [
  "الأول",
  "الثاني",
  "الثالث",
  "الرابع",
  "الخامس",
  "السادس",
  "السابع",
  "الثامن",
  "التاسع",
  "العاشر",
  "الحادي عشر",
  "الثاني عشر",
  "الثالث عشر",
  "الرابع عشر",
  "الخامس عشر",
];

/* =========================
   أرقام إنجليزية لفظياً
========================= */
const englishNumbers = [
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
];

/* =========================================================
   الدالة الرئيسية
========================================================= */

export function getLessonTitle(subjectId, order) {
  const isEnglish = englishSubjects.includes(subjectId);

  /* ===== المواد الأجنبية ===== */
  if (isEnglish) {
    const word = englishNumbers[order - 1] || order;
    return `Lesson ${word}`;
  }

  /* ===== المواد العربية ===== */
  const word = arabicNumbers[order - 1] || order;
  return `الدرس ${word}`;
}
