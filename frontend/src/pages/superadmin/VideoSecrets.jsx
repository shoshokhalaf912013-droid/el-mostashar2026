import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../utils/api";

export default function VideoSecrets() {

  const [lessons, setLessons] =
    useState([]);

  const [videos, setVideos] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [savingId, setSavingId] =
    useState(null);

  const [editingId, setEditingId] =
    useState(null);

  const [editUrl, setEditUrl] =
    useState("");

  const loadData =
    async () => {

      try {

        setLoading(true);

        const [
          lessonsResponse,
          videosResponse,
        ] = await Promise.all([

          api.get(
            "/api/video-secrets/lessons"
          ),

          api.get(
            "/api/video-secrets"
          ),

        ]);

        setLessons(
          Array.isArray(
            lessonsResponse.data?.lessons
          )
            ? lessonsResponse.data.lessons
            : []
        );

        setVideos(
          Array.isArray(
            videosResponse.data?.videos
          )
            ? videosResponse.data.videos
            : []
        );

      } catch (error) {

        console.error(
          "Video secrets loading error:",
          error
        );

        alert(
          error?.response?.data?.error ||
          "فشل تحميل بيانات الفيديوهات"
        );

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    loadData();

  }, []);

  const videosMap =
    useMemo(() => {

      const map =
        new Map();

      for (
        const video of videos
      ) {
        map.set(
          video.lessonId,
          video
        );
      }

      return map;

    }, [
      videos,
    ]);

  const filteredLessons =
    lessons.filter(
      (lesson) => {

        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return true;
        }

        return (

          String(
            lesson.title || ""
          )
            .toLowerCase()
            .includes(term) ||

          String(
            lesson.publicLessonId || ""
          )
            .toLowerCase()
            .includes(term) ||

          String(
            lesson.subjectId || ""
          )
            .toLowerCase()
            .includes(term) ||

          String(
            lesson.gradeId || ""
          )
            .toLowerCase()
            .includes(term)
        );
      }
    );

  const startEdit =
    (lessonId) => {

      const video =
        videosMap.get(
          lessonId
        );

      setEditingId(
        lessonId
      );

      setEditUrl(
        video?.youtubeUrl || ""
      );
    };

  const cancelEdit =
    () => {

      setEditingId(null);
      setEditUrl("");
    };

  const saveVideo =
    async (lessonId) => {

      try {

        if (!editUrl.trim()) {

          alert(
            "أدخل رابط YouTube"
          );

          return;
        }

        setSavingId(
          lessonId
        );

        await api.post(
          `/api/video-secrets/${lessonId}`,
          {
            youtubeUrl:
              editUrl.trim(),
          }
        );

        alert(
          "تم حفظ الفيديو بنجاح"
        );

        setEditingId(null);
        setEditUrl("");

        await loadData();

      } catch (error) {

        console.error(
          "Save video secret error:",
          error
        );

        alert(
          error?.response?.data?.error ||
          "فشل حفظ الفيديو"
        );

      } finally {

        setSavingId(null);
      }
    };

  const deleteVideo =
    async (lessonId) => {

      const confirmed =
        window.confirm(
          "هل تريد حذف فيديو هذا الدرس من المنصة؟"
        );

      if (!confirmed) {
        return;
      }

      try {

        setSavingId(
          lessonId
        );

        await api.delete(
          `/api/video-secrets/${lessonId}`
        );

        alert(
          "تم حذف الفيديو"
        );

        await loadData();

      } catch (error) {

        console.error(
          "Delete video secret error:",
          error
        );

        alert(
          error?.response?.data?.error ||
          "فشل حذف الفيديو"
        );

      } finally {

        setSavingId(null);
      }
    };

  return (
    <div
      dir="rtl"
      style={{
        minHeight:
          "100vh",

        padding:
          "30px",

        background:
          "#050505",

        color:
          "#fff",
      }}
    >

      <div
        style={{
          maxWidth:
            "1200px",

          margin:
            "0 auto",
        }}
      >

        <div
          style={{
            marginBottom:
              "24px",
          }}
        >

          <h1
            style={{
              color:
                "#ffd700",

              marginBottom:
                "8px",
            }}
          >
            🔐 أسرار فيديوهات المنصة
          </h1>

          <p
            style={{
              color:
                "#aaa",

              lineHeight:
                1.8,
            }}
          >
            هذه الصفحة داخلية للـSuper Admin فقط.
            روابط YouTube الحقيقية لا تظهر في صفحات الدروس
            أو لوحة المعلم أو لوحة الـAdmin.
          </p>

        </div>

        <input
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="ابحث باسم الدرس أو الصف أو المادة..."
          style={{
            width:
              "100%",

            boxSizing:
              "border-box",

            padding:
              "14px 16px",

            borderRadius:
              "10px",

            border:
              "1px solid #554400",

            background:
              "#111",

            color:
              "#fff",

            marginBottom:
              "20px",
          }}
        />

        {loading ? (

          <div
            style={{
              padding:
                "40px",

              textAlign:
                "center",

              color:
                "#ffd700",
            }}
          >
            جاري تحميل بيانات الفيديوهات...
          </div>

        ) : (

          <div
            style={{
              display:
                "grid",

              gap:
                "14px",
            }}
          >

            {filteredLessons.map(
              (lesson) => {

                const video =
                  videosMap.get(
                    lesson.id
                  );

                const isEditing =
                  editingId ===
                  lesson.id;

                const isSaving =
                  savingId ===
                  lesson.id;

                return (

                  <div
                    key={
                      lesson.id
                    }
                    style={{
                      border:
                        "1px solid #4a3a00",

                      borderRadius:
                        "14px",

                      padding:
                        "18px",

                      background:
                        "#0d0d0d",
                    }}
                  >

                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        gap:
                          "20px",

                        flexWrap:
                          "wrap",
                      }}
                    >

                      <div>

                        <h3
                          style={{
                            margin:
                              "0 0 8px",

                            color:
                              "#ffd700",
                          }}
                        >
                          {
                            lesson.title
                          }
                        </h3>

                        <div
                          style={{
                            color:
                              "#aaa",

                            fontSize:
                              "13px",

                            lineHeight:
                              1.9,
                          }}
                        >

                          الصف:{" "}
                          {
                            lesson.gradeId ||
                            "-"
                          }

                          <br />

                          المادة:{" "}
                          {
                            lesson.subjectId ||
                            "-"
                          }

                          <br />

                          الوحدة:{" "}
                          {
                            lesson.unitId ||
                            "-"
                          }

                          <br />

                          Public Lesson ID:{" "}
                          {
                            lesson.publicLessonId ||
                            "-"
                          }

                        </div>

                      </div>

                      <div
                        style={{
                          minWidth:
                            "260px",

                          color:
                            video
                              ? "#4ade80"
                              : "#f87171",
                        }}
                      >

                        {
                          video
                            ? "✅ يوجد فيديو"
                            : "❌ لا يوجد فيديو"
                        }

                      </div>

                    </div>

                    {isEditing ? (

                      <div
                        style={{
                          marginTop:
                            "18px",
                        }}
                      >

                        <input
                          value={
                            editUrl
                          }
                          onChange={(e) =>
                            setEditUrl(
                              e.target.value
                            )
                          }
                          placeholder="https://www.youtube.com/watch?v=..."
                          dir="ltr"
                          style={{
                            width:
                              "100%",

                            boxSizing:
                              "border-box",

                            padding:
                              "13px",

                            borderRadius:
                              "8px",

                            border:
                              "1px solid #6b5500",

                            background:
                              "#111",

                            color:
                              "#fff",
                          }}
                        />

                        <div
                          style={{
                            display:
                              "flex",

                            gap:
                              "10px",

                            marginTop:
                              "12px",

                            flexWrap:
                              "wrap",
                          }}
                        >

                          <button
                            disabled={
                              isSaving
                            }
                            onClick={() =>
                              saveVideo(
                                lesson.id
                              )
                            }
                            style={{
                              padding:
                                "10px 18px",

                              border:
                                "none",

                              borderRadius:
                                "8px",

                              background:
                                "#ffd000",

                              color:
                                "#000",

                              fontWeight:
                                "700",

                              cursor:
                                "pointer",
                            }}
                          >
                            {
                              isSaving
                                ? "جاري الحفظ..."
                                : "حفظ"
                            }
                          </button>

                          <button
                            onClick={
                              cancelEdit
                            }
                            style={{
                              padding:
                                "10px 18px",

                              border:
                                "1px solid #555",

                              borderRadius:
                                "8px",

                              background:
                                "#181818",

                              color:
                                "#fff",

                              cursor:
                                "pointer",
                            }}
                          >
                            إلغاء
                          </button>

                        </div>

                      </div>

                    ) : (

                      <div
                        style={{
                          display:
                            "flex",

                          gap:
                            "10px",

                          marginTop:
                            "18px",

                          flexWrap:
                            "wrap",
                        }}
                      >

                        <button
                          onClick={() =>
                            startEdit(
                              lesson.id
                            )
                          }
                          style={{
                            padding:
                              "10px 18px",

                            border:
                              "none",

                            borderRadius:
                              "8px",

                            background:
                              "#ffd000",

                            color:
                              "#000",

                            fontWeight:
                              "700",

                            cursor:
                              "pointer",
                          }}
                        >
                          🔐 إدارة الرابط
                        </button>

                        {video && (

                          <button
                            disabled={
                              isSaving
                            }
                            onClick={() =>
                              deleteVideo(
                                lesson.id
                              )
                            }
                            style={{
                              padding:
                                "10px 18px",

                              border:
                                "1px solid #7f1d1d",

                              borderRadius:
                                "8px",

                              background:
                                "#2a0d0d",

                              color:
                                "#ff7777",

                              cursor:
                                "pointer",
                            }}
                          >
                            حذف الفيديو
                          </button>

                        )}

                      </div>

                    )}

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>
    </div>
  );
}