/**
 * Answer Key Import Utility - FIXED
 * Supports Arabic-Indic digits, Arabic letters, Latin letters,
 * number->letter and letter->number OCR order.
 */
"use strict";

const ARABIC_DIGITS = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

const ANSWER_INDEX = { "أ": 0, "ا": 0, "إ": 0, "آ": 0, "ٱ": 0, "ب": 1, "ج": 2, "د": 3 };
const LABELS = ["أ", "ب", "ج", "د"];

function normalizeArabicDigits(value) {
  return String(value || "").replace(/[٠-٩۰-۹]/g, d => ARABIC_DIGITS[d] || d);
}

function normalizeArabicText(value) {
  return String(value || "")
    .replace(/\u0640/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/[|،؛]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAnswerLetter(value) {
  const text = normalizeArabicText(value);
  if (text === "ا") return "أ";
  if (text === "ب") return "ب";
  if (text === "ج") return "ج";
  if (text === "د") return "د";

  const upper = text.toUpperCase();
  if (upper === "A") return "أ";
  if (upper === "B") return "ب";
  if (upper === "C") return "ج";
  if (upper === "D") return "د";
  return null;
}

function parseMcqAnswerKey(text) {
  const normalized = normalizeArabicDigits(text)
    .replace(/\r\n?/g, "\n")
    .replace(/[‐‑‒–—]/g, "-");

  const answers = {};
  const duplicates = [];
  const invalid = [];

  const setAnswer = (questionNumber, rawLetter, raw) => {
    const number = Number(questionNumber);
    const letter = normalizeAnswerLetter(rawLetter);
    if (!Number.isInteger(number) || number < 1 || number > 10000) return;
    if (letter === null) {
      invalid.push({ questionNumber: number, raw: raw || `${questionNumber} ${rawLetter}` });
      return;
    }
    const answer = ANSWER_INDEX[letter];
    if (answers[number] !== undefined) {
      duplicates.push({ questionNumber: number, previous: answers[number], current: answer, raw: raw || "" });
      return;
    }
    answers[number] = answer;
  };

  const numberFirst = /(?:السؤال\s*|س\s*)?([0-9]+)\s*(?:[-:.)\/\s]+)(أ|ا|إ|آ|ٱ|ب|ج|د|A|B|C|D)(?=\s|$|[-:.,؛،)])/giu;
  let match;
  while ((match = numberFirst.exec(normalized))) {
    setAnswer(match[1], match[2], match[0]);
  }

  const letterFirst = /(?:^|[\s\n(\[|])(أ|ا|إ|آ|ٱ|ب|ج|د|A|B|C|D)\s*[-:.)،؛,]?\s*([0-9]+)(?=\s|$|[-:.)،؛,])/giu;
  while ((match = letterFirst.exec(normalized))) {
    setAnswer(match[2], match[1], match[0]);
  }

  const equality1 = /([0-9]+)\s*=\s*(أ|ا|إ|آ|ٱ|ب|ج|د|A|B|C|D)/giu;
  while ((match = equality1.exec(normalized))) setAnswer(match[1], match[2], match[0]);
  const equality2 = /(أ|ا|إ|آ|ٱ|ب|ج|د|A|B|C|D)\s*=\s*([0-9]+)/giu;
  while ((match = equality2.exec(normalized))) setAnswer(match[2], match[1], match[0]);

  const entries = Object.keys(answers).map(Number).sort((a, b) => a - b);
  return {
    success: true,
    answers,
    entries: entries.map(questionNumber => ({
      questionNumber,
      correctAnswer: answers[questionNumber],
      label: LABELS[answers[questionNumber]],
    })),
    count: entries.length,
    duplicates,
    invalid,
  };
}

function validateMcqCoverage(answerKey, questionNumbers) {
  const answers = answerKey?.answers || {};
  const requested = Array.isArray(questionNumbers)
    ? [...new Set(questionNumbers.map(Number).filter(n => Number.isInteger(n) && n >= 1))].sort((a, b) => a - b)
    : [];
  const missing = requested.filter(n => answers[n] === undefined);
  const extra = Object.keys(answers).map(Number).filter(n => !requested.includes(n)).sort((a, b) => a - b);
  return { success: missing.length === 0, requested, missing, extra, covered: requested.length - missing.length, totalRequested: requested.length };
}

function buildMcqAnswerUpdates(questions, answerKey) {
  const answers = answerKey?.answers || {};
  if (!Array.isArray(questions)) return [];
  return questions.map((question, index) => {
    const questionNumber = Number(question.questionNumber) || index + 1;
    if (answers[questionNumber] === undefined) return { questionNumber, matched: false, update: {} };
    return { questionNumber, matched: true, update: { correctAnswer: answers[questionNumber] } };
  });
}

module.exports = {
  normalizeArabicDigits,
  normalizeArabicText,
  normalizeAnswerLetter,
  parseMcqAnswerKey,
  validateMcqCoverage,
  buildMcqAnswerUpdates,
};
