// src/pages/teacher/ExamBuilder.jsx — LIVE /super-admin/add-exam BUILDER

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

/*
========================================================
EXAM BUILDER
========================================================

يستخدمه:
Teacher
Admin
Super Admin

يدعم:

1) امتحان مرتبط بدرس
2) إنشاء الأسئلة يدويًا
3) توليد الأسئلة من ملف بالذكاء الاصطناعي
4) اختيار من متعدد
5) أسئلة مقالية
6) نموذج إجابة
7) عناصر الإجابة
8) مبررات صحة الإجابة
9) درجة السؤال
10) مستوى الصعوبة
11) معاينة
12) حفظ كمسودة
13) نشر الآن
14) جدولة النشر

لاحقًا:
Question Bank مستقل
========================================================
*/

const LETTERS = ["أ", "ب", "ج", "د"];

const ESSAY_TYPES = [
  { value: "analyze", label: "حلّل" },
  { value: "discuss", label: "ناقش" },
  { value: "compare", label: "قارن" },
  { value: "explain_why", label: "بم تفسّر؟" },
  { value: "results", label: "ما النتائج المترتبة على؟" },
  { value: "effects", label: "ما الآثار المترتبة على؟" },
  { value: "justify", label: "برّر إجابتك" },
  { value: "explain", label: "فسّر" },
  { value: "clarify", label: "وضّح" },
  { value: "mention", label: "اذكر" },
  { value: "deduce", label: "استنتج" },
  { value: "extract", label: "استخرج" },
  { value: "answer", label: "أجب عن السؤال التالي" },
];

const createQuestion = () => ({
  id: `${Date.now()}-${Math.random()}`,

  type: "mcq",

  essayType: "analyze",

  questionText: "",

  choices: ["", "", "", ""],

  // شكل عرض الاختيارات: vertical | row4 | grid2x2
  choiceLayout: "vertical",

  correctAnswer: 0,

  /*
  الإجابة النموذجية
  */
  modelAnswer: "",

  /*
  عناصر الإجابة الأساسية
  */
  answerCriteria: [""],

  /*
  سبب صحة الإجابة في MCQ
  */
  correctReason: "",

  /*
  لماذا الاختيارات الأخرى خاطئة
  */
  wrongReasons: ["", "", ""],

  marks: 1,

  difficulty: "medium",

  source: "manual",

  sourceFileName: "",

  // صورة أو خريطة مرتبطة بالسؤال
  imageUrl: "",
});

/*
========================================================
COMPONENT
========================================================
*/

const SECONDARY_GRADE_IDS = ["sec1", "sec2", "sec3", "bac1", "bac2", "bac3"];
const GENERAL_GRADE_IDS = ["sec1", "sec2", "sec3"];
const BAC_GRADE_IDS = ["bac1", "bac2", "bac3"];

const getItemTitle = (item) =>
  item?.title ||
  item?.name ||
  item?.nameAr ||
  item?.subject ||
  item?.subjectName ||
  item?.label ||
  item?.subjectKey ||
  item?.id ||
  "";

const normalizeSubjectValue = (value) =>
  String(value || "").trim().toLowerCase();

