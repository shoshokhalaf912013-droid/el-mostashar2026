// src/pages/superAdmin/QuestionBank.jsx
// إدارة بنك الأسئلة — Super Admin
//
// يعتمد على:
// GET    /api/question-bank
// GET    /api/question-bank/:id
// PUT    /api/question-bank/:id
// DELETE /api/question-bank/:id
//
// ملاحظة:
// DELETE في الـBackend الحالي هو حذف منطقي (active=false).

import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

const LETTERS = ["أ", "ب", "ج", "د"];

const DIFFICULTY_LABELS = {
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
  mixed: "متنوع",
};

const TYPE_LABELS = {
  mcq: "اختيار من متعدد",
  essay: "سؤال مقالي",
};

const LAYOUT_LABELS = {
  vertical: "رأسي",
  row4: "4 متجاورين",
  grid2x2: "2 × 2",
};

const GRADE_LABELS = {
  sec1: "الثانوية العامة — الصف الأول",
  sec2: "الثانوية العامة — الصف الثاني",
  sec3: "الثانوية العامة — الصف الثالث",
  bac1: "البكالوريا — الصف الأول",
  bac2: "البكالوريا — الصف الثاني",
  bac3: "البكالوريا — الصف الثالث",
};

const getQuestionId = (question) =>
  String(question?._id || question?.id || "");

const getDateLabel = (value) => {
  if (!value) return "—";

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
};

const getGradeLabel = (value) =>
  GRADE_LABELS[value] || value || "غير محدد";

