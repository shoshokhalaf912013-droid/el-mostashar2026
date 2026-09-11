import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../firebase";

/* ===== Box موحّد ===== */
function Box({ title }) {
  return (
    <div
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

export default function BacSubjectsView() {
  const { gradeId } = useParams();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const q = query(
          collection(db, "subjects"),
          where("gradeId", "==", gradeId),
          orderBy("order", "asc")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSubjects(data);
      } catch (err) {
        console.error("Firestore Error:", err);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [gradeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-center text-white p-10">
        تحميل...
      </div>
    );
  }

  /*
   * ============================================================
   * البكالوريا - النسخة الخاصة بالمعلم
   *
   * المادة الوحيدة الظاهرة:
   * الاقتصاد
   *
   * لا نحذف أي مادة من Firebase.
   * نحن فقط نحدد ما يظهر في هذه الواجهة.
   * ============================================================
   */

  const economySubjects = subjects.filter((subject) => {
    const subjectId = subject.subjectId?.toLowerCase().trim() || "";
    const nameAr = subject.nameAr?.trim() || "";

    return (
      subjectId.includes("econom") ||
      subjectId.includes("business") ||
      nameAr === "الاقتصاد" ||
      nameAr.includes("اقتصاد")
    );
  });

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">

      <h1 className="text-2xl font-bold text-yellow-400 text-center mb-10">
        المواد
      </h1>

      {economySubjects.length > 0 ? (
        <section className="max-w-4xl mx-auto">

          <h2 className="text-yellow-400 text-xl mb-6 text-center">
            الاقتصاد
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {economySubjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/student/bac/units/${gradeId}/${subject.id}`}
              >
                <Box title={subject.nameAr || "الاقتصاد"} />
              </Link>
            ))}
          </div>

        </section>
      ) : (
        <div className="text-center text-red-400 text-xl">
          لا توجد مادة الاقتصاد لهذا الصف
        </div>
      )}

    </div>
  );
}