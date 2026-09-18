import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "../../firebase";

export default function AddExam() {
  /* ======================================================
     EXAM BASIC DATA
  ====================================================== */

  const [title, setTitle] = useState("");

  const [stageId, setStageId] = useState("secondary");

  const [systemId, setSystemId] = useState("");

  const [gradeId, setGradeId] = useState("");

  const [subjectId, setSubjectId] = useState("");

  const [subject, setSubject] = useState("");

  const [duration, setDuration] = useState(30);

  /* ======================================================
     CURRICULUM DATA
  ====================================================== */

  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);

  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  /* ======================================================
     EXAM SCOPE
  ======================================================

     lesson
       درس / دروس

     unit
       وحدة / وحدات

     half
       نصف المنهج

     full
       المنهج كامل

     custom
       مخصص
  ====================================================== */

  const [examScope, setExamScope] = useState("custom");

  /*
  ------------------------------------------------------
  الوحدات المختارة
  الحد الأقصى = 3
  ------------------------------------------------------
  */

  const [selectedUnitIds, setSelectedUnitIds] = useState([]);

  /*
  ------------------------------------------------------
  الدروس المختارة
  الحد الأقصى = 3
  ------------------------------------------------------
  */

  const [selectedLessonIds, setSelectedLessonIds] = useState([]);

  /*
  ------------------------------------------------------
  الدروس الخاصة بالوحدات المختارة
  ------------------------------------------------------
  */

  const [lessonsByUnit, setLessonsByUnit] = useState({});

  const [loadingLessons, setLoadingLessons] = useState(false);

  /* ======================================================
     QUESTIONS
  ====================================================== */

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      choices: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);

  /* ======================================================
     LOAD GRADES
  ====================================================== */

  useEffect(() => {
    let cancelled = false;

    const fetchGrades = async () => {
      setLoadingGrades(true);

      try {
        const q = query(
          collection(db, "grades"),
          where("stageId", "==", "secondary"),
          where("active", "==", true)
        );

        const snap = await getDocs(q);

        if (cancelled) return;

        const data = snap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((grade) =>
            ["sec1", "sec2", "sec3", "bac1", "bac2", "bac3"].includes(grade.id)
          )
          .sort(
            (a, b) => Number(a.order || 0) - Number(b.order || 0)
          );

        setGrades(data);
      } catch (error) {
        console.error("❌ Error loading grades:", error);

        if (!cancelled) {
          setGrades([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingGrades(false);
        }
      }
    };

    fetchGrades();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ======================================================
     LOAD SUBJECTS
     مصدر المواد حسب النظام الفعلي في Firebase:
       - الثانوية العامة: gradeSubjects
       - البكالوريا: subjects
     لا توجد أسماء مواد أو IDs أو وراثة من صف آخر هنا.
  ====================================================== */

  useEffect(() => {
    if (!gradeId || !systemId) {
      setSubjects([]);
      setSubjectId("");
      setSubject("");
      setUnits([]);
      setSelectedUnitIds([]);
      setSelectedLessonIds([]);
      setLessonsByUnit({});
      return;
    }

    let cancelled = false;

    const fetchSubjects = async () => {
      setLoadingSubjects(true);

      try {
        const currentGradeId = String(gradeId).trim();

        let snap;

        if (systemId === "general") {
          snap = await getDocs(
            query(
              collection(db, "gradeSubjects"),
              where("active", "==", true),
              where("stageId", "==", "secondary"),
              where("gradeId", "==", currentGradeId)
            )
          );
        } else if (systemId === "bac") {
          snap = await getDocs(
            query(
              collection(db, "subjects"),
              where("gradeId", "==", currentGradeId)
            )
          );
        } else {
          snap = { docs: [] };
        }

        if (cancelled) return;

        const data = snap.docs
          .map((doc) => {
            const raw = doc.data() || {};

            if (systemId === "general") {
              return {
                id: raw.subjectId || doc.id,
                docId: doc.id,
                ...raw,
              };
            }

            // البكالوريا: نفس بنية BacSubjectsView
            // الـ id المستخدم في المسار هو doc.id.
            return {
              id: doc.id,
              ...raw,
            };
          })
          .sort((a, b) => {
            const orderA = Number(a?.order ?? 999999);
            const orderB = Number(b?.order ?? 999999);

            if (orderA !== orderB) {
              return orderA - orderB;
            }

            const nameA = String(
              a?.nameAr ||
                a?.title ||
                a?.name ||
                a?.subject ||
                a?.label ||
                a?.id ||
                ""
            ).trim();

            const nameB = String(
              b?.nameAr ||
                b?.title ||
                b?.name ||
                b?.subject ||
                b?.label ||
                b?.id ||
                ""
            ).trim();

            return nameA.localeCompare(nameB, "ar");
          });

        if (!cancelled) {
          setSubjects(data);

          setSubjectId((current) => {
            if (current && data.some((item) => item.id === current)) {
              return current;
            }

            return "";
          });
        }
      } catch (error) {
        console.error("❌ Error loading subjects from Firestore:", error);

        if (!cancelled) {
          setSubjects([]);
          setSubjectId("");
          setSubject("");
        }
      } finally {
        if (!cancelled) {
          setLoadingSubjects(false);
        }
      }
    };

    fetchSubjects();

    return () => {
      cancelled = true;
    };
  }, [gradeId, systemId]);

  /* ======================================================
     LOAD UNITS
     نفس بنية صفحات الوحدات الفعلية:
       units
       where systemId
       where gradeId
       where subjectId
       where active == true
  ====================================================== */

  useEffect(() => {
    if (!gradeId || !subjectId || !systemId) {
      setUnits([]);
      setSelectedUnitIds([]);
      setSelectedLessonIds([]);
      setLessonsByUnit({});
      return;
    }

    let cancelled = false;

    const fetchUnits = async () => {
      setLoadingUnits(true);

      try {
        const snap = await getDocs(
          query(
            collection(db, "units"),
            where("systemId", "==", systemId),
            where("gradeId", "==", gradeId),
            where("subjectId", "==", subjectId),
            where("active", "==", true)
          )
        );

        if (cancelled) return;

        const data = snap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort(
            (a, b) =>
              Number(a.order || 0) -
              Number(b.order || 0)
          );

        setUnits(data);
      } catch (error) {
        console.error("❌ Error loading units:", error);

        if (!cancelled) {
          setUnits([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingUnits(false);
        }
      }
    };

    fetchUnits();

    return () => {
      cancelled = true;
    };
  }, [gradeId, subjectId, systemId]);

  /* ======================================================
     LOAD LESSONS FOR SELECTED UNITS
  ====================================================== */

  useEffect(() => {
    if (selectedUnitIds.length === 0) {
      setLessonsByUnit({});
      setSelectedLessonIds([]);
      return;
    }

    let cancelled = false;

    const fetchLessons = async () => {
      setLoadingLessons(true);

      try {
        const results = {};

        for (const unitId of selectedUnitIds) {
          const q = query(
            collection(db, "lessons"),
            where("unitId", "==", unitId),
            orderBy("order", "asc")
          );

          const snap = await getDocs(q);

          results[unitId] = snap.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort(
              (a, b) =>
                Number(a.order || 0) -
                Number(b.order || 0)
            );
        }

        if (cancelled) return;

        setLessonsByUnit(results);

        /*
        --------------------------------------------------
        نحذف أي درس تم اختياره سابقًا
        لكنه لم يعد تابعًا للوحدات الحالية.
        --------------------------------------------------
        */

        const validLessonIds = Object.values(results)
          .flat()
          .map((lesson) => lesson.id);

        setSelectedLessonIds((previous) =>
          previous.filter((id) =>
            validLessonIds.includes(id)
          )
        );
      } catch (error) {
        console.error("❌ Error loading lessons:", error);

        if (!cancelled) {
          setLessonsByUnit({});
        }
      } finally {
        if (!cancelled) {
          setLoadingLessons(false);
        }
      }
    };

    fetchLessons();

    return () => {
      cancelled = true;
    };
  }, [selectedUnitIds]);

  /* ======================================================
     SELECTED SUBJECT
  ====================================================== */

  const selectedSubject = useMemo(() => {
    return subjects.find(
      (item) => item.id === subjectId
    );
  }, [subjects, subjectId]);

  const selectedSubjectTitle = String(
    selectedSubject?.nameAr ||
      selectedSubject?.title ||
      selectedSubject?.name ||
      selectedSubject?.subject ||
      selectedSubject?.subjectName ||
      selectedSubject?.label ||
      subject ||
      ""
  ).trim();

  const getSubjectDisplayName = (item) => {
    return String(
      item?.nameAr ||
        item?.title ||
        item?.name ||
        item?.subject ||
        item?.subjectName ||
        item?.label ||
        item?.id ||
        ""
    ).trim();
  };

  const getCurriculumStructureLabel = () => {
    return "الوحدات / الفصول";
  };

  /* ======================================================
     SELECTED LESSONS FLAT LIST
  ====================================================== */

  const allAvailableLessons = useMemo(() => {
    return Object.entries(lessonsByUnit).flatMap(
      ([unitId, lessons]) =>
        lessons.map((lesson) => ({
          ...lesson,
          parentUnitId: unitId,
        }))
    );
  }, [lessonsByUnit]);

  /* ======================================================
     AUTO TITLE
  ====================================================== */

  const getScopeTitle = () => {
    if (examScope === "lesson") {
      return "اختبار على دروس";
    }

    if (examScope === "unit") {
      return "اختبار على وحدات";
    }

    if (examScope === "half") {
      return "اختبار نصف المنهج";
    }

    if (examScope === "full") {
      return "اختبار شامل على المنهج";
    }

    return "اختبار مخصص";
  };

  const generateSuggestedTitle = () => {
    const subjectName =
      selectedSubject?.nameAr ||
      selectedSubject?.title ||
      selectedSubject?.name ||
      subject ||
      "";

    const gradeName =
      grades.find((grade) => grade.id === gradeId)
        ?.title || "";

    const scopeName = getScopeTitle();

    return [
      scopeName,
      subjectName,
      gradeName,
    ]
      .filter(Boolean)
      .join(" - ");
  };

  /* ======================================================
     HANDLE SYSTEM
  ====================================================== */

  const handleSystemChange = (value) => {
    setSystemId(value);
    setStageId("secondary");

    const firstGrade = value === "bac" ? "bac1" : "sec1";

    setGradeId(firstGrade);
    setSubjectId("");
    setSubject("");
    setUnits([]);
    setSelectedUnitIds([]);
    setSelectedLessonIds([]);
    setLessonsByUnit({});
  };

  /* ======================================================
     HANDLE GRADE
  ====================================================== */

  const handleGradeChange = (value) => {
    setGradeId(value);

    setSubjectId("");
    setSubject("");

    setUnits([]);
    setSelectedUnitIds([]);
    setSelectedLessonIds([]);
    setLessonsByUnit({});
  };

  /* ======================================================
     HANDLE SUBJECT
  ====================================================== */

  const handleSubjectChange = (value) => {
    setSubjectId(value);

    const found = subjects.find(
      (item) => item.id === value
    );

    const actualName =
      found?.nameAr ||
      found?.title ||
      found?.name ||
      found?.subject ||
      found?.subjectName ||
      found?.label ||
      "";

    setSubject(
      systemId === "bac" && gradeId === "bac2"
        ? "التاريخ الوطني"
        : actualName
    );

    setUnits([]);
    setSelectedUnitIds([]);
    setSelectedLessonIds([]);
    setLessonsByUnit({});
  };

  /* ======================================================
     HANDLE EXAM SCOPE
  ====================================================== */

  const handleScopeChange = (value) => {
    setExamScope(value);

    /*
    --------------------------------------------------
    تغيير نوع الامتحان لا يمس الأسئلة نفسها.
    فقط يعيد ضبط نطاق الاختيار.
    --------------------------------------------------
    */

    if (value === "half" || value === "full") {
      setSelectedUnitIds([]);
      setSelectedLessonIds([]);
      setLessonsByUnit({});
    }
  };

  /* ======================================================
     SELECT UNIT
  ====================================================== */

  const toggleUnit = (unitId) => {
    setSelectedUnitIds((previous) => {
      const alreadySelected =
        previous.includes(unitId);

      if (alreadySelected) {
        return previous.filter(
          (id) => id !== unitId
        );
      }

      if (previous.length >= 3) {
        alert(
          "يمكن اختيار 3 وحدات كحد أقصى."
        );

        return previous;
      }

      return [...previous, unitId];
    });
  };

  /* ======================================================
     SELECT LESSON
  ====================================================== */

  const toggleLesson = (lessonId) => {
    setSelectedLessonIds((previous) => {
      const alreadySelected =
        previous.includes(lessonId);

      if (alreadySelected) {
        return previous.filter(
          (id) => id !== lessonId
        );
      }

      if (previous.length >= 3) {
        alert(
          "يمكن اختيار 3 دروس كحد أقصى."
        );

        return previous;
      }

      return [...previous, lessonId];
    });
  };

  /* ======================================================
     ADD QUESTION
  ====================================================== */

  const addQuestion = () => {
    setQuestions((previous) => [
      ...previous,
      {
        questionText: "",
        choices: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  /* ======================================================
     UPDATE QUESTION
  ====================================================== */

  const updateQuestion = (
    index,
    field,
    value
  ) => {
    setQuestions((previous) => {
      const copy = [...previous];

      copy[index] = {
        ...copy[index],
        [field]: value,
      };

      return copy;
    });
  };

  /* ======================================================
     UPDATE CHOICE
  ====================================================== */

  const updateChoice = (
    qIndex,
    cIndex,
    value
  ) => {
    setQuestions((previous) => {
      const copy = [...previous];

      const choices = [
        ...copy[qIndex].choices,
      ];

      choices[cIndex] = value;

      copy[qIndex] = {
        ...copy[qIndex],
        choices,
      };

      return copy;
    });
  };

  /* ======================================================
     VALIDATE SCOPE
  ====================================================== */

  const validateExamScope = () => {
    if (
      examScope === "lesson" &&
      selectedLessonIds.length === 0
    ) {
      alert(
        "اختر درسًا واحدًا على الأقل."
      );

      return false;
    }

    if (
      examScope === "unit" &&
      selectedUnitIds.length === 0
    ) {
      alert(
        "اختر وحدة واحدة على الأقل."
      );

      return false;
    }

    if (
      examScope === "custom" &&
      selectedUnitIds.length === 0 &&
      selectedLessonIds.length === 0
    ) {
      alert(
        "في الامتحان المخصص اختر وحدة أو درسًا واحدًا على الأقل."
      );

      return false;
    }

    if (selectedUnitIds.length > 3) {
      alert(
        "لا يمكن اختيار أكثر من 3 وحدات."
      );

      return false;
    }

    if (selectedLessonIds.length > 3) {
      alert(
        "لا يمكن اختيار أكثر من 3 دروس."
      );

      return false;
    }

    return true;
  };

  /* ======================================================
     SUBMIT EXAM
  ====================================================== */

  const submitExam = async () => {
    /* ----------------------------------------------------
       BASIC VALIDATION
    ---------------------------------------------------- */

    if (!title.trim()) {
      return alert(
        "اكتب عنوان الامتحان"
      );
    }

    if (!stageId.trim()) {
      return alert(
        "اكتب المرحلة الدراسية"
      );
    }

    if (!gradeId.trim()) {
      return alert(
        "اختر الصف الدراسي"
      );
    }

    if (!subjectId.trim()) {
      return alert(
        "اختر المادة"
      );
    }

    if (!duration || Number(duration) < 1) {
      return alert(
        "اكتب مدة صحيحة للامتحان"
      );
    }

    if (!validateExamScope()) {
      return;
    }

    /* ----------------------------------------------------
       PREPARE QUESTIONS
    ---------------------------------------------------- */

    const preparedQuestions =
      questions.map((question) => ({
        ...question,
        lessonId:
          selectedLessonIds[0] || "",
      }));

    /* ----------------------------------------------------
       PREPARE EXAM PAYLOAD
    ---------------------------------------------------- */

    const payload = {
      title: title.trim(),

      stageId: stageId.trim(),

      systemId: systemId.trim(),

      gradeId: gradeId.trim(),

      subjectId: subjectId.trim(),

      subject:
        subject.trim() ||
        selectedSubject?.nameAr ||
        selectedSubject?.title ||
        selectedSubject?.name ||
        "",

      /*
      --------------------------------------------------
      نطاق الامتحان
      --------------------------------------------------
      */

      examScope,

      /*
      --------------------------------------------------
      حتى 3 وحدات
      --------------------------------------------------
      */

      selectedUnitIds: [
        ...selectedUnitIds,
      ],

      /*
      --------------------------------------------------
      حتى 3 دروس
      --------------------------------------------------
      */

      selectedLessonIds: [
        ...selectedLessonIds,
      ],

      /*
      --------------------------------------------------
      الحقل القديم
      --------------------------------------------------

      نحتفظ به للتوافق مع النظام القديم.

      إذا كانت هناك وحدة واحدة فقط،
      نضعها هنا.

      إذا لم توجد وحدة واحدة محددة،
      يبقى فارغًا.
      --------------------------------------------------
      */

      unitId:
        selectedUnitIds.length === 1
          ? selectedUnitIds[0]
          : "",

      duration: Number(duration),

      questions: preparedQuestions,

      /*
      --------------------------------------------------
      Question Bank
      --------------------------------------------------
      */

      questionBankSettings: {
        enabled: false,

        count: 0,

        lessonIds: [
          ...selectedLessonIds,
        ],

        difficulty: "any",

        avoidPreviousUsage: true,
      },
    };

    /* ----------------------------------------------------
       SEND TO BACKEND
    ---------------------------------------------------- */

    try {
      console.log(
        "Creating Super Admin Exam:",
        payload
      );

      await api.post(
        "/api/exams",
        payload
      );

      alert(
        "تم إنشاء الامتحان بنجاح!"
      );

      /* --------------------------------------------------
         RESET FORM
      -------------------------------------------------- */

      setTitle("");

      setStageId("secondary");

      setSystemId("");

      setGradeId("");

      setSubjectId("");

      setSubject("");

      setDuration(30);

      setExamScope("custom");

      setSelectedUnitIds([]);

      setSelectedLessonIds([]);

      setLessonsByUnit({});

      setGrades([]);

      setSubjects([]);

      setUnits([]);

      setQuestions([
        {
          questionText: "",
          choices: ["", "", "", ""],
          correctAnswer: 0,
        },
      ]);
    } catch (err) {
      console.error(
        "❌ Error creating exam:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "حدث خطأ أثناء إرسال الامتحان";

      alert(message);
    }
  };

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div
      dir="rtl"
      className="p-6 text-white min-h-screen"
    >
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">
        إضافة امتحان جديد
      </h1>

      {/* ==================================================
          EXAM INFORMATION
      ================================================== */}

      <div className="bg-gray-900 p-5 rounded-lg mb-6">
        <h2 className="text-yellow-300 text-xl mb-4">
          بيانات الامتحان
        </h2>

        <div className="space-y-5">

          {/* TITLE */}

          <div>
            <label className="block text-gray-300 mb-1">
              عنوان الامتحان
            </label>

            <div className="flex gap-2">
              <input
                className="p-3 bg-gray-800 w-full rounded"
                placeholder="مثال: امتحان الوحدة الأولى"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />

              <button
                type="button"
                onClick={() =>
                  setTitle(
                    generateSuggestedTitle()
                  )
                }
                className="
                  px-5 rounded
                  bg-yellow-500
                  hover:bg-yellow-400
                  text-black
                  font-bold
                  whitespace-nowrap
                "
              >
                عنوان تلقائي
              </button>
            </div>
          </div>

          {/* SYSTEM */}

          <div>
            <label className="block text-gray-300 mb-2 font-bold">
              النظام الدراسي
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSystemChange("general")}
                className={`p-4 rounded-xl border-2 font-bold transition ${
                  systemId === "general"
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "bg-gray-800 text-yellow-300 border-yellow-500/40 hover:border-yellow-400"
                }`}
              >
                الثانوية العامة
              </button>

              <button
                type="button"
                onClick={() => handleSystemChange("bac")}
                className={`p-4 rounded-xl border-2 font-bold transition ${
                  systemId === "bac"
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "bg-gray-800 text-yellow-300 border-yellow-500/40 hover:border-yellow-400"
                }`}
              >
                البكالوريا المصرية
              </button>
            </div>

            <p className="text-gray-500 text-sm mt-2">
              المرحلة الحالية محصورة في الثانوية فقط، دون حذف أي مراحل أخرى من قاعدة البيانات.
            </p>
          </div>

          {/* STAGE - FIXED */}

          <input type="hidden" value="secondary" readOnly />

          {/* GRADE */}

          <div>
            <label className="block text-gray-300 mb-1">
              الصف الدراسي
            </label>

            <select
              className="p-3 bg-gray-800 w-full rounded"
              value={gradeId}
              onChange={(e) =>
                handleGradeChange(
                  e.target.value
                )
              }
              disabled={!systemId || loadingGrades}
            >
              <option value="">
                {loadingGrades
                  ? "جاري تحميل الصفوف..."
                  : !systemId
                  ? "اختر النظام أولًا"
                  : "اختر الصف"}
              </option>

              {grades
                .filter((grade) =>
                  systemId === "bac"
                    ? ["bac1", "bac2", "bac3"].includes(grade.id)
                    : ["sec1", "sec2", "sec3"].includes(grade.id)
                )
                .map((grade) => (
                <option
                  key={grade.id}
                  value={grade.id}
                >
                  {grade.title ||
                    grade.nameAr ||
                    grade.name ||
                    grade.id}
                </option>
              ))}
            </select>
          </div>

          {/* SUBJECT */}

          <div>
            <label className="block text-gray-300 mb-1">
              المادة
            </label>

            <select
              className="p-3 bg-gray-800 w-full rounded"
              value={subjectId}
              onChange={(e) =>
                handleSubjectChange(
                  e.target.value
                )
              }
              disabled={
                !gradeId ||
                loadingSubjects
              }
            >
              <option value="">
                {loadingSubjects
                  ? "جاري تحميل المواد..."
                  : !gradeId
                  ? "اختر الصف أولًا"
                  : "اختر المادة"}
              </option>

              {subjects.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {getSubjectDisplayName(item)}
                </option>
              ))}
            </select>

            {subjects.length > 0 && (
              <p className="text-gray-500 text-sm mt-2">
                المواد المعروضة من بيانات Firestore للصف المختار.
              </p>
            )}
          </div>

          {/* ==================================================
              EXAM SCOPE
          ================================================== */}

          <div
            className="
              bg-black
              border
              border-yellow-500/30
              rounded-xl
              p-5
            "
          >
            <label className="block text-yellow-300 text-lg font-bold mb-2">
              نطاق / نوع الامتحان
            </label>

            <p className="text-gray-400 text-sm mb-4">
              اختر النطاق الذي تريد أن يغطيه الامتحان.
            </p>

            <select
              className="p-3 bg-gray-800 w-full rounded"
              value={examScope}
              onChange={(e) =>
                handleScopeChange(
                  e.target.value
                )
              }
            >
              <option value="lesson">
                امتحان على درس / دروس
              </option>

              <option value="unit">
                امتحان على وحدة / وحدات
              </option>

              <option value="half">
                امتحان نصف المنهج
              </option>

              <option value="full">
                امتحان شامل على المنهج
              </option>

              <option value="custom">
                امتحان مخصص
              </option>
            </select>
          </div>

          {/* ==================================================
              UNITS
          ================================================== */}

          {(examScope === "unit" ||
            examScope === "custom") && (
            <div
              className="
                bg-black
                border
                border-blue-500/30
                rounded-xl
                p-5
              "
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-blue-300 text-lg font-bold">
                    {getCurriculumStructureLabel()}
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    العناصر المتاحة تظهر من بيانات Firestore، ويمكن اختيار حتى 3 عناصر للامتحان.
                  </p>
                </div>

                <div className="text-yellow-400 font-bold">
                  {selectedUnitIds.length} / 3
                </div>
              </div>

              {!subjectId ? (
                <div className="text-gray-500">
                  اختر الصف والمادة أولًا.
                </div>
              ) : loadingUnits ? (
                <div className="text-yellow-400">
                  جاري تحميل الوحدات...
                </div>
              ) : units.length === 0 ? (
                <div className="text-red-400">
                  لا توجد وحدات مرتبطة بهذه البيانات.
                </div>
              ) : (
                <div className="space-y-2">
                  {units.map((unit) => {
                    const checked =
                      selectedUnitIds.includes(
                        unit.id
                      );

                    return (
                      <label
                        key={unit.id}
                        className={`
                          flex
                          items-center
                          gap-3
                          p-3
                          rounded-lg
                          cursor-pointer
                          border
                          transition
                          ${
                            checked
                              ? "border-yellow-500 bg-yellow-500/10"
                              : "border-gray-700 bg-gray-900 hover:border-gray-500"
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleUnit(
                              unit.id
                            )
                          }
                          className="w-5 h-5"
                        />

                        <span
                          className={
                            checked
                              ? "text-yellow-300 font-bold"
                              : "text-gray-200"
                          }
                        >
                          {unit.title ||
                            unit.name ||
                            unit.unitId ||
                            unit.id}
                        </span>

                        <span className="text-gray-600 text-sm mr-auto">
                          {unit.unitId ||
                            unit.id}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================================================
              LESSONS
          ================================================== */}

          {(examScope === "lesson" ||
            examScope === "custom") && (
            <div
              className="
                bg-black
                border
                border-green-500/30
                rounded-xl
                p-5
              "
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-green-300 text-lg font-bold">
                    الدروس
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    اختر حتى 3 دروس.
                    يجب اختيار وحدة أولًا.
                  </p>
                </div>

                <div className="text-yellow-400 font-bold">
                  {selectedLessonIds.length} / 3
                </div>
              </div>

              {selectedUnitIds.length === 0 ? (
                <div className="text-gray-500">
                  اختر وحدة واحدة على الأقل لعرض الدروس.
                </div>
              ) : loadingLessons ? (
                <div className="text-yellow-400">
                  جاري تحميل الدروس...
                </div>
              ) : allAvailableLessons.length === 0 ? (
                <div className="text-red-400">
                  لا توجد دروس داخل الوحدات المختارة.
                </div>
              ) : (
                <div className="space-y-5">
                  {selectedUnitIds.map(
                    (selectedUnitId) => {
                      const unit =
                        units.find(
                          (item) =>
                            item.id ===
                            selectedUnitId
                        );

                      const lessons =
                        lessonsByUnit[
                          selectedUnitId
                        ] || [];

                      return (
                        <div
                          key={selectedUnitId}
                          className="
                            border
                            border-gray-700
                            rounded-xl
                            p-4
                            bg-gray-900
                          "
                        >
                          <h4 className="text-yellow-300 font-bold mb-3">
                            {unit?.title ||
                              unit?.name ||
                              selectedUnitId}
                          </h4>

                          {lessons.length === 0 ? (
                            <div className="text-gray-500">
                              لا توجد دروس لهذه الوحدة.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {lessons.map(
                                (lesson) => {
                                  const checked =
                                    selectedLessonIds.includes(
                                      lesson.id
                                    );

                                  return (
                                    <label
                                      key={
                                        lesson.id
                                      }
                                      className={`
                                        flex
                                        items-center
                                        gap-3
                                        p-3
                                        rounded-lg
                                        cursor-pointer
                                        border
                                        ${
                                          checked
                                            ? "border-green-500 bg-green-500/10"
                                            : "border-gray-700"
                                        }
                                      `}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={
                                          checked
                                        }
                                        onChange={() =>
                                          toggleLesson(
                                            lesson.id
                                          )
                                        }
                                        className="w-5 h-5"
                                      />

                                      <span
                                        className={
                                          checked
                                            ? "text-green-300 font-bold"
                                            : "text-gray-200"
                                        }
                                      >
                                        {lesson.title ||
                                          lesson.name ||
                                          lesson.lessonTitle ||
                                          lesson.id}
                                      </span>
                                    </label>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================================================
              HALF / FULL
          ================================================== */}

          {(examScope === "half" ||
            examScope === "full") && (
            <div
              className="
                bg-black
                border
                border-yellow-500/30
                rounded-xl
                p-5
              "
            >
              <div className="text-yellow-300 text-lg font-bold mb-2">
                {examScope === "half"
                  ? "نطاق نصف المنهج"
                  : "نطاق المنهج كاملًا"}
              </div>

              <p className="text-gray-400 leading-7">
                هذا الامتحان لن يكون مربوطًا بدرس واحد
                أو بوحدة واحدة فقط. سيتم حفظ نطاقه على
                مستوى المادة والصف.
              </p>
            </div>
          )}

          {/* ==================================================
              DURATION
          ================================================== */}

          <div>
            <label className="block text-gray-300 mb-1">
              مدة الامتحان بالدقائق
            </label>

            <input
              className="p-3 bg-gray-800 w-full rounded"
              type="number"
              min="1"
              placeholder="المدة بالدقائق"
              value={duration}
              onChange={(e) =>
                setDuration(
                  e.target.value
                )
              }
            />
          </div>

        </div>
      </div>

      {/* ==================================================
          QUESTIONS
      ================================================== */}

      <div className="bg-gray-900 p-5 rounded-lg">
        <h2 className="text-yellow-300 text-xl mb-4">
          الأسئلة
        </h2>

        {questions.map((q, i) => (
          <div
            key={i}
            className="bg-gray-800 p-4 rounded-lg mb-4"
          >
            <h3 className="text-yellow-400 mb-3">
              السؤال {i + 1}
            </h3>

            {/* QUESTION TEXT */}

            <input
              className="p-3 bg-gray-900 w-full mb-3 rounded"
              placeholder={`نص السؤال ${
                i + 1
              }`}
              value={q.questionText}
              onChange={(e) =>
                updateQuestion(
                  i,
                  "questionText",
                  e.target.value
                )
              }
            />

            {/* CHOICES */}

            {q.choices.map(
              (choice, choiceIndex) => (
                <input
                  key={choiceIndex}
                  className="p-3 bg-gray-900 w-full mb-2 rounded"
                  placeholder={`الاختيار ${
                    choiceIndex + 1
                  }`}
                  value={choice}
                  onChange={(e) =>
                    updateChoice(
                      i,
                      choiceIndex,
                      e.target.value
                    )
                  }
                />
              )
            )}

            {/* CORRECT ANSWER */}

            <label className="text-gray-300 mt-3 block mb-1">
              الإجابة الصحيحة
            </label>

            <input
              className="p-3 bg-gray-900 w-full rounded"
              type="number"
              min={0}
              max={3}
              value={q.correctAnswer}
              onChange={(e) =>
                updateQuestion(
                  i,
                  "correctAnswer",
                  Number(
                    e.target.value
                  )
                )
              }
            />

            <p className="text-gray-500 text-sm mt-1">
              0 = الاختيار الأول ، 1 = الثاني ،
              2 = الثالث ، 3 = الرابع
            </p>
          </div>
        ))}

        {/* ADD QUESTION */}

        <button
          type="button"
          onClick={addQuestion}
          className="
            bg-blue-600
            hover:bg-blue-700
            p-3
            mt-3
            rounded
            w-full
          "
        >
          ➕ إضافة سؤال
        </button>

        {/* SAVE */}

        <button
          type="button"
          onClick={submitExam}
          className="
            bg-green-600
            hover:bg-green-700
            p-3
            mt-4
            rounded
            w-full
            font-bold
          "
        >
          ✔ حفظ الامتحان
        </button>
      </div>
    </div>
  );
}