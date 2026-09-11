// controllers/attemptController.js

const Attempt = require("../models/Attempt");
const Exam = require("../models/Exam");
const QuestionUsage = require("../models/QuestionUsage");
const QuestionBank = require("../models/QuestionBank");


// ======================================================
// Helper — الحصول على userId من JWT
// ======================================================

function getUserId(req) {
  return req.user && req.user.id
    ? String(req.user.id)
    : null;
}


// ======================================================
// START ATTEMPT
// بدء محاولة امتحان
// ======================================================

exports.startAttempt = async (req, res, next) => {
  try {

    const { examId } = req.body;

    /*
    ==============================
    التأكد من تسجيل الدخول
    ==============================
    */

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }


    /*
    ==============================
    التحقق من examId
    ==============================
    */

    if (!examId) {
      return res.status(400).json({
        success: false,
        error: "examId is required",
      });
    }


    /*
    ==============================
    الحصول على الامتحان
    ==============================
    */

    const exam =
      await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: "Exam not found",
      });
    }


    /*
    ==============================
    التحقق من حالة الامتحان
    ==============================
    */

    if (
      exam.status === "closed"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "هذا الامتحان مغلق.",
      });
    }


    /*
    ==============================
    منع إنشاء محاولات متكررة
    ==============================
    
    إذا كان لدى الطالب محاولة
    قيد التنفيذ لنفس الامتحان،
    نعيدها بدل إنشاء محاولة جديدة.
    */

    const existingAttempt =
      await Attempt.findOne({
        examId: exam._id,
        userId,
        status: "in_progress",
      });

    if (existingAttempt) {

      return res.json({
        success: true,
        resumed: true,
        attemptId:
          existingAttempt._id,
        attempt:
          existingAttempt,
        exam,
      });
    }


    /*
    ==============================
    مدة الامتحان
    ==============================
    
    Exam.js يستخدم duration
    وليس durationMinutes.
    */

    const durationMinutes =
      Number(exam.duration) || 30;

    const remainingSeconds =
      durationMinutes * 60;


    /*
    ==============================
    إنشاء Attempt
    ==============================
    */

    const attempt =
      new Attempt({

        examId:
          exam._id,

        userId,

        answers: [],

        status:
          "in_progress",

        remainingSeconds,

        allowResume:
          !exam.strictMode,

        startedAt:
          new Date(),

        lastSavedAt:
          new Date(),

        lastPingAt:
          new Date(),

      });


    await attempt.save();


    /*
    ==============================
    تسجيل QuestionUsage
    ==============================
    
    الأسئلة أصبحت الآن جزءًا فعليًا
    من محاولة الطالب.
    */

    const bankQuestions =
      exam.questions.filter(
        (question) =>
          question.questionBankId
      );


    if (
      bankQuestions.length > 0
    ) {

      const usageDocuments =
        bankQuestions.map(
          (question) => ({

            questionId:
              question.questionBankId,

            userId,

            examId:
              exam._id,

            attemptId:
              attempt._id,

            usageType:
              "exam",

            usedAt:
              new Date(),

          })
        );


      /*
      ==============================
      منع تكرار السجلات
      ==============================
      */

      try {

        await QuestionUsage.insertMany(
          usageDocuments,
          {
            ordered: false,
          }
        );

      } catch (usageError) {

        /*
        إذا كان هناك سجل موجود بالفعل،
        لا نريد إسقاط بدء الامتحان.
        */

        if (
          usageError &&
          usageError.code !== 11000 &&
          !usageError.writeErrors
        ) {
          throw usageError;
        }
      }


      /*
      ==============================
      تحديث إحصائيات البنك
      ==============================
      */

      const questionIds =
        bankQuestions.map(
          (question) =>
            question.questionBankId
        );


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
            lastUsedAt:
              new Date(),
          },
        }
      );
    }


    /*
    ==============================
    النتيجة
    ==============================
    */

    res.status(201).json({

      success: true,

      resumed: false,

      attemptId:
        attempt._id,

      attempt,

      exam,

    });

  } catch (err) {

    console.error(
      "startAttempt error:",
      err
    );

    next(err);
  }
};


