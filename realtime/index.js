const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { AccessToken } = require("livekit-server-sdk");
const admin = require("firebase-admin");

// تهيئة Firebase Admin مرة واحدة فقط
if (!admin.apps.length) {
  admin.initializeApp();
}

/* =========================
   LiveKit Token Function
========================= */

const LIVEKIT_API_KEY = defineSecret("LIVEKIT_API_KEY");
const LIVEKIT_API_SECRET = defineSecret("LIVEKIT_API_SECRET");
const LIVEKIT_URL = defineSecret("LIVEKIT_URL");

exports.getToken = onRequest(
  {
    secrets: [LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL],
  },
  async (req, res) => {
    try {
      const room = req.query.room || "defaultRoom";
      const identity = req.query.identity || "guest";

      const apiKey = LIVEKIT_API_KEY.value();
      const apiSecret = LIVEKIT_API_SECRET.value();

      const at = new AccessToken(apiKey, apiSecret, {
        identity,
      });

      at.addGrant({
        roomJoin: true,
        room,
      });

      const token = await at.toJwt();

      res.json({
        token,
        url: LIVEKIT_URL.value(),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Token generation failed" });
    }
  }
);

/* =========================
   Create Teacher Function
========================= */

exports.createTeacher = onCall(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError("unauthenticated", "يجب تسجيل الدخول.");
  }

  const callerUid = auth.uid;

  // التحقق أن المنفذ super-admin
  const callerDoc = await admin
    .firestore()
    .collection("users")
    .doc(callerUid)
    .get();

  if (!callerDoc.exists || callerDoc.data().role !== "super-admin") {
    throw new HttpsError("permission-denied", "غير مصرح لك.");
  }

  const { email, password, name, gradeId, subjectId } = data;

  if (!email || !password || !name || !gradeId || !subjectId) {
    throw new HttpsError("invalid-argument", "جميع الحقول مطلوبة.");
  }

  // التأكد أن البريد غير مستخدم
  try {
    await admin.auth().getUserByEmail(email);
    throw new HttpsError("already-exists", "البريد مستخدم بالفعل.");
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
  }

  // إنشاء المستخدم في Authentication
  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName: name,
    disabled: false,
  });

  const uid = userRecord.uid;
  const now = admin.firestore.FieldValue.serverTimestamp();

  // إنشاء مستند داخل users
  await admin.firestore().collection("users").doc(uid).set({
    uid,
    email,
    name,
    photoUrl: "",
    role: "teacher",
    isTeacher: true,
    active: true,
    teacherCode: "T" + Date.now(),
    createdAt: now,
    updatedAt: now,
  });

  // ربط المعلم بالمادة
  const teacherRef = admin
    .firestore()
    .collection("grades")
    .doc(gradeId)
    .collection("subjects")
    .doc(subjectId)
    .collection("teachers")
    .doc(uid);

  const teacherDoc = await teacherRef.get();

  if (teacherDoc.exists) {
    throw new HttpsError(
      "already-exists",
      "المعلم مرتبط بهذه المادة بالفعل."
    );
  }

  await teacherRef.set({
    teacherId: uid,
    assignedAt: now,
    active: true,
  });

  return { success: true };
});