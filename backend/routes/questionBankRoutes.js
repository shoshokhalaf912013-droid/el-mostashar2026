const express = require("express");
const router = express.Router();

const QuestionBank = require("../models/QuestionBank");
const { buildImportPreview } = require("../utils/questionImporter");


// ======================================================
// ╪»╪╣┘à ╪┤┘â┘ ╪╣╪▒╪╢ ╪د┘╪د╪«╪ز┘è╪د╪▒╪د╪ز
// vertical = ┘â┘ ╪د╪«╪ز┘è╪د╪▒ ┘┘è ╪│╪╖╪▒
// row4 = ╪د┘╪ث╪▒╪ذ╪╣╪ر ┘┘è ╪│╪╖╪▒ ┘ê╪د╪ص╪»
// grid2x2 = ╪د╪«╪ز┘è╪د╪▒╪د┘ ┘┘è ┘â┘ ╪│╪╖╪▒
// ┘╪╢┘è┘ ╪د┘╪ص┘é┘ ╪ح┘┘ë schema ┘ç┘╪د ┘┘╪ز┘ê╪د┘┘é ┘à╪╣ ╪د┘┘à┘ê╪»┘è┘ ╪د┘╪ص╪د┘┘è.
// ======================================================

QuestionBank.schema.add({
  systemId: { type: String, default: "" },
  importOrder: { type: Number, default: 0 },
  originalQuestionNumber: { type: String, default: "", trim: true },
  choiceLayout: {
    type: String,
    enum: ["vertical", "row4", "grid2x2"],
    default: "vertical",
  },
});

// ======================================================
// ╪ص┘é┘ê┘ ╪د┘╪د╪│╪ز┘è╪▒╪د╪» ╪د┘┘à╪ز┘é╪»┘à╪ر
// ┘à┘ê╪ش┘ê╪»╪ر ╪ذ╪د┘┘╪╣┘ ┘┘è QuestionBank ╪د┘╪ص╪د┘┘è╪î
// ┘ê┘╪╢┘à┘ ┘ç┘╪د ╪ث┘ ╪د┘┘Route ┘è╪│╪ز┘é╪ذ┘┘ç╪د ┘ê┘è╪ص┘╪╕┘ç╪د ╪ث┘è╪╢┘ï╪د.
// ======================================================

function normalizeVisualAssets(value) {
  if (!Array.isArray(value)) return [];

  const allowedTypes = [
    "map",
    "portrait",
    "chart",
    "table",
    "diagram",
    "image",
    "other",
  ];

  return value
    .filter(Boolean)
    .map((asset, index) => ({
      type: allowedTypes.includes(asset.type)
        ? asset.type
        : "image",
      url: String(asset.url || "").trim(),
      fileName: String(asset.fileName || "").trim(),
      page:
        Number.isFinite(Number(asset.page)) &&
        Number(asset.page) >= 1
          ? Number(asset.page)
          : null,
      order:
        Number.isFinite(Number(asset.order)) &&
        Number(asset.order) >= 0
          ? Number(asset.order)
          : index,
      caption: String(asset.caption || "").trim(),
      cropped: Boolean(asset.cropped),
      crop: {
        x: Number.isFinite(Number(asset.crop?.x)) ? Number(asset.crop.x) : null,
        y: Number.isFinite(Number(asset.crop?.y)) ? Number(asset.crop.y) : null,
        width: Number.isFinite(Number(asset.crop?.width)) ? Number(asset.crop.width) : null,
        height: Number.isFinite(Number(asset.crop?.height)) ? Number(asset.crop.height) : null,
      },
    }));
}

function normalizeSourceDocument(value) {
  if (!value || typeof value !== "object") return null;

  return {
    fileName: String(value.fileName || "").trim(),
    fileUrl: String(value.fileUrl || "").trim(),
    pages: Array.isArray(value.pages)
      ? value.pages
          .map(Number)
          .filter((page) => Number.isInteger(page) && page >= 1)
      : [],
    referenceText: String(value.referenceText || "").trim(),
    curriculumOnly:
      value.curriculumOnly === undefined
        ? true
        : Boolean(value.curriculumOnly),
  };
}

