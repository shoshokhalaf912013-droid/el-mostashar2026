// models/Attempt.js

const mongoose = require("mongoose");

/*
========================================================
Attempt
محاولة الطالب للامتحان
========================================================
*/


// ======================================================
// إجابة السؤال
// ======================================================

const answerSchema = new mongoose.Schema(
  {
    /*
    رقم السؤال داخل الامتحان
    */

    questionIndex: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
    رقم الاختيار
    0 = أ
    1 = ب
    2 = ج
    3 = د
    */

    choiceIndex: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);


// ======================================================
// Attempt Schema
// ======================================================

const attemptSchema = new mongoose.Schema(
  {
    /*
    ==============================
    الامتحان
    ==============================
    */

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },


    /*
    ==============================
    الطالب
    ==============================
    
    يأتي من JWT:
    
    req.user.id
    */

    userId: {
      type: String,
      default: null,
      index: true,
    },


    /*
    ==============================
    الإجابات
    ==============================
    */

    answers: {
      type: [answerSchema],
      default: [],
    },


    /*
    ==============================
    حالة المحاولة
    ==============================
    */

    status: {
      type: String,

      enum: [
        "in_progress",
        "submitted",
        "failed",
        "abandoned",
      ],

      default: "in_progress",

      index: true,
    },


    /*
    ==============================
    وقت بدء الامتحان
    ==============================
    */

    startedAt: {
      type: Date,
      default: Date.now,
    },


    /*
    ==============================
    آخر حفظ
    ==============================
    */

    lastSavedAt: {
      type: Date,
      default: Date.now,
    },


    /*
    ==============================
    آخر Ping
    ==============================
    */

    lastPingAt: {
      type: Date,
      default: Date.now,
    },


    /*
    ==============================
    وقت انتهاء الامتحان
    ==============================
    */

    endedAt: {
      type: Date,
      default: null,
    },


    /*
    ==============================
    الوقت المتبقي
    ==============================
    
    بالثواني
    */

    remainingSeconds: {
      type: Number,
      required: true,
      min: 0,
    },


    /*
    ==============================
    الدرجة
    ==============================
    */

    score: {
      type: Number,
      default: null,
      min: 0,
    },


    /*
    ==============================
    السماح بالاستكمال
    ==============================
    
    false في Strict Mode
    */

    allowResume: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


// ======================================================
// Indexes
// ======================================================

/*
البحث عن محاولات الطالب في امتحان معين
*/

attemptSchema.index({
  userId: 1,
  examId: 1,
  createdAt: -1,
});


/*
البحث عن المحاولات قيد التنفيذ
*/

attemptSchema.index({
  userId: 1,
  status: 1,
});


/*
منع وجود أكثر من محاولة
قيد التنفيذ لنفس الطالب في نفس الامتحان.

ملاحظة:
هذا Partial Index حتى لا يمنع الطالب
من إعادة الامتحان بعد التسليم.
*/

attemptSchema.index(
  {
    userId: 1,
    examId: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      status: "in_progress",
      userId: {
        $type: "string",
      },
    },
  }
);


// ======================================================
// Pre Save
// ======================================================

attemptSchema.pre("save", function () {

  /*
  لا نسمح بالوقت بالسالب
  */

  if (
    typeof this.remainingSeconds ===
      "number" &&
    this.remainingSeconds < 0
  ) {
    this.remainingSeconds = 0;
  }


  /*
  إذا أصبحت المحاولة submitted
  أو failed أو abandoned
  نسجل وقت الانتهاء إذا لم يكن موجودًا.
  */

  if (
    [
      "submitted",
      "failed",
      "abandoned",
    ].includes(this.status)
  ) {

    if (!this.endedAt) {
      this.endedAt = new Date();
    }

  }

});


// ======================================================
// Export
// ======================================================

module.exports = mongoose.model(
  "Attempt",
  attemptSchema
);