// ======================================================
// GET ATTEMPT
// الحصول على محاولة
// ======================================================

exports.getAttempt = async (
  req,
  res,
  next
) => {

  try {

    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error:
          "User authentication required",
      });
    }


    const att =
      await Attempt.findById(
        req.params.id
      ).lean();


    if (!att) {
      return res.status(404).json({
        success: false,
        error:
          "Attempt not found",
      });
    }


    /*
    ==============================
    حماية المحاولة
    ==============================
    */

    if (
      att.userId &&
      String(att.userId) !== userId
    ) {

      return res.status(403).json({
        success: false,
        error:
          "You are not allowed to access this attempt",
      });
    }


    res.json({
      success: true,
      attempt: att,
    });

  } catch (err) {

    console.error(
      "getAttempt error:",
      err
    );

    next(err);
  }
};


// ======================================================
// SAVE ATTEMPT
// حفظ الإجابات
// ======================================================

exports.saveAttempt = async (
  req,
  res,
  next
) => {

  try {

    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error:
          "User authentication required",
      });
    }


    const { id } =
      req.params;

    const {
      answers,
      remainingSeconds,
    } = req.body;


    const att =
      await Attempt.findById(id);


    if (!att) {
      return res.status(404).json({
        success: false,
        error:
          "Attempt not found",
      });
    }


    /*
    ==============================
    حماية المحاولة
    ==============================
    */

    if (
      att.userId &&
      String(att.userId) !== userId
    ) {

      return res.status(403).json({
        success: false,
        error:
          "You are not allowed to modify this attempt",
      });
    }


    if (
      att.status !==
      "in_progress"
    ) {

      return res.status(400).json({
        success: false,
        error:
          "Cannot save non in_progress attempt",
      });
    }


    /*
    ==============================
    حفظ الإجابات
    ==============================
    */

    if (
      Array.isArray(answers)
    ) {

      att.answers =
        answers;
    }


    /*
    ==============================
    الوقت المتبقي
    ==============================
    */

    if (
      typeof remainingSeconds ===
      "number"
    ) {

      att.remainingSeconds =
        Math.max(
          0,
          Math.floor(
            remainingSeconds
          )
        );
    }


    att.lastSavedAt =
      new Date();

    att.lastPingAt =
      new Date();


    await att.save();


    res.json({
      success: true,
      ok: true,
    });

  } catch (err) {

    console.error(
      "saveAttempt error:",
      err
    );

    next(err);
  }
};


// ======================================================
// PING ATTEMPT
// ======================================================

exports.pingAttempt = async (
  req,
  res,
  next
) => {

  try {

    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error:
          "User authentication required",
      });
    }


    const att =
      await Attempt.findById(
        req.params.id
      );


    if (!att) {
      return res.status(404).json({
        success: false,
        error:
          "Attempt not found",
      });
    }


    if (
      att.userId &&
      String(att.userId) !== userId
    ) {

      return res.status(403).json({
        success: false,
        error:
          "Not allowed",
      });
    }


    if (
      att.status !==
      "in_progress"
    ) {

      return res.status(400).json({
        success: false,
        error:
          "Not in progress",
      });
    }


    att.lastPingAt =
      new Date();


    await att.save();


    res.json({
      success: true,
      ok: true,
    });

  } catch (err) {

    console.error(
      "pingAttempt error:",
      err
    );

    next(err);
  }
};


// ======================================================
// LEAVE ATTEMPT
// مغادرة الامتحان
// ======================================================

