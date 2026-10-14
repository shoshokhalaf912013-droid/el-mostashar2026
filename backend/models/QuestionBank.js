const mongoose = require("mongoose");

const CHOICE_LABELS = ["أ", "ب", "ج", "د"];

/* =========================================================
   Choice Schema
   ========================================================= */

const choiceSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      enum: CHOICE_LABELS,
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

/* =========================================================
   Question Bank Schema
   ========================================================= */

const questionBankSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    normalizedText: {
      type: String,
      index: true,
    },

    type: {
      type: String,
      enum: ["mcq", "essay"],
      required: true,
    },

    /*
     * IMPORTANT:
     * ExamImport sends choices as strings:
     *
     * [
     *   "الاختيار الأول",
     *   "الاختيار الثاني",
     *   "الاختيار الثالث",
     *   "الاختيار الرابع"
     * ]
     *
     * The database schema expects:
     *
     * [
     *   { label: "أ", text: "..." },
     *   { label: "ب", text: "..." },
     *   { label: "ج", text: "..." },
     *   { label: "د", text: "..." }
     * ]
     *
     * So we normalize strings automatically here.
     */

    choices: {
      type: [choiceSchema],
      default: [],

      set: (choices) => {
        if (!Array.isArray(choices)) {
          return choices;
        }

        return choices.map((choice, index) => {
          // Incoming value from ExamImport:
          // "some choice text"
          if (typeof choice === "string") {
            return {
              label: CHOICE_LABELS[index] || "",
              text: choice,
            };
          }

          // Already normalized object
          if (choice && typeof choice === "object") {
            return {
              label:
                choice.label ||
                CHOICE_LABELS[index] ||
                "",

              text:
                choice.text ??
                choice.labelText ??
                "",
            };
          }

          return choice;
        });
      },
    },

    /*
     * MCQ:
     * 0 = أ
     * 1 = ب
     * 2 = ج
     * 3 = د
     *
     * Can be null for imported questions whose answer
     * has not been supplied yet.
     */

    correctAnswer: {
      type: Number,
      min: 0,
      max: 3,
      default: null,
    },

    modelAnswer: {
      type: String,
      default: "",
      trim: true,
    },

    gradingCriteria: {
      type: [String],
      default: [],
    },

    marks: {
      type: Number,
      default: 1,
    },

    stageId: {
      type: String,
      default: "",
    },

    systemId: {
      type: String,
      default: "",
    },

    gradeId: {
      type: String,
      default: "",
    },

    subjectId: {
      type: String,
      default: "",
    },

    unitId: {
      type: String,
      default: "",
    },

    lessonId: {
      type: String,
      default: "",
    },

    sectionId: {
      type: String,
      default: "",
    },

    sectionTitle: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,
      default: "medium",
    },

    cognitiveLevel: {
      type: String,
      default: "",
    },

    /*
     * IMPORTANT:
     * imported_exam is now explicitly allowed.
     */
    source: {
      type: String,
      enum: [
        "teacher",
        "ai",
        "file",
        "mixed",
        "other",
        "imported_exam",
      ],
      default: "teacher",
    },

    sourceName: {
      type: String,
      default: "",
    },

    sourceDocument: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    sourcePage: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    explanation: {
      type: String,
      default: "",
    },

    aiGenerated: {
      type: Boolean,
      default: false,
    },

    aiReviewed: {
      type: Boolean,
      default: false,
    },

    imported: {
      type: Boolean,
      default: false,
    },

    importBatchId: {
      type: String,
      default: "",
    },

    visualAssets: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    choiceLayout: {
      type: String,
      default: "vertical",
    },

    /*
     * TRUE means that the question exists in the Question Bank
     * but its answer has not been resolved yet.
     *
     * This is intentionally different from "not saved".
     */
    unresolved: {
      type: Boolean,
      default: false,
      index: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   Helper
   ========================================================= */

function isImportedExamQuestion(doc) {
  return (
    doc.imported === true &&
    doc.source === "imported_exam"
  );
}

/* =========================================================
   PRE VALIDATE
   ========================================================= */

questionBankSchema.pre("validate", function () {
  const isImportedExam = isImportedExamQuestion(this);

  /* -------------------------------------------------------
     MCQ
     ------------------------------------------------------- */

  if (this.type === "mcq") {
    /*
     * Every MCQ must always have exactly 4 choices.
     */
    if (
      !Array.isArray(this.choices) ||
      this.choices.length !== 4
    ) {
      throw new Error(
        "سؤال الاختيار من متعدد يجب أن يحتوي على 4 اختيارات."
      );
    }

    /*
     * For imported exams:
     *
     * Answer is OPTIONAL.
     *
     * Without answer => unresolved = true
     *
     * With answer => unresolved = false
     */

    if (isImportedExam) {
      const answerMissing =
        this.correctAnswer === null ||
        this.correctAnswer === undefined;

      this.unresolved = answerMissing;

      /*
       * If an answer exists, it must still be valid.
       */
      if (!answerMissing) {
        if (
          this.correctAnswer < 0 ||
          this.correctAnswer > 3
        ) {
          throw new Error(
            "الإجابة الصحيحة يجب أن تكون بين 0 و3."
          );
        }
      }
    } else {
      /*
       * Normal questions remain strict.
       */
      if (
        this.correctAnswer === null ||
        this.correctAnswer === undefined
      ) {
        throw new Error(
          "يجب تحديد الإجابة الصحيحة لسؤال الاختيار من متعدد."
        );
      }

      if (
        this.correctAnswer < 0 ||
        this.correctAnswer > 3
      ) {
        throw new Error(
          "الإجابة الصحيحة يجب أن تكون بين 0 و3."
        );
      }

      this.unresolved = false;
    }
  }

  /* -------------------------------------------------------
     Essay
     ------------------------------------------------------- */

  if (this.type === "essay") {
    const answerMissing =
      !String(this.modelAnswer || "").trim();

    /*
     * Imported essay questions can be saved without
     * model answer.
     */
    if (isImportedExam) {
      this.unresolved = answerMissing;
    } else {
      /*
       * Normal essay questions remain strict.
       */
      if (answerMissing) {
        throw new Error(
          "السؤال المقالي يحتاج إلى نموذج إجابة."
        );
      }

      this.unresolved = false;
    }
  }
});

/* =========================================================
   PRE SAVE
   ========================================================= */

questionBankSchema.pre("save", function () {
  /* -------------------------------------------------------
     Normalize question text
     ------------------------------------------------------- */

  if (this.questionText) {
    this.normalizedText = this.questionText
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  /* -------------------------------------------------------
     MCQ
     ------------------------------------------------------- */

  if (this.type === "mcq") {
    /*
     * MCQ does not use essay grading fields.
     */
    this.modelAnswer = "";
    this.gradingCriteria = [];

    /*
     * Keep unresolved status synchronized.
     */
    if (isImportedExamQuestion(this)) {
      this.unresolved =
        this.correctAnswer === null ||
        this.correctAnswer === undefined;
    } else {
      this.unresolved = false;
    }
  }

  /* -------------------------------------------------------
     Essay
     ------------------------------------------------------- */

  if (this.type === "essay") {
    this.choices = [];
    this.correctAnswer = null;
    this.choiceLayout = "vertical";

    if (isImportedExamQuestion(this)) {
      this.unresolved =
        !String(this.modelAnswer || "").trim();
    } else {
      this.unresolved = false;
    }
  }
});

/* =========================================================
   Export
   ========================================================= */

module.exports = mongoose.model(
  "QuestionBank",
  questionBankSchema
);