const isHistorySubjectItem = (item) => {
  const id = normalizeSubjectValue(item?.id);
  const key = normalizeSubjectValue(item?.subjectKey);
  const subjectId = normalizeSubjectValue(item?.subjectId);
  const title = normalizeSubjectValue(getItemTitle(item));

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
  const title = normalizeSubjectValue(getItemTitle(item));

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
  const title = normalizeSubjectValue(getItemTitle(item));

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
  const title = normalizeSubjectValue(getItemTitle(item));

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
  const title = normalizeSubjectValue(getItemTitle(item));

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

export default function ExamBuilder() {
  const navigate = useNavigate();

  /*
  ========================================================
  ROUTE CONTEXT
  ========================================================
  
  ExamBuilder قد يُفتح من داخل الدرس، لذلك لا نبدأ بصف/مادة
  فارغين إذا كانت بياناتهما موجودة في رابط الصفحة.

  ندعم الشكلين: 
  /teacher/exam-builder/:gradeId/:subjectId/:unitId/:lessonId
  /teacher/exam-builder/:gradeId/:subjectId/unit/:unitNumber/:lessonId
  ========================================================
  */
  const routeParams = useParams();
  const routeParts = window.location.pathname
    .split("/")
    .filter(Boolean);
  const examBuilderIndex = routeParts.indexOf("exam-builder");
  const routeGradeId =
    routeParams.gradeId ||
    (examBuilderIndex >= 0 ? routeParts[examBuilderIndex + 1] : "") ||
    "";
  const routeSubjectId =
    routeParams.subjectId ||
    (examBuilderIndex >= 0 ? routeParts[examBuilderIndex + 2] : "") ||
    "";
  const routeRemainder =
    examBuilderIndex >= 0
      ? routeParts.slice(examBuilderIndex + 3)
      : [];
  const routeUnitId =
    routeParams.unitId ||
    (routeRemainder[0] === "unit"
      ? routeRemainder[1] || ""
      : routeRemainder[0] || "");
  const routeLessonId =
    routeParams.lessonId ||
    (routeRemainder[0] === "unit"
      ? routeRemainder[2] || ""
      : routeRemainder[1] || "");

  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [dataLoading, setDataLoading] = useState({ grades: false, subjects: false, units: false, lessons: false });
  const [stageId, setStageId] = useState("secondary");
  const [systemId, setSystemId] = useState(
    BAC_GRADE_IDS.includes(routeGradeId) ? "bac" : routeGradeId ? "general" : ""
  );
  const [gradeId, setGradeId] = useState(routeGradeId || "");
  const [subjectId, setSubjectId] = useState(routeSubjectId || "");
  const [subject, setSubject] = useState("");
  const [examScope, setExamScope] = useState("lesson");
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);
  const [titleTouched, setTitleTouched] = useState(false);

  /*
  ========================================================
  بيانات الامتحان
  ========================================================
  */

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [duration, setDuration] =
    useState(30);
  useEffect(() => {
    let cancelled = false;

    const loadGrades = async () => {
      setDataLoading((p) => ({ ...p, grades: true }));

      try {
        const snap = await getDocs(
          query(
            collection(db, "grades"),
            where("active", "==", true),
            where("stageId", "==", "secondary")
          )
        );

        if (!cancelled) {
          const loaded = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((grade) => SECONDARY_GRADE_IDS.includes(grade.id))
            .sort(
              (a, b) =>
                Number(a.order ?? 999999) -
                Number(b.order ?? 999999)
            );

          setGrades(loaded);
        }
      } catch (error) {
        console.error("Load secondary grades error:", error);

        if (!cancelled) {
          setGrades([]);
        }
      } finally {
        if (!cancelled) {
          setDataLoading((p) => ({ ...p, grades: false }));
        }
      }
    };

    loadGrades();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  ========================================================
  LOAD SUBJECTS
  ========================================================

  المصدر الحقيقي حسب النظام:

  الثانوية العامة:
  gradeSubjects
  stageId = secondary
  gradeId = الصف
  active = true

  البكالوريا:
  - bac1: subjects
  - bac2 / bac3: trackSubjects

  مهم:
  - في الثانوية العامة نستخدم subject.subjectId
    لأنه هو الـ ID الذي تستخدمه الوحدات والمسارات.
  - في bac1 نستخدم Firestore document ID
    لأن BacSubjectsView تستخدم subject.id.
  - في bac2 / bac3 نستخدم subjectId من trackSubjects
    لأنه هو الـ ID الذي تستخدمه BacAdvancedSubjectsView
    للوصول إلى الوحدات.
  ========================================================
  */

  useEffect(() => {
    if (!gradeId) {
      setSubjects([]);
      setSubjectId("");
      setSubject("");
      setUnits([]);
      setLessons([]);
      setSelectedUnitIds([]);
      setSelectedLessonIds([]);
      return;
    }

    let cancelled = false;

    const loadSubjects = async () => {
      setDataLoading((p) => ({ ...p, subjects: true }));

      try {
        const currentGradeId = String(gradeId).trim();
        let data = [];

        /*
        --------------------------------------------------------
        نحدد مصدر البيانات من الصف نفسه، وليس من systemId في state.
        هذا يمنع اختفاء مواد البكالوريا إذا كانت قيمة systemId
        الموجودة في وثيقة الصف مختلفة عن القيمة المستخدمة في الواجهة.
        --------------------------------------------------------
        */

        if (BAC_GRADE_IDS.includes(currentGradeId)) {
          if (currentGradeId === "bac1") {
            /*
            البكالوريا الأولى: التاريخ موروث من الثانوية العامة.

            نقرأ نفس مصدر الثانوية العامة للصف الأول (sec1)،
            ثم نعرض مادة التاريخ منه كما هي.
            لا نستخدم subjects الخاصة بـ bac1 حتى لا تظهر الرياضيات.
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
            /*
            البكالوريا الثانية:
            المصدر الفعلي في BacAdvancedSubjectsView هو gradeSubjects.

            لا نضع اسم المادة داخل ExamBuilder ولا نفلتر بالاسم؛
            نقرأ كل مواد bac2 الموجودة فعليًا في gradeSubjects.
            وبحسب الصفحة الحالية، هذا هو المكان الذي توجد فيه
            مادة التاريخ الوطني.
            */
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
          } else {
            /*
            البكالوريا الثالثة:
            نطابق المواد التي تظهر حاليًا في صفحة البكالوريا.
            */
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
          }
        } else if (GENERAL_GRADE_IDS.includes(currentGradeId)) {
          /* الثانوية العامة: التاريخ والجغرافيا فقط */
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
              // الثانوية العامة:
              // sec1 = التاريخ فقط
              // sec2/sec3 = التاريخ + الجغرافيا
              // الرياضيات لا تظهر في ExamBuilder.
              if (currentGradeId === "sec1") {
                return isHistorySubjectItem(item) && !isMathSubjectItem(item);
              }

              if (currentGradeId === "sec2" || currentGradeId === "sec3") {
                return (
                  (isHistorySubjectItem(item) || isGeographySubjectItem(item)) &&
                  !isMathSubjectItem(item)
                );
              }

              return false;
            });
        }

        data.sort((a, b) => {
          const orderA = Number(a?.order ?? 999999);
          const orderB = Number(b?.order ?? 999999);

          if (orderA !== orderB) {
            return orderA - orderB;
          }

          return getItemTitle(a).localeCompare(
            getItemTitle(b),
            "ar"
          );
        });

        console.log("ExamBuilder subjects loaded:", {
          gradeId: currentGradeId,
          source:
            currentGradeId === "bac1"
              ? "subjects"
              : currentGradeId === "bac2"
              ? "gradeSubjects"
              : currentGradeId === "bac3"
              ? "trackSubjects"
              : "gradeSubjects",
          subjects: data,
        });

        if (!cancelled) {
          setSubjects(data);

          setSubjectId((current) =>
            current && data.some((item) => item.id === current)
              ? current
              : ""
          );
        }
      } catch (error) {
        console.error(
          "❌ Error loading subjects from Firestore:",
          error
        );

        if (!cancelled) {
          setSubjects([]);
          setSubjectId("");
          setSubject("");
        }
      } finally {
        if (!cancelled) {
          setDataLoading((p) => ({
            ...p,
            subjects: false,
          }));
        }
      }
    };

    loadSubjects();

    return () => {
      cancelled = true;
    };
  }, [gradeId]);

  /*
  ========================================================
  RESTORE SUBJECT FROM ROUTE
  ========================================================
  إذا دخلنا من LessonPlayer برابط يحتوي على history مثل:
  /teacher/exam-builder/sec1/history/...
  يجب أن يظهر التاريخ مباشرة، ولا نطلب من المعلم اختياره مرة أخرى.
  ========================================================
  */
  useEffect(() => {
    if (!routeSubjectId || !subjects.length) return;

    const matchedSubject = subjects.find((item) => {
      const ids = [
        item?.id,
        item?.subjectId,
        item?.subjectKey,
        item?.docId,
      ]
        .filter(Boolean)
        .map((value) => String(value).trim().toLowerCase());

      return ids.includes(String(routeSubjectId).trim().toLowerCase());
    });

    if (matchedSubject) {
      const actualId =
        matchedSubject.id ||
        matchedSubject.subjectId ||
        matchedSubject.docId ||
        routeSubjectId;

      setSubjectId((current) => current || actualId);
      setSubject((current) =>
        current || getItemTitle(matchedSubject)
      );
    }
  }, [routeSubjectId, subjects]);

  /*
  ========================================================
  RESTORE UNIT FROM ROUTE
  ========================================================
  إذا كان الرابط يستخدم /unit/1 بدل Document ID، نطابق الرقم
  مع id / unitId / publicUnitId / order للوحدة الحالية.
  ========================================================
  */
  useEffect(() => {
    if (!routeUnitId || !units.length) return;
    if (selectedUnitIds.length) return;

    const normalizedRouteUnit = String(routeUnitId).trim().toLowerCase();
    const numericRouteUnit = Number(routeUnitId);

    const matchedUnit = units.find((unit) => {
      const candidates = [
        unit?.id,
        unit?.unitId,
        unit?.publicUnitId,
        unit?.unitKey,
      ]
        .filter(Boolean)
        .map((value) => String(value).trim().toLowerCase());

      if (candidates.includes(normalizedRouteUnit)) return true;

      return Number.isFinite(numericRouteUnit) &&
        Number(unit?.order) === numericRouteUnit;
    });

    if (matchedUnit?.id) {
      setSelectedUnitIds([matchedUnit.id]);
    }
  }, [routeUnitId, units, selectedUnitIds.length]);

  const selectedSubjectItem = subjects.find(
    (item) => item.id === subjectId
  );

  const selectedSubjectTitle =
    getItemTitle(selectedSubjectItem);

  /*
  ========================================================
  CURRICULUM SOURCE GRADE
  ========================================================

  البكالوريا الأولى في التاريخ موروثة من sec1،
  لذلك الوحدات والدروس تُقرأ من منهج sec1 كما هو.
  ========================================================
  */

  const isBacFirstHistory =
    systemId === "bac" &&
    gradeId === "bac1" &&
    isHistorySubjectItem(selectedSubjectItem);

  const curriculumGradeId =
    isBacFirstHistory ? "sec1" : gradeId;

  /*
  ========================================================
  لا يوجد منهج hard-coded داخل الـBuilder.

  الوحدات / الفصول المعروضة هي نفس documents
  الموجودة فعليًا في Firestore.
  ========================================================
  */

  const getCurriculumStructureLabel = () => {
    return "الوحدات / الفصول";
  };

  const getCurriculumItemLabel = (item, index) => {
    return (
      item?.title ||
      item?.name ||
      item?.nameAr ||
      item?.label ||
      `العنصر ${index + 1}`
    );
  };


  /*
  ========================================================
  LOAD UNITS
  ========================================================

  المصدر الحقيقي:

  الثانوية العامة:
  units
  systemId = general
  gradeId = الصف
  subjectId = subject.subjectId

  البكالوريا:
  units
  systemId = bac
  gradeId = الصف
  subjectId = subject.id

  لا يوجد fallback إلى نظام أو صف آخر؛
  حتى لا يظهر للمعلم منهج غير تابع للاختيار الحالي.
  ========================================================
  */

  useEffect(() => {
    if (!gradeId || !subjectId || !systemId) {
      setUnits([]);
      setLessons([]);
      setSelectedUnitIds([]);
      setSelectedLessonIds([]);
      return;
    }

    let cancelled = false;

    const loadUnits = async () => {
      setDataLoading((p) => ({
        ...p,
        units: true,
      }));

      try {
        /*
        في bac1 + التاريخ نستخدم منهج sec1 الموروث.
        نبحث أولًا في systemId العام المستخدم مع sec1،
        ثم نستخدم fallback بدون systemId إذا لزم.
        */
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

        /*
        إذا كانت الوحدات القديمة لا تحتوي systemId،
        نقرأها بالصف + المادة فقط.
        */
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

        const loaded = snap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort(
            (a, b) =>
              Number(a.order ?? 999999) -
              Number(b.order ?? 999999)
          );

        console.log("ExamBuilder units loaded:", {
          systemId,
          curriculumGradeId,
          subjectId,
          isBacFirstHistory,
          units: loaded,
        });

        setUnits(loaded);
      } catch (error) {
        console.error(
          "❌ Error loading units from Firestore:",
          error
        );

        if (!cancelled) {
          setUnits([]);
        }
      } finally {
        if (!cancelled) {
          setDataLoading((p) => ({
            ...p,
            units: false,
          }));
        }
      }
    };

    loadUnits();

    return () => {
      cancelled = true;
    };
  }, [
    gradeId,
    subjectId,
    systemId,
    curriculumGradeId,
    isBacFirstHistory,
  ]);

  /*
  ========================================================
  LOAD LESSONS — FROM THE REAL LESSON DOCUMENTS
  ========================================================

  المصدر الفعلي المؤكد في النظام:

  lessons/{lessonId}

  وكل درس فعلي يحتوي على:
  - gradeId
  - subjectId
  - unitId
  - title
  - order
  - active

  وهو نفس أسلوب القراءة المستخدم في LessonsView.

  مهم:
  لا نكتب أسماء الدروس يدويًا هنا.
  ExamBuilder يأخذ أسماء الدروس مباشرة من:
  lesson.title

  والربط يتم بالـ Firestore document ID الحقيقي للوحدة:
  lesson.unitId === unit.id
  ========================================================
  */

  useEffect(() => {
    if (!selectedUnitIds.length) {
      setLessons([]);
      setSelectedLessonIds([]);
      return;
    }

    let cancelled = false;

    const loadLessons = async () => {
      setDataLoading((p) => ({ ...p, lessons: true }));

      try {
        const results = await Promise.all(
          selectedUnitIds.map(async (selectedId) => {
            const selectedUnit = units.find(
              (unit) => unit.id === selectedId
            );

            /*
              لا نفترض أن ID الوحدة في مستند lesson هو بالضرورة
              Firestore document ID للوحدة.

              نأخذ كل المعرفات الفعلية الموجودة في مستند الوحدة،
              ثم نبحث بها داخل Top-Level lessons، وهو نفس المصدر
              الذي تستخدمه LessonsView فعليًا.
            */
            const unitReferences = [
              selectedId,
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

            /* 1) نفس الاستعلام الحرفي المستخدم في LessonsView */
            try {
              const exactSnap = await getDocs(
                query(
                  collection(db, "lessons"),
                  where("gradeId", "==", curriculumGradeId),
                  where("subjectId", "==", subjectId),
                  where("unitId", "==", selectedId)
                )
              );

              data = exactSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                selectedUnitId: selectedId,
              }));
            } catch (error) {
              console.warn(
                "Lessons exact lookup failed:",
                error
              );
            }

            /*
              2) إذا كان unitId داخل lesson يستخدم معرفًا آخر
                 محفوظًا في مستند الوحدة، نجرب كل المعرفات الفعلية.
            */
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
                        selectedUnitId: selectedId,
                      }))
                      .filter((lesson) => {
                            const lessonGrade =
                          lesson.gradeId ?? lesson.grade ?? lesson.gradeKey;
                        const lessonSubject =
                          lesson.subjectId ?? lesson.subject ?? lesson.subjectKey;

                        const gradeMatches =
                          lessonGrade == null ||
                          String(lessonGrade) === String(curriculumGradeId);

                        const subjectMatches =
                          lessonSubject == null ||
                          String(lessonSubject) === String(subjectId);

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

            /*
              3) المصدر النهائي: اقرأ Top-Level lessons مرة واحدة
                 ثم اربط الدروس بالوحدة من بياناتها الفعلية.

                 هذا مهم لأن بعض البيانات القديمة قد لا تحتوي
                 gradeId/subjectId بنفس الصيغة، أو قد تستخدم
                 unitId مختلفًا عن document ID للوحدة.
            */
            if (!data.length) {
              try {
                const allLessonsSnap = await getDocs(
                  collection(db, "lessons")
                );

                const lessons = allLessonsSnap.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                  selectedUnitId: selectedId,
                }));

                data = lessons.filter((lesson) => {
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

                  const unitMatches = lessonUnitReferences.some(
                    (value) => referenceStrings.includes(value)
                  );

                  if (!unitMatches) return false;

                  /* إذا كانت بيانات الدرس تحمل grade/subject،
                     نتحقق منهما أيضًا. */
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
              } catch (error) {
                console.error(
                  "❌ ExamBuilder all-lessons fallback failed:",
                  error
                );
              }
            }

            return data;
          })
        );

        if (cancelled) return;

        const data = results
          .flat()
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

        console.log("ExamBuilder REAL lessons loaded:", {
          curriculumGradeId,
          subjectId,
          selectedUnitIds,
          count: data.length,
          lessons: data.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            name: lesson.name,
            publicLessonId: lesson.publicLessonId,
            gradeId: lesson.gradeId,
            subjectId: lesson.subjectId,
            unitId: lesson.unitId,
            order: lesson.order,
            active: lesson.active,
          })),
        });

        setLessons(data);

        setSelectedLessonIds((previous) =>
          previous.filter((id) =>
            data.some((lesson) => lesson.id === id)
          )
        );
      } catch (error) {
        console.error(
          "❌ Error loading REAL lessons from Firestore:",
          error
        );

        if (!cancelled) {
          setLessons([]);
          setSelectedLessonIds([]);
        }
      } finally {
        if (!cancelled) {
          setDataLoading((p) => ({
            ...p,
            lessons: false,
          }));
        }
      }
    };

    loadLessons();

    return () => {
      cancelled = true;
    };
  }, [
    selectedUnitIds,
    units,
    curriculumGradeId,
    subjectId,
  ]);

  const handleSystemChange = (value) => {
    setSystemId(value);
    setStageId("secondary");

    const firstGrade = value === "bac" ? "bac1" : "sec1";
    setGradeId(firstGrade);
    setSubjectId("");
    setSubject("");
    setUnits([]);
    setLessons([]);
    setSelectedUnitIds([]);
    setSelectedLessonIds([]);
    setTitleTouched(false);
  };

  const handleGradeChange = (value) => {
    const nextSystemId = BAC_GRADE_IDS.includes(value)
      ? "bac"
      : "general";

    setGradeId(value);
    setStageId("secondary");
    setSystemId(nextSystemId);
    setSubjectId("");
    setSubject("");
    setSelectedUnitIds([]);
    setSelectedLessonIds([]);
    setUnits([]);
    setLessons([]);
    setTitleTouched(false);
  };

  const handleSubjectChange = (value) => {
    const item = subjects.find(
      (subjectItem) => subjectItem.id === value
    );

    setSubjectId(value);
    setSubject(
      item?.title ||
      item?.name ||
      item?.subject ||
      item?.nameAr ||
      ""
    );
    setSelectedUnitIds([]);
    setSelectedLessonIds([]);
    setLessons([]);
    setTitleTouched(false);
  };

  const toggleLimitedSelection = (current, value, limit) => {
    if (current.includes(value)) {
      return current.filter((item) => item !== value);
    }

    if (current.length >= limit) {
      alert(`يمكن اختيار ${limit} عناصر كحد أقصى.`);
      return current;
    }

    return [...current, value];
  };

  const handleScopeChange = (value) => {
    setExamScope(value);

    if (value === "lesson") {
      setSelectedUnitIds((prev) => prev.slice(0, 1));
      setSelectedLessonIds((prev) => prev.slice(0, 1));
    } else if (value === "unit") {
      setSelectedUnitIds((prev) => prev.slice(0, 1));
      setSelectedLessonIds([]);
    } else if (value === "half" || value === "full") {
      setSelectedUnitIds([]);
      setSelectedLessonIds([]);
    }
  };

  const primaryUnitId =
    selectedUnitIds.length === 1 ? selectedUnitIds[0] : "";

  const primaryLessonId =
    selectedLessonIds.length === 1 ? selectedLessonIds[0] : "";

  /*
  ========================================================
  مصدر إنشاء الأسئلة
  ========================================================
  */

  const [questionSource, setQuestionSource] =
    useState("manual");

  /*
  ========================================================
  بنك الأسئلة
  ========================================================
  */

  const [bankQuestionCount, setBankQuestionCount] =
    useState(10);

  const [bankQuestionType, setBankQuestionType] =
    useState("mcq");

  const [bankDifficulty, setBankDifficulty] =
    useState("");

  const [bankLoading, setBankLoading] =
    useState(false);

  /*
  ========================================================
  ملف الذكاء الاصطناعي
  ========================================================
  */

  const [aiFile, setAiFile] =
    useState(null);

  const [aiFileName, setAiFileName] =
    useState("");
   const [aiUploadedFileId, setAiUploadedFileId] = useState("");

  const [aiQuestionCount, setAiQuestionCount] =
    useState(10);

  const [aiDifficulty, setAiDifficulty] =
    useState("medium");

  const [aiIncludeMcq, setAiIncludeMcq] =
    useState(true);

  const [aiIncludeEssay, setAiIncludeEssay] =
    useState(true);

  const [aiGenerating, setAiGenerating] =
    useState(false);

  /*
  ========================================================
  حالة تقدم توليد الأسئلة بالذكاء الاصطناعي
  ========================================================
  */

  const [aiProgress, setAiProgress] =
    useState({
      progress: 0,
      stage: "idle",
      stageLabel: "",
    });

  /*
  ========================================================
  الأسئلة
  ========================================================
  */

  const [questions, setQuestions] =
    useState([createQuestion()]);

  /*
  ========================================================
  حفظ الأسئلة في بنك الأسئلة
  ========================================================
  */

  const [bankSavingIndex, setBankSavingIndex] =
    useState(null);

  const [bankSavingAll, setBankSavingAll] =
    useState(false);

  /*
  ========================================================
  النشر
  ========================================================
  */

  const [publishMode, setPublishMode] =
    useState("draft");

  const [publishDate, setPublishDate] =
    useState("");

  const [publishTime, setPublishTime] =
    useState("");

  /*
  ========================================================
  الواجهة
  ========================================================
  */

  const [saving, setSaving] =
    useState(false);

  const [previewOpen, setPreviewOpen] =
    useState(false);

  /*
  ========================================================
  إضافة سؤال
  ========================================================
  */

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      createQuestion(),
    ]);
  };

  /*
  ========================================================
  حذف سؤال
  ========================================================
  */

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      alert(
        "يجب أن يحتوي الامتحان على سؤال واحد على الأقل."
      );
      return;
    }

    setQuestions((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  /*
  ========================================================
  تعديل السؤال
  ========================================================
  */

  const updateQuestion = (
    index,
    field,
    value
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index
          ? {
              ...q,
              [field]: value,
            }
          : q
      )
    );
  };

  /*
  ========================================================
  تعديل اختيار
  ========================================================
  */

  const updateChoice = (
    questionIndex,
    choiceIndex,
    value
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) {
          return q;
        }

        const choices = [
          ...q.choices,
        ];

        choices[choiceIndex] =
          value;

        return {
          ...q,
          choices,
        };
      })
    );
  };

  /*
  ========================================================
  تعديل سبب خطأ الاختيارات
  ========================================================
  */

  const updateWrongReason = (
    questionIndex,
    reasonIndex,
    value
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) {
          return q;
        }

        const reasons = [
          ...(q.wrongReasons || []),
        ];

        reasons[reasonIndex] =
          value;

        return {
          ...q,
          wrongReasons: reasons,
        };
      })
    );
  };

  /*
  ========================================================
  تغيير نوع السؤال
  ========================================================
  */

  const changeQuestionType = (
    index,
    type
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== index) {
          return q;
        }

        if (type === "essay") {
          return {
            ...q,

            type: "essay",

            essayType:
              q.essayType ||
              "analyze",

            choices: [],

            correctAnswer: null,

            modelAnswer:
              q.modelAnswer || "",

            answerCriteria:
              q.answerCriteria?.length
                ? q.answerCriteria
                : [""],
          };
        }

        return {
          ...q,

          type: "mcq",

          choices:
            q.choices?.length === 4
              ? q.choices
              : ["", "", "", ""],

          choiceLayout:
            q.choiceLayout ||
            "vertical",

          correctAnswer:
            q.correctAnswer ??
            0,

          modelAnswer: "",

          answerCriteria: [""],

          correctReason:
            q.correctReason || "",

          wrongReasons:
            q.wrongReasons?.length === 3
              ? q.wrongReasons
              : ["", "", ""],
        };
      })
    );
  };

  /*
  ========================================================
  إضافة عنصر إجابة
  ========================================================
  */

  const addAnswerCriterion = (
    questionIndex
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              answerCriteria: [
                ...(q.answerCriteria || []),
                "",
              ],
            }
          : q
      )
    );
  };

  /*
  ========================================================
  تعديل عنصر إجابة
  ========================================================
  */

  const updateAnswerCriterion = (
    questionIndex,
    criterionIndex,
    value
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) {
          return q;
        }

        const criteria = [
          ...(q.answerCriteria || []),
        ];

        criteria[criterionIndex] =
          value;

        return {
          ...q,
          answerCriteria:
            criteria,
        };
      })
    );
  };

  /*
  ========================================================
  حذف عنصر إجابة
  ========================================================
  */

  const removeAnswerCriterion = (
    questionIndex,
    criterionIndex
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) {
          return q;
        }

        const criteria = [
          ...(q.answerCriteria || []),
        ];

        if (criteria.length === 1) {
          return {
            ...q,
            answerCriteria: [""],
          };
        }

        return {
          ...q,
          answerCriteria:
            criteria.filter(
              (_, ci) =>
                ci !== criterionIndex
            ),
        };
      })
    );
  };

  /*
  ========================================================
  استدعاء أسئلة فعلية من بنك الأسئلة
  ========================================================

  الـBackend الحالي يدعم:
  POST /api/question-bank/random/select

  ويشترط lessonId.
  لذلك:
  - نطاق الدرس: يستدعي البنك للدرس المحدد.
  - نطاق الوحدة: يوزع العدد المطلوب على دروس الوحدة.
  - نصف/كامل المنهج: لا نخترع درسًا؛ نطلب اختيار درس/وحدة
    لأن endpoint البنك الحالي مبني على lessonId.
  ========================================================
  */

  const loadQuestionsFromBank = async () => {
    if (!gradeId || !subjectId) {
      alert("اختر الصف والمادة أولًا.");
      return;
    }

    if (!bankQuestionCount || Number(bankQuestionCount) < 1) {
      alert("عدد أسئلة بنك الأسئلة غير صحيح.");
      return;
    }

    let targetLessonIds = [];

    if (examScope === "lesson") {
      if (!primaryLessonId) {
        alert("اختر الدرس أولًا لاستدعاء أسئلة بنك الأسئلة.");
        return;
      }

      targetLessonIds = [primaryLessonId];
    } else if (examScope === "unit") {
      if (!selectedUnitIds.length) {
        alert("اختر الوحدة أولًا.");
        return;
      }

      targetLessonIds = lessons
        .filter((lesson) =>
          selectedUnitIds.includes(
            lesson.selectedUnitId || lesson.unitId
          )
        )
        .map((lesson) => lesson.id)
        .filter(Boolean);
    } else {
      alert(
        "بنك الأسئلة الحالي يستدعي الأسئلة حسب الدرس. اختر «درس» أو «وحدة» حتى يتم الاستدعاء من البنك فعليًا."
      );
      return;
    }

    if (!targetLessonIds.length) {
      alert("لا توجد دروس مرتبطة بالاختيار الحالي.");
      return;
    }

    try {
      setBankLoading(true);

      const existingBankIds = questions
        .map((q) => q.questionBankId)
        .filter(Boolean)
        .map((id) => String(id));

      const totalRequested = Number(bankQuestionCount);
      const baseCount = Math.floor(
        totalRequested / targetLessonIds.length
      );
      const remainder =
        totalRequested % targetLessonIds.length;

      const requests = targetLessonIds
        .map((lessonId, index) => ({
          lessonId,
          count:
            baseCount + (index < remainder ? 1 : 0),
        }))
        .filter((item) => item.count > 0);

      const responses = await Promise.all(
        requests.map((request) =>
          api.post(
            "/api/question-bank/random/select",
            {
              lessonId: request.lessonId,
              count: request.count,
              type: bankQuestionType || undefined,
              difficulty: bankDifficulty || undefined,
              excludeIds: existingBankIds,
            },
            {
              timeout: 30000,
            }
          )
        )
      );

      const bankQuestions = responses
        .flatMap((response) =>
          Array.isArray(response.data?.questions)
            ? response.data.questions
            : []
        );

      if (!bankQuestions.length) {
        alert(
          "لم يتم العثور على أسئلة مطابقة في بنك الأسئلة لهذا الاختيار."
        );
        return;
      }

      const normalized = bankQuestions.map((q) => {
        const type =
          q.type === "essay" ? "essay" : "mcq";

        const bankId = String(
          q._id || q.id || ""
        );

        return {
          id: `${Date.now()}-${Math.random()}`,

          type,

          essayType:
            q.essayType || "analyze",

          questionText:
            q.questionText ||
            q.question ||
            "",

          choices:
            type === "mcq"
              ? Array.isArray(q.choices)
                ? q.choices.slice(0, 4)
                : ["", "", "", ""]
              : [],

          choiceLayout:
            q.choiceLayout ||
            "vertical",

          correctAnswer:
            type === "mcq"
              ? Number(q.correctAnswer ?? 0)
              : null,

          modelAnswer:
            type === "essay"
              ? q.modelAnswer || ""
              : "",

          answerCriteria:
            type === "essay"
              ? Array.isArray(q.gradingCriteria)
                ? q.gradingCriteria
                : Array.isArray(q.answerCriteria)
                ? q.answerCriteria
                : [""]
              : [],

          correctReason:
            type === "mcq"
              ? q.correctReason || ""
              : "",

          wrongReasons:
            type === "mcq"
              ? Array.isArray(q.wrongReasons)
                ? q.wrongReasons
                : ["", "", ""]
              : [],

          marks:
            Number(q.marks) ||
            (type === "essay" ? 5 : 1),

          difficulty:
            q.difficulty || "medium",

          source: "question_bank",

          sourceFileName:
            q.sourceName || "",

          imageUrl:
            q.imageUrl || "",

          // نحتفظ به داخليًا لتسجيل الاستخدام بعد حفظ الامتحان.
          questionBankId: bankId,
        };
      });

      setQuestions((previous) => {
        const currentIsEmpty =
          previous.length === 1 &&
          !String(previous[0]?.questionText || "").trim();

        return currentIsEmpty
          ? normalized
          : [...previous, ...normalized];
      });

      setQuestionSource("question_bank");

      alert(
        `تم استدعاء ${normalized.length} سؤالًا فعليًا من بنك الأسئلة. راجعها قبل الحفظ.`
      );
    } catch (error) {
      console.error(
        "Question Bank select error:",
        error
      );

      alert(
        error.response?.data?.error ||
          error.message ||
          "حدث خطأ أثناء استدعاء الأسئلة من بنك الأسئلة."
      );
    } finally {
      setBankLoading(false);
    }
  };

  /*
  ========================================================
  حفظ سؤال في بنك الأسئلة
  ========================================================

  الـBackend الحقيقي: POST /api/question-bank
  */

  const saveQuestionToBank = async (questionIndex) => {
    const q = questions[questionIndex];

    if (!q) return false;

    if (!gradeId || !subjectId) {
      alert("اختر الصف والمادة أولًا.");
      return false;
    }

    if (!primaryLessonId) {
      alert("اختر درسًا أولًا حتى يتم ربط السؤال بهذا الدرس في بنك الأسئلة.");
      return false;
    }

    if (!String(q.questionText || "").trim()) {
      alert(`اكتب نص السؤال رقم ${questionIndex + 1} أولًا.`);
      return false;
    }

    if (q.questionBankId) {
      alert("هذا السؤال موجود بالفعل في بنك الأسئلة.");
      return true;
    }

    if (q.type === "mcq") {
      if (!Array.isArray(q.choices) || q.choices.length !== 4 || q.choices.some((choice) => !String(choice || "").trim())) {
        alert(`السؤال رقم ${questionIndex + 1} يجب أن يحتوي على 4 اختيارات مكتملة.`);
        return false;
      }

      if (q.correctAnswer === null || q.correctAnswer === undefined || Number(q.correctAnswer) < 0 || Number(q.correctAnswer) > 3) {
        alert(`حدد الإجابة الصحيحة للسؤال رقم ${questionIndex + 1}.`);
        return false;
      }
    }

    if (q.type === "essay" && !String(q.modelAnswer || "").trim()) {
      alert(`السؤال المقالي رقم ${questionIndex + 1} يحتاج إلى نموذج إجابة.`);
      return false;
    }

    try {
      setBankSavingIndex(questionIndex);

      const payload = {
        questionText: String(q.questionText || "").trim(),
        type: q.type === "essay" ? "essay" : "mcq",
        choices: q.type === "mcq" ? q.choices : [],
        choiceLayout:
          q.type === "mcq"
            ? q.choiceLayout || "vertical"
            : "vertical",
        correctAnswer: q.type === "mcq" ? Number(q.correctAnswer) : null,
        modelAnswer: q.type === "essay" ? String(q.modelAnswer || "").trim() : "",
        gradingCriteria: q.type === "essay"
          ? (q.answerCriteria || []).map((item) => String(item || "").trim()).filter(Boolean)
          : [],
        marks: Number(q.marks) || 1,
        stageId: stageId || "secondary",
        gradeId: gradeId || "",
        subjectId: subjectId || "",
        unitId: primaryUnitId || "",
        lessonId: primaryLessonId || "",
        difficulty: q.difficulty || "medium",
        source: q.source === "ai" ? "ai" : "teacher",
        sourceName: q.sourceFileName || "Exam Builder",
        explanation: q.type === "mcq"
          ? String(q.correctReason || "").trim()
          : "",
        aiGenerated: q.source === "ai",
        aiReviewed: q.source === "ai",
        active: true,
      };

      const response = await api.post(
        "/api/question-bank",
        payload,
        { timeout: 30000 }
      );

      const bankQuestion = response.data?.question;
      const bankId = bankQuestion?._id || bankQuestion?.id;

      if (!response.data?.success || !bankId) {
        throw new Error(
          response.data?.error || "لم يتم حفظ السؤال في بنك الأسئلة."
        );
      }

      setQuestions((previous) =>
        previous.map((item, index) =>
          index === questionIndex
            ? {
                ...item,
                questionBankId: String(bankId),
                source: item.source === "ai" ? item.source : "question_bank",
              }
            : item
        )
      );

      return true;
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.questionId) {
        const existingId = String(error.response.data.questionId);

        setQuestions((previous) =>
          previous.map((item, index) =>
            index === questionIndex
              ? { ...item, questionBankId: existingId }
              : item
          )
        );

        alert("السؤال موجود بالفعل في بنك أسئلة هذا الدرس، وتم ربطه به.");
        return true;
      }

      console.error("Question Bank save error:", error);
      alert(
        error.response?.data?.error ||
          error.message ||
          "حدث خطأ أثناء حفظ السؤال في بنك الأسئلة."
      );
      return false;
    } finally {
      setBankSavingIndex(null);
    }
  };

  /*
  حفظ جميع أسئلة الامتحان الحالية في البنك
  */

  const saveAllQuestionsToBank = async () => {
    if (!questions.length) {
      alert("لا توجد أسئلة لحفظها.");
      return;
    }

    if (!primaryLessonId) {
      alert("اختر الدرس أولًا حتى يتم ربط الأسئلة به في بنك الأسئلة.");
      return;
    }

    setBankSavingAll(true);

    let saved = 0;
    let skipped = 0;

    try {
      for (let index = 0; index < questions.length; index += 1) {
        if (questions[index]?.questionBankId) {
          skipped += 1;
          continue;
        }

        const ok = await saveQuestionToBank(index);
        if (ok) saved += 1;
      }

      alert(
        `تم التعامل مع ${saved} سؤالًا في بنك الأسئلة${skipped ? `، و${skipped} سؤالًا كان موجودًا بالفعل.` : "."}`
      );
    } finally {
      setBankSavingAll(false);
    }
  };

  /*
  ========================================================
  رفع ملف AI
  ========================================================
  */

  const uploadQuestionImage = async (
    questionIndex,
    file
  ) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("من فضلك اختر صورة فقط.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("حجم الصورة يجب ألا يتجاوز 10 MB.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        "/api/upload",
        formData,
        { timeout: 0 }
      );

      const fileUrl = response.data?.fileUrl;

      if (!fileUrl) {
        throw new Error(
          "تم رفع الصورة ولكن لم يستلم النظام رابط الصورة."
        );
      }

      updateQuestion(
        questionIndex,
        "imageUrl",
        fileUrl
      );

      alert("تم رفع صورة / خريطة السؤال بنجاح.");
    } catch (error) {
      console.error(
        "Question image upload error:",
        error
      );

      alert(
        error.response?.data?.error ||
          error.message ||
          "فشل رفع صورة / خريطة السؤال."
      );
    }
  };

  const removeQuestionImage = (
    questionIndex
  ) => {
    updateQuestion(
      questionIndex,
      "imageUrl",
      ""
    );
  };

  const handleAiFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setAiFile(file);

    setAiFileName(
      file.name
    );

    setAiUploadedFileId("");

    setAiProgress({
      progress: 0,
      stage: "selected",
      stageLabel:
        "تم اختيار الملف. اضغط «رفع الملف» لبدء الرفع.",
    });
  };

  /*
  ========================================================
  توليد الأسئلة بالذكاء الاصطناعي
  ========================================================
  
  ملاحظة:
  endpoint الخاص بالـAI يجب أن يكون موجودًا في الـBackend.
  
  نحن نرسل له:
  - الملف
  - الدرس
  - الصف
  - المادة
  - الوحدة
  - عدد الأسئلة
  - الأنواع المطلوبة
  - مستوى الصعوبة
  ========================================================
  */

  /*
  ========================================================
  رفع ملف AI بشكل مستقل
  ========================================================
  */

  const uploadAiSourceFile = async () => {
    if (!aiFile) {
      alert("من فضلك اختر الملف أولًا.");
      return;
    }

    try {
      setAiGenerating(true);

      setAiProgress({
        progress: 0,
        stage: "uploading",
        stageLabel: "جاري رفع الملف إلى الخادم... 0%",
      });

      const formData = new FormData();

      formData.append("file", aiFile);

      formData.append("gradeId", gradeId || "");
      formData.append("subjectId", subjectId || "");
      formData.append("unitId", primaryUnitId || "");
      formData.append("lessonId", primaryLessonId || "");
      formData.append("examScope", examScope);
      formData.append("selectedUnitIds", JSON.stringify(selectedUnitIds));
      formData.append("selectedLessonIds", JSON.stringify(selectedLessonIds));

      /*
      مهم:
      لا نضع Content-Type يدويًا مع FormData.
      Axios والمتصفح يضعان boundary الصحيح تلقائيًا.
      */

      const response = await api.post(
        "/api/ai/upload-source",
        formData,
        {
          timeout: 0,

          onUploadProgress: (event) => {
            if (!event.total) return;

            const percent = Math.round(
              (event.loaded / event.total) * 100
            );

            setAiProgress({
              progress: percent,
              stage: percent >= 100 ? "uploaded" : "uploading",
              stageLabel:
                percent >= 100
                  ? "تم رفع الملف بالكامل."
                  : `جاري رفع الملف... ${percent}%`,
            });
          },
        }
      );

      const uploadedFileId =
        response.data?.fileId;

      if (!uploadedFileId) {
        throw new Error(
          "تم رفع الملف ولكن لم يستلم النظام معرف الملف."
        );
      }

      setAiUploadedFileId(uploadedFileId);

      setAiProgress({
        progress: 100,
        stage: "uploaded",
        stageLabel:
          "✅ تم رفع الملف بالكامل. أصبح جاهزًا للتحليل والتوليد.",
      });

      alert(
        "تم رفع الملف بنجاح. يمكنك الآن بدء توليد الأسئلة."
      );

    } catch (error) {
      console.error(
        "AI source upload error:",
        error
      );

      setAiProgress({
        progress: 0,
        stage: "error",
        stageLabel:
          error.response?.data?.error ||
          error.message ||
          "فشل رفع الملف.",
      });

      alert(
        error.response?.data?.error ||
        error.message ||
        "فشل رفع الملف."
      );

    } finally {
      setAiGenerating(false);
    }
  };


  /*
  ========================================================
  توليد الأسئلة بعد اكتمال رفع الملف
  ========================================================
  */

  const generateQuestionsWithAI = async () => {
    if (!aiUploadedFileId) {
      alert(
        "يجب رفع الملف أولًا وانتظار وصول النسبة إلى 100%."
      );
      return;
    }

    if (
      !aiIncludeMcq &&
      !aiIncludeEssay
    ) {
      alert(
        "اختر نوعًا واحدًا من الأسئلة على الأقل."
      );
      return;
    }

    if (
      !aiQuestionCount ||
      Number(aiQuestionCount) < 1
    ) {
      alert(
        "عدد الأسئلة غير صحيح."
      );
      return;
    }

    try {
      setAiGenerating(true);

      setAiProgress({
        progress: 5,
        stage: "processing",
        stageLabel:
          "تم رفع الملف. جاري الآن بدء تحليل المحتوى وإنشاء الأسئلة... 5%",
      });

      const response =
        await api.post(
          "/api/ai/generate-questions",
          {
            fileId: aiUploadedFileId,
            gradeId: gradeId || "",
            subjectId: subjectId || "",
            unitId: primaryUnitId || "",
            lessonId: primaryLessonId || "",
            examScope,
            selectedUnitIds,
            selectedLessonIds,
            questionCount:
              Number(aiQuestionCount) || 10,
            difficulty:
              aiDifficulty || "medium",
            includeMcq:
              aiIncludeMcq,
            includeEssay:
              aiIncludeEssay,
          },
          {
            timeout: 0,
          }
        );

      const jobId =
        response.data?.jobId;

      if (!jobId) {
        throw new Error(
          "لم يتم إنشاء عملية التوليد."
        );
      }

      let stopped = false;

      const pollJob = async () => {
        if (stopped) return;

        try {
          const statusResponse =
            await api.get(
              `/api/ai/generate-questions/${jobId}`
            );

          const job =
            statusResponse.data;

          setAiProgress({
            progress:
              Number.isFinite(Number(job.progress))
                ? Math.max(0, Math.min(100, Number(job.progress)))
                : 0,
            stage:
              job.stage || "processing",
            stageLabel:
              job.stageLabel ||
              "جاري العمل...",
          });

          if (
            job.status === "completed"
          ) {
            stopped = true;

            const generated =
              job.questions;

            if (
              !Array.isArray(generated) ||
              generated.length === 0
            ) {
              throw new Error(
                "لم يتم إنشاء أسئلة صالحة."
              );
            }

            const normalized =
              generated.map((q) => {
                const type =
                  q.type === "essay"
                    ? "essay"
                    : "mcq";

                return {
                  id: `${Date.now()}-${Math.random()}`,

                  type,

                  essayType:
                    q.essayType ||
                    "analyze",

                  questionText:
                    q.questionText ||
                    q.question ||
                    "",

                  choices:
                    type === "mcq"
                      ? (
                          Array.isArray(
                            q.choices
                          )
                            ? q.choices
                            : Array.isArray(
                                q.options
                              )
                            ? q.options
                            : [
                                "",
                                "",
                                "",
                                "",
                              ]
                        ).slice(0, 4)
                      : [],

                  correctAnswer:
                    type === "mcq"
                      ? Number(
                          q.correctAnswer ??
                            0
                        )
                      : null,

                  modelAnswer:
                    type === "essay"
                      ? q.modelAnswer ||
                        ""
                      : "",

                  answerCriteria:
                    type === "essay"
                      ? Array.isArray(
                          q.answerCriteria
                        ) &&
                        q.answerCriteria
                          .length
                        ? q.answerCriteria
                        : [""]
                      : [],

                  correctReason:
                    type === "mcq"
                      ? q.correctReason ||
                        ""
                      : "",

                  wrongReasons:
                    type === "mcq"
                      ? Array.isArray(
                          q.wrongReasons
                        )
                        ? q.wrongReasons
                        : ["", "", ""]
                      : [],

                  marks:
                    Number(q.marks) ||
                    (type === "essay"
                      ? 5
                      : 1),

                  difficulty:
                    q.difficulty ||
                    aiDifficulty,

                  source: "ai",

                  sourceFileName:
                    aiFileName,

                  imageUrl:
                    q.imageUrl || "",
                };
              });

            setQuestions(
              normalized
            );

            setAiProgress({
              progress: 100,
              stage: "completed",
              stageLabel:
                "✅ اكتمل تحليل الملف وتوليد الأسئلة وتجهيز الإجابات.",
            });

            setAiGenerating(false);

            alert(
              `تم توليد ${normalized.length} سؤالًا. راجع الأسئلة قبل الحفظ أو النشر.`
            );

            return;
          }

          if (
            job.status === "error"
          ) {
            stopped = true;

            throw new Error(
              job.error ||
                "حدث خطأ أثناء التوليد."
            );
          }

          window.setTimeout(
            pollJob,
            1000
          );

        } catch (error) {
          stopped = true;

          setAiGenerating(false);

          setAiProgress({
            progress: 100,
            stage: "error",
            stageLabel:
              error.message ||
              "حدث خطأ أثناء التوليد.",
          });

          console.error(
            "AI generation polling error:",
            error
          );

          alert(
            error.message ||
              "حدث خطأ أثناء توليد الأسئلة."
          );
        }
      };

      pollJob();

    } catch (error) {
      console.error(
        "AI generation start error:",
        error
      );

      setAiGenerating(false);

      setAiProgress({
        progress: 0,
        stage: "error",
        stageLabel:
          error.response?.data?.error ||
          error.message ||
          "حدث خطأ أثناء بدء التوليد.",
      });

      alert(
        error.response?.data?.error ||
          error.message ||
          "حدث خطأ أثناء توليد الأسئلة."
      );
    }
  };

  /*
  ========================================================
  التحقق
  ========================================================
  */

  const validateExam = () => {
    if (!title.trim()) {
      alert(
        "من فضلك اكتب عنوان الامتحان."
      );
      return false;
    }

    if (
      !duration ||
      Number(duration) < 1
    ) {
      alert(
        "مدة الامتحان يجب أن تكون دقيقة واحدة على الأقل."
      );
      return false;
    }

    if (!gradeId || !subjectId) { alert("اختر الصف والمادة أولًا."); return false; }
    if (examScope === "lesson" && selectedLessonIds.length !== 1) { alert("في نطاق درس يجب اختيار درس واحد."); return false; }
    if (examScope === "unit" && selectedUnitIds.length !== 1) { alert("في نطاق وحدة يجب اختيار وحدة واحدة."); return false; }
    if (examScope === "custom" && !selectedUnitIds.length && !selectedLessonIds.length) { alert("في الامتحان المخصص اختر وحدة واحدة على الأقل أو درسًا واحدًا على الأقل."); return false; }
    if (selectedUnitIds.length > 3 || selectedLessonIds.length > 3) { alert("الحد الأقصى هو 3 وحدات و3 دروس."); return false; }

    if (
      !questions.length
    ) {
      alert(
        "أضف سؤالًا واحدًا على الأقل."
      );
      return false;
    }

    for (
      let i = 0;
      i < questions.length;
      i++
    ) {
      const q =
        questions[i];

      if (
        !q.questionText.trim()
      ) {
        alert(
          `السؤال رقم ${
            i + 1
          } لا يحتوي على نص.`
        );
        return false;
      }

      if (
        q.type === "mcq"
      ) {
        if (
          q.choices.length !== 4 ||
          q.choices.some(
            (choice) =>
              !String(
                choice
              ).trim()
          )
        ) {
          alert(
            `أكمل الاختيارات الأربعة للسؤال رقم ${
              i + 1
            }.`
          );
          return false;
        }

        if (
          q.correctAnswer ===
            null ||
          q.correctAnswer ===
            undefined
        ) {
          alert(
            `حدد الإجابة الصحيحة للسؤال رقم ${
              i + 1
            }.`
          );
          return false;
        }

        if (
          !q.correctReason.trim()
        ) {
          alert(
            `أضف سبب صحة الإجابة للسؤال رقم ${
              i + 1
            }.`
          );
          return false;
        }
      }

      if (
        q.type === "essay"
      ) {
        if (
          !q.modelAnswer.trim()
        ) {
          alert(
            `أضف نموذج الإجابة للسؤال المقالي رقم ${
              i + 1
            }.`
          );
          return false;
        }

        const criteria =
          (
            q.answerCriteria ||
            []
          ).filter(
            (item) =>
              String(
                item
              ).trim()
          );

        if (
          criteria.length === 0
        ) {
          alert(
            `أضف عناصر الإجابة للسؤال المقالي رقم ${
              i + 1
            }.`
          );
          return false;
        }
      }

      if (
        Number(q.marks) <= 0
      ) {
        alert(
          `درجة السؤال رقم ${
            i + 1
          } غير صحيحة.`
        );
        return false;
      }
    }

    if (
      publishMode ===
      "scheduled"
    ) {
      if (
        !publishDate ||
        !publishTime
      ) {
        alert(
          "حدد تاريخ ووقت النشر."
        );
        return false;
      }

      const date =
        new Date(
          `${publishDate}T${publishTime}`
        );

      if (
        date.getTime() <=
        Date.now()
      ) {
        alert(
          "موعد النشر يجب أن يكون في المستقبل."
        );
        return false;
      }
    }

    return true;
  };

  /*
  ========================================================
  تجهيز الأسئلة
  ========================================================
  */

  const prepareQuestions =
    () =>
      questions.map(
        (q, index) => ({
          // MongoDB Exam schema requires questionNumber.
          // Always generate it from the final question order.
          questionNumber:
            Number(q.questionNumber) || index + 1,

          questionText:
            q.questionText.trim(),

          type:
            q.type,

          marks:
            Number(q.marks) || 1,

          difficulty:
            q.difficulty,

          source:
            q.source,

          sourceFileName:
            q.sourceFileName ||
            "",

          // صورة / خريطة السؤال
          imageUrl:
            q.imageUrl ||
            "",

          lessonId:
            primaryLessonId || "",

          /*
          MCQ
          */

          choices:
            q.type === "mcq"
              ? [
                  String(q.choices?.[0] ?? "").trim(),
                  String(q.choices?.[1] ?? "").trim(),
                  String(q.choices?.[2] ?? "").trim(),
                  String(q.choices?.[3] ?? "").trim(),
                ]
              : [],

          choiceLayout:
            q.type === "mcq"
              ? q.choiceLayout || "vertical"
              : "vertical",

          correctAnswer:
            q.type === "mcq"
              ? Number(
                  q.correctAnswer
                )
              : null,

          correctReason:
            q.type === "mcq"
              ? q.correctReason ||
                ""
              : "",

          wrongReasons:
            q.type === "mcq"
              ? q.wrongReasons ||
                []
              : [],

          /*
          Essay
          */

          essayType:
            q.type === "essay"
              ? q.essayType
              : null,

          modelAnswer:
            q.type === "essay"
              ? q.modelAnswer.trim()
              : "",

          answerCriteria:
            q.type === "essay"
              ? (
                  q.answerCriteria ||
                  []
                )
                  .map(
                    (item) =>
                      String(
                        item
                      ).trim()
                  )
                  .filter(
                    Boolean
                  )
              : [],
        })
      );

  /*
  ========================================================
  النشر
  ========================================================
  */

  const getPublishing =
    () => {
      if (
        publishMode ===
        "draft"
      ) {
        return {
          status: "draft",

          publishMode:
            "manual",

          autoPublish:
            false,

          scheduledPublishAt:
            null,
        };
      }

      if (
        publishMode ===
        "publish_now"
      ) {
        return {
          status:
            "published",

          publishMode:
            "manual",

          autoPublish:
            false,

          publishedAt:
            new Date().toISOString(),

          scheduledPublishAt:
            null,
        };
      }

      const date =
        new Date(
          `${publishDate}T${publishTime}`
        );

      return {
        status:
          "scheduled",

        publishMode:
          "scheduled",

        autoPublish:
          true,

        scheduledPublishAt:
          date.toISOString(),
      };
    };

  /*
  ========================================================
  حفظ الامتحان
  ========================================================
  */

  const saveExam =
    async () => {
      if (
        !validateExam()
      ) {
        return;
      }

      try {
        setSaving(true);

        const payload = {
          title:
            title.trim(),

          description:
            description.trim(),

          stageId:
            stageId || "",

          systemId:
            systemId || "",

          // التاريخ في أولى بكالوريا وأولى ثانوي مصدر منهجي واحد.
          // لذلك نحفظ هوية المنهج المشتركة (sec1) حتى يظهر الامتحان
          // في المسارين معًا دون إنشاء امتحان/منهج مكرر.
          gradeId:
            curriculumGradeId || gradeId || "",

          subjectId:
            subjectId || "",

          subject:
            subject || "",

          examScope:
            examScope,

          selectedUnitIds:
            selectedUnitIds,

          selectedLessonIds:
            selectedLessonIds,

          // بيانات المنهج المستخدمة فعليًا في هذا الامتحان
          curriculumGradeId:
            curriculumGradeId || gradeId || "",

          unitId:
            primaryUnitId || "",

          lessonId:
            primaryLessonId || "",

          duration:
            Number(duration),

          questions:
            prepareQuestions(),

          questionsCount:
            questions.length,

          creationSource:
            questionSource,

          /*
          إعدادات بنك الأسئلة
          */

          questionBankSettings:
            {
              enabled:
                questions.some(
                  (q) => q.source === "question_bank"
                ),
              questionIds:
                questions
                  .map((q) => q.questionBankId)
                  .filter(Boolean)
                  .map((id) => String(id)),
            },

          /*
          النشر
          */

          ...getPublishing(),
        };

        const response =
          await api.post(
            "/api/exams",
            payload
          );

        if (
          response.data?.success ===
          false
        ) {
          throw new Error(
            response.data?.error ||
              "فشل حفظ الامتحان."
          );
        }

        const usedQuestionIds = questions
          .map((q) => q.questionBankId)
          .filter(Boolean)
          .map((id) => String(id));

        if (usedQuestionIds.length > 0) {
          try {
            await api.post(
              "/api/question-bank/mark-used",
              {
                questionIds: usedQuestionIds,
              },
              {
                timeout: 30000,
              }
            );
          } catch (markUsedError) {
            console.error(
              "Question Bank mark-used error:",
              markUsedError
            );
          }
        }

        alert(
          publishMode ===
            "draft"
            ? "تم حفظ الامتحان كمسودة."
            : publishMode ===
              "publish_now"
            ? "تم نشر الامتحان بنجاح."
            : "تم حفظ الامتحان وجدولة نشره."
        );

        navigate(-1);
      } catch (error) {
        console.error(
          "Save exam error:",
          error
        );

        alert(
          error.response?.data
            ?.error ||
            error.message ||
            "حدث خطأ أثناء حفظ الامتحان."
        );
      } finally {
        setSaving(false);
      }
    };

  /*
  ========================================================
  إجمالي الدرجات
  ========================================================
  */

  const totalMarks =
    questions.reduce(
      (sum, q) =>
        sum +
        (Number(
          q.marks
        ) || 0),
      0
    );

  /*
  ========================================================
  JSX
  ========================================================
  */

  return (
    <div
      className="lesson-player"
      dir="rtl"
    >

      {/* ==================================================
          العنوان
      ================================================== */}

      <h2 className="lesson-title">
        إضافة امتحان جديد
      </h2>

      {/* ==================================================
          مصدر إنشاء الامتحان
      ================================================== */}

      <div className="lesson-block">

        <h3>
          طريقة إنشاء الأسئلة
        </h3>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(240px,1fr))",
            gap:
              "12px",
            marginTop:
              "15px",
          }}
        >

          <button
            type="button"
            onClick={() =>
              setQuestionSource(
                "manual"
              )
            }
            style={{
              padding:
                "18px",
              borderRadius:
                "12px",
              border:
                questionSource ===
                "manual"
                  ? "2px solid #ffd700"
                  : "1px solid #444",
              background:
                questionSource ===
                "manual"
                  ? "rgba(255,215,0,.10)"
                  : "#111",
              color:
                "#fff",
              cursor:
                "pointer",
            }}
          >
            <div
              style={{
                fontSize:
                  "25px",
                marginBottom:
                  "8px",
              }}
            >
              ✍️
            </div>

            <strong>
              إنشاء يدوي
            </strong>

            <div
              style={{
                color:
                  "#aaa",
                fontSize:
                  "13px",
                marginTop:
                  "6px",
              }}
            >
              أكتب الأسئلة بنفسي
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setQuestionSource(
                "ai"
              )
            }
            style={{
              padding:
                "18px",
              borderRadius:
                "12px",
              border:
                questionSource ===
                "ai"
                  ? "2px solid #ffd700"
                  : "1px solid #444",
              background:
                questionSource ===
                "ai"
                  ? "rgba(255,215,0,.10)"
                  : "#111",
              color:
                "#fff",
                cursor:
                "pointer",
            }}
          >
            <div
              style={{
                fontSize:
                  "25px",
                marginBottom:
                  "8px",
              }}
            >
              🤖
            </div>

            <strong>
              توليد بالذكاء الاصطناعي
            </strong>

            <div
              style={{
                color:
                  "#aaa",
                fontSize:
                  "13px",
                marginTop:
                  "6px",
              }}
            >
              ارفع ملفًا ودع AI
              ينشئ الأسئلة
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setQuestionSource(
                "question_bank"
              )
            }
            style={{
              padding:
                "18px",
              borderRadius:
                "12px",
              border:
                questionSource ===
                "question_bank"
                  ? "2px solid #ffd700"
                  : "1px solid #444",
              background:
                questionSource ===
                "question_bank"
                  ? "rgba(255,215,0,.10)"
                  : "#111",
              color:
                "#fff",
              cursor:
                "pointer",
            }}
          >
            <div
              style={{
                fontSize:
                  "25px",
                marginBottom:
                  "8px",
              }}
            >
              📚
            </div>

            <strong>
              استدعاء من بنك الأسئلة
            </strong>

            <div
              style={{
                color:
                  "#aaa",
                fontSize:
                  "13px",
                marginTop:
                  "6px",
              }}
            >
              جلب أسئلة فعلية من قاعدة بنك الأسئلة
            </div>
          </button>

        </div>

        {questionSource === "question_bank" && (
          <div
            style={{
              marginTop: "15px",
              padding: "16px",
              border: "1px solid #444",
              borderRadius: "12px",
              background: "#0d0d0d",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(200px,1fr))",
                gap: "12px",
              }}
            >
              <div>
                <label>عدد الأسئلة</label>
                <input
                  className="youtube-input"
                  type="number"
                  min="1"
                  max="200"
                  value={bankQuestionCount}
                  onChange={(e) =>
                    setBankQuestionCount(e.target.value)
                  }
                />
              </div>

              <div>
                <label>نوع السؤال</label>
                <select
                  className="youtube-input"
                  value={bankQuestionType}
                  onChange={(e) =>
                    setBankQuestionType(e.target.value)
                  }
                >
                  <option value="">كل الأنواع</option>
                  <option value="mcq">اختيار من متعدد</option>
                  <option value="essay">مقالي</option>
                </select>
              </div>

              <div>
                <label>مستوى الصعوبة</label>
                <select
                  className="youtube-input"
                  value={bankDifficulty}
                  onChange={(e) =>
                    setBankDifficulty(e.target.value)
                  }
                >
                  <option value="">كل المستويات</option>
                  <option value="easy">سهل</option>
                  <option value="medium">متوسط</option>
                  <option value="hard">صعب</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={loadQuestionsFromBank}
              disabled={
                bankLoading ||
                !gradeId ||
                !subjectId
              }
              style={{
                marginTop: "14px",
                width: "100%",
                padding: "14px 18px",
                borderRadius: "10px",
                border: "1px solid #d4af37",
                background:
                  bankLoading
                    ? "#333"
                    : "#d4af37",
                color:
                  bankLoading
                    ? "#aaa"
                    : "#111",
                fontWeight: "700",
                cursor:
                  bankLoading
                    ? "wait"
                    : "pointer",
              }}
            >
              {bankLoading
                ? "⏳ جاري استدعاء الأسئلة من البنك..."
                : "📚 استدعاء الأسئلة الآن"}
            </button>

            <div
              style={{
                marginTop: "10px",
                color: "#aaa",
                fontSize: "12px",
              }}
            >
              الاستدعاء يتم من الـ API الحقيقي لبنك الأسئلة
              وبحسب الدرس/الوحدة المحددة، وليس من بيانات وهمية داخل الصفحة.
            </div>
          </div>
        )}

      </div>

      {/* ==================================================
          نطاق الامتحان والارتباط بالمنهج
      ================================================== */}

      <div className="lesson-block">
        <h3>نطاق الامتحان والارتباط بالمنهج</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "12px", marginTop: "15px" }}>
          <div>
            <label>النظام الدراسي</label>
            <select className="youtube-input" value={systemId} onChange={(e) => handleSystemChange(e.target.value)} disabled={dataLoading.grades}>
              <option value="">اختر النظام</option>
              <option value="general">الثانوية العامة</option>
              <option value="bac">البكالوريا المصرية</option>
            </select>
          </div>

          <div>
            <label>المرحلة</label>
            <input className="youtube-input" value="الثانوية" readOnly />
          </div>

          <div>
            <label>الصف الدراسي</label>
            <select className="youtube-input" value={gradeId} onChange={(e) => handleGradeChange(e.target.value)} disabled={!systemId || dataLoading.grades}>
              <option value="">اختر الصف</option>
              {grades
                .filter((g) => (systemId === "bac" ? BAC_GRADE_IDS.includes(g.id) : GENERAL_GRADE_IDS.includes(g.id)))
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title || g.name || g.id}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label>المادة</label>
            <select className="youtube-input" value={subjectId} onChange={(e) => handleSubjectChange(e.target.value)} disabled={!gradeId || dataLoading.subjects}>
              <option value="">اختر المادة</option>
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {getItemTitle(item)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: "15px", padding: "15px", border: "1px solid #d4af37", borderRadius: "12px", background: "rgba(212,175,55,.05)" }}>
          <label>نوع / نطاق الامتحان</label>
          <select className="youtube-input" value={examScope} onChange={(e) => handleScopeChange(e.target.value)}>
            <option value="lesson">درس واحد</option><option value="unit">وحدة واحدة</option><option value="half">نصف المنهج</option><option value="full">المنهج كاملًا</option><option value="custom">مخصص</option>
          </select>
          <div style={{ marginTop: "8px", color: "#aaa", fontSize: "13px" }}>في المخصص يمكنك الجمع بين الوحدات والدروس، بحد أقصى 3 وحدات و3 دروس.</div>
        </div>
        {(examScope === "lesson" || examScope === "unit" || examScope === "custom") && <>
          <div style={{ marginTop: "15px", padding: "15px", border: "1px solid #555", borderRadius: "12px", background: "#0d0d0d" }}>
            <div style={{ color: "#ffd700", fontWeight: "bold", marginBottom: "10px" }}>
              {getCurriculumStructureLabel()}
            </div>

            {dataLoading.units ? (
              <div style={{ color: "#aaa" }}>جاري تحميل الوحدات / الفصول...</div>
            ) : !units.length ? (
              <div style={{ color: "#777" }}>لا توجد وحدات / فصول متاحة لهذا الصف والمادة.</div>
            ) : examScope === "custom" ? (
              <select
                className="youtube-input"
                multiple
                size={Math.min(Math.max(units.length, 4), 8)}
                value={selectedUnitIds}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions).map((option) => option.value);
                  if (values.length > 3) {
                    alert("يمكن اختيار 3 وحدات / فصول كحد أقصى.");
                    return;
                  }
                  setSelectedUnitIds(values);
                  setSelectedLessonIds([]);
                }}
              >
                {units.map((unit, index) => (
                  <option key={unit.id} value={unit.id}>
                    {getCurriculumItemLabel(unit, index)}
                  </option>
                ))}
              </select>
            ) : (
              <select
                className="youtube-input"
                value={primaryUnitId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedUnitIds(value ? [value] : []);
                  setSelectedLessonIds([]);
                }}
              >
                <option value="">اختر العنصر</option>
                {units.map((unit, index) => (
                  <option key={unit.id} value={unit.id}>
                    {getCurriculumItemLabel(unit, index)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {(examScope === "lesson" || examScope === "unit" || examScope === "custom") && selectedUnitIds.length > 0 && (
            <div style={{ marginTop: "15px", padding: "15px", border: "1px solid #555", borderRadius: "12px", background: "#0d0d0d" }}>
              <div style={{ color: "#ffd700", fontWeight: "bold", marginBottom: "10px" }}>
                الدروس {examScope === "custom" ? "— حتى 3 دروس" : "— اختر درسًا واحدًا"}
              </div>

              {dataLoading.lessons ? (
                <div style={{ color: "#aaa" }}>جاري تحميل الدروس...</div>
              ) : !lessons.length ? (
                <div style={{ color: "#777" }}>لا توجد دروس داخل العنصر المختار في البيانات المرفوعة.</div>
              ) : examScope === "custom" ? (
                <select
                  className="youtube-input"
                  multiple
                  size={Math.min(Math.max(lessons.length, 5), 10)}
                  value={selectedLessonIds}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions).map((option) => option.value);
                    if (values.length > 3) {
                      alert("يمكن اختيار 3 دروس كحد أقصى.");
                      return;
                    }
                    setSelectedLessonIds(values);
                  }}
                >
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title || lesson.name || lesson.id}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  className="youtube-input"
                  value={primaryLessonId}
                  onChange={(e) => setSelectedLessonIds(e.target.value ? [e.target.value] : [])}
                >
                  <option value="">اختر الدرس</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title || lesson.name || lesson.id}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </>}
        {(examScope === "half" || examScope === "full") && <div style={{marginTop:"15px",padding:"15px",border:"1px solid #555",borderRadius:"12px",background:"#0d0d0d",color:"#aaa"}}>{examScope === "half" ? "تم تحديد نطاق الامتحان: نصف المنهج." : "تم تحديد نطاق الامتحان: المنهج كاملًا."}</div>}
        <div style={{marginTop:"15px",padding:"15px",border:"1px solid #333",borderRadius:"12px",color:"#bbb",lineHeight:"1.8"}}>
          <div><b>المرحلة:</b> الثانوية</div>
          <div><b>النظام:</b> {systemId === "bac" ? "البكالوريا المصرية" : systemId === "general" ? "الثانوية العامة" : "غير محدد"}</div>
          <div><b>الصف:</b> {grades.find((g) => g.id === gradeId)?.title || grades.find((g) => g.id === gradeId)?.name || gradeId || "غير محدد"}</div>
          <div><b>المادة:</b> {subject || "غير محددة"}</div>
          <div><b>هيكل المنهج:</b> {getCurriculumStructureLabel()}</div>
          <div><b>النطاق:</b> {examScope}</div>
          <div><b>العناصر المختارة:</b> {selectedUnitIds.length}</div>
          <div><b>الدروس المختارة:</b> {selectedLessonIds.length}</div>
        </div>
      </div>

      {/* ==================================================
          AI
      ================================================== */}

      {questionSource ===
        "ai" && (

        <div
          className="lesson-block"
          style={{
            border:
              "1px solid #7c3aed",
          }}
        >

          <h3>
            🤖 إنشاء الأسئلة بالذكاء الاصطناعي
          </h3>

          <p
            style={{
              color:
                "#aaa",
              lineHeight:
                "1.8",
            }}
          >
            ارفع المذكرة أو الملف الذي تريد
            أن يعتمد عليه الذكاء الاصطناعي
            في إنشاء الأسئلة. سيتم إرجاع
            الأسئلة مع الإجابات النموذجية
            ومبررات الإجابة وعناصر التصحيح،
            ثم يمكنك مراجعتها وتعديلها قبل
            الحفظ.
          </p>

          {/* الملف */}

          <div
            style={{
              marginTop:
                "15px",
            }}
          >

            <label
              className="gold-btn"
              style={{
                display:
                  "inline-block",
                cursor:
                  "pointer",
              }}
            >
              📁 اختيار الملف

              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={
                  handleAiFileChange
                }
                style={{
                  display:
                    "none",
                }}
              />
            </label>

            {aiFileName && (
              <div
                style={{
                  marginTop:
                    "10px",
                  color:
                    "#60a5fa",
                }}
              >
                الملف المختار:
                {" "}
                {aiFileName}
              </div>
            )}

          </div>

          {/* إعدادات AI */}

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap:
                "12px",
              marginTop:
                "15px",
            }}
          >

            <div>

              <label>
                عدد الأسئلة
              </label>

              <input
                className="youtube-input"
                type="number"
                min="1"
                max="100"
                value={
                  aiQuestionCount
                }
                onChange={(e) =>
                  setAiQuestionCount(
                    e.target.value
                  )
                }
              />

            </div>

            <div>

              <label>
                مستوى الصعوبة
              </label>

              <select
                className="youtube-input"
                value={
                  aiDifficulty
                }
                onChange={(e) =>
                  setAiDifficulty(
                    e.target.value
                  )
                }
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

                <option value="mixed">
                  متنوع
                </option>

              </select>

            </div>

          </div>

          {/* أنواع الأسئلة */}

          <div
            style={{
              marginTop:
                "15px",
              padding:
                "15px",
              background:
                "#111",
              borderRadius:
                "10px",
            }}
          >

            <strong>
              أنواع الأسئلة المطلوبة
            </strong>

            <label
              style={{
                display:
                  "block",
                marginTop:
                  "12px",
              }}
            >
              <input
                type="checkbox"
                checked={
                  aiIncludeMcq
                }
                onChange={(e) =>
                  setAiIncludeMcq(
                    e.target.checked
                  )
                }
              />

              {" "}
              اختيار من متعدد
            </label>

            <label
              style={{
                display:
                  "block",
                marginTop:
                "10px",
              }}
            >
              <input
                type="checkbox"
                checked={
                  aiIncludeEssay
                }
                onChange={(e) =>
                  setAiIncludeEssay(
                    e.target.checked
                  )
                }
              />

              {" "}
              أسئلة مقالية
            </label>

          </div>

          {/* ملاحظة AI */}

          <div
            style={{
              marginTop:
                "15px",
              padding:
                "15px",
              borderRadius:
                "10px",
              background:
                "rgba(124,58,237,.08)",
              color:
                "#c4b5fd",
              lineHeight:
                "1.8",
            }}
          >
            🧠 في الأسئلة المقالية سيُطلب
            من النظام إنشاء:
            <br />
            • نموذج الإجابة
            <br />
            • عناصر الإجابة الأساسية
            <br />
            • الدرجة
            <br />
            • معايير يمكن استخدامها لاحقًا
            في التصحيح بالذكاء الاصطناعي.
            <br />
            <br />
            وفي الاختيار من متعدد:
            <br />
            • الإجابة الصحيحة
            <br />
            • سبب صحة الاختيار
            <br />
            • أسباب خطأ الاختيارات الأخرى.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: "12px",
              marginTop: "18px",
            }}
          >
            <button
              type="button"
              className="gold-btn"
              onClick={uploadAiSourceFile}
              disabled={
                aiGenerating ||
                !aiFile ||
                !!aiUploadedFileId
              }
              style={{
                width: "100%",
                opacity:
                  !aiFile ||
                  aiUploadedFileId
                    ? 0.6
                    : 1,
              }}
            >
              {aiUploadedFileId
                ? "✅ تم رفع الملف"
                : "📤 رفع الملف الآن"}
            </button>

            <button
              type="button"
              className="gold-live-btn"
              onClick={generateQuestionsWithAI}
              disabled={
                aiGenerating ||
                !aiUploadedFileId
              }
              style={{
                width: "100%",
              }}
            >
              {aiGenerating
                ? "🤖 جارٍ تحليل الملف..."
                : "🤖 بدء توليد الأسئلة"}
            </button>
          </div>

          {/* ==================================================
              PROGRESS
          ================================================== */}

          {(aiGenerating ||
            aiProgress.stage === "completed" ||
            aiProgress.stage === "error") && (
            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                borderRadius: "14px",
                background: "#0d0d0d",
                border:
                  aiProgress.stage === "error"
                    ? "1px solid #ef4444"
                    : "1px solid #7c3aed",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <strong
                  style={{
                    color: "#fff",
                  }}
                >
                  {aiProgress.stage === "completed"
                    ? "✅ اكتمل توليد الأسئلة"
                    : aiProgress.stage === "error"
                    ? "❌ حدث خطأ"
                    : "🤖 الذكاء الاصطناعي يعمل الآن"}
                </strong>

                <strong
                  style={{
                    color:
                      aiProgress.stage === "error"
                        ? "#ef4444"
                        : "#ffd700",
                    fontSize: "20px",
                  }}
                >
                  {aiProgress.progress}%
                </strong>
              </div>

              <div
                style={{
                  height: "12px",
                  background: "#2a2a2a",
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${aiProgress.progress}%`,
                    height: "100%",
                    background:
                      aiProgress.stage === "error"
                        ? "#ef4444"
                        : "linear-gradient(90deg,#7c3aed,#ffd700)",
                    transition:
                      "width .5s ease",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: "14px",
                  color: "#ddd",
                  fontSize: "15px",
                  lineHeight: "1.8",
                }}
              >
                {aiProgress.stageLabel ||
                  "جاري العمل..."}
              </div>

              <div
                style={{
                  marginTop: "15px",
                  display: "grid",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#ddd",
                }}
              >
                <div>
                  {aiProgress.progress >= 10 ? "✓" : "○"}
                  {" "}
                  رفع واستلام الملف
                </div>

                <div>
                  {aiProgress.progress >= 35
                    ? "✓"
                    : aiProgress.progress >= 20
                    ? "⏳"
                    : "○"}
                  {" "}
                  قراءة واستخراج المحتوى
                </div>

                <div>
                  {aiProgress.progress >= 45
                    ? "✓"
                    : aiProgress.progress >= 35
                    ? "⏳"
                    : "○"}
                  {" "}
                  تحليل المادة
                </div>

                <div>
                  {aiProgress.progress >= 88
                    ? "✓"
                    : aiProgress.progress >= 60
                    ? "⏳"
                    : "○"}
                  {" "}
                  إنشاء الأسئلة
                </div>

                <div>
                  {aiProgress.progress >= 100
                    ? "✓"
                    : aiProgress.progress >= 88
                    ? "⏳"
                    : "○"}
                  {" "}
                  تجهيز الإجابات ومعايير التصحيح
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================================================
          بيانات الامتحان
      ================================================== */}

      <div className="lesson-block">

        <h3>
          بيانات الامتحان
        </h3>

        <input
          className="youtube-input"
          placeholder="عنوان الامتحان"
          value={
            title
          }
          onChange={(e) => {
            setTitleTouched(true);
            setTitle(e.target.value);
          }}
        />

        <textarea
          className="youtube-input"
          placeholder="وصف الامتحان - اختياري"
          value={
            description
          }
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          style={{
            minHeight:
              "100px",
          }}
        />

        <input
          className="youtube-input"
          type="number"
          min="1"
          value={
            duration
          }
          onChange={(e) =>
            setDuration(
              e.target.value
            )
          }
        />

        <div
          style={{
            color:
              "#ffd700",
            marginTop:
              "10px",
            fontWeight:
              "bold",
          }}
        >
          إجمالي الدرجات:
          {" "}
          {totalMarks}
        </div>

      </div>

      {/* ==================================================
          الأسئلة
      ================================================== */}

      <div className="lesson-block">

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
          }}
        >

          <h3>
            الأسئلة
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span>
              {questions.length} سؤال
            </span>

            <button
              type="button"
              className="gold-btn"
              onClick={saveAllQuestionsToBank}
              disabled={bankSavingAll || bankSavingIndex !== null}
            >
              {bankSavingAll
                ? "⏳ جاري نقل الأسئلة إلى البنك..."
                : "📚 حفظ جميع الأسئلة في بنك الأسئلة"}
            </button>
          </div>

        </div>

        {questions.map(
          (
            q,
            index
          ) => (

            <div
              key={
                q.id
              }
              style={{
                marginTop:
                  "18px",
                padding:
                  "18px",
                border:
                  "1px solid #555",
                borderRadius:
                  "14px",
                background:
                  "#111",
              }}
            >

              {/* رأس السؤال */}

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap:
                    "10px",
                }}
              >

                <h3
                  style={{
                    color:
                      "#ffd700",
                  }}
                >
                  السؤال{" "}
                  {index + 1}
                </h3>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="gold-btn"
                    onClick={() => saveQuestionToBank(index)}
                    disabled={bankSavingIndex === index || bankSavingAll || Boolean(q.questionBankId)}
                  >
                    {q.questionBankId
                      ? "✅ محفوظ في بنك الأسئلة"
                      : bankSavingIndex === index
                      ? "⏳ جاري الحفظ..."
                      : "📚 حفظ في بنك الأسئلة"}
                  </button>

                  <button
                    type="button"
                    className="red-btn"
                    onClick={() =>
                      removeQuestion(
                        index
                      )
                    }
                  >
                    🗑 حذف السؤال
                  </button>
                </div>

              </div>

              {/* مصدر السؤال */}

              {q.source ===
                "question_bank" && (

                <div
                  style={{
                    color: "#4ade80",
                    fontSize: "13px",
                    marginBottom: "10px",
                  }}
                >
                  📚 السؤال محفوظ في بنك الأسئلة
                </div>
              )}

              {q.source ===
                "ai" && (

                <div
                  style={{
                    color:
                      "#a78bfa",
                    fontSize:
                      "13px",
                    marginBottom:
                      "10px",
                  }}
                >
                  🤖 تم توليد السؤال
                  بالذكاء الاصطناعي
                  من:
                  {" "}
                  {q.sourceFileName}
                </div>
              )}

              {/* نوع السؤال */}

              <label>
                نوع السؤال
              </label>

              <select
                className="youtube-input"
                value={
                  q.type
                }
                onChange={(e) =>
                  changeQuestionType(
                    index,
                    e.target.value
                  )
                }
              >

                <option value="mcq">
                  اختيار من متعدد
                </option>

                <option value="essay">
                  سؤال مقالي
                </option>

              </select>

              {/* النوع المقالي */}

              {q.type ===
                "essay" && (

                <>
                  <label>
                    صيغة السؤال المقالي
                  </label>

                  <select
                    className="youtube-input"
                    value={
                      q.essayType
                    }
                    onChange={(e) =>
                      updateQuestion(
                        index,
                        "essayType",
                        e.target.value
                      )
                    }
                  >

                    {ESSAY_TYPES.map(
                      (
                        type
                      ) => (
                        <option
                          key={
                            type.value
                          }
                          value={
                            type.value
                          }
                        >
                          {
                            type.label
                          }
                        </option>
                      )
                    )}

                  </select>
                </>
              )}

              {/* نص السؤال */}

              <label>
                نص السؤال
              </label>

              <textarea
                className="youtube-input"
                placeholder="اكتب نص السؤال..."
                value={
                  q.questionText
                }
                onChange={(e) =>
                  updateQuestion(
                    index,
                    "questionText",
                    e.target.value
                  )
                }
                style={{
                  minHeight:
                    "100px",
                }}
              />

              {/* ==================================================
                  صورة / خريطة السؤال
              ================================================== */}

              <div
                style={{
                  marginTop: "18px",
                  padding: "15px",
                  border: "1px solid #444",
                  borderRadius: "12px",
                  background: "#0d0d0d",
                }}
              >
                <h4
                  style={{
                    color: "#60a5fa",
                    marginBottom: "10px",
                  }}
                >
                  🗺️🖼️ صورة أو خريطة مرتبطة بالسؤال
                </h4>

                <p
                  style={{
                    color: "#999",
                    fontSize: "13px",
                    lineHeight: "1.7",
                    marginBottom: "12px",
                  }}
                >
                  يمكنك رفع خريطة أو صورة توضيحية للسؤال،
                  وستظهر للطالب داخل الامتحان.
                </p>

                <label
                  className="gold-btn"
                  style={{
                    display: "inline-block",
                    cursor: "pointer",
                  }}
                >
                  📤 رفع صورة / خريطة

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file =
                        e.target.files?.[0];

                      uploadQuestionImage(
                        index,
                        file
                      );

                      e.target.value = "";
                    }}
                    style={{
                      display: "none",
                    }}
                  />
                </label>

                {q.imageUrl && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "12px",
                      border: "1px solid #333",
                      borderRadius: "10px",
                      background: "#111",
                    }}
                  >
                    <div
                      style={{
                        color: "#60a5fa",
                        fontSize: "13px",
                        marginBottom: "10px",
                      }}
                    >
                      ✅ تم رفع صورة السؤال
                    </div>

                    <img
                      src={
                        q.imageUrl.startsWith("http://") ||
                        q.imageUrl.startsWith("https://")
                          ? q.imageUrl
                          : `${(
                              import.meta.env
                                .VITE_API_URL || ""
                            ).replace(
                              /\/$/,
                              ""
                            )}/${q.imageUrl.replace(
                              /^\//,
                              ""
                            )}`
                      }
                      alt="صورة السؤال"
                      style={{
                        display: "block",
                        maxWidth: "100%",
                        maxHeight: "500px",
                        margin: "0 auto",
                        borderRadius: "10px",
                        objectFit: "contain",
                      }}
                    />

                    <button
                      type="button"
                      className="red-btn"
                      onClick={() =>
                        removeQuestionImage(
                          index
                        )
                      }
                      style={{
                        marginTop: "12px",
                      }}
                    >
                      🗑 حذف الصورة
                    </button>
                  </div>
                )}
              </div>

              {/* ==================================================
                  MCQ
              ================================================== */}

              {q.type ===
                "mcq" && (

                <div>

                  <h4>
                    الاختيارات
                  </h4>

                  {/* ==================================================
                      شكل خانات الاختيارات
                  ================================================== */}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "14px",
                    }}
                  >
                    {[
                      {
                        value: "vertical",
                        label: "رأسي",
                      },
                      {
                        value: "row4",
                        label: "4 متجاورين",
                      },
                      {
                        value: "grid2x2",
                        label: "2 × 2",
                      },
                    ].map((layout) => (
                      <button
                        key={layout.value}
                        type="button"
                        onClick={() =>
                          updateQuestion(
                            index,
                            "choiceLayout",
                            layout.value
                          )
                        }
                        style={{
                          flex: "1 1 150px",
                          minHeight: "40px",
                          borderRadius: "9px",
                          border:
                            q.choiceLayout === layout.value
                              ? "1px solid #ffd700"
                              : "1px solid #444",
                          background:
                            q.choiceLayout === layout.value
                              ? "#ffd700"
                              : "#151515",
                          color:
                            q.choiceLayout === layout.value
                              ? "#000"
                              : "#ddd",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {layout.label}
                      </button>
                    ))}
                  </div>

                  {/* ==================================================
                      خانات الاختيارات
                      الجدول نفسه بدون خطوط — فقط الخانات واضحة.
                  ================================================== */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        q.choiceLayout === "row4"
                          ? "repeat(4, minmax(0, 1fr))"
                          : q.choiceLayout === "grid2x2"
                          ? "repeat(2, minmax(0, 1fr))"
                          : "1fr",
                      gap:
                        q.choiceLayout === "vertical"
                          ? "9px"
                          : "12px",
                      width: "100%",
                    }}
                  >
                    {q.choices.map(
                      (
                        choice,
                        ci
                      ) => (
                        <div
                          key={ci}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            minWidth: 0,
                          }}
                        >
                          <strong
                            style={{
                              minWidth: "32px",
                              textAlign: "center",
                              color: "#ffd700",
                              fontSize: "16px",
                            }}
                          >
                            {LETTERS[ci]}
                          </strong>

                          <input
                            className="youtube-input"
                            style={{
                              margin: 0,
                              width: "100%",
                              minWidth: 0,
                              boxSizing: "border-box",
                            }}
                            placeholder={`اكتب إجابة ${LETTERS[ci]}`}
                            value={choice}
                            onChange={(e) =>
                              updateChoice(
                                index,
                                ci,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )
                    )}
                  </div>

                  {/* الإجابة الصحيحة */}

                  <label>
                    الإجابة الصحيحة
                  </label>

                  <select
                    className="youtube-input"
                    value={
                      q.correctAnswer
                    }
                    onChange={(e) =>
                      updateQuestion(
                        index,
                        "correctAnswer",
                        Number(
                          e.target.value
                        )
                      )
                    }
                  >

                    {LETTERS.map(
                      (
                        letter,
                        ci
                      ) => (
                        <option
                          key={
                            ci
                          }
                          value={
                            ci
                          }
                        >
                          (
                          {
                            letter
                          }
                          )
                        </option>
                      )
                    )}

                  </select>

                  {/* سبب صحة الإجابة */}

                  <label>
                    سبب صحة الإجابة
                  </label>

                  <textarea
                    className="youtube-input"
                    placeholder="لماذا هذه الإجابة صحيحة؟"
                    value={
                      q.correctReason
                    }
                    onChange={(e) =>
                      updateQuestion(
                        index,
                        "correctReason",
                        e.target.value
                      )
                    }
                  />

                  {/* أسباب خطأ الاختيارات */}

                  <h4>
                    أسباب خطأ الاختيارات الأخرى
                  </h4>

                  {q.wrongReasons.map(
                    (
                      reason,
                      ri
                    ) => (

                      <textarea
                        key={
                          ri
                        }
                        className="youtube-input"
                        placeholder={`سبب خطأ الاختيار ${
                          LETTERS[
                            ri >=
                            q.correctAnswer
                              ? ri + 1
                              : ri
                          ]
                        }`}
                        value={
                          reason
                        }
                        onChange={(e) =>
                          updateWrongReason(
                            index,
                            ri,
                            e.target.value
                          )
                        }
                      />

                    )
                  )}

                </div>
              )}

              {/* ==================================================
                  ESSAY
              ================================================== */}

              {q.type ===
                "essay" && (

                <div>

                  <h4>
                    📝 نموذج الإجابة
                  </h4>

                  <textarea
                    className="youtube-input"
                    placeholder="اكتب الإجابة النموذجية..."
                    value={
                      q.modelAnswer
                    }
                    onChange={(e) =>
                      updateQuestion(
                        index,
                        "modelAnswer",
                        e.target.value
                      )
                    }
                    style={{
                      minHeight:
                        "150px",
                    }}
                  />

                  <h4>
                    🎯 عناصر الإجابة ومعايير التصحيح
                  </h4>

                  <p
                    style={{
                      color:
                        "#999",
                      fontSize:
                        "13px",
                      lineHeight:
                        "1.7",
                    }}
                  >
                    هذه ليست إجابة حرفية
                    يجب أن يطابقها الطالب.
                    وإنما نقاط أساسية تساعد
                    الذكاء الاصطناعي لاحقًا
                    على معرفة مدى تحقق
                    الإجابة.
                  </p>

                  {(
                    q.answerCriteria ||
                    [""]
                  ).map(
                    (
                      criterion,
                      ci
                    ) => (

                      <div
                        key={
                          ci
                        }
                        style={{
                          display:
                            "flex",
                          gap:
                            "8px",
                          marginBottom:
                            "8px",
                        }}
                      >

                        <input
                          className="youtube-input"
                          style={{
                            margin:
                              0,
                          }}
                          placeholder={`عنصر الإجابة ${ci + 1}`}
                          value={
                            criterion
                          }
                          onChange={(e) =>
                            updateAnswerCriterion(
                              index,
                              ci,
                              e.target.value
                            )
                          }
                        />

                        <button
                          type="button"
                          className="red-btn"
                          onClick={() =>
                            removeAnswerCriterion(
                              index,
                              ci
                            )
                          }
                        >
                          حذف
                        </button>

                      </div>
                    )
                  )}

                  <button
                    type="button"
                    className="gold-btn"
                    onClick={() =>
                      addAnswerCriterion(
                        index
                      )
                    }
                  >
                    + إضافة عنصر إجابة
                  </button>

                </div>
              )}

              {/* الدرجة */}

              <label>
                درجة السؤال
              </label>

              <input
                className="youtube-input"
                type="number"
                min="0.5"
                step="0.5"
                value={
                  q.marks
                }
                onChange={(e) =>
                  updateQuestion(
                    index,
                    "marks",
                    e.target.value
                  )
                }
              />

              {/* الصعوبة */}

              <label>
                مستوى الصعوبة
              </label>

              <select
                className="youtube-input"
                value={
                  q.difficulty
                }
                onChange={(e) =>
                  updateQuestion(
                    index,
                    "difficulty",
                    e.target.value
                  )
                }
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
          )
        )}

        {/* إضافة سؤال */}

        <button
          type="button"
          className="gold-btn"
          onClick={
            addQuestion
          }
          style={{
            width:
              "100%",
            marginTop:
              "15px",
          }}
        >
          + إضافة سؤال
        </button>

      </div>

      {/* ==================================================
          النشر
      ================================================== */}

      <div className="lesson-block">

        <h3>
          نشر الامتحان
        </h3>

        <label>
          <input
            type="radio"
            checked={
              publishMode ===
              "draft"
            }
            onChange={() =>
              setPublishMode(
                "draft"
              )
            }
          />

          {" "}
          💾 حفظ كمسودة
        </label>

        <label
          style={{
            display:
              "block",
            marginTop:
              "10px",
          }}
        >
          <input
            type="radio"
            checked={
              publishMode ===
              "publish_now"
            }
            onChange={() =>
              setPublishMode(
                "publish_now"
              )
            }
          />

          {" "}
          📢 نشر الآن
        </label>

        <label
          style={{
            display:
              "block",
            marginTop:
              "10px",
          }}
        >
          <input
            type="radio"
            checked={
              publishMode ===
              "scheduled"
            }
            onChange={() =>
              setPublishMode(
                "scheduled"
              )
            }
          />

          {" "}
          ⏰ جدولة النشر
        </label>

        {publishMode ===
          "scheduled" && (

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap:
                "10px",
              marginTop:
                "15px",
            }}
          >

            <input
              className="youtube-input"
              type="date"
              value={
                publishDate
              }
              onChange={(e) =>
                setPublishDate(
                  e.target.value
                )
              }
            />

            <input
              className="youtube-input"
              type="time"
              value={
                publishTime
              }
              onChange={(e) =>
                setPublishTime(
                  e.target.value
                )
              }
            />

          </div>
        )}

      </div>

      {/* ==================================================
          أزرار النهاية
      ================================================== */}

      <div className="lesson-block">

        <button
          type="button"
          className="gold-btn"
          onClick={() =>
            setPreviewOpen(
              true
            )
          }
          style={{
            marginLeft:
              "8px",
          }}
        >
          👁 معاينة
        </button>

        <button
          type="button"
          className="gold-live-btn"
          onClick={
            saveExam
          }
          disabled={
            saving
          }
        >
          {saving
            ? "جارٍ الحفظ..."
            : publishMode ===
              "draft"
            ? "💾 حفظ كمسودة"
            : publishMode ===
              "publish_now"
            ? "📢 نشر الامتحان"
            : "⏰ حفظ وجدولة"}
        </button>

        <button
          type="button"
          className="gold-btn"
          onClick={() =>
            navigate(-1)
          }
        >
          رجوع
        </button>

      </div>

      {/* ==================================================
          المعاينة
      ================================================== */}

      {previewOpen && (

        <div
          style={{
            position:
              "fixed",
            inset:
              0,
            zIndex:
              9999,
            background:
              "rgba(0,0,0,.9)",
            overflowY:
              "auto",
            padding:
              "30px",
          }}
        >

          <div
            style={{
              maxWidth:
                "900px",
              margin:
                "auto",
              background:
                "#111",
              border:
                "1px solid #ffd700",
              borderRadius:
                "16px",
              padding:
                "25px",
            }}
          >

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
              }}
            >

              <h2
                style={{
                  color:
                    "#ffd700",
                }}
              >
                {title ||
                  "بدون عنوان"}
              </h2>

              <button
                className="red-btn"
                onClick={() =>
                  setPreviewOpen(
                    false
                  )
                }
              >
                إغلاق
              </button>

            </div>

            <div
              style={{
                color:
                  "#aaa",
                marginBottom:
                  "20px",
              }}
            >
              عدد الأسئلة:
              {" "}
              {questions.length}
              {" | "}
              الدرجة:
              {" "}
              {totalMarks}
              {" | "}
              المدة:
              {" "}
              {duration} دقيقة
            </div>

            {questions.map(
              (
                q,
                index
              ) => (

                <div
                  key={
                    q.id
                  }
                  style={{
                    padding:
                      "18px",
                    marginBottom:
                      "15px",
                    border:
                      "1px solid #333",
                    borderRadius:
                      "10px",
                  }}
                >

                  <div
                    style={{
                      color:
                        "#ffd700",
                      fontWeight:
                        "bold",
                      marginBottom:
                        "10px",
                    }}
                  >
                    السؤال{" "}
                    {index + 1}
                  </div>

                  {q.type ===
                    "essay" && (
                    <div
                      style={{
                        color:
                          "#60a5fa",
                        marginBottom:
                          "8px",
                      }}
                    >
                      {
                        ESSAY_TYPES.find(
                          (item) =>
                            item.value ===
                            q.essayType
                        )?.label
                      }
                    </div>
                  )}

                  <div
                    style={{
                      lineHeight:
                        "1.8",
                      fontSize:
                        "17px",
                    }}
                  >
                    {
                      q.questionText ||
                      "لم تتم كتابة السؤال"
                    }
                  </div>

                  {q.imageUrl && (
                    <div
                      style={{
                        marginTop: "15px",
                        marginBottom: "15px",
                        textAlign: "center",
                      }}
                    >
                      <img
                        src={
                          q.imageUrl.startsWith("http://") ||
                          q.imageUrl.startsWith("https://")
                            ? q.imageUrl
                            : `${(
                                import.meta.env
                                  .VITE_API_URL || ""
                              ).replace(
                                /\/$/,
                                ""
                              )}/${q.imageUrl.replace(
                                /^\//,
                                ""
                              )}`
                        }
                        alt="صورة السؤال"
                        style={{
                          display: "block",
                          maxWidth: "100%",
                          maxHeight: "500px",
                          margin: "0 auto",
                          borderRadius: "10px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  )}

                  {q.type ===
                    "mcq" && (

                    <div
                      style={{
                        marginTop:
                          "15px",
                      }}
                    >

                      <div
                        style={{
                          display:
                            q.choiceLayout === "row4"
                              ? "grid"
                              : q.choiceLayout === "grid2x2"
                              ? "grid"
                              : "block",
                          gridTemplateColumns:
                            q.choiceLayout === "row4"
                              ? "repeat(4, minmax(0, 1fr))"
                              : q.choiceLayout === "grid2x2"
                              ? "repeat(2, minmax(0, 1fr))"
                              : undefined,
                          gap:
                            q.choiceLayout === "vertical"
                              ? "5px"
                              : "8px",
                        }}
                      >
                        {q.choices.map(
                          (choice, ci) => (
                            <div
                              key={ci}
                              style={{
                                padding: "8px",
                                marginBottom:
                                  q.choiceLayout === "vertical"
                                    ? "5px"
                                    : 0,
                                border: "1px solid #333",
                                borderRadius: "7px",
                                minWidth: 0,
                                textAlign: "right",
                              }}
                            >
                              ({LETTERS[ci]}) {choice || "-"}
                            </div>
                          )
                        )}
                      </div>

                    </div>
                  )}

                  {q.type ===
                    "essay" && (

                    <div
                      style={{
                        marginTop:
                          "15px",
                        border:
                          "1px dashed #555",
                        padding:
                          "20px",
                        color:
                          "#888",
                      }}
                    >
                      مساحة إجابة الطالب
                    </div>
                  )}

                  <div
                    style={{
                      color:
                        "#777",
                      marginTop:
                        "10px",
                    }}
                  >
                    الدرجة:
                    {" "}
                    {q.marks}
                  </div>

                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}