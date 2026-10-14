/**
 * Question Importer / Preview Engine
 * backend/utils/questionImporter.js
 */
"use strict";

const {
  parseMcqAnswerKey,
  validateMcqCoverage,
  buildMcqAnswerUpdates,
} = require("./importAnswerKey");

const OPTION_LABELS = ["أ", "ب", "ج", "د"];

function normalizeText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function normalizeDigits(value) {
  const digits = {
    "٠":"0","١":"1","٢":"2","٣":"3","٤":"4",
    "٥":"5","٦":"6","٧":"7","٨":"8","٩":"9",
    "۰":"0","۱":"1","۲":"2","۳":"3","۴":"4",
    "۵":"5","۶":"6","۷":"7","۸":"8","۹":"9",
  };
  return String(value || "").replace(/[٠-٩۰-۹]/g, d => digits[d]);
}

function cleanLine(line) {
  return normalizeText(normalizeDigits(line))
    .replace(/^[‎‏\u200e\u200f]+/g, "")
    .trim();
}

function isImportHeading(line) {
  const value = cleanLine(line).replace(/^(?:\d+|[٠-٩۰-۹]+)\s*[.)\-:|]?\s*/u, '');
  if (!value) return false;
  return /^(?:اختر\s+الإجابة\s+الصحيحة|اختر\s+الإجابة|نموذج\s*[أاببجدد]?|التقييم\s+(?:الأسبوعي|الشهري|النهائي)|الأداء(?:ات)?\s+(?:الصف(?:ي|ية)|الصفية)|الواجب\s+(?:المنزلي|البيتي)|الأسئلة\s+المقالية|الأسئلة\s+التالية|التدريب\s+(?:الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر)|(?:كتاب|مذكرة|ملزمة|المستشار|الامتحان|المصدر|الأضواء|البوكليت|التابلت)\b)/iu.test(value);
}

function parseQuestionStart(line) {
  let value = cleanLine(line).replace(/^[|¦│]+/, "").trim();

  const questionLike =
    /^(في ضوء|فى ضوء|ما المواقف|أى المواقف|أيّ|أي|أى|ماذا|لماذا|كيف|متى|أين|من|ما|هل|علل|اختر|حدد|قارن|استنتج|أثبت|اذكر|يمكن|يعكس|تتضمن|تنص|يمثل|قيام|بناء|ما الذي|ماذا يحدث|كيف يمكن|أي العبارات|أي مما)/iu;

  // OCR in the supplied exam frequently marks the beginning of a question
  // with © instead of a question number. Treat © + question-like text as
  // a new question, while leaving © + ordinary answer text as an option.
  let ocrQuestion = value.match(/^©\s*(.+)$/u);
  if (ocrQuestion && questionLike.test(ocrQuestion[1].trim())) {
    return { number: null, text: ocrQuestion[1].trim(), ocrMarker: "circle" };
  }

  let match = value.match(
    /^(?:السؤال|سؤال|س)\s*(\d+)\s*[:.)\-–—|]?\s*(.*)$/iu
  );
  if (match) {
    return { number: Number(match[1]), text: match[2].trim() };
  }

  match = value.match(
    /^(?:\(\s*)?(\d+)(?:\s*\))?\s*[.)\-:|]?\s*(.*)$/u
  );
  if (!match) {
    // Google Lens/Tesseract can omit the question number completely.
    // In that case we allow a strong question-like line to act as a
    // question boundary. The caller applies an additional safety rule
    // before splitting an existing question.
    if (questionLike.test(value)) {
      return { number: null, text: value, implicit: true };
    }
    return null;
  }

  const number = Number(match[1]);
  const rest = match[2].trim();
  const prefix = value.slice(0, value.length - rest.length);
  const hasPunctuation = /[.)\-:|]/.test(prefix);

  // In copied Arabic PDF/Lens text the printed number is often followed
  // directly by the question text with no punctuation at all. A line that
  // starts with a number is therefore a strong question boundary when it
  // contains real Arabic text. We still reject obvious non-question numeric
  // lines (pure numbers, page references, dates, etc.).
  const hasArabic = /[\u0600-\u06FF]/u.test(rest);
  const hasEnoughText = rest.replace(/[^\p{L}\p{N}]/gu, '').length >= 3;
  const looksLikeHeading = isImportHeading(rest);

  if (!hasArabic || !hasEnoughText || looksLikeHeading) return null;
  if (!hasPunctuation && !questionLike.test(rest) && /^\d{1,3}\s*$/.test(rest)) return null;

  return { number, text: rest };
}

function normalizeOptionLabel(label) {
  const aliases = {
    "أ":"أ","ا":"أ","إ":"أ",
    "ب":"ب","ج":"ج","د":"د"
  };
  return aliases[String(label || "").trim()] || null;
}

