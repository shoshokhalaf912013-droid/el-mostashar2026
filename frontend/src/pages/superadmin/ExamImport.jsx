import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

const LETTERS = ["أ", "ب", "ج", "د"];
const SYSTEM_FALLBACK_TITLES = {
  general: "الثانوية العامة",
  bac: "البكالوريا المصرية",
};

const getGradeSystemId = (grade) =>
  String(
    grade?.systemId ||
      grade?.system ||
      grade?.educationSystemId ||
      grade?.educationSystem ||
      ""
  ).trim();

const getGradeSystemTitle = (grade) =>
  String(
    grade?.systemNameAr ||
      grade?.systemTitleAr ||
      grade?.systemName ||
      grade?.systemTitle ||
      grade?.systemLabel ||
      ""
  ).trim();

const getSystemDisplayTitle = (systemId, grades) => {
  const found = grades.find(
    (grade) => getGradeSystemId(grade) === systemId && getGradeSystemTitle(grade)
  );
  if (found) return getGradeSystemTitle(found);
  return SYSTEM_FALLBACK_TITLES[systemId] || systemId;
};
const BAC_GRADES = ["bac1", "bac2", "bac3"];

const normalizeSubjectValue = (value) =>
  String(value || "").trim().toLowerCase();

const isHistorySubjectItem = (item) => {
  const id = normalizeSubjectValue(item?.id);
  const key = normalizeSubjectValue(item?.subjectKey);
  const subjectId = normalizeSubjectValue(item?.subjectId);
  const title = normalizeSubjectValue(getTitle(item));

  return (
    id === "history" ||
    id === "national-history" ||
    key === "history" ||
    key === "national-history" ||
    subjectId === "history" ||
    subjectId === "national-history" ||
    title === "التاريخ" ||
    title === "التاريخ الوطني" ||
    title === "التاريخ الوطنى" ||
    title.includes("التاريخ")
  );
};

const isGeographySubjectItem = (item) => {
  const id = normalizeSubjectValue(item?.id);
  const key = normalizeSubjectValue(item?.subjectKey);
  const subjectId = normalizeSubjectValue(item?.subjectId);
  const title = normalizeSubjectValue(getTitle(item));

  return (
    id === "geography" ||
    key === "geography" ||
    subjectId === "geography" ||
    title === "الجغرافيا" ||
    title.includes("الجغرافيا")
  );
};

const isMathSubjectItem = (item) => {
  const id = normalizeSubjectValue(item?.id);
  const key = normalizeSubjectValue(item?.subjectKey);
  const subjectId = normalizeSubjectValue(item?.subjectId);
  const title = normalizeSubjectValue(getTitle(item));

  return (
    id === "math" ||
    id === "mathematics" ||
    key === "math" ||
    key === "mathematics" ||
    subjectId === "math" ||
    subjectId === "mathematics" ||
    title === "الرياضيات" ||
    title.includes("رياضيات")
  );
};

const isNationalHistorySubjectItem = (item) => {
  const id = normalizeSubjectValue(item?.id);
  const key = normalizeSubjectValue(item?.subjectKey);
  const subjectId = normalizeSubjectValue(item?.subjectId);
  const title = normalizeSubjectValue(getTitle(item));

  return (
    id === "national history" ||
    id === "national-history" ||
    key === "national history" ||
    key === "national-history" ||
    subjectId === "national history" ||
    subjectId === "national-history" ||
    title === "التاريخ الوطني" ||
    title === "التاريخ الوطنى"
  );
};

const isEconomySubjectItem = (item) => {
  const id = normalizeSubjectValue(item?.id);
  const key = normalizeSubjectValue(item?.subjectKey);
  const subjectId = normalizeSubjectValue(item?.subjectId);
  const title = normalizeSubjectValue(getTitle(item));

  return (
    id === "economy" ||
    id === "economics" ||
    key === "economy" ||
    key === "economics" ||
    subjectId === "economy" ||
    subjectId === "economics" ||
    title === "الاقتصاد" ||
    title.includes("الاقتصاد")
  );
};

const DRAFT_KEY = "el-mostashar_question_import_draft_v3";

const SOURCE_OPTIONS = [
  "كتاب الامتحان",
  "كتاب المصدر",
  "كتاب الأضواء",
  "مذكرة المستشار",
  "التقييمات الوزارية",
  "كتب أخرى",
];

function makeManualSectionId(title) {
  const value = cleanText(title);
  return value ? `manual_${value}` : "";
}


function cleanText(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function getTitle(item, fallback = "") {
  return String(
    item?.title ||
      item?.nameAr ||
      item?.name ||
      item?.subject ||
      item?.label ||
      fallback
  ).trim();
}

function getExplicitChoices(q) {
  const source = Array.isArray(q?.choices)
    ? q.choices
    : Array.isArray(q?.options)
      ? q.options
      : [];

  const choices = source
    .slice(0, 4)
    .map((value) =>
      typeof value === "object"
        ? cleanText(value.text || value.label || value.value || "")
        : cleanText(value)
    );

  return choices.length === 4 && choices.every(Boolean) ? choices : null;
}

function splitInlineArabicChoices(text) {
  const source = cleanText(text);
  if (!source) return null;

  const marker = /(?:^|[\s؛،|])(?:\(?\s*)(أ|ا|ب|ج|د)(?:\s*\)?\s*)(?:[.\-:：]|\))(?=\s*)/g;
  const matches = [];
  let match;

  while ((match = marker.exec(source))) {
    const letter = match[1] === "ا" ? "أ" : match[1];
    if (!matches.some((item) => item.letter === letter)) {
      matches.push({ letter, index: match.index, end: marker.lastIndex });
    }
  }

  if (matches.length < 4) return null;

  const selected = LETTERS.map((letter) =>
    matches.find((item) => item.letter === letter)
  );

  if (selected.some((item) => !item)) return null;

  const questionText = cleanText(source.slice(0, selected[0].index));
  const choices = selected.map((item, index) => {
    const next = selected[index + 1];
    return cleanText(
      source.slice(item.end, next ? next.index : source.length)
    )
      .replace(/^[|؛،]+|[|؛،]+$/g, "")
      .trim();
  });

  if (!questionText || choices.some((choice) => !choice)) return null;
  return { questionText, choices };
}

function normalizeImportedQuestions(payload) {
  const candidates =
    payload?.questions ||
    payload?.preview?.questions ||
    payload?.items ||
    payload?.preview?.items ||
    [];

  if (!Array.isArray(candidates)) return [];

  return candidates.map((q, index) => {
    const rawQuestionText = cleanText(
      q.questionText || q.question || q.text || ""
    );
    const explicitChoices = getExplicitChoices(q);
    const inline = explicitChoices
      ? null
      : splitInlineArabicChoices(rawQuestionText);
    const choices = explicitChoices || inline?.choices || [];
    const explicitType = String(
      q.type || q.questionType || ""
    ).toLowerCase();
    const isEssay = [
      "essay",
      "subjective",
      "written",
      "مقالي",
    ].includes(explicitType);
    const isMcq = !isEssay && choices.length === 4;

    return {
      originalQuestionNumber: String(
        q.questionNumber ?? q.number ?? q.index ?? index + 1
      ).trim(),
      questionText: inline?.questionText || rawQuestionText,
      choices: isMcq ? choices : ["", "", "", ""],
      type: isMcq ? "mcq" : "essay",
      correctAnswer:
        isMcq && Number.isInteger(Number(q.correctAnswer)) && Number(q.correctAnswer) >= 0 && Number(q.correctAnswer) <= 3
          ? Number(q.correctAnswer)
          : null,
      essayAnswers:
        isMcq ? [] : (Array.isArray(q.essayAnswers) && q.essayAnswers.length ? q.essayAnswers : [cleanText(q.modelAnswer || "")]),
      visualAssets: Array.isArray(q.visualAssets)
        ? q.visualAssets
        : [],
      sourcePage: q.sourcePage ?? null,
    };
  });
}

const WORD_MAIN_NS =
  "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function readUint16LE(view, offset) {
  return view.getUint16(offset, true);
}

function readUint32LE(view, offset) {
  return view.getUint32(offset, true);
}

function findZipEndOfCentralDirectory(view) {
  const minimumSize = 22;
  const maximumComment = 0xffff;
  const start = Math.max(
    0,
    view.byteLength - minimumSize - maximumComment
  );

  for (let offset = view.byteLength - minimumSize; offset >= start; offset -= 1) {
    if (readUint32LE(view, offset) === 0x06054b50) {
      return offset;
    }
  }

  return -1;
}

function wordXmlNodeToText(node) {
  let output = "";

  for (const child of Array.from(node.childNodes || [])) {
    if (child.nodeType === 3) {
      output += child.nodeValue || "";
      continue;
    }

    const localName = child.localName || child.nodeName?.split(":").pop();

    if (localName === "t") {
      output += child.textContent || "";
    } else if (localName === "tab") {
      output += "\t";
    } else if (localName === "br" || localName === "cr") {
      output += "\n";
    } else {
      output += wordXmlNodeToText(child);
    }
  }

  return output;
}

