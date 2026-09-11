// frontend/src/pages/Admin/StudentReports.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../../utils/api";

export default function StudentReports() {
  const navigate =
    useNavigate();

  const [
    students,
    setStudents,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/api/reports/students"
        );

      setStudents(
        Array.isArray(
          response.data
            ?.students
        )
          ? response.data.students
          : []
      );
    } catch (err) {
      console.error(
        "Student reports error:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.msg ||
          "تعذر تحميل الطلاب."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      if (!term) {
        return students;
      }

      return students.filter(
        (student) =>
          String(
            student.name ||
              ""
          )
            .toLowerCase()
            .includes(term) ||
          String(
            student.email ||
              ""
          )
            .toLowerCase()
            .includes(term) ||
          String(
            student.userId ||
              ""
          )
            .toLowerCase()
            .includes(term)
      );
    }, [
      students,
      search,
    ]);

  function formatDate(
    value
  ) {
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
        جاري تحميل الطلاب...
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      style={{
        minHeight:
          "100vh",
        background:
          "radial-gradient(circle at top right,rgba(139,92,246,.10),transparent 35%),linear-gradient(180deg,#080808,#111)",
        color:
          "#fff",
        padding:
          "30px",
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
          gap:
            "20px",
          flexWrap:
            "wrap",
          marginBottom:
            "25px",
        }}
      >
        <div>
          <div
            style={{
              color:
                "#888",
              fontSize:
                "12px",
              marginBottom:
                "6px",
            }}
          >
            الإدارة
          </div>

          <h1
            style={{
              margin: 0,
              color:
                "#ffd700",
              fontSize:
                "32px",
              fontWeight:
                "900",
            }}
          >
            👨‍🎓 تقارير الطلاب
          </h1>

          <p
            style={{
              color:
                "#888",
              marginTop:
                "8px",
            }}
          >
            اختر طالبًا لعرض تقريره الكامل
          </p>
        </div>

        <button
          onClick={
            loadStudents
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
          🔄 تحديث
        </button>
      </div>

      {error && (
        <div
          style={{
            background:
              "#210d0d",
            border:
              "1px solid #7f1d1d",
            color:
              "#fca5a5",
            borderRadius:
              "14px",
            padding:
              "16px",
            marginBottom:
              "20px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          marginBottom:
            "20px",
        }}
      >
        <input
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="ابحث باسم الطالب أو البريد الإلكتروني..."
          style={{
            width:
              "100%",
            maxWidth:
              "600px",
            background:
              "#151515",
            border:
              "1px solid rgba(255,255,255,.10)",
            borderRadius:
              "12px",
            padding:
              "14px 16px",
            color:
              "#fff",
            outline:
              "none",
            fontSize:
              "15px",
            boxSizing:
              "border-box",
          }}
        />
      </div>

      {filteredStudents.length ===
      0 ? (
        <div
          style={{
            background:
              "#0e0e0e",
            border:
              "1px solid rgba(255,215,0,.18)",
            borderRadius:
              "18px",
            padding:
              "50px",
            textAlign:
              "center",
            color:
              "#888",
          }}
        >
          لا توجد بيانات طلاب مرتبطة بمحاولات امتحانات حتى الآن.
        </div>
      ) : (
        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(280px,1fr))",
            gap:
              "16px",
          }}
        >
          {filteredStudents.map(
            (student) => (
              <div
                key={
                  student.userId
                }
                style={{
                  background:
                    "linear-gradient(145deg,#141414,#0c0c0c)",
                  border:
                    "1px solid rgba(255,255,255,.08)",
                  borderRadius:
                    "18px",
                  padding:
                    "20px",
                  boxShadow:
                    "0 15px 35px rgba(0,0,0,.22)",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "13px",
                    marginBottom:
                      "18px",
                  }}
                >
                  {student.photoURL ? (
                    <img
                      src={
                        student.photoURL
                      }
                      alt=""
                      style={{
                        width:
                          "52px",
                        height:
                          "52px",
                        borderRadius:
                          "50%",
                        objectFit:
                          "cover",
                        border:
                          "2px solid #ffd700",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width:
                          "52px",
                        height:
                          "52px",
                        borderRadius:
                          "50%",
                        background:
                          "linear-gradient(135deg,#8b5cf6,#06b6d4)",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize:
                          "22px",
                        fontWeight:
                          "900",
                      }}
                    >
                      {(student.name ||
                        "ط"
                      ).charAt(0)}
                    </div>
                  )}

                  <div
                    style={{
                      minWidth:
                        0,
                    }}
                  >
                    <div
                      style={{
                        fontWeight:
                          "900",
                        fontSize:
                          "17px",
                        marginBottom:
                          "4px",
                      }}
                    >
                      {student.name}
                    </div>

                    <div
                      style={{
                        color:
                          "#777",
                        fontSize:
                          "11px",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {student.email ||
                        "بدون بريد"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap:
                      "10px",
                    marginBottom:
                      "17px",
                  }}
                >
                  <div
                    style={{
                      background:
                        "rgba(255,215,0,.05)",
                      borderRadius:
                        "10px",
                      padding:
                        "11px",
                    }}
                  >
                    <div
                      style={{
                        color:
                          "#777",
                        fontSize:
                          "11px",
                      }}
                    >
                      المحاولات
                    </div>

                    <strong
                      style={{
                        color:
                          "#ffd700",
                        fontSize:
                          "20px",
                      }}
                    >
                      {
                        student.attemptsCount
                      }
                    </strong>
                  </div>

                  <div
                    style={{
                      background:
                        "rgba(16,185,129,.05)",
                      borderRadius:
                        "10px",
                      padding:
                        "11px",
                    }}
                  >
                    <div
                      style={{
                        color:
                          "#777",
                        fontSize:
                          "11px",
                      }}
                    >
                      مكتملة
                    </div>

                    <strong
                      style={{
                        color:
                          "#10b981",
                        fontSize:
                          "20px",
                      }}
                    >
                      {
                        student.completedCount
                      }
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    color:
                      "#666",
                    fontSize:
                      "11px",
                    marginBottom:
                      "15px",
                  }}
                >
                  آخر نشاط:
                  {" "}
                  {formatDate(
                    student.lastActivity
                  )}
                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/admin/student-reports/${encodeURIComponent(
                        student.userId
                      )}`
                    )
                  }
                  style={{
                    width:
                      "100%",
                    border:
                      "none",
                    background:
                      "linear-gradient(135deg,#8b5cf6,#6366f1)",
                    color:
                      "#fff",
                    borderRadius:
                      "10px",
                    padding:
                      "12px",
                    fontWeight:
                      "900",
                    cursor:
                      "pointer",
                  }}
                >
                  📊 عرض تقرير الطالب
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}