import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";

function Box({ title, onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer rounded-xl px-6 py-4 text-center
        border border-yellow-500 text-yellow-400
        transition-all duration-200
        hover:bg-yellow-400 hover:text-black hover:scale-[1.02]
      "
    >
      {title}
    </div>
  );
}

export default function SecondaryAdvancedSubjectsView() {
  const { gradeId } = useParams();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!gradeId) return;

      setLoading(true);

      try {
        const q = query(
          collection(db, "gradeSubjects"),
          where("stageId", "==", "secondary"),
          where("gradeId", "==", gradeId),
          where("active", "==", true)
        );

        const snap = await getDocs(q);

        const data = snap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort(
            (a, b) =>
              (a.order ?? 0) - (b.order ?? 0)
          );

        setSubjects(data);
      } catch (error) {
        console.error(
          "❌ Error loading secondary subjects:",
          error
        );

        setSubjects([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [gradeId]);

  const goUnits = (subject) => {
    navigate(
      `/student/secondary/units/${gradeId}/${subject.subjectId}`
    );
  };

  /*
   * ============================================================
   * المواد الخاصة بالنسخة الشخصية
   * ============================================================
   *
   * الصف الثاني:
   * - التاريخ = مادة عامة
   * - الجغرافيا = القسم الأدبي
   *
   * الصف الثالث:
   * - التاريخ = القسم الأدبي
   * - الجغرافيا = القسم الأدبي
   */

  const history = subjects.filter(
    (subject) =>
      subject.title?.trim() === "التاريخ"
  );

  const geography = subjects.filter(
    (subject) =>
      subject.title?.trim() === "الجغرافيا"
  );

  /*
   * الصف الثاني:
   * التاريخ يظهر كمادة عامة.
   */
  const generalSubjects =
    gradeId === "sec2"
      ? history
      : [];

  /*
   * القسم الأدبي:
   *
   * الصف الثاني:
   * الجغرافيا فقط.
   *
   * الصف الثالث:
   * التاريخ والجغرافيا.
   */
  const literarySubjects =
    gradeId === "sec2"
      ? geography
      : gradeId === "sec3"
        ? [...history, ...geography]
        : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-10 flex items-center justify-center">
        <div className="text-yellow-400 text-xl">
          جاري التحميل...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-2xl font-bold text-yellow-400 text-center mb-10">
        مواد الصف{" "}
        {gradeId === "sec2"
          ? "الثاني"
          : gradeId === "sec3"
            ? "الثالث"
            : ""}
        {" "}الثانوي
      </h1>

      <div className="max-w-5xl mx-auto space-y-12">

        {/* =====================================================
            المواد العامة - الصف الثاني فقط
        ====================================================== */}

        {generalSubjects.length > 0 && (
          <section>
            <h2 className="text-xl text-yellow-400 mb-4">
              المواد العامة
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generalSubjects.map((subject) => (
                <Box
                  key={subject.id}
                  title={subject.title}
                  onClick={() => goUnits(subject)}
                />
              ))}
            </div>
          </section>
        )}

        {/* =====================================================
            القسم الأدبي
        ====================================================== */}

        {literarySubjects.length > 0 && (
          <section>
            <h2 className="text-xl text-yellow-400 mb-4">
              القسم الأدبي
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {literarySubjects.map((subject) => (
                <Box
                  key={subject.id}
                  title={subject.title}
                  onClick={() => goUnits(subject)}
                />
              ))}
            </div>
          </section>
        )}

        {/* =====================================================
            لا توجد مواد
        ====================================================== */}

        {generalSubjects.length === 0 &&
          literarySubjects.length === 0 && (
            <div className="text-center text-red-400 text-xl">
              لا توجد مواد متاحة
            </div>
          )}

      </div>

    </div>
  );
}