async function readDocxText(file) {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const eocdOffset = findZipEndOfCentralDirectory(view);

  if (eocdOffset < 0) {
    throw new Error(
      "تعذر قراءة ملف DOCX: الملف ليس مستند Word صالحًا أو تالف."
    );
  }

  const entryCount = readUint16LE(view, eocdOffset + 10);
  const centralDirectoryOffset = readUint32LE(view, eocdOffset + 16);
  const decoder = new TextDecoder("utf-8");

  let cursor = centralDirectoryOffset;
  let target = null;

  for (let index = 0; index < entryCount; index += 1) {
    if (readUint32LE(view, cursor) !== 0x02014b50) {
      break;
    }

    const compressionMethod = readUint16LE(view, cursor + 10);
    const compressedSize = readUint32LE(view, cursor + 20);
    const uncompressedSize = readUint32LE(view, cursor + 24);
    const fileNameLength = readUint16LE(view, cursor + 28);
    const extraLength = readUint16LE(view, cursor + 30);
    const commentLength = readUint16LE(view, cursor + 32);
    const localHeaderOffset = readUint32LE(view, cursor + 42);
    const fileName = decoder.decode(
      new Uint8Array(buffer, cursor + 46, fileNameLength)
    );

    if (fileName === "word/document.xml") {
      target = {
        compressionMethod,
        compressedSize,
        uncompressedSize,
        localHeaderOffset,
      };
      break;
    }

    cursor += 46 + fileNameLength + extraLength + commentLength;
  }

  if (!target) {
    throw new Error(
      "تعذر العثور على نص المستند داخل ملف DOCX."
    );
  }

  const localOffset = target.localHeaderOffset;
  if (readUint32LE(view, localOffset) !== 0x04034b50) {
    throw new Error("ملف DOCX غير صالح أو تالف.");
  }

  const localFileNameLength = readUint16LE(view, localOffset + 26);
  const localExtraLength = readUint16LE(view, localOffset + 28);
  const dataStart =
    localOffset + 30 + localFileNameLength + localExtraLength;

  const compressedBytes = new Uint8Array(
    buffer,
    dataStart,
    target.compressedSize
  );

  let documentBytes;

  if (target.compressionMethod === 0) {
    documentBytes = compressedBytes;
  } else if (target.compressionMethod === 8) {
    if (typeof DecompressionStream !== "function") {
      throw new Error(
        "المتصفح الحالي لا يدعم قراءة DOCX مباشرة. استخدم Chrome أو Edge محدثًا."
      );
    }

    const decompressedStream = new Blob([compressedBytes])
      .stream()
      .pipeThrough(new DecompressionStream("deflate-raw"));

    documentBytes = new Uint8Array(
      await new Response(decompressedStream).arrayBuffer()
    );
  } else {
    throw new Error(
      `طريقة ضغط DOCX غير مدعومة حاليًا: ${target.compressionMethod}.`
    );
  }

  if (
    target.uncompressedSize > 0 &&
    documentBytes.byteLength !== target.uncompressedSize
  ) {
    // لا نفشل القراءة بسبب اختلاف معلومة الحجم في بعض ملفات Word.
  }

  const xml = decoder.decode(documentBytes);
  const xmlDocument = new DOMParser().parseFromString(
    xml,
    "application/xml"
  );

  if (xmlDocument.getElementsByTagName("parsererror").length > 0) {
    throw new Error("تعذر تحليل بنية ملف Word.");
  }

  const paragraphs = Array.from(
    xmlDocument.getElementsByTagNameNS(WORD_MAIN_NS, "p")
  );

  const text = paragraphs
    .map((paragraph) => wordXmlNodeToText(paragraph).replace(/\r/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) {
    throw new Error(
      "تم فتح ملف Word لكن لم يتم العثور على نص قابل للاستخراج."
    );
  }

  return text;
}

function makeQuestionId() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeQuestion(question, index) {
  return {
    id: question.id || makeQuestionId(),
    number: index + 1,
    originalQuestionNumber:
      question.originalQuestionNumber ?? question.number ?? index + 1,
    questionText: cleanText(question.questionText),
    choices:
      question.type === "mcq"
        ? [0, 1, 2, 3].map((i) => cleanText(question.choices?.[i]))
        : ["", "", "", ""],
    type: question.type === "mcq" ? "mcq" : "essay",
    visualAssets: Array.isArray(question.visualAssets)
      ? question.visualAssets
      : [],
    sourcePage: question.sourcePage ?? null,
    sourceFileName: question.sourceFileName || "",
    sourceName: question.sourceName || "",
    sectionId: question.sectionId || "",
    sectionTitle: question.sectionTitle || "",
    correctAnswer: Number.isInteger(question.correctAnswer) ? question.correctAnswer : null,
    essayAnswers:
      question.type === "essay"
        ? Array.isArray(question.essayAnswers) && question.essayAnswers.length
          ? question.essayAnswers.map((answer) => cleanText(answer))
          : [cleanText(question.modelAnswer || "")]
        : [],
  };
}

function getMediaUrl(fileUrl) {
  if (!fileUrl) return "";
  try {
    const base = api?.defaults?.baseURL || window.location.origin;
    return new URL(fileUrl, base).href;
  } catch {
    return fileUrl;
  }
}

async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);

  const response = await api.post("/api/upload", form, {
    timeout: 0,
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!response.data?.success || !response.data?.fileUrl) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "فشل رفع الصورة."
    );
  }

  return {
    ...response.data,
    absoluteUrl: getMediaUrl(response.data.fileUrl),
  };
}

function normalizeSections(lesson) {
  if (!lesson) return [];

  const sources = [
    lesson.sections,
    lesson.parts,
    lesson.subsections,
    lesson.sectionList,
    lesson.sectionsData,
    lesson.children,
  ];

  let raw = sources.find((value) => Array.isArray(value));

  if (!raw && lesson.sections && typeof lesson.sections === "object") {
    raw = Object.entries(lesson.sections).map(([id, value]) => ({
      ...(value || {}),
      id,
    }));
  }

  if (!Array.isArray(raw)) {
    if (lesson.sectionId || lesson.partId) {
      return [
        {
          id: String(lesson.sectionId || lesson.partId),
          title: getTitle(lesson, lesson.sectionTitle || lesson.partTitle || "قسم"),
        },
      ];
    }
    return [];
  }

  return raw
    .map((item, index) => ({
      id: String(
        item?.id ||
          item?.sectionId ||
          item?.partId ||
          item?.key ||
          `${index + 1}`
      ),
      title: String(
        item?.title ||
          item?.nameAr ||
          item?.name ||
          item?.sectionTitle ||
          item?.partTitle ||
          item?.label ||
          `القسم ${index + 1}`
      ).trim(),
    }))
    .filter((item) => item.title);
}