function splitInlineArabicChoices(line) {
  const value = cleanLine(line);
  if (!value) return [];

  const matches = [];
  const re = /(?:^|\s)([أابإبجدد])\s*[.)\-:|]?\s+/gu;
  let match;

  while ((match = re.exec(value)) !== null) {
    matches.push({
      label: normalizeOptionLabel(match[1]),
      start: match.index + match[0].length,
      markerStart: match.index,
    });
  }

  if (matches.length < 2) return [];

  const result = [];
  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const text = value
      .slice(current.start, next ? next.markerStart : value.length)
      .trim();

    if (current.label && text) {
      result.push({ label: current.label, text });
    }
  }

  return result;
}

function parseOptionLine(line) {
  const value = cleanLine(line);

  const inlineChoices = splitInlineArabicChoices(value);
  if (inlineChoices.length) {
    return { inlineChoices };
  }

  let match = value.match(
    /^(?:\(|\[)?([أابإبجدد])(?:\)|\])?\s*[.)\-:|]?\s*(.*)$/u
  );
  if (match) {
    const label = normalizeOptionLabel(match[1]);
    if (label) return { label, text: match[2].trim() };
  }

  if (/^©\s*/u.test(value)) {
    return {
      label: null,
      ocrMarker: "circle",
      text: value.replace(/^©\s*/u, "").trim(),
    };
  }

  match = value.match(/^\)\s*[1-4]\s*\(\s*(.*)$/u);
  if (match) {
    return { label: null, ocrMarker: "numeric", text: match[1].trim() };
  }

  match = value.match(/^\(\s*[1-4]\s*\)\s*(.*)$/u);
  if (match) {
    return { label: null, ocrMarker: "numeric", text: match[1].trim() };
  }

  // Common OCR variants seen in scanned Arabic exams.
  // They are intentionally treated as unlabeled option markers; the parser
  // assigns أ/ب/ج/د in order.
  match = value.match(/^(?:\(\s*\)|\)\s*©\s*\(|QD\)|Q\)|D\))\s*(.*)$/iu);
  if (match) {
    return { label: null, ocrMarker: "ocr", text: match[1].trim() };
  }

  return null;
}

function nextAvailableOptionLabel(options) {
  return OPTION_LABELS.find(
    label => !options.some(item => item.label === label)
  ) || null;
}

function detectVisualType(value) {
  const text = String(value || "").toLowerCase();
  if (/خريطة|map/.test(text)) return "map";
  if (/جدول|table/.test(text)) return "table";
  if (/رسم\s*بياني|chart|graph/.test(text)) return "chart";
  if (/رسم|diagram/.test(text)) return "diagram";
  if (/صورة|image|photo|portrait/.test(text)) return "image";
  return "other";
}

function parseVisualMarker(line, questionNumber) {
  const value = cleanLine(line);
  const match = value.match(
    /^\[(?:صورة|خريطة|جدول|رسم(?:\s*بياني)?|image|map|table|chart|diagram)\]\s*(.*)$/iu
  );
  if (!match) return null;
  return {
    type: detectVisualType(match[0]),
    caption: match[1] || "",
    questionNumber,
    page: null,
    cropped: false,
    crop: { x: null, y: null, width: null, height: null },
  };
}

function parsePageMarker(line) {
  const value = cleanLine(line);
  const match = value.match(/^\[\s*PAGE\s+(\d+)\s*\]$/i);
  return match ? Number(match[1]) : null;
}

function parseBranchStart(line) {
  const value = cleanLine(line);
  const match = value.match(/^(?:\(\s*)?(\d{1,2})(?:\s*\))\s*(.*)$/u);
  if (!match) return null;
  return { number: Number(match[1]), text: match[2].trim() };
}

function makeQuestion({
  number,
  text,
  options = {},
  currentPage = null,
  sectionId = "",
  sectionTitle = "",
} = {}) {
  return {
    questionNumber: number,
    originalQuestionNumber: number,
    questionText: text || "",
    type: "essay",
    choices: [],
    correctAnswer: null,
    modelAnswer: "",
    gradingCriteria: [],
    marks: Number(options.defaultMarks) || 1,
    difficulty: options.difficulty || "medium",
    cognitiveLevel: options.cognitiveLevel || "",
    sectionId: options.sectionId || sectionId || "",
    sectionTitle: options.sectionTitle || sectionTitle || "",
    options: [],
    visualAssets: [],
    sourcePage: currentPage,
  };
}