exports.leaveAttempt = async (
  req,
  res,
  next
) => {

  try {

    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error:
          "User authentication required",
      });
    }


    const att =
      await Attempt.findById(
        req.params.id
      );


    if (!att) {
      return res.status(404).json({
        success: false,
        error:
          "Attempt not found",
      });
    }


    if (
      att.userId &&
      String(att.userId) !== userId
    ) {

      return res.status(403).json({
        success: false,
        error:
          "Not allowed",
      });
    }


    if (
      att.status !==
      "in_progress"
    ) {

      return res.json({
        success: true,
        ok: true,
        status:
          att.status,
      });
    }


    const exam =
      await Exam.findById(
        att.examId
      );


    /*
    ==============================
    Strict Mode
    ==============================
    */

    if (
      exam &&
      exam.strictMode
    ) {

      att.status =
        "failed";

      att.allowResume =
        false;

      att.lastSavedAt =
        new Date();

      await att.save();


      return res.json({
        success: true,
        ok: true,
        status:
          "failed",
      });
    }


    /*
    ==============================
    الوضع العادي
    ==============================
    */

    att.status =
      "abandoned";

    att.lastSavedAt =
      new Date();


    await att.save();


    res.json({
      success: true,
      ok: true,
      status:
        "abandoned",
    });

  } catch (err) {

    console.error(
      "leaveAttempt error:",
      err
    );

    next(err);
  }
};


// ======================================================
// SUBMIT ATTEMPT
// تسليم الامتحان
// ======================================================

exports.submitAttempt = async (
  req,
  res,
  next
) => {

  try {

    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error:
          "User authentication required",
      });
    }


    const { id } =
      req.params;


    const att =
      await Attempt.findById(id);


    if (!att) {
      return res.status(404).json({
        success: false,
        error:
          "Attempt not found",
      });
    }


    /*
    ==============================
    حماية المحاولة
    ==============================
    */

    if (
      att.userId &&
      String(att.userId) !== userId
    ) {

      return res.status(403).json({
        success: false,
        error:
          "You are not allowed to submit this attempt",
      });
    }


    if (
      att.status !==
      "in_progress"
    ) {

      return res.status(400).json({
        success: false,
        error:
          "Cannot submit",
      });
    }


    const exam =
      await Exam.findById(
        att.examId
      );


    if (!exam) {
      return res.status(404).json({
        success: false,
        error:
          "Exam not found",
      });
    }


    /*
    ==============================
    التحقق من عدد الإجابات
    ==============================
    */

    const answers =
      Array.isArray(
        att.answers
      )
        ? att.answers
        : [];


    /*
    ==============================
    منع الإجابات المكررة
    ==============================
    */

    const answerMap =
      new Map();


    answers.forEach(
      (answer) => {

        if (
          answer &&
          Number.isInteger(
            answer.questionIndex
          )
        ) {

          answerMap.set(
            answer.questionIndex,
            answer.choiceIndex
          );
        }

      }
    );


    /*
    ==============================
    التحقق من إكمال الامتحان
    ==============================
    */

    if (
      answerMap.size <
      exam.questions.length
    ) {

      return res.status(400).json({
        success: false,
        error:
          "All questions must be answered before submit",
      });
    }


    /*
    ==============================
    حساب الدرجة
    ==============================
    */

    let score = 0;

    let totalMarks = 0;


    for (
      let i = 0;
      i <
      exam.questions.length;
      i++
    ) {

      const question =
        exam.questions[i];


      const marks =
        Number(
          question.marks
        ) || 1;


      totalMarks +=
        marks;


      /*
      MCQ
      */

      if (
        question.type ===
        "mcq"
      ) {

        const studentAnswer =
          answerMap.get(i);


        if (
          studentAnswer !==
            undefined &&
          studentAnswer ===
            question.correctAnswer
        ) {

          score +=
            marks;
        }
      }

      /*
      Essay
      ==============================
      المقالي يحتاج تصحيحًا منفصلًا
      */

    }


    /*
    ==============================
    حفظ النتيجة
    ==============================
    */

    att.score =
      score;

    att.status =
      "submitted";

    att.remainingSeconds =
      Math.max(
        0,
        Number(
          att.remainingSeconds
        ) || 0
      );

    att.lastSavedAt =
      new Date();

    att.endedAt =
      new Date();


    await att.save();


    res.json({

      success: true,

      ok: true,

      score,

      total:
        totalMarks,

      questionsCount:
        exam.questions.length,

      percentage:
        totalMarks > 0
          ? Math.round(
              (score /
                totalMarks) *
                100
            )
          : 0,

    });

  } catch (err) {

    console.error(
      "submitAttempt error:",
      err
    );

    next(err);
  }
};