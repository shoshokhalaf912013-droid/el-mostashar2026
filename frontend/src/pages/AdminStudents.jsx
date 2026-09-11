// src/pages/AdminStudents.jsx

import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Stack,
} from "@mui/material";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const { role, loading: authLoading } = useAuth();

  /*
   * ============================================================
   * الصلاحيات
   * ============================================================
   *
   * زر التفعيل اليدوي يظهر فقط لـ:
   *
   * admin
   * super-admin
   *
   * ولا يظهر للطالب أو المعلم.
   */
  const canManageSubscriptions =
    role === "admin" ||
    role === "super-admin";

  /*
   * ============================================================
   * تحميل الطلاب
   * ============================================================
   */

  useEffect(() => {
    if (authLoading) return;

    /*
     * إذا لم يكن المستخدم Admin أو Super Admin
     * لا نحاول تحميل بيانات إدارة الطلاب.
     */
    if (!canManageSubscriptions) {
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);

        const snap = await getDocs(collection(db, "users"));

        const users = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setStudents(users);
      } catch (error) {
        console.error("Error loading students:", error);
        alert("حدث خطأ أثناء تحميل الطلاب.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authLoading, canManageSubscriptions]);

  /*
   * ============================================================
   * جعل المستخدم Admin
   * ============================================================
   */

  const makeAdmin = async (id) => {
    if (!canManageSubscriptions) {
      alert("ليس لديك صلاحية لتنفيذ هذا الإجراء.");
      return;
    }

    const confirmed = window.confirm(
      "هل أنت متأكد من تحويل هذا المستخدم إلى Admin؟"
    );

    if (!confirmed) return;

    try {
      await updateDoc(doc(db, "users", id), {
        role: "admin",
      });

      setStudents((prev) =>
        prev.map((student) =>
          student.id === id
            ? {
                ...student,
                role: "admin",
              }
            : student
        )
      );

      alert("تمت الترقية إلى Admin.");
    } catch (error) {
      console.error("Make admin error:", error);
      alert("حدث خطأ أثناء الترقية.");
    }
  };

  /*
   * ============================================================
   * تجديد الاشتراك الحالي
   * ============================================================
   */

  const renew = async (id) => {
    if (!canManageSubscriptions) {
      alert("ليس لديك صلاحية لتنفيذ هذا الإجراء.");
      return;
    }

    const confirmed = window.confirm(
      "هل تريد تجديد الاشتراك لمدة 30 يومًا؟"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);

      const expiration = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );

      await updateDoc(doc(db, "users", id), {
        subscriptionStatus: "active",
        subscriptionEnd: expiration,
      });

      setStudents((prev) =>
        prev.map((student) =>
          student.id === id
            ? {
                ...student,
                subscriptionStatus: "active",
                subscriptionEnd: expiration,
              }
            : student
        )
      );

      alert("تم تجديد الاشتراك لمدة 30 يومًا.");
    } catch (error) {
      console.error("Renew subscription error:", error);
      alert("حدث خطأ أثناء تجديد الاشتراك.");
    } finally {
      setProcessingId(null);
    }
  };

  /*
   * ============================================================
   * التفعيل الإداري المباشر
   * ============================================================
   *
   * هذا الزر مخصص للإدارة فقط.
   *
   * لا يحتاج:
   * - دفع
   * - إيصال
   * - verification
   * - بوابة دفع
   *
   * ويجعل الطالب ACTIVE مباشرة.
   *
   * الهدف:
   * استمرار تشغيل المنصة أثناء التطوير
   * وتجاوز أي مشكلة في نظام الدفع.
   */

  const activateManually = async (student) => {
    if (!canManageSubscriptions) {
      alert("ليس لديك صلاحية لتنفيذ هذا الإجراء.");
      return;
    }

    const confirmed = window.confirm(
      `تفعيل اشتراك ${student.fullName || student.email || "الطالب"} لمدة 30 يومًا؟`
    );

    if (!confirmed) return;

    try {
      setProcessingId(student.id);

      const expiration = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );

      await updateDoc(doc(db, "users", student.id), {
        subscriptionStatus: "active",
        subscriptionEnd: expiration,

        /*
         * علامة توضح أن الاشتراك تم تفعيله إداريًا.
         * مفيدة لنا أثناء التطوير والمراجعة.
         */
        subscriptionActivatedManually: true,
        subscriptionActivatedBy: role,
      });

      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id
            ? {
                ...s,
                subscriptionStatus: "active",
                subscriptionEnd: expiration,
                subscriptionActivatedManually: true,
                subscriptionActivatedBy: role,
              }
            : s
        )
      );

      alert(
        "✅ تم تفعيل الاشتراك يدويًا لمدة 30 يومًا."
      );
    } catch (error) {
      console.error(
        "Manual subscription activation error:",
        error
      );

      alert(
        "❌ حدث خطأ أثناء التفعيل اليدوي."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /*
   * ============================================================
   * إلغاء الاشتراك
   * ============================================================
   */

  const cancelSubscription = async (student) => {
    if (!canManageSubscriptions) {
      alert("ليس لديك صلاحية لتنفيذ هذا الإجراء.");
      return;
    }

    const confirmed = window.confirm(
      `هل تريد إلغاء اشتراك ${
        student.fullName || student.email || "الطالب"
      }؟`
    );

    if (!confirmed) return;

    try {
      setProcessingId(student.id);

      await updateDoc(doc(db, "users", student.id), {
        subscriptionStatus: "inactive",
      });

      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id
            ? {
                ...s,
                subscriptionStatus: "inactive",
              }
            : s
        )
      );

      alert("تم إلغاء الاشتراك.");
    } catch (error) {
      console.error(
        "Cancel subscription error:",
        error
      );

      alert("حدث خطأ أثناء إلغاء الاشتراك.");
    } finally {
      setProcessingId(null);
    }
  };

  /*
   * ============================================================
   * حالة التحميل
   * ============================================================
   */

  if (authLoading || loading) {
    return (
      <Box p={3}>
        <Typography>
          جارٍ تحميل بيانات الطلاب...
        </Typography>
      </Box>
    );
  }

  /*
   * ============================================================
   * منع الوصول لغير الإدارة
   * ============================================================
   */

  if (!canManageSubscriptions) {
    return (
      <Box
        p={4}
        sx={{
          textAlign: "center",
        }}
      >
        <Typography
          variant="h5"
          color="error"
          fontWeight="bold"
        >
          🔒 غير مصرح لك بالدخول
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
          }}
        >
          هذه الصفحة مخصصة للإدارة فقط.
        </Typography>
      </Box>
    );
  }

  /*
   * ============================================================
   * الواجهة
   * ============================================================
   */

  return (
    <Box p={3}>

      <Typography
        variant="h5"
        color="warning.main"
        mb={3}
        fontWeight="bold"
      >
        🧑‍🎓 إدارة الطلاب
      </Typography>

      <Grid container spacing={2}>

        {students.map((student) => {

          const isProcessing =
            processingId === student.id;

          const isActive =
            student.subscriptionStatus === "active";

          return (
            <Grid
              key={student.id}
              item
              xs={12}
              md={6}
            >
              <Paper
                sx={{
                  p: 2,
                  height: "100%",
                }}
                elevation={2}
              >

                {/* بيانات الطالب */}

                <Typography
                  variant="h6"
                  fontWeight="bold"
                >
                  {student.fullName || "بدون اسم"}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  {student.email || "لا يوجد بريد"}
                </Typography>

                {student.phone && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    📱 {student.phone}
                  </Typography>
                )}

                {/* الدور */}

                <Box
                  sx={{
                    mt: 1,
                  }}
                >
                  <Chip
                    size="small"
                    label={
                      student.role ||
                      "غير محدد"
                    }
                  />
                </Box>

                {/* حالة الاشتراك */}

                <Box
                  sx={{
                    mt: 1.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                  >
                    حالة الاشتراك:
                  </Typography>

                  <Chip
                    sx={{
                      mt: 0.5,
                    }}
                    size="small"
                    color={
                      isActive
                        ? "success"
                        : student.subscriptionStatus ===
                          "verification"
                        ? "warning"
                        : "default"
                    }
                    label={
                      student.subscriptionStatus ||
                      "غير محددة"
                    }
                  />
                </Box>

                {/* تاريخ انتهاء الاشتراك */}

                {student.subscriptionEnd && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                    }}
                  >
                    انتهاء الاشتراك:{" "}
                    {(() => {
                      try {
                        const date =
                          student.subscriptionEnd?.toDate
                            ? student.subscriptionEnd.toDate()
                            : new Date(
                                student.subscriptionEnd
                              );

                        return isNaN(date.getTime())
                          ? "غير معروف"
                          : date.toLocaleDateString(
                              "ar-EG"
                            );
                      } catch {
                        return "غير معروف";
                      }
                    })()}
                  </Typography>
                )}

                {/* علامة التفعيل اليدوي */}

                {student.subscriptionActivatedManually && (
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{
                      display: "block",
                      mt: 1,
                      fontWeight: "bold",
                    }}
                  >
                    ⚡ تم التفعيل إداريًا
                  </Typography>
                )}

                {/* الأزرار */}

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{
                    mt: 2,
                  }}
                >

                  {/* التفعيل اليدوي */}

                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    disabled={isProcessing}
                    onClick={() =>
                      activateManually(student)
                    }
                  >
                    {isProcessing
                      ? "جارٍ التنفيذ..."
                      : "⚡ تفعيل الاشتراك"}
                  </Button>

                  {/* التجديد */}

                  <Button
                    size="small"
                    variant="outlined"
                    disabled={isProcessing}
                    onClick={() =>
                      renew(student.id)
                    }
                  >
                    🔄 تجديد 30 يوم
                  </Button>

                  {/* إلغاء الاشتراك */}

                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={
                      isProcessing ||
                      !isActive
                    }
                    onClick={() =>
                      cancelSubscription(student)
                    }
                  >
                    إلغاء الاشتراك
                  </Button>

                  {/* جعل المستخدم Admin */}

                  {student.role !== "admin" &&
                    student.role !== "super-admin" && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          makeAdmin(student.id)
                        }
                      >
                        جعل Admin
                      </Button>
                    )}

                </Stack>

              </Paper>
            </Grid>
          );
        })}

      </Grid>

      {students.length === 0 && (
        <Typography
          sx={{
            mt: 3,
            textAlign: "center",
          }}
        >
          لا توجد بيانات طلاب.
        </Typography>
      )}

    </Box>
  );
}