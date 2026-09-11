// src/pages/teacher/ExamBuilder.jsx

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";

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
});

/*
========================================================
COMPONENT
========================================================
*/

export default function ExamBuilder() {
  const navigate = useNavigate();

  const {
    gradeId,
    subjectId,
    unitId,
    lessonId,
  } = useParams();

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

  /*
  ========================================================
  مصدر إنشاء الأسئلة
  ========================================================
  */

  const [questionSource, setQuestionSource] =
    useState("manual");

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
  رفع ملف AI
  ========================================================
  */

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
      formData.append("unitId", unitId || "");
      formData.append("lessonId", lessonId || "");

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
            unitId: unitId || "",
            lessonId: lessonId || "",
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

    if (
      !gradeId ||
      !subjectId ||
      !unitId ||
      !lessonId
    ) {
      alert(
        "بيانات الصف أو المادة أو الوحدة أو الدرس غير مكتملة."
      );
      return false;
    }

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
        (q) => ({
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

          lessonId:
            lessonId || "",

          /*
          MCQ
          */

          choices:
            q.type === "mcq"
              ? q.choices
              : [],

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

          gradeId:
            gradeId || "",

          subjectId:
            subjectId || "",

          unitId:
            unitId || "",

          lessonId:
            lessonId || "",

          duration:
            Number(duration),

          questions:
            prepareQuestions(),

          questionsCount:
            questions.length,

          creationSource:
            questionSource,

          /*
          البنك غير مفعل حاليًا
          */

          questionBankSettings:
            {
              enabled: false,
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

        </div>

      </div>

      {/* ==================================================
          بيانات الارتباط
      ================================================== */}

      <div className="lesson-block">

        <h3>
          ارتباط الامتحان بالدرس
        </h3>

        <div
          style={{
            marginTop:
              "12px",
            padding:
              "15px",
            border:
              "1px solid #d4af37",
            borderRadius:
              "12px",
            lineHeight:
              "2",
            background:
              "rgba(212,175,55,.05)",
          }}
        >

          <div>
            <b>
              الصف:
            </b>{" "}
            {gradeId ||
              "غير محدد"}
          </div>

          <div>
            <b>
              المادة:
            </b>{" "}
            {subjectId ||
              "غير محددة"}
          </div>

          <div>
            <b>
              الوحدة:
            </b>{" "}
            {unitId ||
              "غير محددة"}
          </div>

          <div>
            <b>
              الدرس:
            </b>{" "}
            {lessonId ||
              "غير محدد"}
          </div>

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
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
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

          <span>
            {questions.length} سؤال
          </span>

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

              {/* مصدر السؤال */}

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
                  MCQ
              ================================================== */}

              {q.type ===
                "mcq" && (

                <div>

                  <h4>
                    الاختيارات
                  </h4>

                  {q.choices.map(
                    (
                      choice,
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
                          alignItems:
                            "center",
                          marginBottom:
                            "8px",
                        }}
                      >

                        <strong>
                          (
                          {
                            LETTERS[
                              ci
                            ]
                          }
                          )
                        </strong>

                        <input
                          className="youtube-input"
                          style={{
                            margin:
                              0,
                          }}
                          placeholder={`الاختيار ${
                            LETTERS[
                              ci
                            ]
                          }`}
                          value={
                            choice
                          }
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

                  {q.type ===
                    "mcq" && (

                    <div
                      style={{
                        marginTop:
                          "15px",
                      }}
                    >

                      {q.choices.map(
                        (
                          choice,
                          ci
                        ) => (

                          <div
                            key={
                              ci
                            }
                            style={{
                              padding:
                                "8px",
                              marginBottom:
                                "5px",
                              border:
                                "1px solid #333",
                              borderRadius:
                                "7px",
                            }}
                          >
                            (
                            {
                              LETTERS[
                                ci
                              ]
                            }
                            ){" "}
                            {
                              choice ||
                              "-"
                            }
                          </div>

                        )
                      )}

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