const getSubjectLabel = (value) => {
  const labels = {
    history: "التاريخ",
    geography: "الجغرافيا",
    economics: "الاقتصاد",
    economy: "الاقتصاد",
    "National History": "التاريخ الوطني",
  };

  return labels[value] || value || "غير محدد";
};

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 20,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [active, setActive] = useState("true");

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [restoringId, setRestoringId] = useState("");

  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const filterOptions = useMemo(() => {
    const unique = (key) =>
      Array.from(
        new Set(
          questions
            .map((question) => question?.[key])
            .filter((value) => value !== undefined && value !== null && value !== "")
            .map((value) => String(value))
        )
      );

    return {
      grades: unique("gradeId"),
      subjects: unique("subjectId"),
      units: unique("unitId"),
      lessons: unique("lessonId"),
    };
  }, [questions]);

  const loadQuestions = useCallback(
    async (targetPage = 1) => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page: targetPage,
          limit: 20,
          active,
        };

        if (search.trim()) params.search = search.trim();
        if (gradeId) params.gradeId = gradeId;
        if (subjectId) params.subjectId = subjectId;
        if (unitId) params.unitId = unitId;
        if (lessonId) params.lessonId = lessonId;
        if (type) params.type = type;
        if (difficulty) params.difficulty = difficulty;

        const response = await api.get("/api/question-bank", { params });

        if (response.data?.success === false) {
          throw new Error(
            response.data?.error || "تعذر تحميل بنك الأسئلة."
          );
        }

        setQuestions(
          Array.isArray(response.data?.questions)
            ? response.data.questions
            : []
        );

        setPagination(
          response.data?.pagination || {
            page: targetPage,
            pages: 1,
            total: 0,
            limit: 20,
          }
        );
      } catch (err) {
        console.error("Question Bank page load error:", err);
        setQuestions([]);
        setError(
          err.response?.data?.error ||
            err.message ||
            "حدث خطأ أثناء تحميل بنك الأسئلة."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      active,
      difficulty,
      gradeId,
      lessonId,
      search,
      subjectId,
      type,
      unitId,
    ]
  );

  useEffect(() => {
    loadQuestions(1);
  }, [loadQuestions]);

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setGradeId("");
    setSubjectId("");
    setUnitId("");
    setLessonId("");
    setType("");
    setDifficulty("");
    setActive("true");
  };

  const saveEditedQuestion = async () => {
    if (!editingQuestion) return;

    if (!String(editingQuestion.questionText || "").trim()) {
      alert("نص السؤال مطلوب.");
      return;
    }

    if (editingQuestion.type === "mcq") {
      if (
        !Array.isArray(editingQuestion.choices) ||
        editingQuestion.choices.length !== 4 ||
        editingQuestion.choices.some(
          (choice) => !String(choice || "").trim()
        )
      ) {
        alert("سؤال الاختيار من متعدد يجب أن يحتوي على 4 اختيارات مكتملة.");
        return;
      }

      const answer = Number(editingQuestion.correctAnswer);

      if (answer < 0 || answer > 3) {
        alert("حدد الإجابة الصحيحة.");
        return;
      }
    }

    if (
      editingQuestion.type === "essay" &&
      !String(editingQuestion.modelAnswer || "").trim()
    ) {
      alert("السؤال المقالي يحتاج إلى نموذج إجابة.");
      return;
    }

    try {
      setSavingEdit(true);

      const payload = {
        questionText: String(editingQuestion.questionText || "").trim(),
        type: editingQuestion.type === "essay" ? "essay" : "mcq",
        choices:
          editingQuestion.type === "mcq"
            ? editingQuestion.choices
            : [],
        correctAnswer:
          editingQuestion.type === "mcq"
            ? Number(editingQuestion.correctAnswer)
            : null,
        modelAnswer:
          editingQuestion.type === "essay"
            ? String(editingQuestion.modelAnswer || "").trim()
            : "",
        gradingCriteria:
          editingQuestion.type === "essay"
            ? editingQuestion.gradingCriteria || []
            : [],
        marks: Number(editingQuestion.marks) || 1,
        stageId: editingQuestion.stageId || "",
        gradeId: editingQuestion.gradeId || "",
        subjectId: editingQuestion.subjectId || "",
        unitId: editingQuestion.unitId || "",
        lessonId: editingQuestion.lessonId || "",
        difficulty: editingQuestion.difficulty || "medium",
        source: editingQuestion.source || "teacher",
        sourceName: editingQuestion.sourceName || "",
        explanation: editingQuestion.explanation || "",
        aiGenerated: Boolean(editingQuestion.aiGenerated),
        aiReviewed: Boolean(editingQuestion.aiReviewed),
        active: editingQuestion.active !== false,
        choiceLayout:
          editingQuestion.type === "mcq"
            ? editingQuestion.choiceLayout || "vertical"
            : "vertical",
      };

      const response = await api.put(
        `/api/question-bank/${getQuestionId(editingQuestion)}`,
        payload,
        { timeout: 30000 }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data?.error || "فشل تعديل السؤال."
        );
      }

      setEditingQuestion(null);
      await loadQuestions(pagination.page);
    } catch (err) {
      console.error("Question Bank edit error:", err);
      alert(
        err.response?.data?.error ||
          err.message ||
          "حدث خطأ أثناء تعديل السؤال."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const disableQuestion = async (question) => {
    const id = getQuestionId(question);
    if (!id) return;

    const ok = window.confirm(
      "هل تريد تعطيل هذا السؤال من بنك الأسئلة؟\nلن يتم حذفه نهائيًا."
    );

    if (!ok) return;

    try {
      setDeletingId(id);

      const response = await api.put(
        `/api/question-bank/${id}`,
        { active: false },
        { timeout: 30000 }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data?.error || "فشل تعطيل السؤال."
        );
      }

      await loadQuestions(pagination.page);
    } catch (err) {
      console.error("Question Bank disable error:", err);
      alert(
        err.response?.data?.error ||
          err.message ||
          "حدث خطأ أثناء تعطيل السؤال."
      );
    } finally {
      setDeletingId("");
    }
  };

  const restoreQuestion = async (question) => {
    const id = getQuestionId(question);
    if (!id) return;

    try {
      setRestoringId(id);

      const response = await api.put(
        `/api/question-bank/${id}`,
        { active: true },
        { timeout: 30000 }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data?.error || "فشل إعادة تفعيل السؤال."
        );
      }

      await loadQuestions(pagination.page);
    } catch (err) {
      console.error("Question Bank restore error:", err);
      alert(
        err.response?.data?.error ||
          err.message ||
          "حدث خطأ أثناء إعادة تفعيل السؤال."
      );
    } finally {
      setRestoringId("");
    }
  };

  const updateEditingChoice = (index, value) => {
    setEditingQuestion((previous) => {
      if (!previous) return previous;

      const choices = [...(previous.choices || [])];
      choices[index] = value;

      return {
        ...previous,
        choices,
      };
    });
  };

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        padding: "28px",
      }}
    >
      <div
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#ffd700",
                fontSize: "30px",
              }}
            >
              📚 بنك الأسئلة
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#aaa",
              }}
            >
              إدارة ومراجعة جميع الأسئلة المحفوظة في المنصة
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div style={statStyle}>
              <span>إجمالي النتائج</span>
              <strong>{pagination.total || 0}</strong>
            </div>

            <div style={statStyle}>
              <span>المعروض</span>
              <strong>{questions.length}</strong>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div style={panelStyle}>
          <h3 style={sectionTitleStyle}>🔎 البحث والتصفية</h3>

          <form
            onSubmit={submitSearch}
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(240px, 2fr) repeat(4, minmax(150px, 1fr))",
              gap: "10px",
            }}
          >
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="ابحث داخل نص السؤال..."
              style={inputStyle}
            />

            <select
              value={gradeId}
              onChange={(event) => setGradeId(event.target.value)}
              style={inputStyle}
            >
              <option value="">كل الصفوف</option>
              {filterOptions.grades.map((value) => (
                <option key={value} value={value}>
                  {getGradeLabel(value)}
                </option>
              ))}
            </select>

            <select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              style={inputStyle}
            >
              <option value="">كل المواد</option>
              {filterOptions.subjects.map((value) => (
                <option key={value} value={value}>
                  {getSubjectLabel(value)}
                </option>
              ))}
            </select>

            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              style={inputStyle}
            >
              <option value="">كل الأنواع</option>
              <option value="mcq">اختيار من متعدد</option>
              <option value="essay">مقالي</option>
            </select>

            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              style={inputStyle}
            >
              <option value="">كل مستويات الصعوبة</option>
              <option value="easy">سهل</option>
              <option value="medium">متوسط</option>
              <option value="hard">صعب</option>
              <option value="mixed">متنوع</option>
            </select>

            <select
              value={unitId}
              onChange={(event) => setUnitId(event.target.value)}
              style={inputStyle}
            >
              <option value="">كل الوحدات</option>
              {filterOptions.units.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <select
              value={lessonId}
              onChange={(event) => setLessonId(event.target.value)}
              style={inputStyle}
            >
              <option value="">كل الدروس</option>
              {filterOptions.lessons.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <select
              value={active}
              onChange={(event) => setActive(event.target.value)}
              style={inputStyle}
            >
              <option value="true">الأسئلة النشطة</option>
              <option value="false">الأسئلة المعطلة</option>
              <option value="">كل الأسئلة</option>
            </select>

            <div
              style={{
                display: "flex",
                gap: "10px",
                gridColumn: "1 / -1",
                marginTop: "4px",
              }}
            >
              <button type="submit" style={goldButtonStyle}>
                🔎 بحث
              </button>

              <button
                type="button"
                onClick={clearFilters}
                style={darkButtonStyle}
              >
                ↺ إعادة ضبط
              </button>
            </div>
          </form>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginTop: "18px",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #ef4444",
              background: "#210909",
              color: "#fca5a5",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* QUESTIONS */}
        <div style={{ marginTop: "20px" }}>
          {loading ? (
            <div style={emptyStyle}>⏳ جاري تحميل بنك الأسئلة...</div>
          ) : questions.length === 0 ? (
            <div style={emptyStyle}>
              <div style={{ fontSize: "42px", marginBottom: "10px" }}>
                📚
              </div>
              لا توجد أسئلة مطابقة للفلاتر الحالية.
            </div>
          ) : (
            questions.map((question, index) => {
              const id = getQuestionId(question);
              const layout =
                question.choiceLayout || "vertical";

              return (
                <div
                  key={id || index}
                  style={{
                    ...panelStyle,
                    marginBottom: "16px",
                    border:
                      question.active === false
                        ? "1px solid #5b2020"
                        : "1px solid #333",
                    opacity:
                      question.active === false ? 0.78 : 1,
                  }}
                >
                  {/* CARD HEADER */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "14px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#ffd700",
                          fontWeight: "700",
                          fontSize: "17px",
                        }}
                      >
                        السؤال رقم {index + 1 + (pagination.page - 1) * pagination.limit}
                      </div>

                      <div
                        style={{
                          color: "#888",
                          fontSize: "12px",
                          marginTop: "5px",
                          direction: "ltr",
                          textAlign: "right",
                        }}
                      >
                        ID: {id || "—"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "7px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Badge>
                        {TYPE_LABELS[question.type] || question.type}
                      </Badge>

                      <Badge>
                        {DIFFICULTY_LABELS[question.difficulty] ||
                          question.difficulty ||
                          "—"}
                      </Badge>

                      {question.type === "mcq" && (
                        <Badge>
                          شكل الاختيارات:{" "}
                          {LAYOUT_LABELS[layout] || layout}
                        </Badge>
                      )}

                      <Badge>
                        {question.active === false
                          ? "معطل"
                          : "نشط"}
                      </Badge>
                    </div>
                  </div>

                  {/* QUESTION */}
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "#0b0b0b",
                      lineHeight: "1.9",
                      fontSize: "17px",
                    }}
                  >
                    {question.questionText}
                  </div>

                  {/* MCQ */}
                  {question.type === "mcq" &&
                    Array.isArray(question.choices) && (
                      <ChoicePreview
                        choices={question.choices}
                        correctAnswer={question.correctAnswer}
                        layout={layout}
                      />
                    )}

                  {/* ESSAY */}
                  {question.type === "essay" && (
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "14px",
                        borderRadius: "10px",
                        background: "#101010",
                      }}
                    >
                      <strong style={{ color: "#ffd700" }}>
                        📝 نموذج الإجابة
                      </strong>

                      <div
                        style={{
                          marginTop: "8px",
                          color: "#ddd",
                          lineHeight: "1.8",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {question.modelAnswer || "—"}
                      </div>
                    </div>
                  )}

                  {/* META */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit,minmax(170px,1fr))",
                      gap: "8px",
                      marginTop: "14px",
                      color: "#aaa",
                      fontSize: "13px",
                    }}
                  >
                    <Meta label="الصف" value={getGradeLabel(question.gradeId)} />
                    <Meta
                      label="المادة"
                      value={getSubjectLabel(question.subjectId)}
                    />
                    <Meta label="الوحدة" value={question.unitId || "—"} />
                    <Meta label="الدرس" value={question.lessonId || "—"} />
                    <Meta
                      label="المصدر"
                      value={
                        question.sourceName ||
                        question.source ||
                        "—"
                      }
                    />
                    <Meta
                      label="مرات الاستخدام"
                      value={question.usageCount ?? 0}
                    />
                    <Meta
                      label="الدرجة"
                      value={question.marks ?? 1}
                    />
                    <Meta
                      label="تاريخ الإضافة"
                      value={getDateLabel(question.createdAt)}
                    />
                  </div>

                  {/* ACTIONS */}
                  <div
                    style={{
                      display: "flex",
                      gap: "9px",
                      flexWrap: "wrap",
                      marginTop: "18px",
                      paddingTop: "14px",
                      borderTop: "1px solid #222",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedQuestion(question)
                      }
                      style={darkButtonStyle}
                    >
                      👁 عرض التفاصيل
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingQuestion({
                          ...question,
                          choices: Array.isArray(question.choices)
                            ? question.choices.map((choice) =>
                                typeof choice === "object" && choice !== null
                                  ? String(choice.text ?? "")
                                  : String(choice ?? "")
                              )
                            : ["", "", "", ""],
                          gradingCriteria:
                            Array.isArray(question.gradingCriteria)
                              ? [...question.gradingCriteria]
                              : [],
                        })
                      }
                      style={goldButtonStyle}
                    >
                      ✏️ تعديل
                    </button>

                    {question.active === false ? (
                      <button
                        type="button"
                        onClick={() =>
                          restoreQuestion(question)
                        }
                        disabled={restoringId === id}
                        style={greenButtonStyle}
                      >
                        {restoringId === id
                          ? "⏳ جاري التفعيل..."
                          : "♻️ إعادة تفعيل"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          disableQuestion(question)
                        }
                        disabled={deletingId === id}
                        style={redButtonStyle}
                      >
                        {deletingId === id
                          ? "⏳ جاري التعطيل..."
                          : "🗑 تعطيل السؤال"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION */}
        {!loading && pagination.pages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "24px",
              paddingBottom: "30px",
            }}
          >
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() =>
                loadQuestions(pagination.page - 1)
              }
              style={darkButtonStyle}
            >
              → السابق
            </button>

            <span
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                background: "#111",
                color: "#ffd700",
              }}
            >
              صفحة {pagination.page} من {pagination.pages}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() =>
                loadQuestions(pagination.page + 1)
              }
              style={darkButtonStyle}
            >
              التالي ←
            </button>
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedQuestion && (
        <Modal
          title="تفاصيل السؤال"
          onClose={() => setSelectedQuestion(null)}
        >
          <QuestionDetails question={selectedQuestion} />
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editingQuestion && (
        <Modal
          title="✏️ تعديل السؤال"
          onClose={() => !savingEdit && setEditingQuestion(null)}
          wide
        >
          <div style={{ display: "grid", gap: "12px" }}>
            <label style={labelStyle}>نص السؤال</label>
            <textarea
              value={editingQuestion.questionText || ""}
              onChange={(event) =>
                setEditingQuestion({
                  ...editingQuestion,
                  questionText: event.target.value,
                })
              }
              style={{
                ...inputStyle,
                minHeight: "120px",
                resize: "vertical",
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(180px,1fr))",
                gap: "10px",
              }}
            >
              <div>
                <label style={labelStyle}>نوع السؤال</label>
                <select
                  value={editingQuestion.type || "mcq"}
                  onChange={(event) => {
                    const nextType = event.target.value;

                    setEditingQuestion({
                      ...editingQuestion,
                      type: nextType,
                      choices:
                        nextType === "mcq"
                          ? editingQuestion.choices?.length === 4
                            ? editingQuestion.choices
                            : ["", "", "", ""]
                          : [],
                      correctAnswer:
                        nextType === "mcq"
                          ? Number(editingQuestion.correctAnswer ?? 0)
                          : null,
                    });
                  }}
                  style={inputStyle}
                >
                  <option value="mcq">اختيار من متعدد</option>
                  <option value="essay">سؤال مقالي</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>الصعوبة</label>
                <select
                  value={editingQuestion.difficulty || "medium"}
                  onChange={(event) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      difficulty: event.target.value,
                    })
                  }
                  style={inputStyle}
                >
                  <option value="easy">سهل</option>
                  <option value="medium">متوسط</option>
                  <option value="hard">صعب</option>
                  <option value="mixed">متنوع</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>الدرجة</label>
                <input
                  type="number"
                  min="1"
                  value={editingQuestion.marks ?? 1}
                  onChange={(event) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      marks: event.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            {editingQuestion.type === "mcq" ? (
              <>
                <label style={labelStyle}>شكل الاختيارات</label>

                <select
                  value={editingQuestion.choiceLayout || "vertical"}
                  onChange={(event) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      choiceLayout: event.target.value,
                    })
                  }
                  style={inputStyle}
                >
                  <option value="vertical">رأسي</option>
                  <option value="row4">4 متجاورين في سطر واحد</option>
                  <option value="grid2x2">سطران — اختياران في كل سطر</option>
                </select>

                <label style={labelStyle}>الاختيارات</label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2,minmax(0,1fr))",
                    gap: "10px",
                  }}
                >
                  {LETTERS.map((letter, index) => (
                    <div
                      key={letter}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <strong style={{ color: "#ffd700" }}>
                        ({letter})
                      </strong>

                      <input
                        value={editingQuestion.choices?.[index] || ""}
                        onChange={(event) =>
                          updateEditingChoice(
                            index,
                            event.target.value
                          )
                        }
                        style={{
                          ...inputStyle,
                          margin: 0,
                        }}
                        placeholder={`الاختيار ${letter}`}
                      />
                    </div>
                  ))}
                </div>

                <label style={labelStyle}>
                  الإجابة الصحيحة
                </label>

                <select
                  value={Number(editingQuestion.correctAnswer ?? 0)}
                  onChange={(event) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      correctAnswer: Number(event.target.value),
                    })
                  }
                  style={inputStyle}
                >
                  {LETTERS.map((letter, index) => (
                    <option key={letter} value={index}>
                      ({letter})
                    </option>
                  ))}
                </select>

                <label style={labelStyle}>
                  سبب صحة الإجابة
                </label>

                <textarea
                  value={editingQuestion.explanation || ""}
                  onChange={(event) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      explanation: event.target.value,
                    })
                  }
                  style={{
                    ...inputStyle,
                    minHeight: "90px",
                  }}
                />
              </>
            ) : (
              <>
                <label style={labelStyle}>نموذج الإجابة</label>

                <textarea
                  value={editingQuestion.modelAnswer || ""}
                  onChange={(event) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      modelAnswer: event.target.value,
                    })
                  }
                  style={{
                    ...inputStyle,
                    minHeight: "150px",
                  }}
                />
              </>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "10px",
                marginTop: "8px",
              }}
            >
              <button
                type="button"
                onClick={saveEditedQuestion}
                disabled={savingEdit}
                style={goldButtonStyle}
              >
                {savingEdit
                  ? "⏳ جاري الحفظ..."
                  : "💾 حفظ التعديلات"}
              </button>

              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                disabled={savingEdit}
                style={darkButtonStyle}
              >
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ChoicePreview({
  choices,
  correctAnswer,
  layout = "vertical",
}) {
  const safeChoices = Array.isArray(choices)
    ? choices.slice(0, 4)
    : [];

  const gridColumns =
    layout === "row4"
      ? "repeat(4,minmax(0,1fr))"
      : layout === "grid2x2"
      ? "repeat(2,minmax(0,1fr))"
      : "1fr";

  return (
    <div
      style={{
        marginTop: "14px",
        display: "grid",
        gridTemplateColumns: gridColumns,
        gap: "10px",
      }}
    >
      {safeChoices.map((choice, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
            padding: "10px 12px",
            borderRadius: "10px",
            background:
              Number(correctAnswer) === index
                ? "rgba(34,197,94,.12)"
                : "#101010",
            border:
              Number(correctAnswer) === index
                ? "1px solid rgba(34,197,94,.35)"
                : "1px solid #222",
          }}
        >
          <strong style={{ color: "#ffd700", flexShrink: 0 }}>
            ({LETTERS[index]})
          </strong>

          <span
            style={{
              color:
                Number(correctAnswer) === index
                  ? "#86efac"
                  : "#ddd",
              overflowWrap: "anywhere",
            }}
          >
            {
              typeof choice === "object" && choice !== null
                ? choice.text || "—"
                : choice || "—"
            }
          </span>
        </div>
      ))}
    </div>
  );
}