function splitInlineBranches(line) {
  const value = cleanLine(line);
  const marker = /(?:^|\s)(?:\(\s*)?(\d{1,2})(?:\s*\))\s*/gu;
  const matches = [];
  let match;
  while ((match = marker.exec(value)) !== null) {
    matches.push({ number: Number(match[1]), start: match.index + match[0].length, markerStart: match.index });
  }
  if (matches.length < 2) return [value];

  const parts = matches.map((item, index) => ({
    number: item.number,
    text: value.slice(item.start, matches[index + 1]?.markerStart ?? value.length).trim(),
  })).filter(item => item.text);

  if (parts.length < 2) return [value];
  parts.sort((a, b) => a.number - b.number);
  return parts.map(item => `(${item.number}) ${item.text}`);
}

function parseQuestionsText(rawText, options = {}) {
  const text = normalizeText(rawText);
  if (!text) {
    return { success: false, error: "نص الأسئلة فارغ.", questions: [] };
  }

  const lines = text.split("\n").map(cleanLine).filter(Boolean);
  const questions = [];
  let current = null;
  let currentOption = null;
  let currentPage = null;
  let nextQuestionNumber = 1;

  // When a printed question contains (1), (2), ... branches, the printed
  // question number is the parent and the saved records become 14(1), 14(2),
  // etc. The parent heading/passage is shared by every branch.
  let branchParentNumber = null;
  let branchParentContext = "";
  let inBranches = false;

  const flush = () => {
    if (!current) return;

    const choices = OPTION_LABELS.map(label => {
      const option = current.options.find(item => item.label === label);
      return option ? option.text : "";
    });

    const hasFourChoices = choices.every(Boolean);
    current.questionText = normalizeText(current.questionText);
    current.choices = hasFourChoices ? choices : [];
    current.type = hasFourChoices ? "mcq" : "essay";
    delete current.options;
    questions.push(current);
    current = null;
    currentOption = null;
  };

  const discardParentContainer = () => {
    current = null;
    currentOption = null;
  };

  const createBranch = (branchNumber, branchText) => {
    const branchQuestionNumber = `${branchParentNumber}(${branchNumber})`;
    const shared = normalizeText(branchParentContext);
    const textWithContext = normalizeText(
      `${shared}${branchText ? ` ${branchText}` : ""}`
    );

    current = makeQuestion({
      number: branchQuestionNumber,
      text: textWithContext,
      options,
      currentPage,
    });
    current.originalQuestionNumber = branchQuestionNumber;
    currentOption = null;
  };

  for (const rawLine of lines) {
    const lineParts = splitInlineBranches(rawLine);
    for (const line of lineParts) {
    const pageMarker = parsePageMarker(line);
    if (pageMarker !== null) {
      currentPage = pageMarker;
      if (current) current.sourcePage = currentPage;
      continue;
    }

    if (isImportHeading(line)) continue;

    // A branch marker such as (1), (2), (3), (4) belongs to the most recent
    // printed question. It is NOT a new top-level question.
    const branch = parseBranchStart(line);
    if (
      branch &&
      branch.number >= 1 &&
      branch.number <= 20 &&
      current !== null
    ) {
      if (!inBranches) {
        branchParentContext = current ? current.questionText : "";
        branchParentNumber = current ? current.questionNumber : null;
        if (branchParentNumber !== null) discardParentContainer();
        inBranches = branchParentNumber !== null;
      } else {
        flush();
      }

      if (inBranches) {
        createBranch(branch.number, branch.text);
        continue;
      }
    }

    const start = parseQuestionStart(line);
    if (start) {
      flush();
      branchParentNumber = null;
      branchParentContext = "";
      inBranches = false;

      const inferredNumber =
        Number.isInteger(start.number) && start.number > 0
          ? start.number
          : nextQuestionNumber;

      current = makeQuestion({
        number: inferredNumber,
        text: start.text,
        options,
        currentPage,
      });

      nextQuestionNumber = Math.max(
        nextQuestionNumber,
        inferredNumber + 1
      );
      continue;
    }

    if (!current) continue;

    const visual = parseVisualMarker(line, current.questionNumber);
    if (visual) {
      visual.page = currentPage;
      current.visualAssets.push(visual);
      continue;
    }

    const option = parseOptionLine(line);
    if (option) {
      if (Array.isArray(option.inlineChoices)) {
        for (const inlineChoice of option.inlineChoices) {
          if (!inlineChoice.label || !inlineChoice.text) continue;
          current.options = current.options.filter(
            item => item.label !== inlineChoice.label
          );
          current.options.push({
            label: inlineChoice.label,
            text: inlineChoice.text,
          });
        }
        currentOption =
          option.inlineChoices[option.inlineChoices.length - 1]?.label ||
          currentOption;
        continue;
      }

      const label = option.label || nextAvailableOptionLabel(current.options);
      if (label) {
        current.options = current.options.filter(item => item.label !== label);
        current.options.push({ label, text: option.text });
        currentOption = label;
        continue;
      }
    }

    if (currentOption) {
      const optionObj = current.options.find(item => item.label === currentOption);
      if (optionObj) {
        optionObj.text = normalizeText(`${optionObj.text} ${line}`);
      }
    } else {
      current.questionText = normalizeText(`${current.questionText} ${line}`);
    }
    }
  }

  flush();

  questions.forEach((question, index) => {
    question.importIndex = index + 1;
    // Keep the exact printed identifier, including 14(1), 14(2), etc.
    question.originalQuestionNumber = String(
      question.originalQuestionNumber ?? question.questionNumber ?? index + 1
    ).trim();
  });

  const warnings = [];
  const seenNumbers = new Set();

  for (const question of questions) {
    const number = String(question.originalQuestionNumber || "").trim();
    if (seenNumbers.has(number)) {
      warnings.push(
        `تكرار رقم السؤال ${number} في النص المستخرج؛ تم الحفاظ على ترتيب الاستيراد كما ظهر في الصفحة.`
      );
    }
    seenNumbers.add(number);
  }

  return {
    success: true,
    count: questions.length,
    questions,
    warnings,
  };
}

