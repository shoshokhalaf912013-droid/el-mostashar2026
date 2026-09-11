/* =====================================================
   UNIVERSAL UNIT TITLE GENERATOR
   يعمل لكل المنصة (ماضى + حاضر + مستقبل)
===================================================== */

/* ========= المواد الأجنبية ========= */

const foreignSubjects = [
  "english",
  "secondLanguageFrench",
  "secondLanguageGerman",
  "secondLanguageItalian",
  "secondLanguageSpanish",
];

/* ========= أرقام عربى ========= */

const arabicNumbers = [
  "الأولى",
  "الثانية",
  "الثالثة",
  "الرابعة",
  "الخامسة",
  "السادسة",
  "السابعة",
  "الثامنة",
  "التاسعة",
  "العاشرة",
  "الحادية عشرة",
  "الثانية عشرة",
];

/* ========= أرقام إنجليزى ========= */

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
];

/* ===================================================== */

export function generateUnitTitle(order, subjectId) {

  const isForeign = foreignSubjects.includes(subjectId);

  /* ===== مواد اللغات ===== */
  if (isForeign) {
    const word = englishNumbers[order - 1] || order;
    return `Unit ${word}`;
  }

  /* ===== مواد عربى ===== */
  const word = arabicNumbers[order - 1] || order;
  return `الوحدة ${word}`;
}
