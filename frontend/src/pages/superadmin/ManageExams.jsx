import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function ManageExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(null);

  const load = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/exams");

      setExams(
        Array.isArray(res.data?.exams)
          ? res.data.exams
          : []
      );

    } catch (err) {
      console.error(
        "خطأ أثناء جلب الامتحانات:",
        err
      );

      setExams([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= نشر الامتحان ================= */

  const publishExam = async (examId) => {
    if (!examId) return;

    const confirmed = window.confirm(
      "هل تريد نشر هذا الامتحان للطلاب؟"
    );

    if (!confirmed) return;

    try {
      setPublishing(examId);

      const res = await api.put(
        `/api/exams/${examId}/publish`
      );

      if (res.data?.success) {
        alert(
          "تم نشر الامتحان بنجاح ✅"
        );

        await load();

      } else {
        alert(
          res.data?.error ||
          "تعذر نشر الامتحان"
        );
      }

    } catch (err) {
      console.error(
        "Publish exam error:",
        err
      );

      alert(
        err.response?.data?.error ||
        "حدث خطأ أثناء نشر الامتحان"
      );

    } finally {
      setPublishing(null);
    }
  };

  /* ================= إلغاء النشر ================= */

  const unpublishExam = async (examId) => {
    if (!examId) return;

    const confirmed = window.confirm(
      "هل تريد إعادة الامتحان إلى المسودة؟"
    );

    if (!confirmed) return;

    try {
      setPublishing(examId);

      const res = await api.put(
        `/api/exams/${examId}/unpublish`
      );

      if (res.data?.success) {
        alert(
          "تم إرجاع الامتحان إلى المسودة"
        );

        await load();

      } else {
        alert(
          res.data?.error ||
          "تعذر إلغاء نشر الامتحان"
        );
      }

    } catch (err) {
      console.error(
        "Unpublish exam error:",
        err
      );

      alert(
        err.response?.data?.error ||
        "حدث خطأ أثناء إلغاء النشر"
      );

    } finally {
      setPublishing(null);
    }
  };

  /* ================= حذف الامتحان ================= */

  const deleteExam = async (examId) => {
    if (!examId) return;

    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذا الامتحان؟"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/api/exams/${examId}`
      );

      alert(
        "تم حذف الامتحان بنجاح"
      );

      await load();

    } catch (err) {
      console.error(
        "Delete exam error:",
        err
      );

      alert(
        err.response?.data?.error ||
        "حدث خطأ أثناء حذف الامتحان"
      );
    }
  };

  /* ================= Loading ================= */

  if (loading) {
    return (
      <div className="p-6 text-white">
        جاري تحميل الامتحانات...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div
      className="p-6 text-white"
      dir="rtl"
    >

      <h1 className="text-3xl mb-6 font-bold">
        إدارة الامتحانات 📝
      </h1>

      {exams.length === 0 ? (

        <div
          className="bg-gray-800 p-6 rounded-lg"
        >
          لا توجد امتحانات حاليًا.
        </div>

      ) : (

        <div className="space-y-4">

          {exams.map((exam) => {

            const isPublished =
              exam.status ===
              "published";

            const isPublishing =
              publishing ===
              exam._id;

            return (
              <div
                key={exam._id}
                className="bg-gray-800 p-5 rounded-xl border border-gray-700"
              >

                {/* ===== العنوان ===== */}

                <div className="flex justify-between items-start gap-4">

                  <div>

                    <h2
                      className="text-xl font-bold"
                    >
                      {exam.title}
                    </h2>

                    {exam.description && (
                      <p className="text-gray-400 mt-2">
                        {exam.description}
                      </p>
                    )}

                  </div>

                  {/* ===== الحالة ===== */}

                  <div>

                    {isPublished ? (

                      <span
                        className="px-3 py-1 rounded-full bg-green-700 text-white"
                      >
                        منشور ✅
                      </span>

                    ) : (

                      <span
                        className="px-3 py-1 rounded-full bg-yellow-700 text-white"
                      >
                        مسودة 📝
                      </span>

                    )}

                  </div>

                </div>

                {/* ===== البيانات ===== */}

                <div
                  className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300"
                >

                  <p>
                    المادة:{" "}
                    {exam.subject ||
                      "غير محددة"}
                  </p>

                  <p>
                    الصف:{" "}
                    {exam.gradeId ||
                      "غير محدد"}
                  </p>

                  <p>
                    الوحدة:{" "}
                    {exam.unitId ||
                      "غير محددة"}
                  </p>

                  <p>
                    عدد الأسئلة:{" "}
                    {exam.questions?.length ||
                      exam.questionsCount ||
                      0}
                  </p>

                  <p>
                    المدة:{" "}
                    {exam.duration ||
                      0}{" "}
                    دقيقة
                  </p>

                  <p>
                    المصدر:{" "}
                    {exam.creationSource ||
                      "غير محدد"}
                  </p>

                </div>

                {/* ===== أزرار التحكم ===== */}

                <div
                  className="flex flex-wrap gap-3 mt-5"
                >

                  {!isPublished ? (

                    <button
                      onClick={() =>
                        publishExam(
                          exam._id
                        )
                      }
                      disabled={
                        isPublishing
                      }
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-5 py-2 rounded-lg font-bold"
                    >
                      {isPublishing
                        ? "جاري النشر..."
                        : "🟢 نشر الامتحان"}
                    </button>

                  ) : (

                    <button
                      onClick={() =>
                        unpublishExam(
                          exam._id
                        )
                      }
                      disabled={
                        isPublishing
                      }
                      className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 px-5 py-2 rounded-lg font-bold"
                    >
                      {isPublishing
                        ? "جاري التعديل..."
                        : "↩️ إلغاء النشر"}
                    </button>

                  )}

                  <button
                    onClick={() =>
                      deleteExam(
                        exam._id
                      )
                    }
                    className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-bold"
                  >
                    🗑️ حذف
                  </button>

                </div>

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
}