function attachAnswerKey(questions, answerKeyText) {
  const parsed = parseMcqAnswerKey(answerKeyText || "");
  const mcqNumbers = questions.filter(q => q.type === "mcq").map(q => q.questionNumber);
  const coverage = validateMcqCoverage(parsed, mcqNumbers);
  const updates = buildMcqAnswerUpdates(questions, parsed);

  const result = questions.map(question => {
    const update = updates.find(u => u.questionNumber === question.questionNumber);
    if (update && update.matched && question.type === "mcq") {
      question.correctAnswer = update.update.correctAnswer;
      question.answerKeyMatched = true;
    } else {
      question.answerKeyMatched = false;
    }
    return question;
  });

  return { questions: result, answerKey: parsed, coverage };
}

function attachVisualAssets(questions, visualAssets = []) {
  if (!Array.isArray(visualAssets)) return questions;

  const byQuestion = new Map();
  for (const asset of visualAssets) {
    const number = Number(asset.questionNumber);
    if (!Number.isInteger(number) || number < 1) continue;
    if (!byQuestion.has(number)) byQuestion.set(number, []);
    byQuestion.get(number).push({
      type: asset.type || "image",
      url: String(asset.url || ""),
      fileName: String(asset.fileName || ""),
      page: Number.isInteger(Number(asset.page)) ? Number(asset.page) : null,
      order: Number.isInteger(Number(asset.order)) ? Number(asset.order) : 0,
      caption: String(asset.caption || ""),
      cropped: Boolean(asset.cropped),
      crop: asset.crop || { x: null, y: null, width: null, height: null },
    });
  }

  return questions.map(question => ({
    ...question,
    visualAssets: [
      ...(question.visualAssets || []),
      ...(byQuestion.get(question.questionNumber) || []),
    ],
  }));
}

function buildImportPreview({
  questionsText,
  answerKeyText = "",
  visualAssets = [],
  sourceDocument = null,
  defaults = {},
} = {}) {
  const parsed = parseQuestionsText(questionsText, defaults);
  if (!parsed.success) return parsed;

  let questions = attachVisualAssets(parsed.questions, visualAssets);
  let answerKey = null;
  let coverage = null;

  if (answerKeyText && String(answerKeyText).trim()) {
    const attached = attachAnswerKey(questions, answerKeyText);
    questions = attached.questions;
    answerKey = attached.answerKey;
    coverage = attached.coverage;
  }

  questions = questions.map(question => ({
    ...question,
    source: "file",
    sourceName: sourceDocument?.fileName || "",
    imported: true,
    sourceDocument: sourceDocument || null,
    sourcePage: question.sourcePage || null,
    aiGenerated: false,
    aiReviewed: false,
  }));

  const missingAnswers = questions
    .filter(q => q.type === "mcq" && q.correctAnswer === null)
    .map(q => q.questionNumber);

  const warnings = [
    ...(Array.isArray(parsed.warnings) ? parsed.warnings : []),
  ];

  if (missingAnswers.length) {
    warnings.push(
      `أسئلة MCQ بدون إجابة في نموذج الإجابة: ${missingAnswers.join(", ")}`
    );
  }

  if (coverage?.extra?.length) {
    warnings.push(
      `أرقام موجودة في نموذج الإجابة وغير موجودة في الأسئلة: ${coverage.extra.join(", ")}`
    );
  }

  return {
    success: true,
    previewOnly: true,
    count: questions.length,
    questions,
    answerKey,
    coverage,
    warnings,
    readyForReview: true,
    readyForSave: false,
  };
}

module.exports = {
  parseQuestionsText,
  attachAnswerKey,
  attachVisualAssets,
  buildImportPreview,
  splitInlineArabicChoices,
};