function QuestionDetails({ question }) {
  return (
    <div style={{ display: "grid", gap: "14px" }}>
      <div
        style={{
          padding: "15px",
          background: "#0d0d0d",
          borderRadius: "12px",
          lineHeight: "1.9",
          whiteSpace: "pre-wrap",
        }}
      >
        {question.questionText || "—"}
      </div>

      {question.type === "mcq" ? (
        <>
          <ChoicePreview
            choices={question.choices}
            correctAnswer={question.correctAnswer}
            layout={question.choiceLayout || "vertical"}
          />

          <Meta
            label="الإجابة الصحيحة"
            value={
              LETTERS[Number(question.correctAnswer)] ||
              "—"
            }
          />

          <Meta
            label="سبب صحة الإجابة"
            value={question.explanation || "—"}
          />
        </>
      ) : (
        <Meta
          label="نموذج الإجابة"
          value={question.modelAnswer || "—"}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: "10px",
        }}
      >
        <Meta label="الصف" value={getGradeLabel(question.gradeId)} />
        <Meta label="المادة" value={getSubjectLabel(question.subjectId)} />
        <Meta label="الوحدة" value={question.unitId || "—"} />
        <Meta label="الدرس" value={question.lessonId || "—"} />
        <Meta
          label="الشكل"
          value={
            question.type === "mcq"
              ? LAYOUT_LABELS[question.choiceLayout || "vertical"] ||
                question.choiceLayout ||
                "رأسي"
              : "—"
          }
        />
        <Meta
          label="مرات الاستخدام"
          value={question.usageCount ?? 0}
        />
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "#101010",
        borderRadius: "9px",
      }}
    >
      <div
        style={{
          color: "#777",
          fontSize: "11px",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#ddd",
          overflowWrap: "anywhere",
        }}
      >
        {value ?? "—"}
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 9px",
        borderRadius: "999px",
        background: "#161616",
        color: "#d4d4d4",
        border: "1px solid #292929",
        fontSize: "12px",
      }}
    >
      {children}
    </span>
  );
}

