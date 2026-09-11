import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase";
import { lessonRef } from "../../utils/lessonRef";
import useUserRole from "../../hooks/useUserRole";

/* =========================================================
   STYLES
========================================================= */

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, #181818 0%, #050505 55%, #000 100%)",
  padding: "35px",
  color: "#fff",
};

const cardStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  background: "rgba(15,15,15,0.96)",
  border: "1px solid rgba(255,215,0,0.22)",
  borderRadius: "20px",
  padding: "30px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#facc15",
  fontWeight: "700",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  marginBottom: "18px",
  background: "#fff",
  color: "#111",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  outline: "none",
  fontSize: "15px",
  boxSizing: "border-box",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "120px",
  resize: "vertical",
};

const sectionStyle = {
  marginTop: "25px",
  padding: "22px",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "15px",
};

const primaryButtonStyle = {
  background: "linear-gradient(135deg, #FFD700, #b89600)",
  color: "#000",
  border: "none",
  padding: "13px 26px",
  borderRadius: "10px",
  fontWeight: "800",
  fontSize: "15px",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  background: "#202020",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.15)",
  padding: "13px 22px",
  borderRadius: "10px",
  fontWeight: "700",
  cursor: "pointer",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function AddLesson() {
  const navigate = useNavigate();
  const { role } = useUserRole();

  /* =======================================================
     PERMISSIONS

     Teacher + Admin + Super Admin
     لديهم صلاحية إضافة الدرس.
  ======================================================= */

  const canManage =
    role === "teacher" ||
    role === "admin" ||
    role === "super-admin";

  /* =======================================================
     SELECTION DATA
  ======================================================= */

  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);

  const [loadingGrades, setLoadingGrades] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  /* =======================================================
     SELECTED VALUES
  ======================================================= */

  const [gradeId, setGradeId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [unitId, setUnitId] = useState("");

  /* =======================================================
     LESSON DATA
  ======================================================= */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // الفيديو اختياري
  const [videoUrl, setVideoUrl] = useState("");

  /* =======================================================
     UI STATE
  ======================================================= */

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD GRADES
  ======================================================= */

  useEffect(() => {
    const loadGrades = async () => {
      try {
        setLoadingGrades(true);
        setError("");

        const q = query(
          collection(db, "grades"),
          where("active", "==", true),
          orderBy("order", "asc")
        );

        const snap = await getDocs(q);

        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setGrades(data);
      } catch (err) {
        console.error("❌ Error loading grades:", err);
        setError("تعذر تحميل الصفوف.");
      } finally {
        setLoadingGrades(false);
      }
    };

    if (canManage) {
      loadGrades();
    }
  }, [canManage]);

  /* =======================================================
     LOAD SUBJECTS

     مهم:
     لا نستخدم active + orderBy في نفس Query
     حتى لا نحتاج Composite Index جديد.

     نحضر كل مواد الصف ثم:
     - نستبعد فقط المواد التي active === false
     - نرتبها محليًا.
  ======================================================= */

  useEffect(() => {
    const loadSubjects = async () => {
      if (!gradeId) {
        setSubjects([]);
        return;
      }

      try {
        setLoadingSubjects(true);
        setError("");

        const q = query(
          collection(db, "gradeSubjects"),
          where("gradeId", "==", gradeId)
        );

        const snap = await getDocs(q);

        const data = snap.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          // إذا active غير موجود نعتبر المادة فعالة
          .filter((subject) => subject.active !== false)
          .sort(
            (a, b) =>
              (Number(a.order) || 0) -
              (Number(b.order) || 0)
          );

        console.log(
          "✅ Subjects for grade:",
          gradeId,
          data
        );

        setSubjects(data);
      } catch (err) {
        console.error(
          "❌ Error loading subjects:",
          err
        );

        setSubjects([]);
        setError("تعذر تحميل المواد.");
      } finally {
        setLoadingSubjects(false);
      }
    };

    setSubjectId("");
    setUnitId("");
    setUnits([]);

    loadSubjects();
  }, [gradeId]);

  /* =======================================================
     LOAD UNITS
  ======================================================= */

  useEffect(() => {
    const loadUnits = async () => {
      if (!gradeId || !subjectId) {
        setUnits([]);
        return;
      }

      try {
        setLoadingUnits(true);
        setError("");

        const q = query(
          collection(db, "units"),
          where("systemId", "==", "general"),
          where("gradeId", "==", gradeId),
          where("subjectId", "==", subjectId)
        );

        const snap = await getDocs(q);

        const data = snap.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          .filter((unit) => unit.active !== false);

        data.sort(
          (a, b) =>
            (Number(a.order) || 0) -
            (Number(b.order) || 0)
        );

        console.log(
          "✅ Units:",
          gradeId,
          subjectId,
          data
        );

        setUnits(data);
      } catch (err) {
        console.error(
          "❌ Error loading units:",
          err
        );

        setUnits([]);
        setError("تعذر تحميل الوحدات.");
      } finally {
        setLoadingUnits(false);
      }
    };

    setUnitId("");
    loadUnits();
  }, [gradeId, subjectId]);

  /* =======================================================
     PUBLIC LESSON ID

     هذا هو الـID الذي يظهر للطالب في الرابط.
     الـFirestore document ID الحقيقي يظل داخليًا.
  ======================================================= */

  const generatePublicLessonId = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    let value = "L";

    for (let i = 0; i < 10; i += 1) {
      value += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }

    return value;
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (!canManage) {
      setError("ليس لديك صلاحية إضافة درس.");
      return;
    }

    if (!gradeId) {
      setError("اختر الصف أولًا.");
      return;
    }

    if (!subjectId) {
      setError("اختر المادة أولًا.");
      return;
    }

    if (!unitId) {
      setError("اختر الوحدة أولًا.");
      return;
    }

    if (!title.trim()) {
      setError("عنوان الدرس مطلوب.");
      return;
    }

    try {
      setLoading(true);

      /* ====================================================
         إنشاء ID للدرس
      ==================================================== */

      const lessonsCollection = collection(
        db,
        "grades",
        gradeId,
        "subjects",
        subjectId,
        "units",
        unitId,
        "lessons"
      );

      const newLessonDoc = doc(lessonsCollection);

      const newLessonId = newLessonDoc.id;
      const publicLessonId = generatePublicLessonId();

      /* ====================================================
         المرجع الموحد للدرس
      ==================================================== */

      const ref = lessonRef(
        gradeId,
        subjectId,
        unitId,
        newLessonId
      );

      /* ====================================================
         إنشاء الدرس
      ==================================================== */

      await setDoc(ref, {
        id: newLessonId,
        publicLessonId,

        title: title.trim(),

        description: description.trim(),

        teacherId: null,

        // رابط الفيديو لا يُحفظ داخل وثيقة الدرس.
        // سيتم حفظه في lessonVideos/{lessonId} المحمية بالـFirestore Rules.

        pdfUrl: "",

        imageUrl: "",

        active: true,

        gradeId,

        subjectId,

        unitId,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      });

      /* ====================================================
         حفظ الفيديو في وثيقة منفصلة محمية
         لا يستطيع الطالب قراءتها إلا باشتراك فعال.
      ==================================================== */
      if (videoUrl.trim()) {
        let videoId = null;

        try {
          const parsed = new URL(videoUrl.trim());

          if (parsed.hostname.includes("youtu.be")) {
            videoId = parsed.pathname.replace(/^\//, "").split("/")[0] || null;
          } else if (parsed.hostname.includes("youtube.com")) {
            videoId = parsed.searchParams.get("v");

            if (!videoId) {
              const parts = parsed.pathname.split("/").filter(Boolean);
              const index = parts.findIndex((part) =>
                ["embed", "shorts", "live"].includes(part)
              );

              if (index !== -1 && parts[index + 1]) {
                videoId = parts[index + 1];
              }
            }
          }
        } catch (videoError) {
          console.error("❌ Invalid YouTube URL:", videoError);
        }

        if (!videoId) {
          throw new Error("رابط YouTube غير صحيح.");
        }

        await setDoc(
          doc(db, "lessonVideos", newLessonId),
          {
            lessonId: newLessonId,
            videoUrl: `https://www.youtube.com/embed/${videoId}`,
            videoType: "youtube",
            gradeId,
            subjectId,
            unitId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setSuccess(true);

      /* ====================================================
         فتح محرر الدرس الحقيقي
      ==================================================== */

      setTimeout(() => {
        navigate(
          `/teacher/lesson-builder/${gradeId}/${subjectId}/${unitId}/${newLessonId}`
        );
      }, 700);
    } catch (err) {
      console.error(
        "❌ Create lesson error:",
        err
      );

      setError(
        err?.message ||
          "حدث خطأ أثناء إنشاء الدرس."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     ACCESS DENIED
  ======================================================= */

  if (!canManage) {
    return (
      <div style={pageStyle} dir="rtl">
        <div style={cardStyle}>
          <h2
            style={{
              color: "#ef4444",
              marginBottom: "10px",
            }}
          >
            غير مصرح
          </h2>

          <p>
            ليس لديك صلاحية إضافة درس.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div style={pageStyle} dir="rtl">
      <div style={cardStyle}>

        {/* ================= HEADER ================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#FFD700",
                fontSize: "28px",
              }}
            >
              إضافة درس جديد
            </h1>

            <p
              style={{
                marginTop: "8px",
                opacity: 0.7,
              }}
            >
              أنشئ الدرس داخل الصف والمادة والوحدة الصحيحة.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/teacher/lessons")
            }
            style={secondaryButtonStyle}
          >
            ← العودة للدروس
          </button>
        </div>

        {/* ================= SUCCESS ================= */}

        {success && (
          <div
            style={{
              background: "#065f46",
              border:
                "1px solid rgba(52,211,153,0.35)",
              padding: "14px",
              marginBottom: "20px",
              borderRadius: "10px",
              color: "#d1fae5",
              fontWeight: "700",
            }}
          >
            ✅ تم إنشاء الدرس بنجاح، جارٍ فتح محرر الدرس...
          </div>
        )}

        {/* ================= ERROR ================= */}

        {error && (
          <div
            style={{
              background: "#7f1d1d",
              border:
                "1px solid rgba(248,113,113,0.35)",
              padding: "14px",
              marginBottom: "20px",
              borderRadius: "10px",
              color: "#fee2e2",
            }}
          >
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ================= LOCATION ================= */}

          <div style={sectionStyle}>

            <h3
              style={{
                marginTop: 0,
                color: "#fff",
                marginBottom: "20px",
              }}
            >
              📚 مكان الدرس
            </h3>

            {/* ===== GRADE ===== */}

            <label style={labelStyle}>
              الصف *
            </label>

            <select
              value={gradeId}
              onChange={(e) =>
                setGradeId(e.target.value)
              }
              style={selectStyle}
              disabled={loadingGrades}
            >
              <option value="">
                {loadingGrades
                  ? "جاري تحميل الصفوف..."
                  : "اختر الصف"}
              </option>

              {grades.map((grade) => (
                <option
                  key={grade.id}
                  value={grade.id}
                >
                  {grade.title ||
                    grade.name ||
                    grade.id}
                </option>
              ))}
            </select>

            {/* ===== SUBJECT ===== */}

            <label style={labelStyle}>
              المادة *
            </label>

            <select
              value={subjectId}
              onChange={(e) =>
                setSubjectId(e.target.value)
              }
              style={selectStyle}
              disabled={
                !gradeId ||
                loadingSubjects
              }
            >
              <option value="">
                {!gradeId
                  ? "اختر الصف أولًا"
                  : loadingSubjects
                  ? "جاري تحميل المواد..."
                  : subjects.length === 0
                  ? "لا توجد مواد لهذا الصف"
                  : "اختر المادة"}
              </option>

              {subjects.map((subject) => (
                <option
                  key={
                    subject.subjectId ||
                    subject.id
                  }
                  value={
                    subject.subjectId ||
                    subject.id
                  }
                >
                  {subject.title ||
                    subject.name ||
                    subject.subjectName ||
                    subject.subjectId ||
                    subject.id}
                </option>
              ))}
            </select>

            {/* ===== UNIT ===== */}

            <label style={labelStyle}>
              الوحدة *
            </label>

            <select
              value={unitId}
              onChange={(e) =>
                setUnitId(e.target.value)
              }
              style={selectStyle}
              disabled={
                !subjectId ||
                loadingUnits
              }
            >
              <option value="">
                {!subjectId
                  ? "اختر المادة أولًا"
                  : loadingUnits
                  ? "جاري تحميل الوحدات..."
                  : units.length === 0
                  ? "لا توجد وحدات لهذه المادة"
                  : "اختر الوحدة"}
              </option>

              {units.map((unit) => (
                <option
                  key={unit.id}
                  value={unit.id}
                >
                  {unit.title ||
                    `الوحدة ${unit.order || ""}`}
                </option>
              ))}
            </select>

          </div>

          {/* ================= LESSON DATA ================= */}

          <div style={sectionStyle}>

            <h3
              style={{
                marginTop: 0,
                color: "#fff",
                marginBottom: "20px",
              }}
            >
              📝 بيانات الدرس
            </h3>

            <label style={labelStyle}>
              عنوان الدرس *
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="اكتب عنوان الدرس"
              style={inputStyle}
            />

            <label style={labelStyle}>
              وصف الدرس
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="اكتب وصفًا مختصرًا للدرس"
              style={textareaStyle}
            />

            <label style={labelStyle}>
              رابط الفيديو

              <span
                style={{
                  opacity: 0.5,
                  marginRight: "8px",
                  fontWeight: "400",
                }}
              >
                اختياري
              </span>
            </label>

            <input
              value={videoUrl}
              onChange={(e) =>
                setVideoUrl(e.target.value)
              }
              placeholder="https://www.youtube.com/..."
              style={inputStyle}
            />

          </div>

          {/* ================= SUMMARY ================= */}

          {gradeId &&
            subjectId &&
            unitId && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  borderRadius: "12px",
                  background:
                    "rgba(255,215,0,0.06)",
                  border:
                    "1px solid rgba(255,215,0,0.15)",
                }}
              >
                <div
                  style={{
                    color: "#FFD700",
                    fontWeight: "800",
                    marginBottom: "10px",
                  }}
                >
                  مسار الدرس
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    opacity: 0.75,
                    direction: "ltr",
                    wordBreak: "break-all",
                  }}
                >
                  grades/{gradeId}/subjects/
                  {subjectId}/units/{unitId}/lessons/
                  [new lessonId]
                </div>
              </div>
            )}

          {/* ================= ACTIONS ================= */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-start",
              marginTop: "28px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                opacity: loading ? 0.65 : 1,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "⏳ جاري إنشاء الدرس..."
                : "➕ إنشاء الدرس"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                navigate("/teacher/lessons")
              }
              style={secondaryButtonStyle}
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}