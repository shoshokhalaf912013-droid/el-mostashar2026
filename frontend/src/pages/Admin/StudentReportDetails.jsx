// frontend/src/pages/Admin/StudentReportDetails.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../utils/api";

import DonutChart
  from "../../components/reports/DonutChart";

function Stat({
  title,
  value,
  color,
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(145deg,#141414,#0c0c0c)",
        border:
          "1px solid rgba(255,255,255,.08)",
        borderRadius:
          "15px",
        padding:
          "18px",
      }}
    >
      <div
        style={{
          color:
            "#777",
          fontSize:
            "12px",
          marginBottom:
            "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color:
            color ||
            "#ffd700",
          fontSize:
            "27px",
          fontWeight:
            "900",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function StudentReportDetails() {
  const {
    userId,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    report,
    setReport,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          `/api/reports/students/${encodeURIComponent(
            userId
          )}`
        );

      setReport(
        response.data || null
      );
    } catch (err) {
      console.error(
        "Student report error:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.msg ||
          "تعذر تحميل تقرير الطالب."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, [userId]);

  const distributionData =
    useMemo(() => {
      const d =
        report?.student
          ?.distribution || {};

      return [
        {
          label:
            "ممتاز",
          value:
            d.excellent || 0,
          color:
            "#10B981",
        },

        {
          label:
            "جيد جدًا",
          value:
            d.veryGood || 0,
          color:
            "#06B6D4",
        },

        {
          label:
            "جيد",
          value:
            d.good || 0,
          color:
            "#8B5CF6",
        },

        {
          label:
            "يحتاج تحسين",
          value:
            d.needsImprovement ||
            0,
          color:
            "#F43F5E",
        },
      ];
    }, [report]);

  function formatDate(
    value
  ) {
    if (!value) {
      return "—";
    }

    try {
      return new Date(
        value
      ).toLocaleDateString(
        "ar-EG",
        {
          year:
            "numeric",
          month:
            "short",
          day:
            "numeric",
        }
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
        return "#10B981";

      case "failed":
        return "#F43F5E";

      case "abandoned":
        return "#F59E0B";

      case "in_progress":
        return "#06B6D4";

      default:
        return "#888";
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight:
            "100vh",
          background:
            "#080808",
          color:
            "#fff",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          fontSize:
            "18px",
        }}
      >
        جاري تحميل تقرير الطالب...
      </div>
    );
  }

  if (error) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight:
            "100vh",
          background:
            "#080808",
          color:
            "#fff",
          padding:
            "40px",
        }}
      >
        <div
          style={{
            maxWidth:
              "650px",
            margin:
              "80px auto",
            background:
              "#190c0c",
            border:
              "1px solid #7f1d1d",
            borderRadius:
              "18px",
            padding:
              "30px",
            textAlign:
              "center",
          }}
        >
          <div
            style={{
              fontSize:
                "40px",
              marginBottom:
                "15px",
            }}
          >
            ⚠️
          </div>

          <h2
            style={{
              color:
                "#ffd700",
            }}
          >
            تعذر تحميل التقرير
          </h2>

          <p
            style={{
              color:
                "#fca5a5",
            }}
          >
            {error}
          </p>

          <button
            onClick={
              loadReport
            }
            style={{
              border:
                "none",
              background:
                "#ffd700",
              color:
                "#111",
              borderRadius:
                "10px",
              padding:
                "12px 20px",
              fontWeight:
                "900",
              cursor:
                "pointer",
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!report?.student) {
    return null;
  }

  const student =
    report.student;

  const history =
    Array.isArray(
      report.history
    )
      ? report.history
      : [];

  const progress =
    Array.isArray(
      report.progress
    )
      ? report.progress
      : [];

  const chartTotal =
    distributionData.reduce(
      (sum, item) =>
        sum +
        item.value,
      0
    );

  return (
    <div
      dir="rtl"
      style={{
        minHeight:
          "100vh",
        background:
          "radial-gradient(circle at top right,rgba(139,92,246,.11),transparent 32%),radial-gradient(circle at top left,rgba(6,182,212,.08),transparent 28%),linear-gradient(180deg,#080808,#111)",
        color:
          "#fff",
        padding:
          "30px",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between",
          gap:
            "15px",
          flexWrap:
            "wrap",
          marginBottom:
            "25px",
        }}
      >
        <button
          onClick={() =>
            navigate(
              "/admin/student-reports"
            )
          }
          style={{
            background:
              "#171717",
            border:
              "1px solid rgba(255,255,255,.10)",
            color:
              "#fff",
            borderRadius:
              "10px",
            padding:
              "10px 16px",
            cursor:
              "pointer",
            fontWeight:
              "700",
          }}
        >
          ← العودة إلى الطلاب
        </button>

        <button
          onClick={
            loadReport
          }
          style={{
            background:
              "#ffd700",
            border:
              "none",
            color:
              "#111",
            borderRadius:
              "10px",
            padding:
              "11px 18px",
            cursor:
              "pointer",
            fontWeight:
              "900",
          }}
        >
          🔄 تحديث التقرير
        </button>
      </div>

      {/* =================================================
          STUDENT HEADER
      ================================================= */}

      <div
        style={{
          background:
            "linear-gradient(145deg,#151515,#0c0c0c)",
          border:
            "1px solid rgba(255,255,255,.08)",
          borderRadius:
            "22px",
          padding:
            "25px",
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "18px",
          flexWrap:
            "wrap",
          marginBottom:
            "18px",
        }}
      >
        <div
          style={{
            width:
              "72px",
            height:
              "72px",
            borderRadius:
              "20px",
            background:
              "linear-gradient(135deg,#8B5CF6,#06B6D4)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            fontSize:
              "30px",
            fontWeight:
              "900",
          }}
        >
          {(student.name ||
            "ط"
          ).charAt(0)}
        </div>

        <div>
          <div
            style={{
              color:
                "#888",
              fontSize:
                "12px",
              marginBottom:
                "5px",
            }}
          >
            التقرير الفردي
          </div>

          <h1
            style={{
              margin: 0,
              color:
                "#ffd700",
              fontSize:
                "30px",
              fontWeight:
                "900",
            }}
          >
            {student.name}
          </h1>

          <div
            style={{
              color:
                "#888",
              marginTop:
                "7px",
              fontSize:
                "13px",
            }}
          >
            {student.email ||
              "بدون بريد إلكتروني"}
          </div>
        </div>
      </div>

      {/* =================================================
          TOP STATS
      ================================================= */}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(170px,1fr))",
          gap:
            "14px",
          marginBottom:
            "18px",
        }}
      >
        <Stat
          title="الأداء العام"
          value={`${student.averagePercentage}%`}
          color="#06B6D4"
        />

        <Stat
          title="نسبة النجاح"
          value={`${student.passRate}%`}
          color="#10B981"
        />

        <Stat
          title="أعلى نتيجة"
          value={`${student.highestPercentage}%`}
          color="#8B5CF6"
        />

        <Stat
          title="أقل نتيجة"
          value={`${student.lowestPercentage}%`}
          color="#F43F5E"
        />

        <Stat
          title="الاختبارات المكتملة"
          value={
            student.submittedCount
          }
          color="#F59E0B"
        />
      </div>

      {/* =================================================
          VISUAL ANALYTICS
      ================================================= */}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "minmax(300px,420px) minmax(300px,1fr)",
          gap:
            "18px",
          marginBottom:
            "18px",
        }}
      >
        {/* DONUT */}

        <div
          style={{
            background:
              "linear-gradient(145deg,#111,#0a0a0a)",
            border:
              "1px solid rgba(255,255,255,.08)",
            borderRadius:
              "20px",
            padding:
              "25px",
          }}
        >
          <h2
            style={{
              marginTop:
                0,
              color:
                "#ffd700",
              fontSize:
                "19px",
            }}
          >
            🎯 توزيع مستوى الطالب
          </h2>

          <p
            style={{
              color:
                "#777",
              fontSize:
                "12px",
              marginBottom:
                "20px",
            }}
          >
            توزيع النتائج حسب أداء الاختبارات
          </p>

          {chartTotal >
          0 ? (
            <DonutChart
              data={
                distributionData
              }
              centerValue={`${student.averagePercentage}%`}
              centerLabel="المتوسط"
              size={230}
              strokeWidth={32}
            />
          ) : (
            <div
              style={{
                height:
                  "250px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color:
                  "#666",
              }}
            >
              لا توجد نتائج مكتملة.
            </div>
          )}
        </div>

        {/* PROGRESS */}

        <div
          style={{
            background:
              "linear-gradient(145deg,#111,#0a0a0a)",
            border:
              "1px solid rgba(255,255,255,.08)",
            borderRadius:
              "20px",
            padding:
              "25px",
          }}
        >
          <h2
            style={{
              marginTop:
                0,
              color:
                "#ffd700",
              fontSize:
                "19px",
            }}
          >
            📈 تطور الطالب
          </h2>

          <p
            style={{
              color:
                "#777",
              fontSize:
                "12px",
            }}
          >
            آخر نتائج الاختبارات بالترتيب الزمني
          </p>

          {progress.length ===
          0 ? (
            <div
              style={{
                color:
                  "#666",
                padding:
                  "50px 0",
                textAlign:
                  "center",
              }}
            >
              لا توجد نتائج كافية لعرض التطور.
            </div>
          ) : (
            <div
              style={{
                display:
                  "grid",
                gap:
                  "13px",
                marginTop:
                  "20px",
              }}
            >
              {progress
                .slice(
                  -8
                )
                .map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item.examTitle}-${index}`}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap:
                            "10px",
                          marginBottom:
                            "7px",
                          fontSize:
                            "12px",
                        }}
                      >
                        <span
                          style={{
                            color:
                              "#ddd",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {item.examTitle}
                        </span>

                        <strong
                          style={{
                            color:
                              "#06B6D4",
                          }}
                        >
                          {
                            item.percentage
                          }%
                        </strong>
                      </div>

                      <div
                        style={{
                          width:
                            "100%",
                          height:
                            "9px",
                          background:
                            "rgba(255,255,255,.06)",
                          borderRadius:
                            "999px",
                          overflow:
                            "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(
                                100,
                                Number(
                                  item.percentage
                                ) ||
                                  0
                              )
                            )}%`,
                            height:
                              "100%",
                            background:
                              "linear-gradient(90deg,#8B5CF6,#06B6D4)",
                            borderRadius:
                              "999px",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          color:
                            "#555",
                          marginTop:
                            "5px",
                          fontSize:
                            "10px",
                        }}
                      >
                        {formatDate(
                          item.date
                        )}
                      </div>
                    </div>
                  )
                )}
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          EXAM HISTORY
      ================================================= */}

      <div
        style={{
          background:
            "linear-gradient(145deg,#111,#0a0a0a)",
          border:
            "1px solid rgba(255,255,255,.08)",
          borderRadius:
            "20px",
          padding:
            "25px",
        }}
      >
        <h2
          style={{
            marginTop:
              0,
            color:
              "#ffd700",
            fontSize:
              "20px",
          }}
        >
          📝 سجل الاختبارات
        </h2>

        {history.length ===
        0 ? (
          <div
            style={{
              color:
                "#666",
              textAlign:
                "center",
              padding:
                "40px",
            }}
          >
            لا توجد اختبارات لهذا الطالب.
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
                    "الاختبار",
                    "الحالة",
                    "الدرجة",
                    "المجموع",
                    "النسبة",
                    "الإجابات",
                    "التاريخ",
                  ].map(
                    (title) => (
                      <th
                        key={
                          title
                        }
                        style={{
                          textAlign:
                            "right",
                          color:
                            "#ffd700",
                          padding:
                            "13px",
                          borderBottom:
                            "1px solid rgba(255,255,255,.08)",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {title}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {history.map(
                  (item) => (
                    <tr
                      key={String(
                        item.attemptId
                      )}
                    >
                      <td
                        style={{
                          padding:
                            "13px",
                          borderBottom:
                            "1px solid rgba(255,255,255,.05)",
                          fontWeight:
                            "800",
                        }}
                      >
                        {
                          item.examTitle
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "13px",
                          borderBottom:
                            "1px solid rgba(255,255,255,.05)",
                          color:
                            statusColor(
                              item.status
                            ),
                          fontWeight:
                            "800",
                        }}
                      >
                        {statusLabel(
                          item.status
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            "13px",
                          borderBottom:
                            "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        {item.score ??
                          "—"}
                      </td>

                      <td
                        style={{
                          padding:
                            "13px",
                          borderBottom:
                            "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        {item.totalMarks ||
                          "—"}
                      </td>

                      <td
                        style={{
                          padding:
                            "13px",
                          borderBottom:
                            "1px solid rgba(255,255,255,.05)",
                          fontWeight:
                            "900",
                          color:
                            item.percentage ===
                            null
                              ? "#666"
                              : item.percentage >=
                                50
                              ? "#10B981"
                              : "#F43F5E",
                        }}
                      >
                        {item.percentage ===
                        null
                          ? "—"
                          : `${item.percentage}%`}
                      </td>

                      <td
                        style={{
                          padding:
                            "13px",
                          borderBottom:
                            "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        {
                          item.answersCount
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "13px",
                          borderBottom:
                            "1px solid rgba(255,255,255,.05)",
                          color:
                            "#888",
                        }}
                      >
                        {formatDate(
                          item.startedAt
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}