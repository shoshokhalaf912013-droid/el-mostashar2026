import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";

const ARABIC_OPTIONS = ["أ", "ب", "ج", "د"];

const createEmptyQuestion = () => ({
  questionText: "",
  type: "mcq",
  choices: ["", "", "", ""],
  correctAnswer: 0,
  modelAnswer: "",
  marks: 1,
  difficulty: "medium",
  source: "manual",
  lessonId: "",
  explanation: "",
});

export default function AddQuestion() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState(createEmptyQuestion());

  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= تحميل الامتحان ================= */

  useEffect(() => {
    const loadExam = async () => {
      if (!examId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await api.get(`/api/exams/${examId}`);

        const loadedExam = res.data?.exam || null;

        if (!loadedExam) {
          alert("لم يتم العثور على الامتحان.");
          return;
        }

        setExam(loadedExam);
        setQuestions(
          Array.isArray(loadedExam.questions)
            ? loadedExam.questions
            : []
        );
      } catch (error) {
        console.error("Error loading exam:", error);
        alert("حدث خطأ أثناء تحميل الامتحان.");
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  /* ================= تغيير نوع السؤال ================= */

  const changeQuestionType = (type) => {
    setQuestion((prev) => ({
      ...prev,
      type,
      choices:
        type === "mcq"
          ? prev.choices?.length === 4
            ? prev.choices
            : ["", "", "", ""]
          : [],
      correctAnswer:
        type === "mcq"
          ? typeof prev.correctAnswer === "number"
            ? prev.correctAnswer
            : 0
          : null,
    }));
  };

  /* ================= تغيير الاختيار ================= */

  const updateChoice = (index, value) => {
    setQuestion((prev) => {
      const choices = [...prev.choices];
      choices[index] = value;

      return {
        ...prev,
        choices,
      };
    });
  };

  /* ================= حفظ السؤال ================= */

  const saveQuestion = async () => {
    if (!question.questionText.trim()) {
      alert("اكتب نص السؤال أولًا.");
      return;
    }

    if (question.type === "mcq") {
      const hasEmptyChoice = question.choices.some(
        (choice) => !choice.trim()
      );

      if (hasEmptyChoice) {
        alert("يجب كتابة الاختيارات الأربعة.");
        return;
      }

      if (
        question.correctAnswer === null ||
        question.correctAnswer === undefined
      ) {
        alert("حدد الإجابة الصحيحة.");
        return;
      }
    }

    if (question.type === "essay" && !question.modelAnswer.trim()) {
      alert("اكتب نموذج الإجابة للسؤال المقالي.");
      return;
    }

    const cleanQuestion = {
      questionText: question.questionText.trim(),
      type: question.type,
      choices:
        question.type === "mcq"
          ? question.choices.map((choice) => choice.trim())
          : [],
      correctAnswer:
        question.type === "mcq"
          ? Number(question.correctAnswer)
          : null,
      modelAnswer:
        question.type === "essay"
          ? question.modelAnswer.trim()
          : "",
      marks: Number(question.marks) || 1,
      difficulty: question.difficulty,
      source: "manual",
      lessonId: question.lessonId || "",
      explanation: question.explanation || "",
    };

    let updatedQuestions;

    if (editingIndex === null) {
      updatedQuestions = [
        ...questions,
        cleanQuestion,
      ];
    } else {
      updatedQuestions = questions.map((item, index) =>
        index === editingIndex
          ? {
              ...cleanQuestion,
              _id: item._id,
            }
          : item
      );
    }

    try {
      setSaving(true);

      const res = await api.put(
        `/api/exams/${examId}`,
        {
          questions: updatedQuestions,
        }
      );

      const savedExam = res.data?.exam;

      if (savedExam) {
        setExam(savedExam);
        setQuestions(savedExam.questions || []);
      } else {
        setQuestions(updatedQuestions);
      }

      resetForm();

      alert(
        editingIndex === null
          ? "تمت إضافة السؤال بنجاح."
          : "تم تعديل السؤال بنجاح."
      );
    } catch (error) {
      console.error("Error saving question:", error);

      alert(
        error?.response?.data?.error ||
          "حدث خطأ أثناء حفظ السؤال."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= تعديل السؤال ================= */

  const startEdit = (item, index) => {
    setEditingIndex(index);

    setQuestion({
      questionText: item.questionText || "",
      type: item.type || "mcq",
      choices:
        Array.isArray(item.choices) &&
        item.choices.length === 4
          ? item.choices
          : ["", "", "", ""],
      correctAnswer:
        typeof item.correctAnswer === "number"
          ? item.correctAnswer
          : 0,
      modelAnswer: item.modelAnswer || "",
      marks: item.marks || 1,
      difficulty: item.difficulty || "medium",
      source: "manual",
      lessonId: item.lessonId || "",
      explanation: item.explanation || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ================= حذف السؤال ================= */

  const deleteQuestion = async (index) => {
    if (
      !window.confirm(
        "هل أنت متأكد من حذف هذا السؤال؟"
      )
    ) {
      return;
    }

    const updatedQuestions = questions.filter(
      (_, questionIndex) => questionIndex !== index
    );

    try {
      setSaving(true);

      const res = await api.put(
        `/api/exams/${examId}`,
        {
          questions: updatedQuestions,
        }
      );

      const savedExam = res.data?.exam;

      if (savedExam) {
        setExam(savedExam);
        setQuestions(savedExam.questions || []);
      } else {
        setQuestions(updatedQuestions);
      }

      if (editingIndex === index) {
        resetForm();
      }

      alert("تم حذف السؤال.");
    } catch (error) {
      console.error("Error deleting question:", error);

      alert(
        error?.response?.data?.error ||
          "حدث خطأ أثناء حذف السؤال."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= إعادة النموذج ================= */

  const resetForm = () => {
    setEditingIndex(null);
    setQuestion(createEmptyQuestion());
  };

  /* ================= تحميل ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-yellow-400 text-xl">
            جاري تحميل الامتحان...
          </p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-red-400">
            لم يتم العثور على الامتحان.
          </p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-950 text-white p-4 md:p-6"
    >
      <div className="max-w-5xl mx-auto">

        {/* العنوان */}

        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            ← رجوع
          </button>

          <h1 className="text-3xl font-bold text-yellow-400">
            إدارة أسئلة الامتحان
          </h1>

          <p className="text-gray-300 mt-2">
            {exam.title}
          </p>
        </div>

        {/* ================= نموذج السؤال ================= */}

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-8">

          <h2 className="text-xl font-bold text-yellow-300 mb-5">
            {editingIndex === null
              ? "إضافة سؤال جديد"
              : `تعديل السؤال ${editingIndex + 1}`}
          </h2>

          {/* نوع السؤال */}

          <div className="mb-5">
            <label className="block mb-2 text-gray-300">
              نوع السؤال
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  changeQuestionType("mcq")
                }
                className={`p-3 rounded-lg border ${
                  question.type === "mcq"
                    ? "bg-yellow-600 border-yellow-300 text-black"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                اختيار من متعدد
              </button>

              <button
                type="button"
                onClick={() =>
                  changeQuestionType("essay")
                }
                className={`p-3 rounded-lg border ${
                  question.type === "essay"
                    ? "bg-yellow-600 border-yellow-300 text-black"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                سؤال مقالي
              </button>

            </div>
          </div>

          {/* نص السؤال */}

          <div className="mb-5">
            <label className="block mb-2 text-gray-300">
              نص السؤال
            </label>

            <textarea
              value={question.questionText}
              onChange={(e) =>
                setQuestion((prev) => ({
                  ...prev,
                  questionText: e.target.value,
                }))
              }
              rows={4}
              placeholder="اكتب نص السؤال هنا..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-yellow-400"
            />
          </div>

          {/* ================= MCQ ================= */}

          {question.type === "mcq" && (
            <div className="mb-5">

              <label className="block mb-3 text-gray-300">
                الاختيارات
              </label>

              <div className="space-y-3">

                {question.choices.map(
                  (choice, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3"
                    >

                      <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-800 border border-yellow-600 flex items-center justify-center text-yellow-400 font-bold text-lg">
                        ( {ARABIC_OPTIONS[index]} )
                      </div>

                      <input
                        type="text"
                        value={choice}
                        onChange={(e) =>
                          updateChoice(
                            index,
                            e.target.value
                          )
                        }
                        placeholder={`الاختيار ${ARABIC_OPTIONS[index]}`}
                        className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-yellow-400"
                      />

                    </div>
                  )
                )}

              </div>

              {/* الإجابة الصحيحة */}

              <div className="mt-5">

                <label className="block mb-3 text-gray-300">
                  الإجابة الصحيحة
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                  {ARABIC_OPTIONS.map(
                    (option, index) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setQuestion((prev) => ({
                            ...prev,
                            correctAnswer: index,
                          }))
                        }
                        className={`p-3 rounded-lg border font-bold ${
                          question.correctAnswer ===
                          index
                            ? "bg-green-600 border-green-300"
                            : "bg-gray-800 border-gray-600"
                        }`}
                      >
                        ( {option} )
                      </button>
                    )
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ================= ESSAY ================= */}

          {question.type === "essay" && (
            <div className="mb-5">

              <label className="block mb-2 text-gray-300">
                نموذج الإجابة
              </label>

              <textarea
                value={question.modelAnswer}
                onChange={(e) =>
                  setQuestion((prev) => ({
                    ...prev,
                    modelAnswer: e.target.value,
                  }))
                }
                rows={6}
                placeholder="اكتب نموذج الإجابة الذي يستخدمه المعلم في التصحيح..."
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-yellow-400"
              />

            </div>
          )}

          {/* الدرجة */}

          <div className="mb-5">

            <label className="block mb-2 text-gray-300">
              درجة السؤال
            </label>

            <input
              type="number"
              min="1"
              value={question.marks}
              onChange={(e) =>
                setQuestion((prev) => ({
                  ...prev,
                  marks: e.target.value,
                }))
              }
              className="w-full md:w-48 p-3 bg-gray-800 border border-gray-700 rounded-lg"
            />

          </div>

          {/* مستوى الصعوبة */}

          <div className="mb-5">

            <label className="block mb-2 text-gray-300">
              مستوى الصعوبة
            </label>

            <select
              value={question.difficulty}
              onChange={(e) =>
                setQuestion((prev) => ({
                  ...prev,
                  difficulty: e.target.value,
                }))
              }
              className="w-full md:w-64 p-3 bg-gray-800 border border-gray-700 rounded-lg"
            >
              <option value="easy">
                سهل
              </option>

              <option value="medium">
                متوسط
              </option>

              <option value="hard">
                صعب
              </option>
            </select>

          </div>

          {/* شرح السؤال */}

          <div className="mb-5">

            <label className="block mb-2 text-gray-300">
              شرح السؤال
            </label>

            <textarea
              value={question.explanation}
              onChange={(e) =>
                setQuestion((prev) => ({
                  ...prev,
                  explanation: e.target.value,
                }))
              }
              rows={4}
              placeholder="شرح اختياري للسؤال..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
            />

          </div>

          {/* الأزرار */}

          <div className="flex flex-col md:flex-row gap-3">

            <button
              type="button"
              disabled={saving}
              onClick={saveQuestion}
              className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 p-3 rounded-lg font-bold"
            >
              {saving
                ? "جاري الحفظ..."
                : editingIndex === null
                ? "✔ إضافة السؤال"
                : "✔ حفظ التعديل"}
            </button>

            {editingIndex !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-700 hover:bg-gray-600 p-3 rounded-lg"
              >
                إلغاء التعديل
              </button>
            )}

          </div>

        </div>

        {/* ================= قائمة الأسئلة ================= */}

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-xl font-bold text-yellow-300">
              أسئلة الامتحان
            </h2>

            <span className="bg-gray-800 px-4 py-2 rounded-lg">
              العدد: {questions.length}
            </span>

          </div>

          {questions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              لا توجد أسئلة في هذا الامتحان حتى الآن.
            </div>
          ) : (
            <div className="space-y-4">

              {questions.map((item, index) => (

                <div
                  key={item._id || index}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-4"
                >

                  {/* رقم السؤال */}

                  <div className="flex items-start gap-3">

                    <div className="shrink-0 text-yellow-400 font-bold text-lg min-w-[55px]">
                      {index + 1} -
                    </div>

                    <div className="flex-1">

                      <div className="flex flex-wrap gap-2 mb-3">

                        <span className="px-3 py-1 rounded-full bg-blue-700 text-sm">
                          {item.type === "essay"
                            ? "مقالي"
                            : "اختياري"}
                        </span>

                        <span className="px-3 py-1 rounded-full bg-gray-700 text-sm">
                          {item.marks || 1} درجة
                        </span>

                      </div>

                      <p className="text-lg font-semibold mb-4">
                        {item.questionText}
                      </p>

                      {/* اختيارات السؤال */}

                      {item.type === "mcq" &&
                        Array.isArray(
                          item.choices
                        ) && (
                          <div className="space-y-2 mb-4">

                            {item.choices.map(
                              (choice, choiceIndex) => (

                                <div
                                  key={choiceIndex}
                                  className={`p-2 rounded ${
                                    item.correctAnswer ===
                                    choiceIndex
                                      ? "bg-green-900 border border-green-500"
                                      : "bg-gray-900"
                                  }`}
                                >
                                  (
                                  {
                                    ARABIC_OPTIONS[
                                      choiceIndex
                                    ]
                                  }
                                  ) {choice}

                                  {item.correctAnswer ===
                                    choiceIndex && (
                                    <span className="text-green-400 mr-2">
                                      ✓ الإجابة الصحيحة
                                    </span>
                                  )}
                                </div>

                              )
                            )}

                          </div>
                        )}

                      {/* المقال */}

                      {item.type === "essay" &&
                        item.modelAnswer && (
                          <div className="bg-gray-900 p-3 rounded-lg mb-4">
                            <p className="text-yellow-400 mb-1">
                              نموذج الإجابة:
                            </p>
                            <p className="text-gray-300 whitespace-pre-wrap">
                              {item.modelAnswer}
                            </p>
                          </div>
                        )}

                      {/* أزرار الإدارة */}

                      <div className="flex flex-wrap gap-2">

                        <button
                          onClick={() =>
                            startEdit(
                              item,
                              index
                            )
                          }
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-black font-bold"
                        >
                          ✎ تعديل
                        </button>

                        <button
                          onClick={() =>
                            deleteQuestion(index)
                          }
                          className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg font-bold"
                        >
                          🗑 حذف
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}