function Modal({ title, children, onClose, wide = false }) {
  return (
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: wide ? "900px" : "760px",
          margin: "auto",
          background: "#0b0b0b",
          border: "1px solid #333",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 20px 70px rgba(0,0,0,.55)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            marginBottom: "18px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#ffd700",
              fontSize: "22px",
            }}
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "#222",
              color: "#fff",
              borderRadius: "8px",
              padding: "7px 11px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

const panelStyle = {
  background: "#0b0b0b",
  border: "1px solid #282828",
  borderRadius: "15px",
  padding: "18px",
};

const sectionTitleStyle = {
  margin: "0 0 14px",
  color: "#ffd700",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#111",
  color: "#fff",
  border: "1px solid #3a3a3a",
  borderRadius: "9px",
  padding: "11px 12px",
  outline: "none",
};

const labelStyle = {
  display: "block",
  color: "#bbb",
  fontSize: "13px",
  marginBottom: "6px",
};

const statStyle = {
  minWidth: "125px",
  background: "#101010",
  border: "1px solid #292929",
  borderRadius: "11px",
  padding: "9px 13px",
  textAlign: "center",
};

const goldButtonStyle = {
  border: "none",
  borderRadius: "9px",
  background: "#ffd700",
  color: "#000",
  padding: "10px 15px",
  cursor: "pointer",
  fontWeight: "700",
};

const darkButtonStyle = {
  border: "1px solid #333",
  borderRadius: "9px",
  background: "#171717",
  color: "#fff",
  padding: "10px 15px",
  cursor: "pointer",
};

const redButtonStyle = {
  border: "none",
  borderRadius: "9px",
  background: "#b91c1c",
  color: "#fff",
  padding: "10px 15px",
  cursor: "pointer",
};

const greenButtonStyle = {
  border: "none",
  borderRadius: "9px",
  background: "#166534",
  color: "#fff",
  padding: "10px 15px",
  cursor: "pointer",
};

const emptyStyle = {
  ...panelStyle,
  textAlign: "center",
  padding: "60px 20px",
  color: "#aaa",
};
