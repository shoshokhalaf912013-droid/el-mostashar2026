// src/pages/Admin/AddExam.jsx

import React, { useState } from "react";
import api from "../../utils/api";

const EMPTY_QUESTION = () => ({
  questionText: "",
  type: "mcq",
  choices: ["", "", "", ""],
  correctAnswer: null,
  modelAnswer: "",
  marks: 1,
  difficulty: "medium",
  explanation: "",
});

export default function AddExam() {
  const [exam, setExam] = useState({
    title: "",
    description: "",
    subject: "",
    stageId: "",
    gradeId: "",
    unitId: "",
    lessonId: "",
    duration: 30,
    withGifts: false,
    allowPrevious: true,
    strictMode: false,
  });

  const [questions, setQuestions] = useState([
    EMPTY_QUESTION(),
  ]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* =====================================================
     EXAM DATA
  ===================================================== */

  const updateExam = (field, value) => {
    setExam((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =====================================================
     QUESTIONS
  ===================================================== */

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      EMPTY_QUESTION(),
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const updateQuestion = (
    index,
    field,
    value
  ) => {
    setQuestions((prev) =>
      prev.map((question, i) =>
        i === index
          ? {
              ...question,
              [field]: value,
            }
          : question
      )
    );
  };

  const updateChoice = (
    questionIndex,
    choiceIndex,
    value
  ) => {
    setQuestions((prev) =>
      prev.map((question, i) => {
        if (i !== questionIndex) {
          return question;
        }

        const choices = [
          ...question.choices,
        ];

        choices[choiceIndex] = value;

        return {
          ...question,
          choices,
        };
      })
    );
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateExam = () => {
    if (!exam.title.trim()) {
      return "من فضلك اكتب عنوان الامتحان.";
    }

    if (!exam.stageId.trim()) {
      return "من فضلك اكتب المرحلة.";
    }

    if (!exam.gradeId.trim()) {
      return "من فضلك اكتب الصف.";
    }

    if (!exam.subject.trim()) {
      return "من فضلك اكتب المادة.";
    }

    if (!exam.unitId.trim()) {
      return "من فضلك اكتب الوحدة.";
    }

    if (!exam.lessonId.trim()) {
      return "من فضلك اكتب الدرس.";
    }

    if (!questions.length) {
      return "يجب إضافة سؤال واحد على الأقل.";
    }

    for (
      let i = 0;
      i < questions.length;
      i++
    ) {
      const q = questions[i];

      if (!q.questionText.trim()) {
        return `من فضلك اكتب نص السؤال رقم ${
          i + 1
        }.`;
      }

      if (q.type === "mcq") {
        if (
          q.choices.length !== 4 ||
          q.choices.some(
            (choice) => !choice.trim()
          )
        ) {
          return `السؤال رقم ${
            i + 1
          } يجب أن يحتوي على 4 اختيارات.`;
        }

        if (
          q.correctAnswer === null ||
          q.correctAnswer === undefined
        ) {
          return `من فضلك حدد الإجابة الصحيحة للسؤال رقم ${
            i + 1
          }.`;
        }
      }

      if (q.type === "essay") {
        if (!q.modelAnswer.trim()) {
          return `من فضلك اكتب نموذج الإجابة للسؤال رقم ${
            i + 1
          }.`;
        }
      }
    }

    return null;
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const saveExam = async () => {
    setMessage("");

    const validationError =
      validateExam();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: exam.title.trim(),
        description:
          exam.description.trim(),

        subject:
          exam.subject.trim(),

        stageId:
          exam.stageId.trim(),

        gradeId:
          exam.gradeId.trim(),

        unitId:
          exam.unitId.trim(),

        duration:
          Number(exam.duration) || 30,

        creationSource: "manual",

        withGifts:
          Boolean(exam.withGifts),

        allowPrevious:
          Boolean(exam.allowPrevious),

        strictMode:
          Boolean(exam.strictMode),

        questions:
          questions.map(
            (question, index) => ({
              questionNumber:
                index + 1,

              questionText:
                question.questionText.trim(),

              type:
                question.type,

              choices:
                question.type === "mcq"
                  ? question.choices
                  : [],

              correctAnswer:
                question.type === "mcq"
                  ? Number(
                      question.correctAnswer
                    )
                  : null,

              modelAnswer:
                question.type === "essay"
                  ? question.modelAnswer.trim()
                  : "",

              marks:
                Number(question.marks) || 1,

              difficulty:
                question.difficulty,

              source: "manual",

              lessonId:
                exam.lessonId.trim(),

              explanation:
                question.explanation.trim(),
            })
          ),
      };

      const response = await api.post(
        "/api/exams",
        payload
      );

      if (
        response.data?.success === false
      ) {
        throw new Error(
          response.data?.error ||
            "تعذر حفظ الامتحان."
        );
      }

      setMessage(
        "تم حفظ الامتحان بنجاح."
      );

      setExam({
        title: "",
        description: "",
        subject: "",
        stageId: "",
        gradeId: "",
        unitId: "",
        lessonId: "",
        duration: 30,
        withGifts: false,
        allowPrevious: true,
        strictMode: false,
      });

      setQuestions([
        EMPTY_QUESTION(),
      ]);
    } catch (error) {
      console.error(
        "Create exam error:",
        error
      );

      setMessage(
        error.response?.data?.error ||
          error.message ||
          "حدث خطأ أثناء حفظ الامتحان."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        bg-[#030712]
        text-white
        px-4
        py-8
      "
    >
      <div
        className="
          max-w-6xl
          mx-auto
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="text-center mb-8">

          <h1
            className="
              text-3xl
              md:text-4xl
              font-extrabold
              text-yellow-400
              drop-shadow-[0_0_12px_rgba(250,204,21,0.35)]
            "
          >
            📝 إضافة امتحان جديد
          </h1>

          <p className="text-gray-400 mt-3">
            إنشاء اختبار متكامل وإضافة الأسئلة
            وتحديد الإجابات والدرجات.
          </p>

        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div
            className={`
              mb-6
              rounded-xl
              border
              px-5
              py-4
              font-bold
              ${
                message.includes(
                  "بنجاح"
                )
                  ? "bg-green-900/30 border-green-500 text-green-300"
                  : "bg-red-900/30 border-red-500 text-red-300"
              }
            `}
          >
            {message}
          </div>
        )}

        {/* =================================================
            EXAM INFORMATION
        ================================================= */}

        <section
          className="
            bg-black
            border-2
            border-yellow-400
            rounded-2xl
            p-5
            md:p-7
            shadow-[0_0_25px_rgba(250,204,21,0.18)]
            mb-7
          "
        >

          <h2
            className="
              text-xl
              font-bold
              text-yellow-400
              mb-5
            "
          >
            بيانات الامتحان
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Field
              label="عنوان الامتحان"
              value={exam.title}
              onChange={(e) =>
                updateExam(
                  "title",
                  e.target.value
                )
              }
              placeholder="اكتب عنوان الامتحان"
            />

            <Field
              label="المادة"
              value={exam.subject}
              onChange={(e) =>
                updateExam(
                  "subject",
                  e.target.value
                )
              }
              placeholder="مثال: التاريخ"
            />

            <Field
              label="المرحلة"
              value={exam.stageId}
              onChange={(e) =>
                updateExam(
                  "stageId",
                  e.target.value
                )
              }
              placeholder="مثال: ثانوي"
            />

            <Field
              label="الصف"
              value={exam.gradeId}
              onChange={(e) =>
                updateExam(
                  "gradeId",
                  e.target.value
                )
              }
              placeholder="مثال: الصف الثالث الثانوي"
            />

            <Field
              label="الوحدة"
              value={exam.unitId}
              onChange={(e) =>
                updateExam(
                  "unitId",
                  e.target.value
                )
              }
              placeholder="اسم الوحدة"
            />

            <Field
              label="الدرس"
              value={exam.lessonId}
              onChange={(e) =>
                updateExam(
                  "lessonId",
                  e.target.value
                )
              }
              placeholder="اسم الدرس"
            />

            <Field
              label="مدة الامتحان بالدقائق"
              type="number"
              value={exam.duration}
              onChange={(e) =>
                updateExam(
                  "duration",
                  e.target.value
                )
              }
              min="1"
            />

          </div>

          <div className="mt-4">

            <label className="block text-yellow-300 mb-2 font-bold">
              وصف الامتحان
            </label>

            <textarea
              value={exam.description}
              onChange={(e) =>
                updateExam(
                  "description",
                  e.target.value
                )
              }
              rows={4}
              placeholder="وصف مختصر للامتحان..."
              className="
                w-full
                bg-[#111]
                border
                border-yellow-400
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                focus:ring-2
                focus:ring-yellow-400
              "
            />

          </div>

          {/* SETTINGS */}

          <div
            className="
              mt-6
              grid
              grid-cols-1
              md:grid-cols-3
              gap-3
            "
          >

            <CheckBox
              label="السماح بالرجوع للسؤال السابق"
              checked={exam.allowPrevious}
              onChange={(e) =>
                updateExam(
                  "allowPrevious",
                  e.target.checked
                )
              }
            />

            <CheckBox
              label="الوضع الصارم"
              checked={exam.strictMode}
              onChange={(e) =>
                updateExam(
                  "strictMode",
                  e.target.checked
                )
              }
            />

            <CheckBox
              label="تفعيل الهدايا"
              checked={exam.withGifts}
              onChange={(e) =>
                updateExam(
                  "withGifts",
                  e.target.checked
                )
              }
            />

          </div>

        </section>

        {/* =================================================
            QUESTIONS
        ================================================= */}

        <section
          className="
            bg-black
            border-2
            border-yellow-400
            rounded-2xl
            p-5
            md:p-7
            shadow-[0_0_25px_rgba(250,204,21,0.18)]
          "
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              justify-between
              items-center
              gap-4
              mb-6
            "
          >

            <h2
              className="
                text-xl
                font-bold
                text-yellow-400
              "
            >
              الأسئلة
            </h2>

            <button
              type="button"
              onClick={addQuestion}
              className="
                bg-yellow-400
                hover:bg-yellow-300
                text-black
                px-6
                py-3
                rounded-xl
                font-extrabold
                transition
              "
            >
              ➕ إضافة سؤال
            </button>

          </div>

          <div className="space-y-6">

            {questions.map(
              (question, index) => (
                <QuestionCard
                  key={index}
                  question={question}
                  index={index}
                  updateQuestion={
                    updateQuestion
                  }
                  updateChoice={
                    updateChoice
                  }
                  removeQuestion={
                    removeQuestion
                  }
                />
              )
            )}

          </div>

        </section>

        {/* =================================================
            SAVE
        ================================================= */}

        <div className="mt-7 flex justify-center">

          <button
            type="button"
            onClick={saveExam}
            disabled={saving}
            className="
              min-w-[260px]
              bg-gradient-to-r
              from-yellow-400
              to-yellow-600
              hover:from-yellow-300
              hover:to-yellow-500
              disabled:opacity-50
              disabled:cursor-not-allowed
              text-black
              px-8
              py-4
              rounded-2xl
              font-extrabold
              text-xl
              shadow-[0_0_25px_rgba(250,204,21,0.35)]
              transition
            "
          >
            {saving
              ? "⏳ جاري حفظ الامتحان..."
              : "💾 حفظ الامتحان"}
          </button>

        </div>

      </div>
    </div>
  );
}

/* =======================================================
   FIELD
======================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}) {
  return (
    <div>

      <label className="block text-yellow-300 mb-2 font-bold">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className="
          w-full
          bg-[#111]
          border
          border-yellow-400
          rounded-xl
          px-4
          py-3
          text-white
          outline-none
          placeholder:text-gray-600
          focus:ring-2
          focus:ring-yellow-400
        "
      />

    </div>
  );
}

/* =======================================================
   CHECKBOX
======================================================= */

function CheckBox({
  label,
  checked,
  onChange,
}) {
  return (
    <label
      className="
        flex
        items-center
        gap-3
        bg-[#111]
        border
        border-gray-700
        rounded-xl
        px-4
        py-3
        cursor-pointer
        hover:border-yellow-400
      "
    >

      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 accent-yellow-400"
      />

      <span className="text-gray-200">
        {label}
      </span>

    </label>
  );
}

/* =======================================================
   QUESTION CARD
======================================================= */

function QuestionCard({
  question,
  index,
  updateQuestion,
  updateChoice,
  removeQuestion,
}) {
  return (
    <div
      className="
        bg-[#111]
        border
        border-gray-700
        rounded-2xl
        p-5
        relative
      "
    >

      <div
        className="
          flex
          justify-between
          items-center
          mb-5
        "
      >

        <h3
          className="
            text-lg
            font-bold
            text-yellow-300
          "
        >
          السؤال {index + 1}
        </h3>

        {index > 0 && (
          <button
            type="button"
            onClick={() =>
              removeQuestion(index)
            }
            className="
              bg-red-600
              hover:bg-red-700
              px-4
              py-2
              rounded-lg
              font-bold
            "
          >
            🗑 حذف
          </button>
        )}

      </div>

      {/* TYPE */}

      <div className="mb-4">

        <label className="block text-gray-300 mb-2">
          نوع السؤال
        </label>

        <select
          value={question.type}
          onChange={(e) =>
            updateQuestion(
              index,
              "type",
              e.target.value
            )
          }
          className="
            w-full
            bg-black
            border
            border-yellow-400
            rounded-xl
            px-4
            py-3
            text-white
          "
        >
          <option value="mcq">
            اختيار من متعدد
          </option>

          <option value="essay">
            مقالي
          </option>
        </select>

      </div>

      {/* QUESTION TEXT */}

      <div className="mb-4">

        <label className="block text-yellow-300 mb-2 font-bold">
          نص السؤال
        </label>

        <textarea
          value={
            question.questionText
          }
          onChange={(e) =>
            updateQuestion(
              index,
              "questionText",
              e.target.value
            )
          }
          rows={3}
          placeholder="اكتب السؤال هنا..."
          className="
            w-full
            bg-black
            border
            border-gray-700
            focus:border-yellow-400
            rounded-xl
            px-4
            py-3
            text-white
            outline-none
          "
        />

      </div>

      {/* MCQ */}

      {question.type === "mcq" && (
        <>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {question.choices.map(
              (choice, choiceIndex) => (
                <div key={choiceIndex}>

                  <label className="block text-gray-400 mb-2">
                    الاختيار{" "}
                    {
                      ["أ", "ب", "ج", "د"][
                        choiceIndex
                      ]
                    }
                  </label>

                  <input
                    value={choice}
                    onChange={(e) =>
                      updateChoice(
                        index,
                        choiceIndex,
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      bg-black
                      border
                      border-yellow-400
                      rounded-xl
                      px-4
                      py-3
                      text-white
                      outline-none
                    "
                  />

                </div>
              )
            )}

          </div>

          <div className="mt-4">

            <label className="block text-yellow-300 mb-2 font-bold">
              الإجابة الصحيحة
            </label>

            <select
              value={
                question.correctAnswer ??
                ""
              }
              onChange={(e) =>
                updateQuestion(
                  index,
                  "correctAnswer",
                  e.target.value === ""
                    ? null
                    : Number(
                        e.target.value
                      )
                )
              }
              className="
                w-full
                bg-black
                border
                border-yellow-400
                rounded-xl
                px-4
                py-3
                text-white
              "
            >
              <option value="">
                اختر الإجابة الصحيحة
              </option>

              <option value="0">
                أ
              </option>

              <option value="1">
                ب
              </option>

              <option value="2">
                ج
              </option>

              <option value="3">
                د
              </option>

            </select>

          </div>

        </>
      )}

      {/* ESSAY */}

      {question.type === "essay" && (
        <div className="mt-4">

          <label className="block text-yellow-300 mb-2 font-bold">
            نموذج الإجابة
          </label>

          <textarea
            value={
              question.modelAnswer
            }
            onChange={(e) =>
              updateQuestion(
                index,
                "modelAnswer",
                e.target.value
              )
            }
            rows={4}
            className="
              w-full
              bg-black
              border
              border-yellow-400
              rounded-xl
              px-4
              py-3
              text-white
              outline-none
            "
          />

        </div>
      )}

      {/* EXTRA */}

      <div
        className="
          mt-5
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
        "
      >

        <div>

          <label className="block text-gray-300 mb-2">
            الدرجة
          </label>

          <input
            type="number"
            min="0"
            value={question.marks}
            onChange={(e) =>
              updateQuestion(
                index,
                "marks",
                e.target.value
              )
            }
            className="
              w-full
              bg-black
              border
              border-gray-700
              rounded-xl
              px-4
              py-3
              text-white
            "
          />

        </div>

        <div>

          <label className="block text-gray-300 mb-2">
            مستوى الصعوبة
          </label>

          <select
            value={
              question.difficulty
            }
            onChange={(e) =>
              updateQuestion(
                index,
                "difficulty",
                e.target.value
              )
            }
            className="
              w-full
              bg-black
              border
              border-gray-700
              rounded-xl
              px-4
              py-3
              text-white
            "
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

      </div>

      <div className="mt-4">

        <label className="block text-gray-300 mb-2">
          شرح السؤال
        </label>

        <textarea
          value={
            question.explanation
          }
          onChange={(e) =>
            updateQuestion(
              index,
              "explanation",
              e.target.value
            )
          }
          rows={2}
          className="
            w-full
            bg-black
            border
            border-gray-700
            rounded-xl
            px-4
            py-3
            text-white
          "
        />

      </div>

    </div>
  );
}