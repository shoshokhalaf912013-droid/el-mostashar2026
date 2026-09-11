/* =====================================================
   🎂 Birthday Engine
   Stable + 24H Session + Internal Test Mode
===================================================== */

/* ========= TEST SWITCH (للتجربة فقط) ========= */
/*
   true  = تشغيل عيد الميلاد لكل المستخدمين
   false = النظام الحقيقي فقط
*/
const BIRTHDAY_TEST_MODE = true;

export function shouldShowBirthday(birthDate, userId) {

  /* ================= TEST MODE ================= */
  if (BIRTHDAY_TEST_MODE) {
    return true;
  }

  /* ================= REAL SYSTEM ================= */
  if (!birthDate || !userId) return false;

  const today = new Date();

  const todayKey =
    today.getFullYear() +
    "-" +
    (today.getMonth() + 1) +
    "-" +
    today.getDate();

  const storageKey = `birthday-${userId}`;

  const savedKey = localStorage.getItem(storageKey);

  const birth = new Date(birthDate);

  const isBirthday =
    birth.getDate() === today.getDate() &&
    birth.getMonth() === today.getMonth();

  if (!isBirthday) {
    localStorage.removeItem(storageKey);
    return false;
  }

  if (savedKey === todayKey) {
    return true;
  }

  localStorage.setItem(storageKey, todayKey);
  return true;
}