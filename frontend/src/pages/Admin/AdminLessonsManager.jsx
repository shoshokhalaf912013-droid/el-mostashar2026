import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import api from "../../utils/api";

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function AdminSubjectBuilder() {
  const { gradeId, subjectKey } = useParams();

  const [units, setUnits] = useState([]);
  const [newUnitTitle, setNewUnitTitle] = useState("");

  /* ================= جلب الوحدات ================= */

  useEffect(() => {
    if (!gradeId || !subjectKey) return;

    const q = query(
      collection(db, "units"),
      where("gradeId", "==", gradeId),
      where("subjectKey", "==", subjectKey),
      orderBy("order", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUnits(data);
    });

    return () => unsub();
  }, [gradeId, subjectKey]);

  /* ================= إضافة وحدة ================= */

  const addUnit = async () => {
    if (!newUnitTitle.trim()) return;

    try {
      await addDoc(collection(db, "units"), {
        title: newUnitTitle.trim(),
        gradeId,
        subjectKey,
        order: units.length + 1,
        createdAt: serverTimestamp(),
      });

      setNewUnitTitle("");
    } catch (error) {
      console.error("❌ Error adding unit:", error);
      alert("حدث خطأ أثناء إضافة الوحدة.");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl text-yellow-400 mb-6">
        إدارة الوحدات والدروس
      </h1>

      {/* ================================================= */}
      {/* إضافة وحدة */}
      {/* ================================================= */}

      <div className="bg-[#111] p-4 rounded mb-8">
        <h2 className="text-lg mb-3 text-yellow-300">
          إضافة وحدة جديدة
        </h2>

        <div className="flex gap-3">
          <div className="w-32 text-gray-400 flex items-center">
            الوحدة {units.length + 1}
          </div>

          <input
            value={newUnitTitle}
            onChange={(e) => setNewUnitTitle(e.target.value)}
            placeholder="اسم الوحدة"
            className="flex-1 p-2 rounded bg-black border border-gray-700"
          />

          <button
            onClick={addUnit}
            className="bg-green-600 px-6 rounded"
          >
            إضافة
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* الوحدات */}
      {/* ================================================= */}

      {units.length === 0 ? (
        <div className="text-gray-400">
          لا توجد وحدات بعد
        </div>
      ) : (
        units.map((unit, unitIndex) => (
          <UnitBlock
            key={unit.id}
            unit={unit}
            unitIndex={unitIndex}
          />
        ))
      )}
    </div>
  );
}

/* ================================================= */
/* ================= وحدة واحدة ==================== */
/* ================================================= */

