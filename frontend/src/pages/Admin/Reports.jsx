// frontend/src/pages/Admin/Reports.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../utils/api";

/* =========================================================
   CIRCULAR PROGRESS
========================================================= */

function CircularProgress({
  value = 0,
  label = "",
  subLabel = "",
  size = 150,
  stroke = 12,
  gradient = "linear-gradient(135deg,#00f5a0,#00c6ff)",
}) {
  const safeValue = Math.max(
    0,
    Math.min(100, Number(value) || 0)
  );

  const radius = 50 - stroke / 2;

  const circumference =
    2 * Math.PI * radius;

  const dashOffset =
    circumference -
    (safeValue / 100) *
      circumference;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* BACKGROUND CIRCLE */}

        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            inset: 0,
            transform:
              "rotate(-90deg)",
          }}
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={stroke}
          />

          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#circleGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={
              circumference
            }
            strokeDashoffset={
              dashOffset
            }
            style={{
              transition:
                "stroke-dashoffset 0.8s ease",
              filter:
                "drop-shadow(0 0 7px rgba(0, 220, 255, 0.35))",
            }}
          />

          <defs>
            <linearGradient
              id="circleGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={
                  gradient
                    .replace(
                      "linear-gradient(135deg,",
                      ""
                    )
                    .split(",")[0]
                }
              />

              <stop
                offset="100%"
                stopColor={
                  gradient
                    .replace(
                      "linear-gradient(135deg,",
                      ""
                    )
                    .split(",")[1]
                    ?.replace(
                      ")",
                      ""
                    ) ||
                  "#ffffff"
                }
              />
            </linearGradient>
          </defs>
        </svg>

        {/* CENTER */}

        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize:
                size >= 150
                  ? "28px"
                  : "24px",
              fontWeight: "900",
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {safeValue}%
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "#888",
              marginTop: "7px",
            }}
          >
            من 100
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: "16px",
          color: "#fff",
          fontWeight: "800",
          textAlign: "center",
        }}
      >
        {label}
      </div>

      {subLabel && (
        <div
          style={{
            fontSize: "12px",
            color: "#777",
            textAlign: "center",
          }}
        >
          {subLabel}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SMALL STAT
========================================================= */

function SmallStat({
  icon,
  title,
  value,
  accent = "#ffd700",
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(145deg,#151515,#0c0c0c)",
        border:
          "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "16px",
        minHeight: "90px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "rgba(255,255,255,0.05)",
          fontSize: "21px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color: "#777",
            fontSize: "12px",
            marginBottom: "5px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "23px",
            fontWeight: "900",
            color: accent,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION
========================================================= */

function Section({
  title,
  icon,
  children,
}) {
  return (
    <section
      style={{
        background:
          "linear-gradient(145deg,#101010,#0b0b0b)",
        border:
          "1px solid rgba(212,175,55,0.18)",
        borderRadius: "18px",
        padding: "22px",
        marginTop: "24px",
        boxShadow:
          "0 12px 30px rgba(0,0,0,0.22)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          marginBottom: "18px",
        }}
      >
        <span
          style={{
            fontSize: "20px",
          }}
        >
          {icon}
        </span>

        <h2
          style={{
            margin: 0,
            color: "#ffd700",
            fontSize: "20px",
          }}
        >
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   REPORTS
========================================================= */

export default function Reports() {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    statistics,
    setStatistics,
  ] = useState(null);

  const [
    topExams,
    setTopExams,
  ] = useState([]);

  const [
    recentAttempts,
    setRecentAttempts,
  ] = useState([]);

  const [
    examReports,
    setExamReports,
  ] = useState([]);

  const [
    questionReports,
    setQuestionReports,
  ] = useState([]);

  /* =====================================================
     LOAD
  ===================================================== */

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const [
        summaryRes,
        examsRes,
        questionsRes,
      ] = await Promise.all([
        api.get(
          "/api/reports/summary"
        ),

        api.get(
          "/api/reports/exams"
        ),

        api.get(
          "/api/reports/questions"
        ),
      ]);

      setStatistics(
        summaryRes.data
          ?.statistics || null
      );

      setTopExams(
        Array.isArray(
          summaryRes.data
            ?.topExams
        )
          ? summaryRes.data.topExams
          : []
      );

      setRecentAttempts(
        Array.isArray(
          summaryRes.data
            ?.recentAttempts
        )
          ? summaryRes.data
              .recentAttempts
          : []
      );

      setExamReports(
        Array.isArray(
          examsRes.data
            ?.reports
        )
          ? examsRes.data.reports
          : []
      );

      setQuestionReports(
        Array.isArray(
          questionsRes.data
            ?.reports
        )
          ? questionsRes.data.reports
          : []
      );
    } catch (err) {
      console.error(
        "Reports loading error:",
        err
      );

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.msg ||
          "تعذر تحميل التقارير."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  /* =====================================================
     CALCULATIONS
  ===================================================== */

  const completionRate =
    useMemo(() => {
      if (
        !statistics ||
        !statistics.totalAttempts
      ) {
        return 0;
      }

      return Math.round(
        (statistics.completedAttempts /
          statistics.totalAttempts) *
          100
      );
    }, [statistics]);

  const abandonedRate =
    useMemo(() => {
      if (
        !statistics ||
        !statistics.totalAttempts
      ) {
        return 0;
      }

      return Math.round(
        (statistics.abandonedAttempts /
          statistics.totalAttempts) *
          100
      );
    }, [statistics]);

  const activeRate =
    useMemo(() => {
      if (
        !statistics ||
        !statistics.totalAttempts
      ) {
        return 0;
      }

      return Math.round(
        (statistics.inProgressAttempts /
          statistics.totalAttempts) *
          100
      );
    }, [statistics]);

  const averageScorePercent =
    useMemo(() => {
      if (
        !statistics ||
        !statistics.averageScore
      ) {
        return 0;
      }

      /*
        هنا نعرض متوسط الدرجة
        كنسبة فقط إذا كانت القيمة
        أصلًا بين 0 و100.
      */

      return Math.max(
        0,
        Math.min(
          100,
          Number(
            statistics.averageScore
          ) || 0
        )
      );
    }, [statistics]);

  /* =====================================================
     HELPERS
  ===================================================== */

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    try {
      return new Date(
        value
      ).toLocaleString(
        "ar-EG"
      );
    } catch {
      return "—";
    }
  }

  function statusLabel(
    status
  ) {
    switch (status) {
      case "submitted":
        return "تم التسليم";

      case "in_progress":
        return "قيد التنفيذ";

      case "abandoned":
        return "متروكة";

      case "failed":
        return "فاشلة";

      default:
        return status || "—";
    }
  }

  function statusColor(
    status
  ) {
    switch (status) {
      case "submitted":
        return "#4ade80";

      case "failed":
        return "#f87171";

      case "abandoned":
        return "#facc15";

      case "in_progress":
        return "#60a5fa";

      default:
        return "#aaa";
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg,#080808,#111)",
          color: "#fff",
          padding: "30px",
          direction: "rtl",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
            minHeight: "70vh",
            flexDirection:
              "column",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius:
                "50%",
              border:
                "5px solid rgba(255,215,0,0.15)",
              borderTopColor:
                "#ffd700",
              animation:
                "reportsSpin 0.8s linear infinite",
            }}
          />

          <div
            style={{
              color: "#aaa",
              fontSize: "18px",
            }}
          >
            جاري تحميل التقارير...
          </div>

          <style>
            {`
              @keyframes reportsSpin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg,#080808,#111)",
          color: "#fff",
          padding: "30px",
          direction: "rtl",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin:
              "100px auto",
            textAlign:
              "center",
            background:
              "linear-gradient(145deg,#211010,#120909)",
            border:
              "1px solid #7f1d1d",
            borderRadius: "18px",
            padding: "35px",
          }}
        >
          <div
            style={{
              fontSize: "45px",
              marginBottom:
                "15px",
            }}
          >
            ⚠️
          </div>

          <h2
            style={{
              color: "#ffd700",
              marginTop: 0,
            }}
          >
            تعذر تحميل التقارير
          </h2>

          <div
            style={{
              color: "#fca5a5",
              marginBottom:
                "20px",
            }}
          >
            {error}
          </div>

          <button
            onClick={
              loadReports
            }
            style={{
              background:
                "#ffd700",
              color: "#111",
              border: "none",
              borderRadius:
                "10px",
              padding:
                "12px 25px",
              fontWeight:
                "800",
              cursor:
                "pointer",
            }}
          >
            🔄 إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(212,175,55,0.07), transparent 35%), linear-gradient(180deg,#080808,#111)",
        color: "#fff",
        padding:
          "28px",
        direction: "rtl",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom:
            "25px",
        }}
      >
        <div>
          <div
            style={{
              fontSize:
                "12px",
              color:
                "#888",
              marginBottom:
                "5px",
            }}
          >
            لوحة الإدارة
          </div>

          <h1
            style={{
              margin: 0,
              fontSize:
                "34px",
              fontWeight:
                "900",
              color:
                "#ffd700",
              letterSpacing:
                "0.3px",
            }}
          >
            📊 التقارير والإحصائيات
          </h1>

          <p
            style={{
              marginTop:
                "8px",
              color:
                "#888",
            }}
          >
            متابعة أداء الطلاب والامتحانات بشكل مباشر
          </p>
        </div>

        <button
          onClick={
            loadReports
          }
          style={{
            background:
              "linear-gradient(135deg,#ffd700,#d4af37)",
            color:
              "#111",
            border:
              "none",
            borderRadius:
              "12px",
            padding:
              "13px 22px",
            fontWeight:
              "900",
            cursor:
              "pointer",
            boxShadow:
              "0 8px 25px rgba(255,215,0,0.18)",
          }}
        >
          🔄 تحديث البيانات
        </button>
      </div>

      {/* =================================================
          MAIN CIRCULAR DASHBOARD
      ================================================= */}

      <div
        style={{
          background:
            "linear-gradient(145deg,#121212,#0a0a0a)",
          border:
            "1px solid rgba(255,255,255,0.08)",
          borderRadius:
            "22px",
          padding:
            "28px 22px",
          display:
            "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(170px,1fr))",
          gap:
            "18px",
          alignItems:
            "center",
          boxShadow:
            "0 18px 50px rgba(0,0,0,0.3)",
        }}
      >
        <CircularProgress
          value={
            statistics?.passRate ||
            0
          }
          label="نسبة النجاح"
          subLabel="الطلاب الناجحون"
          gradient="linear-gradient(135deg,#00f5a0,#00c853)"
        />

        <CircularProgress
          value={
            completionRate
          }
          label="نسبة الإتمام"
          subLabel="الامتحانات المكتملة"
          gradient="linear-gradient(135deg,#00c6ff,#0072ff)"
        />

        <CircularProgress
          value={
            averageScorePercent
          }
          label="متوسط الأداء"
          subLabel="متوسط الدرجات"
          gradient="linear-gradient(135deg,#ffd700,#ff8c00)"
        />

        <CircularProgress
          value={
            Math.max(
              0,
              100 - abandonedRate
            )
          }
          label="الاستمرارية"
          subLabel="المحاولات غير المتروكة"
          gradient="linear-gradient(135deg,#a855f7,#ec4899)"
        />
      </div>

      {/* =================================================
          SMALL STATISTICS
      ================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(190px,1fr))",
          gap: "14px",
          marginTop: "18px",
        }}
      >
        <SmallStat
          icon="👨‍🎓"
          title="عدد الطلاب"
          value={
            statistics?.uniqueStudents ||
            0
          }
          accent="#00d4ff"
        />

        <SmallStat
          icon="📝"
          title="إجمالي المحاولات"
          value={
            statistics?.totalAttempts ||
            0
          }
          accent="#ffd700"
        />

        <SmallStat
          icon="✅"
          title="ناجحون"
          value={
            statistics?.passedAttempts ||
            0
          }
          accent="#4ade80"
        />

        <SmallStat
          icon="❌"
          title="راسبون"
          value={
            statistics?.failedSubmissions ||
            0
          }
          accent="#f87171"
        />

        <SmallStat
          icon="⏳"
          title="قيد التنفيذ"
          value={
            statistics?.inProgressAttempts ||
            0
          }
          accent="#60a5fa"
        />

        <SmallStat
          icon="🚪"
          title="المحاولات المتروكة"
          value={
            statistics?.abandonedAttempts ||
            0
          }
          accent="#facc15"
        />
      </div>

      {/* =================================================
          TOP EXAMS
      ================================================= */}

      <Section
        title="أكثر الامتحانات استخدامًا"
        icon="🏆"
      >
        {topExams.length ===
        0 ? (
          <div
            style={{
              color: "#777",
              textAlign:
                "center",
              padding:
                "30px",
            }}
          >
            لا توجد بيانات حتى الآن.
          </div>
        ) : (
          <div
            style={{
              display:
                "grid",
              gap:
                "10px",
            }}
          >
            {topExams.map(
              (
                exam,
                index
              ) => {
                const max =
                  topExams[0]
                    ?.attempts ||
                  1;

                const width =
                  (exam.attempts /
                    max) *
                  100;

                return (
                  <div
                    key={
                      String(
                        exam.examId
                      )
                    }
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "42px minmax(150px,1fr) 80px",
                      gap:
                        "14px",
                      alignItems:
                        "center",
                    }}
                  >
                    <div
                      style={{
                        width:
                          "36px",
                        height:
                          "36px",
                        borderRadius:
                          "50%",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          "rgba(255,215,0,0.08)",
                        color:
                          "#ffd700",
                        fontWeight:
                          "900",
                      }}
                    >
                      {index +
                        1}
                    </div>

                    <div>
                      <div
                        style={{
                          color:
                            "#fff",
                          fontWeight:
                            "800",
                          marginBottom:
                            "8px",
                        }}
                      >
                        {exam.title}
                      </div>

                      <div
                        style={{
                          width:
                            "100%",
                          height:
                            "8px",
                          background:
                            "rgba(255,255,255,0.06)",
                          borderRadius:
                            "999px",
                          overflow:
                            "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${width}%`,
                            height:
                              "100%",
                            background:
                              "linear-gradient(90deg,#ffd700,#ff8c00)",
                            borderRadius:
                              "999px",
                            transition:
                              "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        color:
                          "#ffd700",
                        fontSize:
                          "18px",
                        fontWeight:
                          "900",
                        textAlign:
                          "left",
                      }}
                    >
                      {
                        exam.attempts
                      }
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </Section>

      {/* =================================================
          EXAMS
      ================================================= */}

      <Section
        title="تقارير الامتحانات"
        icon="📚"
      >
        {examReports.length ===
        0 ? (
          <div
            style={{
              color:
                "#777",
              textAlign:
                "center",
              padding:
                "30px",
            }}
          >
            لا توجد بيانات امتحانات حتى الآن.
          </div>
        ) : (
          <div
            style={{
              overflowX:
                "auto",
            }}
          >
            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  "850px",
              }}
            >
              <thead>
                <tr>
                  {[
                    "الامتحان",
                    "المحاولات",
                    "الأسئلة",
                    "الدرجة",
                    "المتوسط",
                    "الأداء",
                    "النجاح",
                  ].map(
                    (header) => (
                      <th
                        key={
                          header
                        }
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.08)",
                          color:
                            "#ffd700",
                          textAlign:
                            "right",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {examReports.map(
                  (
                    exam
                  ) => (
                    <tr
                      key={String(
                        exam.examId
                      )}
                    >
                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                          fontWeight:
                            "800",
                        }}
                      >
                        {
                          exam.title
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {
                          exam.attemptsCount
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {
                          exam.questionsCount
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {
                          exam.totalMarks
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {
                          exam.averageScore
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            padding:
                              "6px 10px",
                            borderRadius:
                              "999px",
                            background:
                              "rgba(96,165,250,0.10)",
                            color:
                              "#60a5fa",
                            fontWeight:
                              "800",
                          }}
                        >
                          {
                            exam.averagePercentage
                          }
                          %
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            padding:
                              "6px 11px",
                            borderRadius:
                              "999px",
                            background:
                              exam.passRate >=
                              50
                                ? "rgba(74,222,128,0.10)"
                                : "rgba(248,113,113,0.10)",
                            color:
                              exam.passRate >=
                              50
                                ? "#4ade80"
                                : "#f87171",
                            fontWeight:
                              "900",
                          }}
                        >
                          {
                            exam.passRate
                          }
                          %
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* =================================================
          QUESTIONS
      ================================================= */}

      <Section
        title="أصعب الأسئلة"
        icon="❓"
      >
        {questionReports.length ===
        0 ? (
          <div
            style={{
              color:
                "#777",
              textAlign:
                "center",
              padding:
                "30px",
            }}
          >
            لا توجد بيانات كافية لتحليل الأسئلة.
          </div>
        ) : (
          <div
            style={{
              display:
                "grid",
              gap:
                "10px",
            }}
          >
            {questionReports
              .slice(
                0,
                10
              )
              .map(
                (
                  question,
                  index
                ) => {
                  const difficulty =
                    Number(
                      question.wrongRate
                    ) || 0;

                  return (
                    <div
                      key={`${String(
                        question.examId
                      )}-${question.questionIndex}`}
                      style={{
                        background:
                          "rgba(255,255,255,0.025)",
                        border:
                          "1px solid rgba(255,255,255,0.05)",
                        borderRadius:
                          "13px",
                        padding:
                          "15px",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap:
                            "15px",
                          alignItems:
                            "center",
                          marginBottom:
                            "10px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "10px",
                            alignItems:
                              "center",
                            minWidth:
                              0,
                          }}
                        >
                          <div
                            style={{
                              width:
                                "32px",
                              height:
                                "32px",
                              borderRadius:
                                "50%",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              background:
                                "rgba(255,215,0,0.08)",
                              color:
                                "#ffd700",
                              fontWeight:
                                "900",
                              flexShrink:
                                0,
                            }}
                          >
                            {index +
                              1}
                          </div>

                          <div
                            style={{
                              color:
                                "#888",
                              fontSize:
                                "12px",
                            }}
                          >
                            {
                              question.examTitle
                            }
                          </div>
                        </div>

                        <div
                          style={{
                            color:
                              difficulty >=
                              50
                                ? "#f87171"
                                : "#facc15",
                            fontWeight:
                              "900",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          خطأ{" "}
                          {
                            question.wrongRate
                          }
                          %
                        </div>
                      </div>

                      <div
                        style={{
                          color:
                            "#ddd",
                          lineHeight:
                            "1.7",
                          marginBottom:
                            "11px",
                        }}
                      >
                        {question.questionText ||
                          `السؤال ${
                            question.questionIndex +
                            1
                          }`}
                      </div>

                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "1fr 1fr",
                          gap:
                            "10px",
                        }}
                      >
                        <div
                          style={{
                            color:
                              "#4ade80",
                            fontSize:
                              "12px",
                          }}
                        >
                          ✅ صحيح:{" "}
                          {
                            question.correctAnswers
                          }
                        </div>

                        <div
                          style={{
                            color:
                              "#f87171",
                            fontSize:
                              "12px",
                          }}
                        >
                          ❌ خطأ:{" "}
                          {
                            question.wrongAnswers
                          }
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
          </div>
        )}
      </Section>

      {/* =================================================
          RECENT ATTEMPTS
      ================================================= */}

      <Section
        title="آخر المحاولات"
        icon="🕒"
      >
        {recentAttempts.length ===
        0 ? (
          <div
            style={{
              color:
                "#777",
              textAlign:
                "center",
              padding:
                "30px",
            }}
          >
            لا توجد محاولات حتى الآن.
          </div>
        ) : (
          <div
            style={{
              overflowX:
                "auto",
            }}
          >
            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  "850px",
              }}
            >
              <thead>
                <tr>
                  {[
                    "الطالب",
                    "الامتحان",
                    "الحالة",
                    "الدرجة",
                    "البداية",
                    "النهاية",
                  ].map(
                    (header) => (
                      <th
                        key={
                          header
                        }
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.08)",
                          color:
                            "#ffd700",
                          textAlign:
                            "right",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {recentAttempts.map(
                  (
                    attempt
                  ) => (
                    <tr
                      key={String(
                        attempt._id
                      )}
                    >
                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {attempt.userId ||
                          "—"}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                          fontWeight:
                            "700",
                        }}
                      >
                        {attempt.examTitle ||
                          String(
                            attempt.examId
                          )}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                          color:
                            statusColor(
                              attempt.status
                            ),
                          fontWeight:
                            "800",
                        }}
                      >
                        {statusLabel(
                          attempt.status
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                          color:
                            "#ffd700",
                          fontWeight:
                            "900",
                        }}
                      >
                        {attempt.score ??
                          "—"}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                          color:
                            "#aaa",
                        }}
                      >
                        {formatDate(
                          attempt.startedAt
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                          color:
                            "#aaa",
                        }}
                      >
                        {formatDate(
                          attempt.endedAt
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}