function normalizeSourcePage(value) {
  if (!value || typeof value !== "object") return null;

  const pageNumber = Number(value.pageNumber);

  return {
    fileName: String(value.fileName || "").trim(),
    pageNumber:
      Number.isInteger(pageNumber) && pageNumber >= 1
        ? pageNumber
        : null,
    originalQuestionNumber: String(
      value.originalQuestionNumber || ""
    ).trim(),
  };
}

// ======================================================
// GET ظ¤ ╪ش┘à┘è╪╣ ╪ث╪│╪خ┘╪ر ╪ذ┘┘â ╪د┘╪ث╪│╪خ┘╪ر
// ======================================================

router.get("/", async (req, res) => {
  try {
    const {
      stageId,
      gradeId,
      subjectId,
      unitId,
      lessonId,
      sectionId,
      systemId,
      type,
      difficulty,
      cognitiveLevel,
      imported,
      importBatchId,
      active,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};

    if (stageId) filter.stageId = stageId;
    if (gradeId) filter.gradeId = gradeId;
    if (subjectId) filter.subjectId = subjectId;
    if (unitId) filter.unitId = unitId;
    if (lessonId) filter.lessonId = lessonId;
    if (sectionId) filter.sectionId = sectionId;
    if (systemId) filter.systemId = systemId;
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (cognitiveLevel) filter.cognitiveLevel = cognitiveLevel;
    if (imported !== undefined) {
      filter.imported = imported === "true";
    }
    if (importBatchId) filter.importBatchId = importBatchId;

    if (active !== undefined) {
      filter.active = active === "true";
    }

    if (search) {
      filter.questionText = {
        $regex: search,
        $options: "i",
      };
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(
      Math.max(Number(limit), 1),
      200
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const [questions, total] =
      await Promise.all([
        QuestionBank.find(filter)
          .sort(importBatchId ? { importOrder: 1 } : { createdAt: -1 })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        QuestionBank.countDocuments(filter),
      ]);

    res.json({
      success: true,
      questions,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (err) {
    console.error(
      "Question Bank GET error:",
      err
    );

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================================================
// POST ظ¤ ╪د╪│╪ز┘è╪▒╪د╪» ╪د┘╪ث╪│╪خ┘╪ر ╪ح┘┘ë Preview ┘┘é╪╖
// ┘╪د ┘è╪ز┘à ╪د┘╪ص┘╪╕ ┘┘è QuestionBank ┘ç┘╪د.
// ======================================================
router.post("/import/preview", async (req, res) => {
  try {
    const {
      questionsText = "",
      answerKeyText = "",
      visualAssets = [],
      sourceDocument = null,
      defaults = {},
    } = req.body || {};

    if (!String(questionsText || "").trim()) {
      return res.status(400).json({
        success: false,
        error: "┘╪╡ ╪د┘╪ث╪│╪خ┘╪ر ┘à╪╖┘┘ê╪ذ ┘╪ح┘╪┤╪د╪ة ╪د┘┘à╪╣╪د┘è┘╪ر.",
      });
    }

    const preview = buildImportPreview({
      questionsText,
      answerKeyText,
      visualAssets,
      sourceDocument,
      defaults,
    });

    if (!preview.success) {
      return res.status(400).json(preview);
    }

    return res.json(preview);
  } catch (err) {
    console.error("Question Bank IMPORT PREVIEW error:", err);
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================================================
// GET ظ¤ ╪│╪ج╪د┘ ┘ê╪د╪ص╪»
// ======================================================

router.get("/:id", async (req, res) => {
  try {
    const question =
      await QuestionBank.findById(
        req.params.id
      );

    if (!question) {
      return res.status(404).json({
        success: false,
        error: "Question not found",
      });
    }

    res.json({
      success: true,
      question,
    });
  } catch (err) {
    console.error(
      "Question Bank GET ONE error:",
      err
    );

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================================================
// POST ظ¤ ╪ح╪╢╪د┘╪ر ╪│╪ج╪د┘ ╪ش╪»┘è╪»
// ======================================================

router.post("/", async (req, res) => {
  try {
    const {
      questionText,
      type = "mcq",
      choices = [],
      correctAnswer = null,
      modelAnswer = "",
      gradingCriteria = [],
      marks = 1,

      stageId = "",
      gradeId = "",
      subjectId = "",
      unitId = "",
      lessonId = "",
      sectionId = "",
      sectionTitle = "",
      systemId = "",
      importOrder = 0,
      originalQuestionNumber = null,

      difficulty = "medium",
      cognitiveLevel = "",

      source = "teacher",
      sourceName = "",

      explanation = "",

      aiGenerated = false,
      aiReviewed = false,

      imported = false,
      importBatchId = "",

      visualAssets = [],
      sourceDocument = null,
      sourcePage = null,

      active = true,

      choiceLayout = "vertical",
    } = req.body;

    const normalizedChoiceLayout =
      ["vertical", "row4", "grid2x2"].includes(choiceLayout)
        ? choiceLayout
        : "vertical";

    const normalizedVisualAssets =
      normalizeVisualAssets(visualAssets);

    const normalizedSourceDocument =
      normalizeSourceDocument(sourceDocument);

    const normalizedSourcePage =
      normalizeSourcePage(sourcePage);

    const allowUnresolvedImport =
      imported === true && source === "imported_exam";

    // ==================================================
    // ╪د┘╪ز╪ص┘é┘é ╪د┘╪ث╪│╪د╪│┘è
    // ==================================================

    if (
      !questionText ||
      !questionText.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "┘╪╡ ╪د┘╪│╪ج╪د┘ ┘à╪╖┘┘ê╪ذ.",
      });
    }

    if (!["mcq", "essay"].includes(type)) {
      return res.status(400).json({
        success: false,
        error:
          "┘┘ê╪╣ ╪د┘╪│╪ج╪د┘ ┘è╪ش╪ذ ╪ث┘ ┘è┘â┘ê┘ mcq ╪ث┘ê essay.",
      });
    }

    // ==================================================
    // ╪ز╪╖╪ذ┘è╪╣ ╪د┘┘╪╡ ┘┘à┘╪╣ ╪د┘╪ز┘â╪▒╪د╪▒
    // ==================================================

    const normalizedText =
      questionText
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    // ==================================================
    // ╪د┘╪ذ╪ص╪س ╪╣┘ ╪│╪ج╪د┘ ┘à┘â╪▒╪▒ ┘┘è ┘┘╪│ ╪د┘╪»╪▒╪│
    // ==================================================

    const duplicate =
      await QuestionBank.findOne({
        lessonId,
        systemId,
        sectionId,
        normalizedText,
        active: true,
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        error:
          "┘ç╪░╪د ╪د┘╪│╪ج╪د┘ ┘à┘ê╪ش┘ê╪» ╪ذ╪د┘┘╪╣┘ ┘┘è ╪ذ┘┘â ╪ث╪│╪خ┘╪ر ┘ç╪░╪د ╪د┘╪»╪▒╪│.",
        questionId: duplicate._id,
      });
    }

    // ==================================================
    // MCQ
    // ==================================================

    if (type === "mcq") {
      if (
        !Array.isArray(choices) ||
        choices.length !== 4
      ) {
        return res.status(400).json({
          success: false,
          error:
            "╪│╪ج╪د┘ ╪د┘╪د╪«╪ز┘è╪د╪▒ ┘à┘ ┘à╪ز╪╣╪»╪» ┘è╪ش╪ذ ╪ث┘ ┘è╪ص╪ز┘ê┘è ╪╣┘┘ë 4 ╪د╪«╪ز┘è╪د╪▒╪د╪ز.",
        });
      }

      if (
        !allowUnresolvedImport &&
        (correctAnswer === null ||
          correctAnswer === undefined ||
          correctAnswer < 0 ||
          correctAnswer > 3)
      ) {
        return res.status(400).json({
          success: false,
          error:
            "┘è╪ش╪ذ ╪ز╪ص╪»┘è╪» ╪د┘╪ح╪ش╪د╪ذ╪ر ╪د┘╪╡╪ص┘è╪ص╪ر ┘à┘ 0 ╪ح┘┘ë 3.",
        });
      }
    }

    // ==================================================
    // ESSAY
    // ==================================================

    if (type === "essay") {
      if (
        !allowUnresolvedImport &&
        (!modelAnswer ||
        !modelAnswer.trim())
      ) {
        return res.status(400).json({
          success: false,
          error:
            "╪د┘╪│╪ج╪د┘ ╪د┘┘à┘é╪د┘┘è ┘è╪ص╪ز╪د╪ش ╪ح┘┘ë ┘┘à┘ê╪░╪ش ╪ح╪ش╪د╪ذ╪ر.",
        });
      }
    }

    // ==================================================
    // ╪ح┘╪┤╪د╪ة ╪د┘╪│╪ج╪د┘
    // ==================================================

    const question =
      new QuestionBank({
        questionText:
          questionText.trim(),

        type,

        choices:
          type === "mcq"
            ? choices
            : [],

        correctAnswer:
          type === "mcq"
            ? correctAnswer
            : null,

        modelAnswer:
          type === "essay"
            ? modelAnswer.trim()
            : "",

        gradingCriteria:
          type === "essay"
            ? gradingCriteria
            : [],

        marks,

        stageId,
        gradeId,
        subjectId,
        unitId,
        lessonId,
        sectionId,
        sectionTitle,
        systemId,
        importOrder: Number(importOrder) || 0,
        originalQuestionNumber: String(
          originalQuestionNumber ?? ""
        ).trim(),

        difficulty,
        cognitiveLevel,

        visualAssets: normalizedVisualAssets,
        sourceDocument: normalizedSourceDocument,
        sourcePage: normalizedSourcePage,

        source,
        sourceName,

        explanation,

        aiGenerated,
        aiReviewed,

        imported,
        importBatchId,

        normalizedText,

        active,

        choiceLayout: normalizedChoiceLayout,
      });

    await question.save();

    res.status(201).json({
      success: true,
      message:
        "╪ز┘à╪ز ╪ح╪╢╪د┘╪ر ╪د┘╪│╪ج╪د┘ ╪ح┘┘ë ╪ذ┘┘â ╪د┘╪ث╪│╪خ┘╪ر ╪ذ┘╪ش╪د╪ص.",
      question,
    });
  } catch (err) {
    console.error(
      "Question Bank CREATE error:",
      err
    );

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================================================
// PUT ظ¤ ╪ز╪╣╪»┘è┘ ╪│╪ج╪د┘
// ======================================================

router.put("/:id", async (req, res) => {
  try {
    const question =
      await QuestionBank.findById(
        req.params.id
      );

    if (!question) {
      return res.status(404).json({
        success: false,
        error: "Question not found",
      });
    }

    const allowedFields = [
      "questionText",
      "type",
      "choices",
      "correctAnswer",
      "modelAnswer",
      "gradingCriteria",
      "marks",

      "stageId",
      "gradeId",
      "subjectId",
      "unitId",
      "lessonId",
      "sectionId",
      "systemId",
      "importOrder",
      "originalQuestionNumber",
      "sectionTitle",

      "difficulty",
      "cognitiveLevel",

      "source",
      "sourceName",

      "explanation",

      "aiGenerated",
      "aiReviewed",

      "imported",
      "importBatchId",
      "visualAssets",
      "sourceDocument",
      "sourcePage",

      "active",
      "choiceLayout",
    ];

    for (const field of allowedFields) {
      if (
        req.body[field] !== undefined
      ) {
        question[field] =
          req.body[field];
      }
    }

    if (question.choiceLayout &&
        !["vertical", "row4", "grid2x2"].includes(question.choiceLayout)) {
      question.choiceLayout = "vertical";
    }

    if (question.questionText) {
      question.normalizedText =
        question.questionText
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
    }

    if (req.body.visualAssets !== undefined) {
      question.visualAssets =
        normalizeVisualAssets(req.body.visualAssets);
    }

    if (req.body.sourceDocument !== undefined) {
      question.sourceDocument =
        normalizeSourceDocument(req.body.sourceDocument);
    }

    if (req.body.sourcePage !== undefined) {
      question.sourcePage =
        normalizeSourcePage(req.body.sourcePage);
    }

    await question.save();

    res.json({
      success: true,
      message:
        "╪ز┘à ╪ز╪╣╪»┘è┘ ╪د┘╪│╪ج╪د┘ ╪ذ┘╪ش╪د╪ص.",
      question,
    });
  } catch (err) {
    console.error(
      "Question Bank UPDATE error:",
      err
    );

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================================================
// DELETE ظ¤ ╪ص╪░┘ ╪د┘╪│╪ج╪د┘
// ======================================================

router.delete("/:id", async (req, res) => {
  try {
    const question =
      await QuestionBank.findById(
        req.params.id
      );

    if (!question) {
      return res.status(404).json({
        success: false,
        error: "Question not found",
      });
    }

    // ==================================================
    // ╪ص╪░┘ ┘à┘╪╖┘é┘è ┘ê┘┘è╪│ ╪ص╪░┘┘ï╪د ┘┘ç╪د╪خ┘è┘ï╪د
    // ==================================================

    question.active = false;

    await question.save();

    res.json({
      success: true,
      message:
        "╪ز┘à ╪ز╪╣╪╖┘è┘ ╪د┘╪│╪ج╪د┘ ┘à┘ ╪ذ┘┘â ╪د┘╪ث╪│╪خ┘╪ر.",
    });
  } catch (err) {
    console.error(
      "Question Bank DELETE error:",
      err
    );

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================================================
// POST ظ¤ ╪د╪«╪ز┘è╪د╪▒ ╪ث╪│╪خ┘╪ر ╪╣╪┤┘ê╪د╪خ┘è╪ر ┘à┘ ╪»╪▒╪│
// ======================================================

router.post("/random/select", async (req, res) => {
  try {
    const {
      lessonId,
      sectionId,
      count = 10,
      type,
      difficulty,
      cognitiveLevel,
      excludeIds = [],
    } = req.body;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        error: "lessonId ┘à╪╖┘┘ê╪ذ.",
      });
    }

    const number =
      Math.max(Number(count), 1);

    const filter = {
      lessonId,
      active: true,
    };

    if (sectionId) {
      filter.sectionId = sectionId;
    }

    if (type) {
      filter.type = type;
    }

    if (difficulty) {
      filter.difficulty =
        difficulty;
    }

    if (cognitiveLevel) {
      filter.cognitiveLevel = cognitiveLevel;
    }

    if (
      Array.isArray(excludeIds) &&
      excludeIds.length > 0
    ) {
      filter._id = {
        $nin: excludeIds,
      };
    }

    const questions =
      await QuestionBank.aggregate([
        {
          $match: filter,
        },

        {
          $sample: {
            size: number,
          },
        },
      ]);

    res.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (err) {
    console.error(
      "Question Bank RANDOM error:",
      err
    );

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================================================
// POST ظ¤ ╪ز╪│╪ش┘è┘ ╪د╪│╪ز╪«╪»╪د┘à ╪د┘╪ث╪│╪خ┘╪ر
// ======================================================

router.post("/mark-used", async (req, res) => {
  try {
    const {
      questionIds = [],
    } = req.body;

    if (
      !Array.isArray(questionIds) ||
      questionIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "questionIds ┘à╪╖┘┘ê╪ذ.",
      });
    }

    await QuestionBank.updateMany(
      {
        _id: {
          $in: questionIds,
        },
      },
      {
        $inc: {
          usageCount: 1,
        },

        $set: {
          lastUsedAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      message:
        "╪ز┘à ╪ز╪│╪ش┘è┘ ╪د╪│╪ز╪«╪»╪د┘à ╪د┘╪ث╪│╪خ┘╪ر.",
    });
  } catch (err) {
    console.error(
      "Question Bank MARK USED error:",
      err
    );

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
