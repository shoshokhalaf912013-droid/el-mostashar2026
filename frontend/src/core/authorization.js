/* =====================================
   ROLES
===================================== */

export const ROLES = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
};

/* =====================================
   PERMISSIONS MAP
   🔥 SINGLE SOURCE OF TRUTH
===================================== */

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    manageLessons: true,
    startLive: true,
    uploadFiles: true,
  },

  [ROLES.ADMIN]: {
    manageLessons: true,
    startLive: true,
    uploadFiles: true,
  },

  [ROLES.TEACHER]: {
    manageLessons: true,
    startLive: true,
    uploadFiles: true,
  },

  [ROLES.STUDENT]: {
    manageLessons: false,
    startLive: false,
    uploadFiles: false,
  },
};

/* =====================================
   HELPERS
===================================== */

export const hasPermission = (role, permission) =>
  ROLE_PERMISSIONS[role]?.[permission] === true;