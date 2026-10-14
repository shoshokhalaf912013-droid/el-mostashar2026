import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../utils/api";

export default function VideoSecrets() {
  const [lessons, setLessons] = useState([]);
  const [videos, setVideos] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState("");

  /* =====================================================
     LOAD LESSONS + PROTECTED VIDEOS
  ===================================================== */

  async function loadData() {
    try {
      setLoading(true);

      const [
        lessonsResponse,
        videosResponse,
      ] = await Promise.all([
        api.get("/api/video-secrets/lessons"),
        api.get("/api/video-secrets"),
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
  }

  useEffect(() => {
    loadData();
  }, []);

  /* =====================================================
     MAP VIDEOS BY LESSON
  ===================================================== */

  const videosMap = useMemo(() => {
    const map = new Map();

    for (const video of videos) {
      map.set(video.lessonId, video);
    }

    return map;
  }, [videos]);

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredLessons = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return lessons;
    }

    return lessons.filter((lesson) => {
      return (
        String(lesson.title || "")
          .toLowerCase()
          .includes(term) ||

        String(lesson.publicLessonId || "")
          .toLowerCase()
          .includes(term) ||

        String(lesson.subjectId || "")
          .toLowerCase()
          .includes(term) ||

        String(lesson.gradeId || "")
          .toLowerCase()
          .includes(term) ||

        String(lesson.unitId || "")
          .toLowerCase()
          .includes(term)
      );
    });
  }, [lessons, search]);

  /* =====================================================
     START EDIT VIDEO
  ===================================================== */

  function startEdit(lessonId) {
    const video = videosMap.get(lessonId);

    setEditingId(lessonId);
    setEditUrl(video?.youtubeUrl || "");
  }

  /* =====================================================
     CANCEL EDIT
  ===================================================== */

  function cancelEdit() {
    setEditingId(null);
    setEditUrl("");
  }

  /* =====================================================
     SAVE / REPLACE PROTECTED VIDEO
  ===================================================== */

  async function saveVideo(lessonId) {
    const youtubeUrl = editUrl.trim();

    if (!youtubeUrl) {
      alert("أدخل رابط YouTube أولًا.");
      return;
    }

    try {
      setSavingId(lessonId);

      const response = await api.post(
        `/api/video-secrets/${encodeURIComponent(
          lessonId
        )}`,
        {
          youtubeUrl,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.error ||
            "فشل حفظ الفيديو."
        );
      }

      alert(
        "✅ تم حفظ الفيديو وحمايته بنجاح."
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
          error?.message ||
          "فشل حفظ الفيديو"
      );
    } finally {
      setSavingId(null);
    }
  }

  /* =====================================================
     DELETE VIDEO
  ===================================================== */

  async function deleteVideo(lessonId) {
    const confirmed = window.confirm(
      "هل تريد حذف فيديو هذا الدرس من المنصة؟"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSavingId(lessonId);

      await api.delete(
        `/api/video-secrets/${encodeURIComponent(
          lessonId
        )}`
      );

      alert("تم حذف فيديو الدرس.");

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
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        bg-black
        text-white
        p-6
      "
    >
      <div className="max-w-7xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            mb-8
            p-6
            rounded-2xl
            border
            border-yellow-500/30
            bg-[#0b0b0b]
          "
        >
          <div className="flex items-center gap-4">

            <div
              className="
                w-14
                h-14
                rounded-2xl
                flex
                items-center
                justify-center
                bg-yellow-400/10
                border
                border-yellow-400/30
                text-3xl
              "
            >
              🎬
            </div>

            <div>

              <h1
                className="
                  text-2xl
                  md:text-3xl
                  font-black
                  text-yellow-400
                "
              >
                إضافة وحماية فيديو YouTube
              </h1>

              <p
                className="
                  mt-2
                  text-sm
                  text-gray-400
                "
              >
                أضف رابط YouTube للدرس وسيتم
                تمريره إلى نظام حماية الفيديو
                الموجود بالمنصة.
              </p>

            </div>

          </div>
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div
          className="
            mb-6
            p-5
            rounded-2xl
            border
            border-yellow-500/20
            bg-[#0b0b0b]
          "
        >

          <label
            className="
              block
              mb-2
              text-yellow-400
              font-bold
            "
          >
            🔎 البحث عن الدرس
          </label>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="
              ابحث باسم الدرس أو الصف أو المادة أو الوحدة...
            "
            className="
              w-full
              px-4
              py-3
              rounded-xl
              bg-black
              border
              border-yellow-500/30
              text-white
              placeholder-gray-600
              outline-none
              focus:border-yellow-400
            "
          />

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div
            className="
              p-12
              rounded-2xl
              border
              border-yellow-500/20
              bg-[#0b0b0b]
              text-center
              text-yellow-400
              font-bold
            "
          >
            جاري تحميل الدروس والفيديوهات...
          </div>

        ) : filteredLessons.length === 0 ? (

          <div
            className="
              p-12
              rounded-2xl
              border
              border-yellow-500/20
              bg-[#0b0b0b]
              text-center
              text-gray-400
            "
          >
            لا توجد دروس مطابقة للبحث.
          </div>

        ) : (

          <div className="space-y-5">

            {filteredLessons.map((lesson) => {

              const video =
                videosMap.get(lesson.id);

              const isEditing =
                editingId === lesson.id;

              const isSaving =
                savingId === lesson.id;

              return (
                <div
                  key={lesson.id}
                  className="
                    rounded-2xl
                    border
                    border-yellow-500/25
                    bg-[#0b0b0b]
                    p-5
                  "
                >

                  {/* =================================================
                      LESSON HEADER
                  ================================================= */}

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-6
                      flex-wrap
                    "
                  >

                    <div className="min-w-0">

                      <h2
                        className="
                          text-xl
                          font-black
                          text-yellow-400
                          mb-3
                        "
                      >
                        {lesson.title ||
                          "بدون عنوان"}
                      </h2>

                      <div
                        className="
                          grid
                          grid-cols-1
                          md:grid-cols-2
                          gap-x-8
                          gap-y-2
                          text-sm
                          text-gray-400
                        "
                      >

                        <div>
                          الصف:
                          <span className="text-white mr-2">
                            {lesson.gradeId || "-"}
                          </span>
                        </div>

                        <div>
                          المادة:
                          <span className="text-white mr-2">
                            {lesson.subjectId || "-"}
                          </span>
                        </div>

                        <div>
                          الوحدة:
                          <span className="text-white mr-2">
                            {lesson.unitId || "-"}
                          </span>
                        </div>

                        <div>
                          Public Lesson ID:
                          <span className="text-white mr-2">
                            {lesson.publicLessonId ||
                              "-"}
                          </span>
                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        VIDEO STATUS
                    ================================================= */}

                    <div
                      className={`
                        px-4
                        py-3
                        rounded-xl
                        border
                        font-bold
                        text-sm
                        shrink-0

                        ${
                          video
                            ? `
                              bg-green-500/10
                              border-green-500/30
                              text-green-400
                            `
                            : `
                              bg-red-500/10
                              border-red-500/30
                              text-red-400
                            `
                        }
                      `}
                    >
                      {video
                        ? "🟢 الفيديو محمي"
                        : "🔴 لا يوجد فيديو"}
                    </div>

                  </div>

                  {/* =================================================
                      CURRENT VIDEO INFO
                  ================================================= */}

                  {video && !isEditing && (
                    <div
                      className="
                        mt-5
                        p-4
                        rounded-xl
                        bg-black
                        border
                        border-green-500/20
                      "
                    >

                      <div
                        className="
                          text-sm
                          text-gray-400
                          mb-2
                        "
                      >
                        حالة الفيديو
                      </div>

                      <div
                        className="
                          text-green-400
                          font-bold
                        "
                      >
                        🔐 محمي بواسطة نظام
                        حماية الفيديو
                      </div>

                    </div>
                  )}

                  {/* =================================================
                      EDITOR
                  ================================================= */}

                  {isEditing && (

                    <div
                      className="
                        mt-5
                        p-5
                        rounded-xl
                        bg-black
                        border
                        border-yellow-500/30
                      "
                    >

                      <label
                        className="
                          block
                          mb-2
                          text-yellow-400
                          font-bold
                        "
                      >
                        رابط فيديو YouTube
                      </label>

                      <input
                        value={editUrl}
                        onChange={(e) =>
                          setEditUrl(
                            e.target.value
                          )
                        }
                        placeholder="https://www.youtube.com/watch?v=..."
                        dir="ltr"
                        className="
                          w-full
                          px-4
                          py-3
                          rounded-xl
                          bg-[#111]
                          border
                          border-yellow-500/30
                          text-white
                          outline-none
                          focus:border-yellow-400
                        "
                      />

                      <div
                        className="
                          mt-3
                          text-xs
                          text-gray-500
                        "
                      >
                        سيتم إرسال الرابط إلى
                        Backend الحماية، ولا يتم
                        حفظ رابط YouTube الخام
                        داخل بيانات الدرس.
                      </div>

                      <div
                        className="
                          flex
                          gap-3
                          mt-5
                          flex-wrap
                        "
                      >

                        <button
                          disabled={isSaving}
                          onClick={() =>
                            saveVideo(
                              lesson.id
                            )
                          }
                          className="
                            px-6
                            py-3
                            rounded-xl
                            bg-gradient-to-b
                            from-yellow-200
                            to-yellow-500
                            text-black
                            font-black
                            disabled:opacity-50
                          "
                        >
                          {isSaving
                            ? "جاري الحفظ..."
                            : "🔐 حفظ وحماية الفيديو"}
                        </button>

                        <button
                          disabled={isSaving}
                          onClick={
                            cancelEdit
                          }
                          className="
                            px-6
                            py-3
                            rounded-xl
                            bg-zinc-800
                            text-white
                            font-bold
                            disabled:opacity-50
                          "
                        >
                          إلغاء
                        </button>

                      </div>

                    </div>

                  )}

                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  {!isEditing && (

                    <div
                      className="
                        flex
                        gap-3
                        mt-5
                        flex-wrap
                      "
                    >

                      <button
                        onClick={() =>
                          startEdit(
                            lesson.id
                          )
                        }
                        className="
                          px-6
                          py-3
                          rounded-xl
                          bg-gradient-to-b
                          from-yellow-200
                          to-yellow-500
                          text-black
                          font-black
                        "
                      >
                        🎬{" "}
                        {video
                          ? "تعديل رابط الفيديو"
                          : "إضافة فيديو"}
                      </button>

                      {video && (

                        <button
                          disabled={isSaving}
                          onClick={() =>
                            deleteVideo(
                              lesson.id
                            )
                          }
                          className="
                            px-6
                            py-3
                            rounded-xl
                            bg-red-950
                            border
                            border-red-700
                            text-red-300
                            font-bold
                            disabled:opacity-50
                          "
                        >
                          🗑 حذف الفيديو
                        </button>

                      )}

                    </div>

                  )}

                </div>
              );
            })}

          </div>

        )}

      </div>
    </div>
  );
}