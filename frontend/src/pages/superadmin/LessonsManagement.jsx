import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  serverTimestamp,
  doc,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../firebase";
import { lessonRef } from "../../utils/lessonRef";
import api from "../../utils/api";

/* =========================================================
   SUPER ADMIN — LESSON MANAGEMENT

   Central place for:
   - Edit lesson data
   - Replace / add / delete lesson video
   - Open lesson for preview
   - Jump to unit management
   - Add another lesson to the same unit

   The protected-video API remains the single source of truth
   for YouTube data.
========================================================= */

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: "9px",
  border: "1px solid rgba(255,215,0,0.28)",
  background: "#111",
  color: "#fff",
  outline: "none",
};

const buttonStyle = {
  border: "none",
  borderRadius: "9px",
  padding: "10px 14px",
  fontWeight: 800,
  cursor: "pointer",
};

const inferSystemId = (gradeId) =>
  String(gradeId || "").toLowerCase().startsWith("bac")
    ? "bac"
    : "general";

export default function LessonManagement() {
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    active: true,
  });
  const [videoDrafts, setVideoDrafts] = useState({});
  const [openVideoEditor, setOpenVideoEditor] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const [lessonsResponse, videosResponse] = await Promise.all([
        api.get("/api/video-secrets/lessons"),
        api.get("/api/video-secrets"),
      ]);

      const loadedLessons = Array.isArray(
        lessonsResponse.data?.lessons
      )
        ? lessonsResponse.data.lessons
        : [];

      const loadedVideos = Array.isArray(
        videosResponse.data?.videos
      )
        ? videosResponse.data.videos
        : [];

      setLessons(loadedLessons);
      setVideos(loadedVideos);

      const drafts = {};
      loadedVideos.forEach((video) => {
        drafts[video.lessonId] = video.youtubeUrl || "";
      });
      setVideoDrafts(drafts);
    } catch (error) {
      console.error("Lesson management loading error:", error);
      alert(
        error?.response?.data?.error ||
          "فشل تحميل إدارة الدروس"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const videosMap = useMemo(() => {
    const map = new Map();
    for (const video of videos) {
      map.set(video.lessonId, video);
    }
    return map;
  }, [videos]);

  const filteredLessons = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return lessons;

    return lessons.filter((lesson) => {
      const haystack = [
        lesson.title,
        lesson.gradeId,
        lesson.subjectId,
        lesson.unitId,
        lesson.publicLessonId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [lessons, search]);

  const startEdit = (lesson) => {
    setEditingId(lesson.id);
    setDraft({
      title: lesson.title || "",
      description: lesson.description || "",
      active: lesson.active !== false,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({
      title: "",
      description: "",
      active: true,
    });
  };

  const saveLesson = async (lesson) => {
    if (!lesson?.id) return;

    if (!draft.title.trim()) {
      alert("اكتب عنوان الدرس.");
      return;
    }

    try {
      setBusyId(lesson.id);

      const fields = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        active: Boolean(draft.active),
        updatedAt: serverTimestamp(),
      };

      const batch = writeBatch(db);

      batch.update(doc(db, "lessons", lesson.id), fields);

      batch.set(
        lessonRef(
          lesson.gradeId || "",
          lesson.subjectId || "",
          lesson.unitId || "",
          lesson.id
        ),
        fields,
        { merge: true }
      );

      await batch.commit();

      setLessons((current) =>
        current.map((item) =>
          item.id === lesson.id
            ? { ...item, ...draft }
            : item
        )
      );

      cancelEdit();
      alert("تم تعديل بيانات الدرس بنجاح.");
    } catch (error) {
      console.error("Edit lesson error:", error);
      alert("حدث خطأ أثناء تعديل الدرس.");
    } finally {
      setBusyId(null);
    }
  };

  const saveVideo = async (lessonId) => {
    const youtubeUrl = String(videoDrafts[lessonId] || "").trim();

    if (!youtubeUrl) {
      alert("أدخل رابط YouTube.");
      return;
    }

    try {
      setBusyId(lessonId);

      await api.post(`/api/video-secrets/${lessonId}`, {
        youtubeUrl,
      });

      alert("تم حفظ / استبدال فيديو الدرس بنجاح.");
      setOpenVideoEditor(null);
      await loadData();
    } catch (error) {
      console.error("Save video error:", error);
      alert(
        error?.response?.data?.error ||
          "فشل حفظ الفيديو"
      );
    } finally {
      setBusyId(null);
    }
  };

  const deleteVideo = async (lessonId) => {
    const confirmed = window.confirm(
      "هل تريد حذف فيديو هذا الدرس من المنصة؟"
    );

    if (!confirmed) return;

    try {
      setBusyId(lessonId);
      await api.delete(`/api/video-secrets/${lessonId}`);
      alert("تم حذف فيديو الدرس.");
      setOpenVideoEditor(null);
      setVideoDrafts((current) => ({
        ...current,
        [lessonId]: "",
      }));
      await loadData();
    } catch (error) {
      console.error("Delete video error:", error);
      alert(
        error?.response?.data?.error ||
          "فشل حذف الفيديو"
      );
    } finally {
      setBusyId(null);
    }
  };

  const previewLesson = (lesson) => {
    const publicId = lesson.publicLessonId || lesson.id;
    if (!publicId) return;

    const stage = inferSystemId(lesson.gradeId);

    navigate(
      `/student/${stage}/lesson/${encodeURIComponent(
        lesson.gradeId || ""
      )}/${encodeURIComponent(
        lesson.subjectId || ""
      )}/${encodeURIComponent(
        lesson.unitId || ""
      )}/${encodeURIComponent(publicId)}`
    );
  };

  const openUnitManager = (lesson) => {
    const systemId = inferSystemId(lesson.gradeId);

    navigate(
      `/super-admin/units/${encodeURIComponent(systemId)}/${encodeURIComponent(
        lesson.gradeId || ""
      )}/${encodeURIComponent(lesson.subjectId || "")}`
    );
  };

  const addLessonToSameUnit = (lesson) => {
    const systemId = inferSystemId(lesson.gradeId);

    navigate(
      `/super-admin/add-lesson/${encodeURIComponent(
        systemId
      )}/${encodeURIComponent(lesson.gradeId || "")}/${encodeURIComponent(
        lesson.subjectId || ""
      )}/${encodeURIComponent(lesson.unitId || "")}`
    );
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#ffd700",
                fontSize: "28px",
              }}
            >
              📚 إدارة الدروس
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                color: "#aaa",
                lineHeight: 1.8,
              }}
            >
              المكان المركزي لتعديل الدرس، استبدال الفيديو، حذف الفيديو،
              فتح الدرس أو الانتقال إلى الوحدة.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            style={{
              ...buttonStyle,
              background: "#202020",
              color: "#ffd700",
              border: "1px solid #554400",
            }}
          >
            🔄 تحديث القائمة
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم الدرس أو الصف أو المادة أو الوحدة..."
          style={{
            ...inputStyle,
            marginBottom: "18px",
          }}
        />

        {loading ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#ffd700",
              background: "#0d0d0d",
              borderRadius: "14px",
            }}
          >
            جاري تحميل الدروس...
          </div>
        ) : filteredLessons.length === 0 ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#aaa",
              background: "#0d0d0d",
              borderRadius: "14px",
            }}
          >
            لا توجد دروس مطابقة.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            {filteredLessons.map((lesson, index) => {
              const video = videosMap.get(lesson.id);
              const isEditing = editingId === lesson.id;
              const isVideoEditing = openVideoEditor === lesson.id;
              const isBusy = busyId === lesson.id;

              return (
                <div
                  key={lesson.id}
                  style={{
                    background: "#0d0d0d",
                    border: "1px solid #4a3a00",
                    borderRadius: "15px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "18px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          color: "#777",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        الدرس #{index + 1}
                      </div>

                      <h2
                        style={{
                          margin: "0 0 8px",
                          color: "#ffd700",
                          fontSize: "20px",
                        }}
                      >
                        {lesson.title || "بدون عنوان"}
                      </h2>

                      <div
                        style={{
                          color: "#aaa",
                          lineHeight: 1.9,
                          fontSize: "13px",
                        }}
                      >
                        الصف: {lesson.gradeId || "-"}
                        <br />
                        المادة: {lesson.subjectId || "-"}
                        <br />
                        الوحدة: {lesson.unitId || "-"}
                        <br />
                        Public Lesson ID: {lesson.publicLessonId || "-"}
                      </div>
                    </div>

                    <div
                      style={{
                        minWidth: "220px",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          color: video ? "#4ade80" : "#f87171",
                          fontWeight: 800,
                        }}
                      >
                        {video ? "✅ يوجد فيديو" : "❌ لا يوجد فيديو"}
                      </div>

                      {video && (
                        <div
                          style={{
                            marginTop: "7px",
                            color: "#777",
                            fontSize: "12px",
                            direction: "ltr",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {video.youtubeUrl}
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div
                      style={{
                        marginTop: "18px",
                        padding: "15px",
                        background: "#111",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,215,0,0.18)",
                      }}
                    >
                      <label style={{ color: "#ffd700", display: "block", marginBottom: "7px" }}>
                        عنوان الدرس
                      </label>
                      <input
                        value={draft.title}
                        onChange={(e) =>
                          setDraft((current) => ({
                            ...current,
                            title: e.target.value,
                          }))
                        }
                        style={inputStyle}
                      />

                      <label
                        style={{
                          color: "#ffd700",
                          display: "block",
                          marginTop: "14px",
                          marginBottom: "7px",
                        }}
                      >
                        وصف الدرس
                      </label>
                      <textarea
                        value={draft.description}
                        onChange={(e) =>
                          setDraft((current) => ({
                            ...current,
                            description: e.target.value,
                          }))
                        }
                        style={{
                          ...inputStyle,
                          minHeight: "100px",
                          resize: "vertical",
                        }}
                      />

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "12px",
                          color: "#ddd",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={draft.active}
                          onChange={(e) =>
                            setDraft((current) => ({
                              ...current,
                              active: e.target.checked,
                            }))
                          }
                        />
                        الدرس متاح للطلاب
                      </label>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginTop: "14px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => saveLesson(lesson)}
                          disabled={isBusy}
                          style={{
                            ...buttonStyle,
                            background: "#ffd000",
                            color: "#000",
                          }}
                        >
                          {isBusy ? "جاري الحفظ..." : "💾 حفظ تعديل الدرس"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={isBusy}
                          style={{
                            ...buttonStyle,
                            background: "#242424",
                            color: "#fff",
                          }}
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}

                  {isVideoEditing && (
                    <div
                      style={{
                        marginTop: "18px",
                        padding: "15px",
                        background: "#111",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,215,0,0.18)",
                      }}
                    >
                      <div
                        style={{
                          color: "#ffd700",
                          fontWeight: 800,
                          marginBottom: "8px",
                        }}
                      >
                        🔗 إدخال / استبدال رابط فيديو YouTube
                      </div>

                      <label
                        style={{
                          display: "block",
                          color: "#ddd",
                          marginBottom: "7px",
                          fontWeight: "700",
                        }}
                      >
                        رابط فيديو YouTube فقط
                      </label>

                      <input
                        type="url"
                        value={videoDrafts[lesson.id] || ""}
                        onChange={(e) =>
                          setVideoDrafts((current) => ({
                            ...current,
                            [lesson.id]: e.target.value,
                          }))
                        }
                        placeholder="https://www.youtube.com/watch?v=..."
                        dir="ltr"
                        style={inputStyle}
                      />

                      <div
                        style={{
                          color: "#888",
                          fontSize: "12px",
                          lineHeight: 1.7,
                          marginTop: "8px",
                        }}
                      >
                        ضع رابط فيديو YouTube فقط (عادي أو Unlisted). لا يتم رفع ملفات MP4. الحفظ يمر عبر
                        Protected Video API.
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginTop: "14px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => saveVideo(lesson.id)}
                          disabled={isBusy}
                          style={{
                            ...buttonStyle,
                            background: "#ffd000",
                            color: "#000",
                          }}
                        >
                          {isBusy ? "جاري الحفظ..." : "💾 حفظ / استبدال الفيديو"}
                        </button>

                        {video && (
                          <button
                            type="button"
                            onClick={() => deleteVideo(lesson.id)}
                            disabled={isBusy}
                            style={{
                              ...buttonStyle,
                              background: "#2a0d0d",
                              color: "#ff7777",
                              border: "1px solid #7f1d1d",
                            }}
                          >
                            🗑 حذف الفيديو
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setOpenVideoEditor(null)}
                          disabled={isBusy}
                          style={{
                            ...buttonStyle,
                            background: "#242424",
                            color: "#fff",
                          }}
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "18px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => startEdit(lesson)}
                      style={{
                        ...buttonStyle,
                        background: "#ffd000",
                        color: "#000",
                      }}
                    >
                      ✏️ تعديل الدرس
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenVideoEditor(lesson.id);
                        setVideoDrafts((current) => ({
                          ...current,
                          [lesson.id]: videosMap.get(lesson.id)?.youtubeUrl || "",
                        }));
                      }}
                      style={{
                        ...buttonStyle,
                        background: "#1d1d1d",
                        color: "#ffd700",
                        border: "1px solid #554400",
                      }}
                    >
                      🔗 {video ? "استبدال / تعديل رابط YouTube" : "إضافة رابط YouTube"}
                    </button>

                    <button
                      type="button"
                      onClick={() => previewLesson(lesson)}
                      style={{
                        ...buttonStyle,
                        background: "#1d1d1d",
                        color: "#fff",
                        border: "1px solid #333",
                      }}
                    >
                      👁 معاينة الدرس
                    </button>

                    <button
                      type="button"
                      onClick={() => addLessonToSameUnit(lesson)}
                      style={{
                        ...buttonStyle,
                        background: "#1d1d1d",
                        color: "#fff",
                        border: "1px solid #333",
                      }}
                    >
                      ➕ إضافة درس بنفس الوحدة
                    </button>

                    <button
                      type="button"
                      onClick={() => openUnitManager(lesson)}
                      style={{
                        ...buttonStyle,
                        background: "#1d1d1d",
                        color: "#fff",
                        border: "1px solid #333",
                      }}
                    >
                      📂 إدارة الوحدة
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