function UnitBlock({ unit, unitIndex }) {
  const [lessons, setLessons] = useState([]);
  const [newLessonTitle, setNewLessonTitle] = useState("");

  /* ================================================= */
  /* الفيديو */
  /* ================================================= */

  const [videoUrls, setVideoUrls] = useState({});
  const [savingVideo, setSavingVideo] = useState({});
  const [videoMessages, setVideoMessages] = useState({});

  /* ================================================= */
  /* جلب الدروس */
  /* ================================================= */

  useEffect(() => {
    const q = query(
      collection(db, "lessons"),
      where("unitId", "==", unit.id),
      orderBy("order", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLessons(data);
    });

    return () => unsub();
  }, [unit.id]);

  /* ================================================= */
  /* جلب روابط الفيديو الحالية لكل درس */
  /* ================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadVideos = async () => {
      if (!lessons.length) return;

      const loadedVideos = {};

      for (const lesson of lessons) {
        try {
          const response = await api.get(
            `/api/video-secrets/${lesson.id}`
          );

          if (cancelled) return;

          const data = response?.data || {};

          let url =
            data.youtubeUrl ||
            data.videoUrl ||
            "";

          /*
           * إذا كان الـ backend يعيد youtubeVideoId فقط
           * نبني رابط YouTube كامل.
           */

          if (!url && data.youtubeVideoId) {
            url = `https://www.youtube.com/watch?v=${data.youtubeVideoId}`;
          }

          loadedVideos[lesson.id] = url;
        } catch (error) {
          /*
           * 404 يعني غالبًا أن الدرس ليس لديه فيديو بعد.
           * لا نعرض خطأ للمستخدم في هذه الحالة.
           */

          if (error?.response?.status !== 404) {
            console.error(
              `❌ Failed to load video for lesson ${lesson.id}:`,
              error
            );
          }

          loadedVideos[lesson.id] = "";
        }
      }

      if (!cancelled) {
        setVideoUrls((prev) => ({
          ...prev,
          ...loadedVideos,
        }));
      }
    };

    loadVideos();

    return () => {
      cancelled = true;
    };
  }, [lessons]);

  /* ================================================= */
  /* إضافة درس */
  /* ================================================= */

  const addLesson = async () => {
    if (!newLessonTitle.trim()) return;

    try {
      await addDoc(collection(db, "lessons"), {
        title: newLessonTitle.trim(),
        unitId: unit.id,
        order: lessons.length + 1,
        createdAt: serverTimestamp(),
      });

      setNewLessonTitle("");
    } catch (error) {
      console.error("❌ Error adding lesson:", error);
      alert("حدث خطأ أثناء إضافة الدرس.");
    }
  };

  /* ================================================= */
  /* تغيير رابط الفيديو */
  /* ================================================= */

  const handleVideoChange = (lessonId, value) => {
    setVideoUrls((prev) => ({
      ...prev,
      [lessonId]: value,
    }));

    setVideoMessages((prev) => ({
      ...prev,
      [lessonId]: "",
    }));
  };

  /* ================================================= */
  /* حفظ رابط الفيديو */
  /* ================================================= */

  const saveVideo = async (lessonId) => {
    const youtubeUrl = (videoUrls[lessonId] || "").trim();

    if (!youtubeUrl) {
      setVideoMessages((prev) => ({
        ...prev,
        [lessonId]: {
          type: "error",
          text: "من فضلك أدخل رابط فيديو YouTube.",
        },
      }));

      return;
    }

    const isYoutube =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(
        youtubeUrl
      );

    if (!isYoutube) {
      setVideoMessages((prev) => ({
        ...prev,
        [lessonId]: {
          type: "error",
          text: "من فضلك أدخل رابط YouTube صحيح.",
        },
      }));

      return;
    }

    try {
      setSavingVideo((prev) => ({
        ...prev,
        [lessonId]: true,
      }));

      setVideoMessages((prev) => ({
        ...prev,
        [lessonId]: "",
      }));

      /*
       * api.js يقوم تلقائيًا بإرسال Firebase ID Token.
       */

      await api.post(
        `/api/video-secrets/${lessonId}`,
        {
          youtubeUrl,
        }
      );

      setVideoMessages((prev) => ({
        ...prev,
        [lessonId]: {
          type: "success",
          text: "تم حفظ رابط الفيديو بنجاح ✔️",
        },
      }));
    } catch (error) {
      console.error(
        `❌ Failed to save video for lesson ${lessonId}:`,
        error
      );

      let message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "حدث خطأ أثناء حفظ رابط الفيديو.";

      if (error?.response?.status === 401) {
        message =
          "انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.";
      }

      if (error?.response?.status === 403) {
        message =
          "ليس لديك صلاحية لحفظ فيديو الدرس. يجب أن يكون حسابك بصلاحية Super Admin حاليًا.";
      }

      if (error?.response?.status === 404) {
        message =
          "لم يتم العثور على الدرس.";
      }

      setVideoMessages((prev) => ({
        ...prev,
        [lessonId]: {
          type: "error",
          text: message,
        },
      }));
    } finally {
      setSavingVideo((prev) => ({
        ...prev,
        [lessonId]: false,
      }));
    }
  };

  return (
    <div className="border border-gray-700 rounded p-4 mb-6 bg-[#0b0b0b]">
      {/* ================================================= */}
      {/* عنوان الوحدة */}
      {/* ================================================= */}

      <h3 className="text-yellow-400 mb-4">
        الوحدة {unitIndex + 1} : {unit.title}
      </h3>

      {/* ================================================= */}
      {/* إضافة درس */}
      {/* ================================================= */}

      <div className="flex gap-3 mb-4">
        <div className="w-32 text-gray-400 flex items-center">
          الدرس {lessons.length + 1}
        </div>

        <input
          value={newLessonTitle}
          onChange={(e) =>
            setNewLessonTitle(e.target.value)
          }
          placeholder="اسم الدرس"
          className="flex-1 p-2 rounded bg-black border border-gray-700"
        />

        <button
          onClick={addLesson}
          className="bg-blue-600 px-6 rounded"
        >
          إضافة
        </button>
      </div>

      {/* ================================================= */}
      {/* قائمة الدروس */}
      {/* ================================================= */}

      {lessons.length === 0 ? (
        <div className="text-gray-500">
          لا توجد دروس بعد
        </div>
      ) : (
        lessons.map((lesson, lessonIndex) => {
          const message = videoMessages[lesson.id];

          return (
            <div
              key={lesson.id}
              className="bg-[#111] p-4 rounded mb-3 border border-gray-800"
            >
              {/* ============================= */}
              {/* اسم الدرس */}
              {/* ============================= */}

              <div className="text-white font-semibold mb-3">
                الدرس {lessonIndex + 1} : {lesson.title}
              </div>

              {/* ============================= */}
              {/* رابط الفيديو */}
              {/* ============================= */}

              <div className="mt-2">
                <label className="block text-gray-300 mb-2">
                  🎥 رابط فيديو الدرس
                </label>

                <div className="flex gap-3">
                  <input
                    type="url"
                    value={videoUrls[lesson.id] || ""}
                    onChange={(e) =>
                      handleVideoChange(
                        lesson.id,
                        e.target.value
                      )
                    }
                    placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
                    dir="ltr"
                    className="flex-1 p-2 rounded bg-black border border-gray-700 text-white"
                  />

                  <button
                    onClick={() =>
                      saveVideo(lesson.id)
                    }
                    disabled={savingVideo[lesson.id]}
                    className={`px-5 rounded font-semibold ${
                      savingVideo[lesson.id]
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-500"
                    }`}
                  >
                    {savingVideo[lesson.id]
                      ? "جاري الحفظ..."
                      : "حفظ الفيديو"}
                  </button>
                </div>

                {/* ============================= */}
                {/* ملاحظة */}
                {/* ============================= */}

                <div className="text-gray-500 text-sm mt-2">
                  يمكنك استخدام فيديو YouTube عادي أو
                  فيديو غير مدرج (Unlisted).
                </div>

                {/* ============================= */}
                {/* رسالة الحفظ */}
                {/* ============================= */}

                {message && (
                  <div
                    className={`mt-2 text-sm ${
                      message.type === "success"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {message.text}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}