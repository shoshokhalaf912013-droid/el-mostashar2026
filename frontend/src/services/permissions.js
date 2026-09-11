// services/permissions.js

// ======================================
// ROLE HELPERS
// ======================================

const getRole = (userData) => {
  return userData?.role?.toLowerCase?.() || null;
};

export const isSuperAdmin = (userData) => {
  if (!userData) return false;

  return (
    userData.isSuperAdmin === true ||
    getRole(userData) === "super-admin"
  );
};

// ======================================
// CONTENT PERMISSIONS
// ======================================

// ✅ إدارة المحتوى (إضافة + تعديل)
export const canManageContent = (userData) => {
  if (!userData) return false;

  if (isSuperAdmin(userData)) return true;

  const role = getRole(userData);

  const allowedRoles = new Set([
    "admin",
    "teacher",
  ]);

  return allowedRoles.has(role);
};

// ✅ الإضافة
export const canAddContent = (userData) => {
  return canManageContent(userData);
};

// ✅ التعديل
export const canEditContent = (userData) => {
  return canManageContent(userData);
};

// ❌ الحذف — سوبر فقط
export const canDeleteContent = (userData) => {
  return isSuperAdmin(userData);
};

// ❌ التعطيل — سوبر فقط
export const canDisableContent = (userData) => {
  return isSuperAdmin(userData);
};
// ======================================
// LIVE PERMISSIONS
// ======================================

// 🔴 بدء البث
export const canStartLive = (userData) => {
  if (!userData) return false;
  if (isSuperAdmin(userData)) return true;

  const role = getRole(userData);
  return role === "teacher";
};

// 🔴 إنهاء البث
export const canEndLive = (userData) => {
  if (!userData) return false;
  if (isSuperAdmin(userData)) return true;

  const role = getRole(userData);
  return role === "teacher";
};

// 🎤 التحكم في المايك
export const canControlMic = (userData) => {
  if (!userData) return false;
  if (isSuperAdmin(userData)) return true;

  const role = getRole(userData);
  return role === "teacher";
};

// 🎥 التحكم في الكاميرا (حسب إذن السوبر داخل الغرفة)
export const canControlCamera = (userData, roomData) => {
  if (!userData) return false;

  if (isSuperAdmin(userData)) return true;

  const role = getRole(userData);

  if (role !== "teacher") return false;

  // السوبر يحدد من داخل الغرفة
  return roomData?.permissions?.teachercameraallowed === true;
};

// ✋ رفع اليد (طالب)
export const canRaiseHand = (userData) => {
  if (!userData) return false;

  const role = getRole(userData);
  return role === "student";
};

// 👥 دخول غرفة لايف
export const canJoinLive = (userData) => {
  if (!userData) return false;

  const role = getRole(userData);

  const allowedRoles = new Set([
    "student",
    "teacher",
    "super-admin"
  ]);

  return allowedRoles.has(role);
};