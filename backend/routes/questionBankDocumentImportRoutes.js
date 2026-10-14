const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");

const {
  buildDocumentImportPayload,
} = require("../utils/smartDocumentImporter");

const {
  buildImportPreview,
} = require("../utils/questionImporter");

const router = express.Router();

// ======================================================
// Comparison-question table preparation
// Additive only: affects essay questions containing
// "قارن" / "المقارنة بين". All other questions are untouched.
// ======================================================
function isComparisonQuestion(questionText) {
  return /(?:قارن|المقارنة\s+بين)/iu.test(
    String(questionText || "")
  );
}

function extractComparisonSides(questionText) {
  const text = String(questionText || "")
    .replace(/\s+/g, " ")
    .trim();

  const match = text.match(
    /(?:قارن(?:\s+بين)?|المقارنة\s+بين)\s+(.+?)(?:\s+(?:و|بين)\s+)(.+?)(?:[؟?،.:؛]|$)/iu
  );

  if (!match) return ["العنصر الأول", "العنصر الثاني"];

  const first = match[1].trim().replace(/[،.:؛]+$/u, "");
  const second = match[2].trim().replace(/[،.:؛]+$/u, "");

  if (!first || !second || first.length > 120 || second.length > 120) {
    return ["العنصر الأول", "العنصر الثاني"];
  }

  return [first, second];
}

function buildComparisonTableHtml(questionText) {
  const [first, second] = extractComparisonSides(questionText);

  const escape = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const cell = (value, header = false) =>
    `<${header ? "th" : "td"} style="border:1px solid #6b7280;padding:8px;min-width:120px;${header ? "background:#1f2937;color:#f9fafb;font-weight:700;" : ""}">${escape(value)}</${header ? "th" : "td"}>`;

  return `<table data-import-table="comparison" style="width:100%;border-collapse:collapse;text-align:right;direction:rtl"><thead><tr>${cell("وجه المقارنة", true)}${cell(first, true)}${cell(second, true)}</tr></thead><tbody>${[1,2,3].map(() => `<tr>${cell("")}${cell("")}${cell("")}</tr>`).join("")}</tbody></table>`;
}

function prepareComparisonQuestions(preview) {
  if (!preview || !Array.isArray(preview.questions)) return preview;

  const questions = preview.questions.map((question) => {
    if (question.type !== "essay" || !isComparisonQuestion(question.questionText)) {
      return question;
    }

    // Never overwrite an existing model answer. Only initialize the
    // comparison table when the answer area is actually empty.
    const existingAnswer = Array.isArray(question.essayAnswers)
      ? question.essayAnswers.some((value) => String(value || "").trim())
      : Boolean(String(question.modelAnswer || "").trim());

    const existingHtml = String(question.modelAnswer || "");
    const hasExistingTable = /<table[\s>]/iu.test(existingHtml);
    const html = hasExistingTable
      ? existingHtml
      : buildComparisonTableHtml(question.questionText);

    if (existingAnswer) {
      // Preserve the existing answer and add the comparison table only when
      // there is not already a table. This keeps previous answer content intact.
      const combined = hasExistingTable
        ? existingHtml
        : `${existingHtml}\n\n${html}`;
      return {
        ...question,
        comparisonTable: { enabled: true, html },
        essayAnswers: [combined],
        modelAnswer: combined,
      };
    }

    return {
      ...question,
      comparisonTable: { enabled: true, html },
      essayAnswers: [html],
      modelAnswer: html,
    };
  });

  return { ...preview, questions };
}

const uploadDir = path.join(
  os.tmpdir(),
  "el-mostashar-question-imports"
);

fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    // This import flow intentionally uses images only.
    // PDF is not needed here because the working pipeline is:
    // image -> preprocessing -> Tesseract OCR.

    const allowed =
      /^image\/(png|jpe?g|webp|bmp|tiff?)$/i.test(
        file.mimetype || ""
      );

    if (!allowed) {
      return cb(
        new Error(
          "هذا الاستيراد يستخدم الصور فقط: PNG/JPG/JPEG/WebP/BMP/TIFF."
        )
      );
    }

    cb(null, true);
  },
});

// ======================================================
// POST /api/question-bank/import/preview
// Text -> existing import preview.
// Nothing is saved.
// ======================================================
router.post(
  "/preview",
  async (req, res) => {
    try {
      const body = req.body || {};

      const questionsText = String(
        body.questionsText || ""
      ).trim();

      if (!questionsText) {
        return res.status(400).json({
          success: false,
          error: "نص الأسئلة مطلوب.",
        });
      }

      const payload = {
        questionsText,
        answerKeyText: String(
          body.answerKeyText || ""
        ),
        visualAssets: Array.isArray(body.visualAssets)
          ? body.visualAssets
          : [],
        sourceDocument:
          body.sourceDocument &&
          typeof body.sourceDocument === "object"
            ? body.sourceDocument
            : null,
        defaults:
          body.defaults &&
          typeof body.defaults === "object"
            ? body.defaults
            : {},
      };

      const preview = prepareComparisonQuestions(
        buildImportPreview(payload)
      );

      return res.json({
        success: true,
        ...preview,
      });
    } catch (error) {
      console.error(
        "Question Bank TEXT PREVIEW error:",
        error
      );

      return res.status(400).json({
        success: false,
        error:
          error.message ||
          "فشل ترتيب وتحليل النص.",
      });
    }
  }
);

// ======================================================
// POST /api/question-bank/import/document-preview
// Upload image -> OCR -> existing import preview.
// Nothing is saved.
// ======================================================
router.post(
  "/document-preview",
  upload.single("file"),
  async (req, res) => {
    let filePath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error:
            "صورة الأسئلة أو صورة نموذج الإجابة مطلوبة.",
        });
      }

      filePath = req.file.path;

      let defaults = {};

      if (req.body?.defaults) {
        try {
          defaults = JSON.parse(
            req.body.defaults
          );
        } catch {
          return res.status(400).json({
            success: false,
            error:
              "defaults يجب أن يكون JSON صالحًا.",
          });
        }
      }

      const payload =
        await buildDocumentImportPayload({
          filePath,
          mimeType: req.file.mimetype,
          originalName: req.file.originalname,
          ocrLanguage:
            req.body?.ocrLanguage ||
            "ara+eng",
          defaults,
          answerKeyText:
            req.body?.answerKeyText || "",
        });

      const preview = prepareComparisonQuestions(
        buildImportPreview(payload)
      );

      return res.json({
        ...preview,

        // ==========================================
        // OCR TEXT
        // ==========================================
        // Tesseract يستخرج النص داخل payload.questionsText
        // ويجب إرساله للـ Frontend.
        questionsText:
          payload.questionsText,

        importBatchId:
          payload.importBatchId,

        extraction:
          payload.extraction,

        sourceDocument:
          payload.sourceDocument,
      });
    } catch (error) {
      console.error(
        "Question Bank DOCUMENT PREVIEW error:",
        error
      );

      return res.status(400).json({
        success: false,
        error:
          error.message ||
          "فشل استيراد الصورة.",
      });
    } finally {
      if (filePath) {
        fs.promises
          .unlink(filePath)
          .catch(() => {});
      }
    }
  }
);

module.exports = router;