export default function ExamImport() {
  const [questions, setQuestions] = useState([]);

  const [systemId, setSystemId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");

  const [grades, setGrades] = useState([]);
  const systems = useMemo(() => {
    const ids = [
      ...new Set(
        grades
          .map((grade) =>
            getGradeSystemId(grade) ||
            (BAC_GRADES.includes(grade.id) ? "bac" : "general")
          )
          .filter(Boolean)
      ),
    ];
    return ids.map((id) => ({
      id,
      title: getSystemDisplayTitle(id, grades),
    }));
  }, [grades]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const [sourcePageImage, setSourcePageImage] = useState(null);
  const [sourcePageFile, setSourcePageFile] = useState(null);
  const [sourcePageName, setSourcePageName] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [customSourceName, setCustomSourceName] = useState("");
  const [pageText, setPageText] = useState("");
  const [documentInputMode, setDocumentInputMode] = useState("text");
  const [documentFileName, setDocumentFileName] = useState("");
  const [singleQuestionText, setSingleQuestionText] = useState("");
  const [singleQuestionImage, setSingleQuestionImage] = useState(null);
  const [singleQuestionImageAsset, setSingleQuestionImageAsset] = useState(null);
  const [singleQuestionImagePreview, setSingleQuestionImagePreview] = useState("");
  const [mode, setMode] = useState("page");

  const [numberFrom, setNumberFrom] = useState("");
  const [numberTo, setNumberTo] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === lessonId),
    [lessons, lessonId]
  );

  const sections = useMemo(
    () => normalizeSections(selectedLesson),
    [selectedLesson]
  );

  const effectiveSourceName = useMemo(
    () => sourceName === "كتب أخرى" ? cleanText(customSourceName) : cleanText(sourceName),
    [sourceName, customSourceName]
  );
  const effectiveSectionId = sectionId || makeManualSectionId(sectionTitle);

  const mcqCount = useMemo(
    () => questions.filter((q) => q.type === "mcq").length,
    [questions]
  );

  const essayCount = useMemo(
    () => questions.filter((q) => q.type === "essay").length,
    [questions]
  );

  const importedSections = useMemo(() => {
    const map = new Map();
    questions.forEach((q) => {
      const title = cleanText(q.sectionTitle || sectionTitle);
      if (!title) return;
      if (!map.has(title)) map.set(title, { title, count: 0 });
      map.get(title).count += 1;
    });
    return Array.from(map.values());
  }, [questions, sectionTitle]);

  const renumber = (list) =>
    list.map((q, index) => ({ ...q, number: index + 1 }));

  const selectedSystemTitle = getSystemDisplayTitle(systemId, grades);

  useEffect(() => {
    let cancelled = false;

    const loadGrades = async () => {
      setLoadingGrades(true);
      try {
        const snap = await getDocs(
          query(
            collection(db, "grades"),
            where("stageId", "==", "secondary"),
            where("active", "==", true)
          )
        );

        if (cancelled) return;

        const data = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((grade) => getGradeSystemId(grade) || ["sec1", "sec2", "sec3", "bac1", "bac2", "bac3"].includes(grade.id))
          .sort(
            (a, b) => Number(a.order || 0) - Number(b.order || 0)
          );

        setGrades(data);
      } catch (err) {
        console.error("Load grades error:", err);
        if (!cancelled) setGrades([]);
      } finally {
        if (!cancelled) setLoadingGrades(false);
      }
    };

    loadGrades();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleGrades = useMemo(() => {
    if (!systemId) return [];
    return grades.filter((grade) => {
      const gradeSystem =
        getGradeSystemId(grade) ||
        (BAC_GRADES.includes(grade.id) ? "bac" : "general");
      return gradeSystem === systemId;
    });
  }, [grades, systemId]);

  useEffect(() => {
    if (!systemId || !gradeId) {
      setSubjects([]);
      setSubjectId("");
      setUnits([]);
      setLessons([]);
      setUnitId("");
      setLessonId("");
      setSectionId("");
      setSectionTitle("");
      return undefined;
    }

    let cancelled = false;

    const loadSubjects = async () => {
      setLoadingSubjects(true);

      try {
        const currentGradeId = String(gradeId).trim();
        let data = [];

        /*
         * نفس مصدر المواد المستخدم فعليًا في ExamBuilder بالمنصة.
         * لا ننشئ مادة أو مسارًا جديدًا.
         */
        if (currentGradeId === "bac1") {
          /*
           * البكالوريا الأولى في المنصة تستخدم تاريخ sec1 الموروث.
           * نقرأ نفس سجل المادة من gradeSubjects.
           */
          const snap = await getDocs(
            query(
              collection(db, "gradeSubjects"),
              where("stageId", "==", "secondary"),
              where("gradeId", "==", "sec1"),
              where("active", "==", true)
            )
          );

          data = snap.docs
            .map((doc) => {
              const raw = doc.data() || {};
              return {
                ...raw,
                id: raw.subjectId || doc.id,
                docId: doc.id,
              };
            })
            .filter(isHistorySubjectItem);
        } else if (currentGradeId === "bac2") {
          const snap = await getDocs(
            query(
              collection(db, "gradeSubjects"),
              where("gradeId", "==", currentGradeId),
              where("active", "==", true),
              orderBy("order", "asc")
            )
          );

          data = snap.docs
            .map((doc) => {
              const raw = doc.data() || {};
              return {
                ...raw,
                id: raw.subjectId || doc.id,
                docId: doc.id,
              };
            })
            .filter(isNationalHistorySubjectItem);
        } else if (currentGradeId === "bac3") {
          const snap = await getDocs(
            query(
              collection(db, "trackSubjects"),
              where("gradeId", "==", currentGradeId),
              where("active", "==", true),
              orderBy("order", "asc")
            )
          );

          data = snap.docs
            .map((doc) => {
              const raw = doc.data() || {};
              return {
                ...raw,
                id: raw.subjectId || doc.id,
                docId: doc.id,
              };
            })
            .filter(
              (item) =>
                isEconomySubjectItem(item) ||
                isGeographySubjectItem(item)
            );
        } else {
          const snap = await getDocs(
            query(
              collection(db, "gradeSubjects"),
              where("active", "==", true),
              where("stageId", "==", "secondary"),
              where("gradeId", "==", currentGradeId)
            )
          );

          data = snap.docs
            .map((doc) => {
              const raw = doc.data() || {};
              return {
                id: raw.subjectId || doc.id,
                docId: doc.id,
                ...raw,
              };
            })
            .filter((item) => {
              if (currentGradeId === "sec1") {
                return (
                  isHistorySubjectItem(item) &&
                  !isMathSubjectItem(item)
                );
              }

              if (currentGradeId === "sec2" || currentGradeId === "sec3") {
                return (
                  (isHistorySubjectItem(item) ||
                    isGeographySubjectItem(item)) &&
                  !isMathSubjectItem(item)
                );
              }

              return false;
            });
        }

        if (cancelled) return;

        data.sort(
          (a, b) =>
            Number(a?.order ?? 999999) -
              Number(b?.order ?? 999999) ||
            getTitle(a).localeCompare(getTitle(b), "ar")
        );

        console.log("ExamImport subjects loaded from platform logic:", {
          gradeId: currentGradeId,
          count: data.length,
          subjects: data,
        });

        setSubjects(data);
        setSubjectId((current) =>
          current && data.some((item) => item.id === current)
            ? current
            : ""
        );
      } catch (err) {
        console.error("Load platform subjects error:", err);
        if (!cancelled) {
          setSubjects([]);
          setSubjectId("");
        }
      } finally {
        if (!cancelled) setLoadingSubjects(false);
      }
    };

    loadSubjects();

    return () => {
      cancelled = true;
    };
  }, [systemId, gradeId]);

  const selectedSubjectItem = useMemo(
    () => subjects.find((item) => item.id === subjectId),
    [subjects, subjectId]
  );

  const isBacFirstHistory =
    systemId === "bac" &&
    gradeId === "bac1" &&
    isHistorySubjectItem(selectedSubjectItem);

  const curriculumGradeId = isBacFirstHistory ? "sec1" : gradeId;

  useEffect(() => {
    if (!systemId || !gradeId || !subjectId) {
      setUnits([]);
      setUnitId("");
      setLessons([]);
      setLessonId("");
      setSectionId("");
      setSectionTitle("");
      return undefined;
    }

    let cancelled = false;

    const loadUnits = async () => {
      setLoadingUnits(true);

      try {
        const candidateSystemIds = isBacFirstHistory
          ? ["general", "secondary", "bac"]
          : [systemId];

        let snap = null;

        for (const currentSystemId of candidateSystemIds) {
          const currentSnap = await getDocs(
            query(
              collection(db, "units"),
              where("systemId", "==", currentSystemId),
              where("gradeId", "==", curriculumGradeId),
              where("subjectId", "==", subjectId),
              where("active", "==", true)
            )
          );

          if (!currentSnap.empty) {
            snap = currentSnap;
            break;
          }
        }

        if (!snap || snap.empty) {
          snap = await getDocs(
            query(
              collection(db, "units"),
              where("gradeId", "==", curriculumGradeId),
              where("subjectId", "==", subjectId)
            )
          );
        }

        if (cancelled) return;

        const data = snap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort(
            (a, b) =>
              Number(a.order ?? 999999) -
              Number(b.order ?? 999999)
          );

        console.log("ExamImport REAL units loaded:", {
          systemId,
          gradeId,
          curriculumGradeId,
          subjectId,
          count: data.length,
          units: data,
        });

        setUnits(data);
      } catch (err) {
        console.error("Load real units error:", err);
        if (!cancelled) setUnits([]);
      } finally {
        if (!cancelled) setLoadingUnits(false);
      }
    };

    loadUnits();

    return () => {
      cancelled = true;
    };
  }, [
    systemId,
    gradeId,
    subjectId,
    curriculumGradeId,
    isBacFirstHistory,
  ]);

  useEffect(() => {
    if (!unitId) {
      setLessons([]);
      setLessonId("");
      return undefined;
    }

    let cancelled = false;

    const loadLessons = async () => {
      setLoadingLessons(true);

      try {
        const selectedUnit = units.find((unit) => unit.id === unitId);

        const unitReferences = [
          unitId,
          selectedUnit?.id,
          selectedUnit?.unitId,
          selectedUnit?.publicUnitId,
          selectedUnit?.unitKey,
          selectedUnit?.slug,
          selectedUnit?.code,
        ]
          .filter(
            (value) =>
              value !== undefined &&
              value !== null &&
              String(value).trim() !== ""
          )
          .flatMap((value) => {
            const variants = [String(value)];

            if (typeof value === "number") {
              variants.push(value);
            } else if (/^-?\d+(\.\d+)?$/.test(String(value))) {
              variants.push(Number(value));
            }

            return variants;
          });

        const uniqueUnitReferences = [
          ...new Map(
            unitReferences.map((value) => [String(value), value])
          ).values(),
        ];

        let data = [];

        // 1) الربط المباشر الحقيقي: grade + subject + unit.
        try {
          const exactSnap = await getDocs(
            query(
              collection(db, "lessons"),
              where("gradeId", "==", curriculumGradeId),
              where("subjectId", "==", subjectId),
              where("unitId", "==", unitId)
            )
          );

          data = exactSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error) {
          console.warn("Lessons exact lookup failed:", error);
        }

        // 2) لو lesson.unitId يستخدم معرفًا آخر للوحدة.
        if (!data.length) {
          const referenceResults = await Promise.all(
            uniqueUnitReferences.map(async (unitReference) => {
              try {
                const snap = await getDocs(
                  query(
                    collection(db, "lessons"),
                    where("unitId", "==", unitReference)
                  )
                );

                return snap.docs
                  .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                  }))
                  .filter((lesson) => {
                    const lessonGrade =
                      lesson.gradeId ??
                      lesson.grade ??
                      lesson.gradeKey;

                    const lessonSubject =
                      lesson.subjectId ??
                      lesson.subject ??
                      lesson.subjectKey;

                    const gradeMatches =
                      lessonGrade == null ||
                      String(lessonGrade) ===
                        String(curriculumGradeId);

                    const subjectMatches =
                      lessonSubject == null ||
                      String(lessonSubject) ===
                        String(subjectId);

                    return gradeMatches && subjectMatches;
                  });
              } catch (error) {
                console.warn(
                  "Lessons unit reference lookup failed:",
                  unitReference,
                  error
                );
                return [];
              }
            })
          );

          data = referenceResults.flat();
        }

        // 3) آخر fallback: قراءة lessons الموجودة فعليًا وربطها
        // بكل معرفات الوحدة الفعلية.
        if (!data.length) {
          const allLessonsSnap = await getDocs(
            collection(db, "lessons")
          );

          const lessonsData = allLessonsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          data = lessonsData.filter((lesson) => {
            const lessonUnitReferences = [
              lesson.unitId,
              lesson.unitDocId,
              lesson.publicUnitId,
              lesson.unitKey,
              lesson.unitNumber,
              lesson.number,
              lesson.code,
            ]
              .filter(
                (value) =>
                  value !== undefined &&
                  value !== null &&
                  String(value).trim() !== ""
              )
              .map((value) => String(value));

            const referenceStrings = uniqueUnitReferences.map(
              (value) => String(value)
            );

            if (
              !lessonUnitReferences.some((value) =>
                referenceStrings.includes(value)
              )
            ) {
              return false;
            }

            const gradeMatches =
              !lesson.gradeId ||
              String(lesson.gradeId) ===
                String(curriculumGradeId);

            const subjectMatches =
              !lesson.subjectId ||
              String(lesson.subjectId) ===
                String(subjectId);

            return gradeMatches && subjectMatches;
          });
        }

        if (cancelled) return;

        const uniqueData = data
          .filter(
            (lesson, index, array) =>
              array.findIndex(
                (item) => item.id === lesson.id
              ) === index
          )
          .sort(
            (a, b) =>
              Number(a.order ?? 999999) -
              Number(b.order ?? 999999)
          );

        console.log("ExamImport REAL lessons loaded:", {
          curriculumGradeId,
          subjectId,
          unitId,
          count: uniqueData.length,
          lessons: uniqueData,
        });

        setLessons(uniqueData);
      } catch (err) {
        console.error("Load real lessons error:", err);
        if (!cancelled) setLessons([]);
      } finally {
        if (!cancelled) setLoadingLessons(false);
      }
    };

    loadLessons();

    return () => {
      cancelled = true;
    };
  }, [
    unitId,
    units,
    curriculumGradeId,
    subjectId,
  ]);

  useEffect(() => {
    setSectionId("");
    setSectionTitle("");
  }, [lessonId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (Array.isArray(draft.questions)) {
          setQuestions(draft.questions.map(normalizeQuestion));
        }
        setSystemId(draft.systemId || "");
        setGradeId(draft.gradeId || "");
        setSubjectId(draft.subjectId || "");
        setUnitId(draft.unitId || "");
        setLessonId(draft.lessonId || "");
        setSectionId(draft.sectionId || "");
        setSectionTitle(draft.sectionTitle || "");
        setSourceName(draft.sourceName || "");
        setCustomSourceName(draft.customSourceName || "");
        setDocumentFileName(draft.documentFileName || "");
        if (draft.sourcePageImage) setSourcePageImage(draft.sourcePageImage);
        if (draft.sourcePageName) setSourcePageName(draft.sourcePageName);
        if (typeof draft.pageText === "string") setPageText(draft.pageText);
        if (typeof draft.singleQuestionText === "string") {
          setSingleQuestionText(draft.singleQuestionText);
        }
        if (draft.singleQuestionImageAsset) {
          setSingleQuestionImageAsset(draft.singleQuestionImageAsset);
        }
        if (draft.numberFrom != null) setNumberFrom(String(draft.numberFrom));
        if (draft.numberTo != null) setNumberTo(String(draft.numberTo));
        if (draft.questions?.length) {
          setNotice(
            `تم استعادة المسودة السابقة: ${draft.questions.length} سؤال. راجع الربط قبل الحفظ النهائي.`
          );
        }
      }
    } catch (err) {
      console.error("Draft restore error:", err);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (singleQuestionImagePreview) {
        URL.revokeObjectURL(singleQuestionImagePreview);
      }
    };
  }, [singleQuestionImagePreview]);

  // حفظ تلقائي مستمر للمسودة. الصور نفسها لا تُخزن كـ File داخل localStorage؛
  // الصور المرفوعة تُحفظ كرابط فعلي داخل visualAssets، ولذلك تبقى مرتبطة بالسؤال بعد Refresh.
  useEffect(() => {
    if (!draftLoaded) return;

    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          version: 4,
          savedAt: new Date().toISOString(),
          systemId,
          gradeId,
          subjectId,
          unitId,
          lessonId,
          sectionId,
          sectionTitle,
          sourceName,
          customSourceName,
          documentFileName,
          sourcePageName,
          sourcePageImage,
          pageText,
          singleQuestionText,
          singleQuestionImageAsset,
          numberFrom,
          numberTo,
          questions,
        })
      );
    } catch (err) {
      console.error("Auto draft save error:", err);
    }
  }, [
    draftLoaded,
    systemId,
    gradeId,
    subjectId,
    unitId,
    lessonId,
    sectionId,
    sectionTitle,
    sourceName,
    customSourceName,
    documentFileName,
    sourcePageName,
    sourcePageImage,
    pageText,
    singleQuestionText,
    singleQuestionImageAsset,
    numberFrom,
    numberTo,
    questions,
  ]);

  const handleSystemChange = (value) => {
    setSystemId(value);
    setGradeId("");
    setSubjectId("");
    setUnitId("");
    setLessonId("");
    setSectionId("");
    setSectionTitle("");
    setSubjects([]);
    setUnits([]);
    setLessons([]);
  };

  const handleGradeChange = (value) => {
    const grade = grades.find((item) => item.id === value);
    const detectedSystem =
      getGradeSystemId(grade) || (BAC_GRADES.includes(value) ? "bac" : "general");

    setSystemId(detectedSystem);
    setGradeId(value);
    setSubjectId("");
    setUnitId("");
    setLessonId("");
    setSectionId("");
    setSectionTitle("");
    setUnits([]);
    setLessons([]);
  };

  const handleSubjectChange = (value) => {
    setSubjectId(value);
    setUnitId("");
    setLessonId("");
    setSectionId("");
    setSectionTitle("");
    setLessons([]);
  };

  const handleUnitChange = (value) => {
    setUnitId(value);
    setLessonId("");
    setSectionId("");
    setSectionTitle("");
  };

  const handleLessonChange = (value) => {
    setLessonId(value);
    setSectionId("");
    setSectionTitle("");
  };

  const moveQuestion = (index, direction) => {
    setQuestions((previous) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= previous.length) return previous;
      const next = [...previous];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return renumber(next);
    });
  };

  const deleteQuestion = (index) => {
    if (!window.confirm(`هل تريد حذف السؤال رقم ${index + 1}؟`)) return;
    setQuestions((previous) =>
      renumber(previous.filter((_, itemIndex) => itemIndex !== index))
    );
  };

  const updateQuestionText = (id, value) => {
    setQuestions((previous) =>
      previous.map((q) =>
        q.id === id ? { ...q, questionText: value } : q
      )
    );
  };

  const updateChoice = (id, choiceIndex, value) => {
    setQuestions((previous) =>
      previous.map((q) => {
        if (q.id !== id || q.type !== "mcq") return q;
        const choices = [...q.choices];
        choices[choiceIndex] = value;
        return { ...q, choices };
      })
    );
  };

  const toggleCorrectAnswer = (id, choiceIndex) => {
    setQuestions((previous) => previous.map((q) =>
      q.id !== id || q.type !== "mcq"
        ? q
        : { ...q, correctAnswer: q.correctAnswer === choiceIndex ? null : choiceIndex }
    ));
  };

  const [openQuestionPasteIndex, setOpenQuestionPasteIndex] = useState(null);

  const handleQuestionPaste = (questionIndex, event) => {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;

    event.preventDefault();
    event.stopPropagation();

    const file = imageItem.getAsFile();
    if (file) {
      setQuestionImage(questionIndex, file);
      setOpenQuestionPasteIndex(null);
    }
  };

  const handleOpenQuestionPaste = (questionIndex) => {
    setOpenQuestionPasteIndex((current) =>
      current === questionIndex ? null : questionIndex
    );
  };

  const changeQuestionType = (id, type) => {
    setQuestions((previous) =>
      previous.map((q) => {
        if (q.id !== id) return q;
        return {
          ...q,
          type,
          choices:
            type === "mcq"
              ? q.choices?.length === 4
                ? q.choices
                : ["", "", "", ""]
              : ["", "", "", ""],
          correctAnswer: type === "mcq" && Number.isInteger(q.correctAnswer) ? q.correctAnswer : null,
          essayAnswers:
            type === "essay"
              ? Array.isArray(q.essayAnswers) && q.essayAnswers.length
                ? q.essayAnswers
                : [q.modelAnswer || ""]
              : [],
        };
      })
    );
  };

  const updateEssayAnswer = (id, answerIndex, value) => {
    setQuestions((previous) =>
      previous.map((q) => {
        if (q.id !== id || q.type !== "essay") return q;
        const essayAnswers = Array.isArray(q.essayAnswers)
          ? [...q.essayAnswers]
          : [q.modelAnswer || ""];
        essayAnswers[answerIndex] = value;
        return { ...q, essayAnswers, modelAnswer: essayAnswers.join("\n\n") };
      })
    );
  };

  const addEssayAnswer = (id) => {
    setQuestions((previous) =>
      previous.map((q) => {
        if (q.id !== id || q.type !== "essay") return q;
        const essayAnswers = Array.isArray(q.essayAnswers) && q.essayAnswers.length
          ? [...q.essayAnswers]
          : [q.modelAnswer || ""];
        essayAnswers.push("");
        return { ...q, essayAnswers, modelAnswer: essayAnswers.join("\n\n") };
      })
    );
  };

  const removeEssayAnswer = (id, answerIndex) => {
    setQuestions((previous) =>
      previous.map((q) => {
        if (q.id !== id || q.type !== "essay") return q;
        const current = Array.isArray(q.essayAnswers) && q.essayAnswers.length
          ? [...q.essayAnswers]
          : [q.modelAnswer || ""];
        if (current.length <= 1) return q;
        current.splice(answerIndex, 1);
        return { ...q, essayAnswers: current, modelAnswer: current.join("\n\n") };
      })
    );
  };

  const parseTextIntoQuestions = async (text, sourcePage = null) => {
    const value = cleanText(text);
    if (!value) throw new Error("ضع نص Google Lens أولًا.");

    const response = await api.post(
      "/api/question-bank/import/preview",
      {
        questionsText: value,
        answerKeyText: "",
        visualAssets: [],
        sourceDocument: {
          fileName: sourcePageName || effectiveSourceName || documentFileName || "Google Lens",
          fileUrl: sourcePageImage?.url || "",
          pages: sourcePage ? [sourcePage] : [1],
          referenceText: "",
          curriculumOnly: true,
        },
        defaults: { source: "imported_exam", sourceName: effectiveSourceName || "" },
      },
      { timeout: 0 }
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.error || "فشل ترتيب وتحليل النص."
      );
    }

    return normalizeImportedQuestions(response.data);
  };

  const setSingleImageFile = async (file) => {
    if (!file) {
      if (singleQuestionImagePreview) {
        URL.revokeObjectURL(singleQuestionImagePreview);
      }
      setSingleQuestionImage(null);
      setSingleQuestionImagePreview("");
      setSingleQuestionImageAsset(null);
      return;
    }

    if (!String(file.type || "").startsWith("image/")) {
      setError("الملف المنسوخ ليس صورة. انسخ الصورة ثم اضغط Ctrl+V.");
      return;
    }

    if (singleQuestionImagePreview) {
      URL.revokeObjectURL(singleQuestionImagePreview);
    }

    setSingleQuestionImage(file);
    setSingleQuestionImagePreview(URL.createObjectURL(file));
    setError("");
    setNotice("⏳ جاري رفع صورة السؤال وربطها به...");

    try {
      // الرفع يتم فورًا، حتى لا تضيع الصورة إذا حدث Refresh قبل الضغط على إضافة السؤال.
      const uploaded = await uploadImage(file);
      setSingleQuestionImageAsset({
        type: "image",
        url: uploaded.fileUrl,
        absoluteUrl: uploaded.absoluteUrl,
        fileName: uploaded.originalName || file.name,
        order: 0,
        cropped: false,
      });
      setNotice("✓ تم رفع الصورة وحفظ رابطها؛ ستظل مرتبطة بهذا السؤال.");
    } catch (err) {
      console.error("Single question image upload error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "فشل رفع صورة السؤال."
      );
    }
  };

  const handleDocumentFile = async (file) => {
    if (!file) return;

    setError("");
    setNotice("");
    setDocumentFileName(file.name || "");
    setSourcePageName(file.name || "");

    const fileName = String(file.name || "").toLowerCase();

    try {
      setLoading(true);

      if (fileName.endsWith(".docx")) {
        const extractedText = await readDocxText(file);
        setPageText(extractedText);
        setSourcePageImage(null);
        setSourcePageFile(null);
        setNotice(
          `✓ تم قراءة ملف Word مباشرة: ${file.name}\nراجع النص ثم اضغط «إضافة أسئلة الصفحة».`
        );
        return;
      }

      if (
        fileName.endsWith(".txt") ||
        fileName.endsWith(".text") ||
        fileName.endsWith(".md")
      ) {
        const extractedText = await file.text();
        const cleaned = cleanText(extractedText);

        if (!cleaned) {
          throw new Error("الملف النصي فارغ.");
        }

        setPageText(cleaned);
        setSourcePageImage(null);
        setSourcePageFile(null);
        setNotice(
          `✓ تم قراءة الملف النصي: ${file.name}\nراجع النص ثم اضغط «إضافة أسئلة الصفحة».`
        );
        return;
      }

      if (fileName.endsWith(".doc")) {
        throw new Error(
          "ملفات Word القديمة بصيغة .doc لا تُقرأ مباشرة حاليًا. افتح الملف في Word واحفظه بصيغة .docx ثم اختره هنا."
        );
      }

      throw new Error(
        "نوع الملف غير مدعوم. استخدم TXT أو MD أو Word DOCX."
      );
    } catch (err) {
      console.error("Document import error:", err);
      setPageText("");
      setError(
        err.message ||
          "تعذر قراءة الملف."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImportAndSaveSingleQuestion = async () => {
    setError("");
    setNotice("");

    if (!singleQuestionText.trim()) {
      setError("الصق نص السؤال من Google Lens أولًا.");
      return;
    }

    if (!systemId || !gradeId || !subjectId || !unitId || !lessonId) {
      setError("أكمل اختيار النظام والصف والمادة والوحدة والدرس أولًا.");
      return;
    }

    try {
      setLoading(true);

      const parsed = await parseTextIntoQuestions(singleQuestionText);

      if (!parsed.length) {
        throw new Error("لم يتم التعرف على السؤال. راجع النص المنسوخ.");
      }

      const newQuestions = parsed.map((q, index) => ({
        ...q,
        id: makeQuestionId(),
        sourceFileName: effectiveSourceName || sourcePageName || "سؤال منفرد",
        sourceName: effectiveSourceName || "",
        sectionId: effectiveSectionId,
        sectionTitle: cleanText(sectionTitle),
        originalQuestionNumber: String(
          q.originalQuestionNumber ?? questions.length + index + 1
        ).trim(),
      }));

      if (singleQuestionImageAsset) {
        newQuestions.forEach((q) => {
          q.visualAssets = [singleQuestionImageAsset];
        });
      }

      // أضف السؤال إلى المسودة أولًا، حتى يظل موجودًا محليًا حتى لو تعطل الحفظ الفعلي.
      setQuestions((previous) => renumber([...previous, ...newQuestions]));

      for (let index = 0; index < newQuestions.length; index += 1) {
        const q = newQuestions[index];

        if (
          q.type === "mcq" &&
          (q.choices?.length !== 4 ||
            q.choices.some((choice) => !String(choice || "").trim()))
        ) {
          throw new Error(
            `السؤال ${index + 1} لا يحتوي على 4 اختيارات كاملة، لذلك لم يتم حفظه فعليًا.`
          );
        }
        if (q.type === "mcq" && ![0, 1, 2, 3].includes(q.correctAnswer)) {
          throw new Error(`حدد الإجابة الصحيحة للسؤال ${index + 1} أولًا.`);
        }

        const importBatchId = `single_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 10)}`;

        const response = await api.post(
          "/api/question-bank",
          {
            questionText: String(q.questionText || "").trim(),
            type: q.type,
            choices: q.type === "mcq" ? q.choices : [],
            correctAnswer: q.type === "mcq" ? q.correctAnswer : null,
            modelAnswer:
              q.type === "essay"
                ? (Array.isArray(q.essayAnswers) && q.essayAnswers.length ? q.essayAnswers : [q.modelAnswer || ""]).join("\n\n")
                : "",
            gradingCriteria: [],
            marks: 1,
            stageId: "secondary",
            systemId,
            gradeId,
            subjectId,
            unitId,
            lessonId,
            sectionId: q.sectionId || effectiveSectionId,
            sectionTitle: cleanText(q.sectionTitle || sectionTitle),
            difficulty: "medium",
            cognitiveLevel: "",
            source: "imported_exam",
            sourceName: q.sourceName || effectiveSourceName || sourcePageName || documentFileName || "سؤال منفرد",
            explanation: "",
            aiGenerated: false,
            aiReviewed: false,
            imported: true,
            importBatchId,
            importOrder: questions.length + index + 1,
            originalQuestionNumber: String(
              q.originalQuestionNumber ?? questions.length + index + 1
            ).trim(),
            visualAssets: Array.isArray(q.visualAssets) ? q.visualAssets : [],
            sourceDocument: {
              fileName: sourcePageName || effectiveSourceName || documentFileName || "",
              fileUrl: sourcePageImage?.url || "",
              pages: [Number(q.sourcePage) || 1],
              referenceText: "الصورة المرجعية مرشد للترتيب فقط.",
              curriculumOnly: true,
            },
            sourcePage: {
              fileName: sourcePageName || "سؤال منفرد",
              pageNumber: Number(q.sourcePage) || 1,
              originalQuestionNumber: String(
                q.originalQuestionNumber || questions.length + index + 1
              ),
            },
            active: true,
            choiceLayout: "vertical",
          },
          { timeout: 30000 }
        );

        const bankId = response.data?.question?._id || "";

        setQuestions((previous) =>
          previous.map((item) =>
            item.id === q.id
              ? {
                  ...item,
                  bankQuestionId: bankId,
                  bankSavedAt: new Date().toISOString(),
                }
              : item
          )
        );
      }

      setSingleQuestionText("");
      setSingleImageFile(null);
      setSingleQuestionImageAsset(null);

      setNotice(
        `✓ تم إضافة السؤال وحفظه فعليًا في بنك الأسئلة${
          singleQuestionImageAsset ? " مع الصورة المطابقة له." : "."
        }`
      );
    } catch (err) {
      console.error("Import and save single question error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "تمت إضافة السؤال للمسودة، لكن تعذر الحفظ الفعلي."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSingleQuestionPaste = (event) => {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find((item) =>
      item.type.startsWith("image/")
    );
    if (!imageItem) return;

    event.preventDefault();
    const file = imageItem.getAsFile();
    if (file) setSingleImageFile(file);
  };

  const clearSingleQuestionImage = () => setSingleImageFile(null);

  const handleImportPage = async () => {
    setError("");
    setNotice("");

    if (!pageText.trim()) {
      setError("ارفع صورة الصفحة أولًا ليتم استخراج النص تلقائيًا.");
      return;
    }

    try {
      setLoading(true);
      const parsed = await parseTextIntoQuestions(pageText);

      if (!parsed.length) {
        throw new Error(
          "لم يتم العثور على أسئلة واضحة في النص المستخرج. راجع النص أو عدّلْه يدويًا ثم أعد المحاولة."
        );
      }

      let nextQuestions = parsed.map((q) => ({
        ...q,
        id: makeQuestionId(),
        sourceFileName: effectiveSourceName || sourcePageName || documentFileName || "صفحة مستوردة",
        sourceName: effectiveSourceName || "",
        sectionId: effectiveSectionId,
        sectionTitle: cleanText(sectionTitle),
      }));

      const from = Number(numberFrom);
      const to = Number(numberTo);

      if (Number.isInteger(from) && Number.isInteger(to) && from >= 1 && to >= from) {
        const expected = to - from + 1;
        if (expected !== nextQuestions.length) {
          throw new Error(
            `النطاق من ${from} إلى ${to} يعني ${expected} سؤالًا، بينما تم استخراج ${nextQuestions.length} سؤال. راجع النص أو عدّل النطاق.`
          );
        }
        nextQuestions = nextQuestions.map((q, index) => ({
          ...q,
          originalQuestionNumber: from + index,
        }));
      }

      setQuestions((previous) => renumber([...previous, ...nextQuestions]));
      setPageText("");
      setNotice(
        `✓ تمت إضافة ${nextQuestions.length} سؤالًا. راجع الترتيب والنوع قبل الحفظ.`
      );
    } catch (err) {
      console.error("Page import error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "فشل استيراد الصفحة."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImportSingleQuestion = async () => {
    setError("");
    setNotice("");

    if (!singleQuestionText.trim()) {
      setError("الصق نص السؤال من Google Lens أولًا.");
      return;
    }

    try {
      setLoading(true);
      const parsed = await parseTextIntoQuestions(singleQuestionText);

      if (!parsed.length) {
        throw new Error(
          "لم يتم التعرف على السؤال. راجع النص المنسوخ."
        );
      }

      const newQuestions = parsed.map((q) => ({
        ...q,
        id: makeQuestionId(),
        sourceFileName: effectiveSourceName || sourcePageName || "سؤال منفرد",
        sourceName: effectiveSourceName || "",
        sectionId: effectiveSectionId,
        sectionTitle: cleanText(sectionTitle),
      }));

      if (singleQuestionImageAsset) {
        newQuestions.forEach((q) => {
          q.visualAssets = [singleQuestionImageAsset];
        });
      }

      setQuestions((previous) =>
        renumber([...previous, ...newQuestions])
      );
      setSingleQuestionText("");
      setSingleImageFile(null);
      setSingleQuestionImageAsset(null);
      setNotice(
        `✓ تمت إضافة ${newQuestions.length} سؤال. الصورة مرتبطة بالسؤال نفسه.`
      );
    } catch (err) {
      console.error("Single question import error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "فشل استيراد السؤال."
      );
    } finally {
      setLoading(false);
    }
  };

  const setQuestionImage = async (questionIndex, file) => {
    if (!file) return;

    try {
      setError("");
      setNotice("⏳ جاري رفع صورة السؤال...");
      const uploaded = await uploadImage(file);

      setQuestions((previous) =>
        previous.map((q, index) =>
          index === questionIndex
            ? {
                ...q,
                visualAssets: [
                  {
                    type: "image",
                    url: uploaded.fileUrl,
                    absoluteUrl: uploaded.absoluteUrl,
                    fileName: uploaded.originalName || file.name,
                    order: 0,
                    cropped: false,
                  },
                ],
              }
            : q
        )
      );

      setNotice("✓ تم حفظ صورة السؤال مع السؤال.");
    } catch (err) {
      console.error("Question image upload error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "فشل رفع صورة السؤال."
      );
    }
  };

  const removeQuestionImage = (questionIndex) => {
    setQuestions((previous) =>
      previous.map((q, index) =>
        index === questionIndex ? { ...q, visualAssets: [] } : q
      )
    );
  };

  const handleSourcePageImage = async (file) => {
    if (!file) return;

    try {
      setError("");
      setNotice("⏳ جاري رفع الصورة وتشغيل OCR المجاني...");

      // Keep the original upload exactly as before so the source page remains
      // attached to the import and available as the visual reference.
      const uploaded = await uploadImage(file);
      setSourcePageFile(file);

      setSourcePageImage({
        url: uploaded.fileUrl,
        absoluteUrl: uploaded.absoluteUrl,
        fileName: uploaded.originalName || file.name,
      });
      setSourcePageName(uploaded.originalName || file.name);

      // Run the existing local Tesseract document-preview endpoint directly
      // on the original image. No OpenAI API is used here.
      const form = new FormData();
      form.append("file", file);
      form.append("ocrLanguage", "ara+eng");
      form.append(
        "defaults",
        JSON.stringify({ source: "imported_exam" })
      );

      const ocrResponse = await api.post(
        "/api/question-bank/import/document-preview",
        form,
        {
          timeout: 0,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const extractedText = String(
        ocrResponse.data?.questionsText ||
          ocrResponse.data?.extraction?.text ||
          ""
      ).trim();

      if (!ocrResponse.data?.success || !extractedText) {
        throw new Error(
          ocrResponse.data?.error ||
            "تم رفع الصورة، لكن لم يتم استخراج نص منها."
        );
      }

      setPageText(extractedText);
      setNotice(
        `✓ تم رفع الصورة واستخراج النص تلقائيًا بواسطة OCR المجاني. راجعه ثم اضغط «إضافة أسئلة الصفحة».`
      );
    } catch (err) {
      console.error("Source page OCR error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "فشل استخراج النص من صورة الصفحة."
      );
    }
  };

  const saveDraft = async () => {
    if (!questions.length) {
      setError("لا توجد أسئلة لحفظها.");
      return;
    }

    try {
      setSavingDraft(true);
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          version: 3,
          savedAt: new Date().toISOString(),
          systemId,
          gradeId,
          subjectId,
          unitId,
          lessonId,
          sectionId,
          sectionTitle,
          sourcePageName,
          sourcePageImage,
          pageText,
          singleQuestionText,
          numberFrom,
          numberTo,
          questions,
        })
      );
      setNotice(
        `✓ تم حفظ المسودة محليًا: ${questions.length} سؤالًا. ويمكنك لاحقًا حفظها فعليًا في بنك الأسئلة.`
      );
    } catch (err) {
      console.error("Draft save error:", err);
      setError("تعذر حفظ المسودة في المتصفح.");
    } finally {
      setSavingDraft(false);
    }
  };

  const clearDraft = () => {
    if (!window.confirm("سيتم حذف المسودة الحالية من هذا المتصفح. هل أنت متأكد؟")) {
      return;
    }

    localStorage.removeItem(DRAFT_KEY);
    setQuestions([]);
    setSourcePageImage(null);
    setSourcePageFile(null);
    setSourcePageName("");
    setSourceName("");
    setCustomSourceName("");
    setDocumentFileName("");
    setSectionId("");
    setSectionTitle("");
    setPageText("");
    setSingleQuestionText("");
    setSingleImageFile(null);
    setSingleQuestionImageAsset(null);
    setNotice("تم حذف المسودة.");
    setError("");
  };

  const validateBeforeSave = () => {
    if (!systemId) return "اختر النظام أولًا: الثانوية العامة أو البكالوريا المصرية.";
    if (!gradeId) return "اختر الصف أولًا.";
    if (!subjectId) return "اختر المادة أولًا.";
    if (!unitId) return "اختر الوحدة أولًا.";
    if (!lessonId) return "اختر الدرس أولًا.";
    if (!questions.length) return "لا توجد أسئلة للحفظ.";

    for (let index = 0; index < questions.length; index += 1) {
      const q = questions[index];
      if (!q.questionText.trim()) {
        return `السؤال رقم ${index + 1} لا يحتوي على نص.`;
      }

      if (q.type === "mcq") {
        if (q.choices.length !== 4 || q.choices.some((choice) => !String(choice).trim())) {
          return `السؤال رقم ${index + 1} اختياري، ويجب أن يحتوي على 4 اختيارات كاملة.`;
        }
        if (![0, 1, 2, 3].includes(q.correctAnswer)) {
          return `السؤال رقم ${index + 1} اختياري، ويجب تحديد الإجابة الصحيحة.`;
        }
      }
    }

    return "";
  };

  const saveQuestionToBank = async (questionIndex) => {
    const q = questions[questionIndex];
    if (!q) return;

    if (!systemId || !gradeId || !subjectId || !unitId || !lessonId) {
      setError("أكمل ربط النظام والصف والمادة والوحدة والدرس أولًا.");
      return;
    }

    if (!String(q.questionText || "").trim()) {
      setError(`السؤال رقم ${questionIndex + 1} لا يحتوي على نص.`);
      return;
    }

    if (
      q.type === "mcq" &&
      (q.choices?.length !== 4 ||
        q.choices.some((choice) => !String(choice || "").trim()))
    ) {
      setError(`السؤال رقم ${questionIndex + 1} اختياري ويجب أن يحتوي على 4 اختيارات كاملة.`);
      return;
    }
    if (q.type === "mcq" && ![0, 1, 2, 3].includes(q.correctAnswer)) {
      setError(`حدد الإجابة الصحيحة للسؤال ${questionIndex + 1} أولًا.`);
      return;
    }

    try {
      setSavingQuestionId(q.id);
      setError("");
      setNotice(`⏳ جاري الحفظ الفعلي للسؤال ${questionIndex + 1}...`);

      const importBatchId = `single_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;

      const response = await api.post(
        "/api/question-bank",
        {
          questionText: q.questionText.trim(),
          type: q.type,
          choices: q.type === "mcq" ? q.choices : [],
          correctAnswer: q.type === "mcq" ? q.correctAnswer : null,
          modelAnswer:
            q.type === "essay"
              ? (Array.isArray(q.essayAnswers) && q.essayAnswers.length
                  ? q.essayAnswers
                  : [q.modelAnswer || ""]
                ).join("\n\n")
              : "",
          gradingCriteria: [],
          marks: 1,

          stageId: "secondary",
          systemId,
          gradeId,
          subjectId,
          unitId,
          lessonId,
          sectionId: effectiveSectionId,
          sectionTitle: cleanText(sectionTitle),

          difficulty: "medium",
          cognitiveLevel: "",
          source: "imported_exam",
          sourceName: q.sourceFileName || effectiveSourceName || sourcePageName || documentFileName || "Imported Exam",
          explanation: "",
          aiGenerated: false,
          aiReviewed: false,

          imported: true,
          importBatchId,
          importOrder: questionIndex + 1,
          originalQuestionNumber: String(
            q.originalQuestionNumber ?? questionIndex + 1
          ).trim(),

          // هذا هو الرابط الصريح: الصورة الموجودة في q.visualAssets
          // تُرسل مع نفس السؤال، ولا تُفصل عنه.
          visualAssets: Array.isArray(q.visualAssets) ? q.visualAssets : [],

          sourceDocument: {
            fileName: sourcePageName || effectiveSourceName || documentFileName || "",
            fileUrl: sourcePageImage?.url || "",
            pages: [Number(q.sourcePage) || 1],
            referenceText: "الصورة المرجعية مرشد للترتيب فقط.",
            curriculumOnly: true,
          },

          sourcePage: {
            fileName: sourcePageName || q.sourceFileName || "",
            pageNumber: Number(q.sourcePage) || 1,
            originalQuestionNumber: String(
              q.originalQuestionNumber || questionIndex + 1
            ),
          },

          active: true,
          choiceLayout: "vertical",
        },
        { timeout: 30000 }
      );

      const bankQuestion = response.data?.question;

      setQuestions((previous) =>
        previous.map((item) =>
          item.id === q.id
            ? {
                ...item,
                bankQuestionId: bankQuestion?._id || "",
                bankSavedAt: new Date().toISOString(),
              }
            : item
        )
      );

      setNotice(
        `✓ تم الحفظ الفعلي للسؤال ${questionIndex + 1} في بنك الأسئلة${
          q.visualAssets?.length ? " مع صورته المرتبطة به." : "."
        }`
      );
    } catch (err) {
      if (err.response?.status === 409) {
        setNotice(`✓ السؤال ${questionIndex + 1} موجود بالفعل في بنك الأسئلة.`);
      } else {
        console.error("Single question bank save error:", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "فشل حفظ السؤال في بنك الأسئلة."
        );
      }
    } finally {
      setSavingQuestionId(null);
    }
  };

  const saveQuestionsToBank = async () => {
    if (!effectiveSourceName) {
      setError("اختر المصدر / الكتاب أولًا.");
      return;
    }
    if (!cleanText(sectionTitle)) {
      setError("اكتب عنوان القسم / التدريب / التقييم أولًا، مثل: التدريب الأول.");
      return;
    }

    const validationError = validateBeforeSave();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setNotice("⏳ جاري حفظ الأسئلة فعليًا في بنك الأسئلة...");

      const importBatchId = `import_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;

      const sourceDocument = {
        fileName: sourcePageName || effectiveSourceName || documentFileName || "",
        fileUrl: sourcePageImage?.url || "",
        pages: [1],
        referenceText: "الصورة المرجعية هي مرشد ترتيب الأسئلة فقط.",
        curriculumOnly: true,
      };

      let saved = 0;
      let skipped = 0;
      const savedIds = [];

      for (let index = 0; index < questions.length; index += 1) {
        const q = questions[index];

        try {
          const response = await api.post(
            "/api/question-bank",
            {
              questionText: q.questionText.trim(),
              type: q.type,
              choices: q.type === "mcq" ? q.choices : [],

              correctAnswer: q.type === "mcq" ? q.correctAnswer : null,
              modelAnswer:
                q.type === "essay"
                  ? (Array.isArray(q.essayAnswers) && q.essayAnswers.length
                      ? q.essayAnswers
                      : [q.modelAnswer || ""]
                    ).join("\n\n")
                  : "",
              gradingCriteria: [],

              marks: 1,

              stageId: "secondary",
              systemId,
              gradeId,
              subjectId,
              unitId,
              lessonId,
              sectionId: q.sectionId || effectiveSectionId,
              sectionTitle: cleanText(q.sectionTitle || sectionTitle),

              difficulty: "medium",
              cognitiveLevel: "",

              source: "imported_exam",
              sourceName:
                q.sourceName || q.sourceFileName || effectiveSourceName || sourcePageName || documentFileName || "Imported Exam",

              explanation: "",
              aiGenerated: false,
              aiReviewed: false,

              imported: true,
              importBatchId,
              importOrder: index + 1,
              originalQuestionNumber: String(
                q.originalQuestionNumber ?? index + 1
              ).trim(),

              visualAssets: q.visualAssets || [],
              sourceDocument,
              sourcePage: {
                fileName: sourcePageName || q.sourceFileName || q.sourceName || effectiveSourceName || "",
                pageNumber: Number(q.sourcePage) || 1,
                originalQuestionNumber: String(
                  q.originalQuestionNumber || index + 1
                ),
              },

              active: true,
              choiceLayout: "vertical",
            },
            { timeout: 30000 }
          );

          const bankQuestion = response.data?.question;
          if (bankQuestion?._id) savedIds.push(bankQuestion._id);
          saved += 1;
        } catch (err) {
          if (err.response?.status === 409) {
            skipped += 1;
          } else {
            // ============================================================
            // تشخيص تفصيلي لخطأ حفظ السؤال
            // لا نغيّر السؤال ولا نخفي سبب الخطأ.
            // نُظهر رقم السؤال + بيانات الطلب + رد الـ Backend.
            // ============================================================
            const backendData = err?.response?.data || {};
            const backendError =
              backendData?.error ||
              err?.message ||
              "سبب الخطأ غير معروف.";

            const diagnostic = {
              questionIndex: index + 1,
              originalQuestionNumber:
                Number(q?.originalQuestionNumber) || index + 1,
              questionType: q?.type || "",
              questionText: String(q?.questionText || "").trim(),
              choices: Array.isArray(q?.choices) ? q.choices : [],
              choicesCount: Array.isArray(q?.choices) ? q.choices.length : 0,
              correctAnswer:
                q?.type === "mcq" ? q?.correctAnswer ?? null : null,
              modelAnswer:
                q?.type === "essay"
                  ? String(q?.modelAnswer || "").trim()
                  : "",
              systemId,
              gradeId,
              subjectId,
              unitId,
              lessonId,
              sectionId: q?.sectionId || effectiveSectionId || "",
              imported: true,
              source: "imported_exam",
              httpStatus: err?.response?.status || null,
              backendResponse: backendData,
            };

            console.error(
              "========== QUESTION BANK SAVE DIAGNOSTIC ==========",
              diagnostic
            );

            const detailsText =
              backendData?.details &&
              typeof backendData.details === "object"
                ? Object.entries(backendData.details)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join("\n")
                : "";

            const diagnosticMessage = [
              `❌ فشل حفظ السؤال رقم ${diagnostic.questionIndex}.`,
              `رقم السؤال الأصلي: ${diagnostic.originalQuestionNumber}.`,
              `نوع السؤال: ${diagnostic.questionType || "غير محدد"}.`,
              `HTTP: ${diagnostic.httpStatus || "غير معروف"}.`,
              `سبب الـ Backend: ${backendError}`,
              detailsText ? `تفاصيل إضافية:\n${detailsText}` : "",
              `عدد الاختيارات المرسلة: ${diagnostic.choicesCount}.`,
              diagnostic.questionType === "mcq"
                ? `الإجابة الصحيحة المرسلة: ${
                    diagnostic.correctAnswer === null ||
                    diagnostic.correctAnswer === undefined
                      ? "غير محددة"
                      : diagnostic.correctAnswer
                  }.`
                : "",
              diagnostic.questionText
                ? `بداية نص السؤال: ${diagnostic.questionText.slice(0, 250)}`
                : "نص السؤال فارغ.",
              "",
              "تم تسجيل التفاصيل الكاملة في Console تحت:",
              "QUESTION BANK SAVE DIAGNOSTIC",
            ]
              .filter(Boolean)
              .join("\n");

            throw new Error(diagnosticMessage);
          }
        }
      }

      localStorage.removeItem(DRAFT_KEY);

      setNotice(
        `✓ تم الحفظ الفعلي في بنك الأسئلة.\nتمت إضافة: ${saved} سؤال\nالمكرر: ${skipped}\nلم يتم إدخال أي إجابة صحيحة — مرحلة الإجابات لاحقًا.`
      );

      if (savedIds.length) {
        setNotice((previous) =>
          `${previous}\n\nBatch: ${importBatchId}`
        );
      }
    } catch (err) {
      // ============================================================
      // إظهار سبب الخطأ الحقيقي بدل رسالة Axios العامة فقط.
      // ============================================================
      console.error("Question bank save error:", {
        message: err?.message,
        status: err?.response?.status,
        responseData: err?.response?.data,
        fullError: err,
      });

      setError(
        err?.message ||
          err?.response?.data?.error ||
          "فشل حفظ الأسئلة في بنك الأسئلة."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!draftLoaded) {
    return (
      <div dir="rtl" className="min-h-screen text-white p-6">
        جاري استعادة المسودة...
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">
          📥 استيراد الأسئلة — إدخال وترتيب وربط بنك الأسئلة
        </h1>
        <p className="text-gray-400 mt-2 leading-8">
          الصفحة الكاملة للنص، والسؤال المنفرد للصورة أو الخريطة أو أي شكل.
          الصورة المرجعية تساعد في ترتيب الأسئلة، ولا توجد إجابات في هذه المرحلة.
        </p>
      </div>

      {(error || notice) && (
        <div className="mb-5 space-y-3">
          {error && (
            <div className="p-4 rounded-xl border border-red-500/50 bg-red-950/30 text-red-300 whitespace-pre-line">
              {error}
            </div>
          )}
          {notice && (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-950/20 text-green-300 whitespace-pre-line">
              {notice}
            </div>
          )}
        </div>
      )}

      <section className="bg-[#111] border border-yellow-500/20 rounded-2xl p-5 mb-6">
        <h2 className="text-lg font-bold text-yellow-300 mb-4">
          🧭 ربط الأسئلة بالمنهج — إجباري قبل الحفظ
        </h2>

        <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-yellow-300 font-bold mb-2">📚 المصدر / الكتاب</label>
            <select value={sourceName} onChange={(event) => setSourceName(event.target.value)} className="w-full rounded-xl border border-gray-700 bg-[#0b0b0b] p-3 text-white outline-none focus:border-yellow-400">
              <option value="">اختر المصدر / الكتاب</option>
              {SOURCE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            {sourceName === "كتب أخرى" && (
              <input value={customSourceName} onChange={(event) => setCustomSourceName(event.target.value)} placeholder="اكتب اسم الكتاب / المذكرة" className="mt-2 w-full rounded-xl border border-gray-700 bg-[#0b0b0b] p-3 text-white outline-none focus:border-yellow-400" />
            )}
          </div>
          <div>
            <label className="block text-yellow-300 font-bold mb-2">🏷️ عنوان القسم / التدريب / التقييم</label>
            <input value={sectionTitle} onChange={(event) => setSectionTitle(event.target.value)} placeholder="مثال: التدريب الأول — التقييم الأسبوعي — الأداء الصفي" className="w-full rounded-xl border border-gray-700 bg-[#0b0b0b] p-3 text-white outline-none focus:border-yellow-400" />
            <p className="text-xs text-gray-500 mt-2">كل ملف يمثل قسمًا مستقلًا، وأرقام الأسئلة داخله تظل أرقام المصدر.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <SelectBox
            label="1 — النظام"
            value={systemId}
            onChange={handleSystemChange}
            options={systems}
            placeholder="اختر النظام"
          />

          <SelectBox
            label="2 — الصف"
            value={gradeId}
            onChange={handleGradeChange}
            options={visibleGrades}
            placeholder={
              systemId ? "اختر الصف" : "اختر النظام أولًا"
            }
            disabled={!systemId || loadingGrades}
            getOptionLabel={(item) => getTitle(item, item.id)}
          />

          <SelectBox
            label="3 — المادة"
            value={subjectId}
            onChange={handleSubjectChange}
            options={subjects}
            placeholder={
              gradeId ? "اختر المادة" : "اختر الصف أولًا"
            }
            disabled={!gradeId || loadingSubjects}
            getOptionLabel={(item) => getTitle(item, item.id)}
          />

          <SelectBox
            label="4 — الوحدة"
            value={unitId}
            onChange={handleUnitChange}
            options={units}
            placeholder={
              subjectId ? "اختر الوحدة" : "اختر المادة أولًا"
            }
            disabled={!subjectId || loadingUnits}
            getOptionLabel={(item) => getTitle(item, item.id)}
          />

          <SelectBox
            label="5 — الدرس"
            value={lessonId}
            onChange={handleLessonChange}
            options={lessons}
            placeholder={
              unitId ? "اختر الدرس" : "اختر الوحدة أولًا"
            }
            disabled={!unitId || loadingLessons}
            getOptionLabel={(item) => getTitle(item, item.id)}
          />

          {sections.length > 0 && (
            <SelectBox
              label="6 — القسم / الجزء الموجود في المنهج"
              value={sectionId}
              onChange={(value) => {
                const section = sections.find((item) => item.id === value);
                setSectionId(value);
                setSectionTitle(section?.title || "");
              }}
              options={sections}
              placeholder="اختر القسم / الجزء"
              disabled={!lessonId}
              getOptionLabel={(item) => item.title}
            />
          )}
        </div>

        <div className="mt-4 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 text-gray-300 leading-7">
          <b className="text-blue-300">الربط الفعلي:</b>{" "}
          {selectedSystemTitle || "النظام"} → الصف → المادة → الوحدة → الدرس
          {sections.length > 0 ? " → القسم / الجزء" : ""}.
          <br />
          هذه البيانات تحفظ مع كل سؤال داخل بنك الأسئلة، وليست مجرد بيانات مؤقتة للشاشة.
        </div>
      </section>

      <section className="bg-[#111] border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold">📄 المرحلة 1 — إدخال الأسئلة</h2>
            <p className="text-sm text-gray-400 mt-1">
              صفحة كاملة للنص فقط، أو سؤال منفرد إذا كان به خريطة/صورة/شكل.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("page")}
              className={`px-4 py-2 rounded-xl font-bold ${
                mode === "page"
                  ? "bg-yellow-400 text-black"
                  : "border border-gray-700 text-gray-300"
              }`}
            >
              📄 صفحة كاملة
            </button>
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`px-4 py-2 rounded-xl font-bold ${
                mode === "single"
                  ? "bg-yellow-400 text-black"
                  : "border border-gray-700 text-gray-300"
              }`}
            >
              📷 سؤال منفرد
            </button>
          </div>
        </div>

        {mode === "page" ? (
          <div className="mt-6">
            <div className="flex flex-wrap gap-2 mb-5">
              <button type="button" onClick={() => setDocumentInputMode("text")} className={`px-4 py-3 rounded-xl font-bold border ${documentInputMode === "text" ? "bg-yellow-400 text-black border-yellow-400" : "border-gray-700 text-gray-300"}`}>📝 نص / لصق</button>
              <button type="button" onClick={() => setDocumentInputMode("word")} className={`px-4 py-3 rounded-xl font-bold border ${documentInputMode === "word" ? "bg-yellow-400 text-black border-yellow-400" : "border-gray-700 text-gray-300"}`}>📄 Word / DOCX / TXT</button>
              <button type="button" onClick={() => setDocumentInputMode("ocr")} className={`px-4 py-3 rounded-xl font-bold border ${documentInputMode === "ocr" ? "bg-yellow-400 text-black border-yellow-400" : "border-gray-700 text-gray-300"}`}>🖼️ صورة + OCR</button>
            </div>
            {documentInputMode === "word" && (
              <div className="mb-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div>
                  <label className="block text-yellow-300 font-bold mb-2">📄 اختيار ملف Word / نص</label>
                  <input type="file" accept=".docx,.doc,.txt,.text,.md" onChange={(event) => handleDocumentFile(event.target.files?.[0] || null)} className="w-full text-sm" />
                  <div className="mt-3 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 text-gray-300 leading-8">يدعم مباشرة <b className="text-blue-200">DOCX / TXT / MD</b>. أما DOC القديم فيُحفظ أولًا كـ DOCX.</div>
                  {documentFileName && <div className="mt-3 p-3 rounded-xl border border-green-500/30 text-green-300">✓ الملف: {documentFileName}</div>}
                </div>
                <div>
                  <label className="block text-yellow-300 font-bold mb-2">📝 النص المستخرج من الملف — قابل للمراجعة</label>
                  <textarea value={pageText} onChange={(event) => setPageText(event.target.value)} rows={14} placeholder="سيظهر هنا النص المستخرج من Word/TXT/MD..." className="w-full rounded-xl border border-gray-700 bg-[#0b0b0b] text-white p-4 outline-none focus:border-yellow-400 leading-8" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div>
              <label className="block text-yellow-300 font-bold mb-2">
                🖼️ صورة الصفحة الأصلية — مرشد الترتيب
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff"
                onChange={(event) =>
                  handleSourcePageImage(event.target.files?.[0])
                }
                className="w-full text-sm"
              />

              {sourcePageImage?.absoluteUrl && (
                <div className="mt-4 border border-gray-700 rounded-xl p-3 bg-[#0b0b0b]">
                  <img
                    src={sourcePageImage.absoluteUrl}
                    alt="الصفحة الأصلية"
                    className="max-h-[520px] w-full object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSourcePageImage(null);
                      setSourcePageName("");
                    }}
                    className="mt-3 px-4 py-2 rounded-lg border border-red-500/50 text-red-300"
                  >
                    حذف الصورة المرجعية
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-yellow-300 font-bold mb-2">
                📝 النص المستخرج تلقائيًا من الصفحة (OCR)
              </label>
              <textarea
                value={pageText}
                onChange={(event) => setPageText(event.target.value)}
                placeholder="سيظهر هنا النص المستخرج تلقائيًا من صورة الصفحة. ويمكنك مراجعته وتعديله قبل إضافة الأسئلة..."
                rows={18}
                className="w-full rounded-xl border border-gray-700 bg-[#0b0b0b] text-white p-4 outline-none focus:border-yellow-400"
              />

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="number"
                  min="1"
                  value={numberFrom}
                  onChange={(event) => setNumberFrom(event.target.value)}
                  placeholder="رقم السؤال من — إذا لم تظهر الأرقام"
                  className="rounded-xl border border-gray-700 bg-[#0b0b0b] p-3 text-white outline-none focus:border-yellow-400"
                />
                <input
                  type="number"
                  min="1"
                  value={numberTo}
                  onChange={(event) => setNumberTo(event.target.value)}
                  placeholder="رقم السؤال إلى — إذا لم تظهر الأرقام"
                  className="rounded-xl border border-gray-700 bg-[#0b0b0b] p-3 text-white outline-none focus:border-yellow-400"
                />
              </div>

              <button
                type="button"
                onClick={handleImportPage}
                disabled={loading || !pageText.trim()}
                className="mt-3 px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold disabled:opacity-40"
              >
                {loading ? "⏳ جاري ترتيب الصفحة..." : "➕ إضافة أسئلة الصفحة"}
              </button>
            </div>
          </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div>
              <label className="block text-yellow-300 font-bold mb-2">
                📷 صورة السؤال / الخريطة / الشكل
              </label>

              <div
                tabIndex={0}
                onPaste={handleSingleQuestionPaste}
                className="rounded-2xl border-2 border-dashed border-yellow-400/50 bg-[#0b0b0b] p-5 outline-none focus:border-yellow-400 transition"
              >
                <div className="text-yellow-300 font-bold text-center">
                  📋 الصق الصورة هنا مباشرة — Ctrl + V
                </div>
                <div className="text-gray-400 text-sm text-center mt-2 leading-7">
                  انسخ الصورة من Google Lens أو أداة القص، ثم اضغط{" "}
                  <b className="text-white">Ctrl+V</b> هنا.
                  <br />
                  لا تحتاج إلى حفظ الصورة ثم إعادة رفعها.
                </div>

                {singleQuestionImagePreview ? (
                  <div className="mt-4">
                    <img
                      src={singleQuestionImagePreview}
                      alt="الصورة الملصقة للسؤال"
                      className="max-h-[420px] max-w-full mx-auto object-contain rounded-xl border border-gray-700"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-green-300 text-sm">
                        ✓ تم تجهيز الصورة مع السؤال
                      </span>
                      <button
                        type="button"
                        onClick={clearSingleQuestionImage}
                        className="px-4 py-2 rounded-lg border border-red-500/50 text-red-300"
                      >
                        إزالة الصورة
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center text-gray-500 py-10">
                    مساحة اللصق السريع للصورة
                  </div>
                )}
              </div>

              <label className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl border border-gray-700 cursor-pointer hover:border-yellow-400">
                📁 أو اختر صورة من الجهاز
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff"
                  onChange={(event) =>
                    setSingleImageFile(event.target.files?.[0] || null)
                  }
                  className="hidden"
                />
              </label>

              <div className="mt-4 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 text-gray-300 leading-7">
                هذه الصورة مرتبطة <b className="text-blue-300">بهذا السؤال فقط</b>،
                وعند الضغط على ↑ أو ↓ ستتحرك معه الصورة والخريطة والاختيارات والنص كوحدة واحدة.
              </div>
            </div>

            <div>
              <label className="block text-yellow-300 font-bold mb-2">
                📝 نص السؤال من Google Lens
              </label>
              <textarea
                value={singleQuestionText}
                onChange={(event) => setSingleQuestionText(event.target.value)}
                placeholder="الصق نص السؤال كاملًا مع الاختيارات إن كان اختياريًا..."
                rows={14}
                className="w-full rounded-xl border border-gray-700 bg-[#0b0b0b] text-white p-4 outline-none focus:border-yellow-400"
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleImportSingleQuestion}
                  disabled={loading || !singleQuestionText.trim()}
                  className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold disabled:opacity-40"
                >
                  {loading ? "⏳ جاري إضافة السؤال..." : "➕ إضافة السؤال للمسودة"}
                </button>

                <button
                  type="button"
                  onClick={handleImportAndSaveSingleQuestion}
                  disabled={
                    loading ||
                    !singleQuestionText.trim() ||
                    !systemId ||
                    !gradeId ||
                    !subjectId ||
                    !unitId ||
                    !lessonId
                  }
                  className="px-6 py-3 rounded-xl bg-green-500 text-black font-bold disabled:opacity-40"
                  title="إضافة السؤال للمسودة ثم حفظه فورًا في بنك الأسئلة"
                >
                  {loading
                    ? "⏳ جاري الحفظ..."
                    : "💾 إضافة وحفظ السؤال فعليًا"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {questions.length > 0 && (
        <section className="mt-6 bg-[#111] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <div>
              <h2 className="text-lg font-bold">
                🔎 المرحلة 2 — مراجعة وترتيب واعتماد نوع السؤال
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                هذه المرحلة لا تدخل أي إجابة صحيحة.
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="text-gray-300">
                إجمالي: <b className="text-yellow-400">{questions.length}</b>
              </span>
              <span className="text-green-300">اختياري: {mcqCount}</span>
              <span className="text-blue-300">مقالي: {essayCount}</span>
            </div>
          </div>

          <div className="mb-5 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-gray-300 leading-8">
            <b className="text-yellow-300">🔒 قاعدة الترتيب:</b> عند الضغط على ↑ أو ↓ ينتقل السؤال بكل محتوياته — النص والاختيارات والصورة/الخريطة. الرقم الجديد يعاد حسابه تلقائيًا، و<strong>الترتيب المحفوظ هو ترتيبك النهائي.</strong>

            <div className="mt-2 text-green-300">
              💾 كل سؤال له حفظ فعلي مستقل، والصورة الظاهرة داخل بطاقة السؤال تُحفظ داخل نفس سجل السؤال.
              والحفظ المحلي يتم تلقائيًا بعد كل تعديل حتى لا تضيع المسودة عند Refresh.
            </div>
          </div>

          {importedSections.length > 0 && (
            <div className="mb-5 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
              <div className="font-bold text-yellow-300 mb-3">📚 أقسام الملفات المستوردة تحت هذا الدرس</div>
              <div className="flex flex-wrap gap-2">
                {importedSections.map((item) => (
                  <div key={item.title} className="px-4 py-2 rounded-xl border border-gray-700 bg-[#0b0b0b] text-gray-200">
                    <b>{item.title}</b> <span className="text-yellow-400">({item.count} سؤال)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-5">
            {questions.map((q, index) => {
              const image =
                q.visualAssets?.[0]?.absoluteUrl ||
                getMediaUrl(q.visualAssets?.[0]?.url);

              return (
                <article
                  key={q.id}
                  className="border border-gray-800 rounded-2xl p-4 bg-[#0d0d0d]"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center font-black text-lg">
                        {q.originalQuestionNumber || index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-yellow-400">
                          السؤال {q.originalQuestionNumber || index + 1}
                        </div>
                        <div className="text-xs text-gray-500">
                          رقم المصدر: {q.originalQuestionNumber || "غير محدد"}
                        </div>
                        <div className="text-xs text-blue-300 mt-1">
                          {q.sourceName || effectiveSourceName || "بدون مصدر"} — {q.sectionTitle || sectionTitle || "بدون قسم"}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, -1)}
                        disabled={index === 0}
                        title="نقل لأعلى"
                        className="w-10 h-10 rounded-xl border border-gray-700 hover:border-yellow-400 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, 1)}
                        disabled={index === questions.length - 1}
                        title="نقل لأسفل"
                        className="w-10 h-10 rounded-xl border border-gray-700 hover:border-yellow-400 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => saveQuestionToBank(index)}
                        disabled={saving || savingQuestionId === q.id}
                        className="px-4 h-10 rounded-xl bg-green-500 text-black font-bold disabled:opacity-40"
                      >
                        {savingQuestionId === q.id
                          ? "⏳ حفظ..."
                          : q.bankQuestionId
                          ? "✓ محفوظ فعليًا"
                          : "💾 حفظ السؤال فعليًا"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteQuestion(index)}
                        className="px-3 h-10 rounded-xl border border-red-500/40 text-red-300"
                      >
                        حذف
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => changeQuestionType(q.id, "essay")}
                      className={`rounded-xl px-4 py-3 font-bold border ${
                        q.type === "essay"
                          ? "bg-blue-500/20 border-blue-400 text-blue-200"
                          : "border-gray-700 text-gray-300"
                      }`}
                    >
                      ✍️ مقالي
                    </button>
                    <button
                      type="button"
                      onClick={() => changeQuestionType(q.id, "mcq")}
                      className={`rounded-xl px-4 py-3 font-bold border ${
                        q.type === "mcq"
                          ? "bg-yellow-400/20 border-yellow-400 text-yellow-200"
                          : "border-gray-700 text-gray-300"
                      }`}
                    >
                      ⭕ اختياري — 4 اختيارات
                    </button>
                  </div>

                  <textarea
                    value={q.questionText}
                    onChange={(event) =>
                      updateQuestionText(q.id, event.target.value)
                    }
                    rows={4}
                    className="mt-4 w-full rounded-xl border border-gray-700 bg-[#080808] text-white p-4 leading-8 outline-none focus:border-yellow-400"
                  />

                  {image && (
                    <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
                      <div className="text-blue-300 font-bold mb-3">
                        🖼️ صورة السؤال / الخريطة
                      </div>
                      <img
                        src={image}
                        alt={`صورة السؤال ${index + 1}`}
                        className="max-h-[420px] max-w-full mx-auto object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeQuestionImage(index)}
                        className="mt-3 px-4 py-2 rounded-lg border border-red-500/40 text-red-300"
                      >
                        إزالة الصورة
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenQuestionPaste(index)}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl border border-yellow-400/60 text-yellow-300 hover:bg-yellow-400 hover:text-black transition"
                  >
                    🖼️ {image ? "استبدال صورة / خريطة" : "إضافة صورة / خريطة للسؤال"}
                  </button>

                  {openQuestionPasteIndex === index && (
                    <div
                      tabIndex={0}
                      data-question-paste="true"
                      onPaste={(event) => handleQuestionPaste(index, event)}
                      className="mt-3 rounded-2xl border-2 border-dashed border-yellow-400 bg-[#0b0b0b] p-5 outline-none focus:ring-2 focus:ring-yellow-400"
                      autoFocus
                    >
                      <div className="text-yellow-300 font-bold text-center text-lg">
                        📋 الصق الصورة أو الخريطة هنا مباشرة — Ctrl + V
                      </div>
                      <div className="text-gray-400 text-sm text-center mt-2">
                        انسخ الصورة من Google Lens أو Word ثم اضغط Ctrl + V هنا.
                      </div>
                      <label className="mt-4 mx-auto w-fit flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 text-gray-300 cursor-pointer hover:border-yellow-400">
                        📁 أو اختر صورة من الجهاز
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              setQuestionImage(index, file);
                              setOpenQuestionPasteIndex(null);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}

                  {q.type === "mcq" ? (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {LETTERS.map((letter, choiceIndex) => (
                        <div
                          key={letter}
                          className="rounded-xl border border-gray-700 bg-[#080808] p-3"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => toggleCorrectAnswer(q.id, choiceIndex)}
                              aria-pressed={q.correctAnswer === choiceIndex}
                              className={`w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center font-bold ${q.correctAnswer === choiceIndex ? "bg-green-500 border-green-300 text-black" : "border-yellow-400 text-yellow-300"}`}
                              title="اضغط للاختيار، واضغط مرة أخرى لإلغاء الاختيار"
                            >
                              {q.correctAnswer === choiceIndex ? "✓" : letter}
                            </button>
                            <textarea
                              value={q.choices?.[choiceIndex] || ""}
                              onChange={(event) =>
                                updateChoice(q.id, choiceIndex, event.target.value)
                              }
                              rows={3}
                              className="w-full bg-transparent text-white outline-none leading-7 resize-y"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {(Array.isArray(q.essayAnswers) && q.essayAnswers.length
                        ? q.essayAnswers
                        : [q.modelAnswer || ""]
                      ).map((answer, answerIndex) => (
                        <div
                          key={`${q.id}-essay-answer-${answerIndex}`}
                          className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5"
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="font-bold text-blue-200">
                              ✍️ نموذج الإجابة الفعلي — النقطة {answerIndex + 1}
                            </div>
                            {(q.essayAnswers?.length || 1) > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEssayAnswer(q.id, answerIndex)}
                                className="px-3 py-1 rounded-lg border border-red-500/40 text-red-300 text-sm"
                              >
                                حذف هذا المربع
                              </button>
                            )}
                          </div>
                          <textarea
                            value={answer || ""}
                            onChange={(event) =>
                              updateEssayAnswer(q.id, answerIndex, event.target.value)
                            }
                            rows={5}
                            placeholder={`اكتب نموذج الإجابة الخاص بالنقطة ${answerIndex + 1} هنا...`}
                            className="w-full rounded-xl border border-gray-700 bg-[#080808] text-white p-4 leading-8 outline-none focus:border-blue-400"
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addEssayAnswer(q.id)}
                        className="w-full rounded-xl border border-dashed border-blue-400/60 bg-blue-500/5 px-4 py-3 font-bold text-blue-200 hover:border-blue-300 hover:bg-blue-500/10"
                      >
                        ＋ إضافة مربع إجابة للنقطة التالية
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={saveDraft}
              disabled={savingDraft}
              className="px-7 py-3 rounded-xl bg-green-500 text-black font-bold disabled:opacity-40"
            >
              {savingDraft ? "⏳ جاري الحفظ..." : "💾 حفظ المسودة محليًا"}
            </button>

            <button
              type="button"
              onClick={saveQuestionsToBank}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-yellow-400 text-black font-black disabled:opacity-40"
            >
              {saving
                ? "⏳ جاري الحفظ والتوزيع..."
                : "💾 حفظ وتوزيع الأسئلة في بنك الأسئلة"}
            </button>

            <button
              type="button"
              onClick={clearDraft}
              disabled={saving}
              className="px-7 py-3 rounded-xl border border-red-500/50 text-red-300 font-bold disabled:opacity-40"
            >
              🗑️ حذف المسودة
            </button>
          </div>

          <div className="mt-4 p-4 rounded-xl border border-gray-800 text-gray-400 leading-7">
            <b className="text-yellow-300">بعد الحفظ الفعلي:</b> الأسئلة تدخل بنك الأسئلة بالربط المحدد، مع المصدر والقسم ورقم السؤال الأصلي، والإجابة الصحيحة التي حددتها للاختياري ونماذج إجابة المقالي.
          </div>
        </section>
      )}
    </div>
  );
}

function SelectBox({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  getOptionLabel = (item) => getTitle(item, item.id),
}) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-gray-200 mb-2">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-gray-700 bg-[#080808] text-white p-3 outline-none focus:border-yellow-400 disabled:opacity-40"
      >
        <option value="">{placeholder}</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {getOptionLabel(item)}
          </option>
        ))}
      </select>
    </label>
  );
}
