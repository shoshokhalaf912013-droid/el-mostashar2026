import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../firebase";

/*
  قواعد ثابتة (مؤقتًا):
  - كل المسارات تظهر
  - كل المواد تظهر
  - لا يوجد منع على الدخول
*/

const TRACKS = [
  { id: "bacLifeMedicine", title: "مسار الطب وعلوم الحياة" },
  { id: "bacEngineering", title: "مسار الهندسة وعلوم الحاسب" },
  { id: "bacBusiness", title: "مسار الأعمال" },
  { id: "bacArtsHumanities", title: "مسار الآداب والفنون" },
];

export default function BacTracksSubjectsView() {
  const { gradeId } = useParams(); // bac2 | bac3
  const navigate = useNavigate();

  const [subjectsByTrack, setSubjectsByTrack] = useState({});
  const [openTrack, setOpenTrack] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrackSubjects();
  }, [gradeId]);

  async function loadTrackSubjects() {
    setLoading(true);

    try {
      const q = query(
        collection(db, "trackSubjects"),
        where("active", "==", true),
        where("gradeId", "==", gradeId),
        orderBy("order", "asc")
      );

      const snap = await getDocs(q);

      const grouped = {};

      snap.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };

        if (!grouped[data.trackId]) {
          grouped[data.trackId] = [];
        }

        grouped[data.trackId].push(data);
      });

      setSubjectsByTrack(grouped);
    } catch (e) {
      console.error("❌ BacTracksSubjectsView:", e);
    } finally {
      setLoading(false);
    }
  }

  // ✅ دخول مباشر بدون أي منع
  function handleSubjectClick(subject) {
    navigate(`/student/bac/units/${gradeId}/${subject.subjectId}`);
  }

  if (loading) {
    return <div className="p-10 text-center text-white">جاري التحميل...</div>;
  }

  return (
    <div className="p-10 text-white">
      <h2 className="text-2xl text-center mb-10">مسارات البكالوريا</h2>

      <div className="space-y-6">
        {TRACKS.map((track) => {
          const subjects = subjectsByTrack[track.id] || [];
          const isOpen = openTrack === track.id;

          return (
            <div
              key={track.id}
              className="border border-yellow-700/40 rounded-xl"
            >
              {/* عنوان المسار */}
              <div
                onClick={() =>
                  setOpenTrack(isOpen ? null : track.id)
                }
                className="
                  cursor-pointer
                  p-6
                  bg-zinc-900
                  hover:bg-zinc-800
                  transition
                  flex
                  justify-between
                  items-center
                "
              >
                <span className="text-lg">{track.title}</span>
                <span className="text-yellow-400">
                  {isOpen ? "−" : "+"}
                </span>
              </div>

              {/* المواد */}
              {isOpen && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.length === 0 && (
                    <div className="text-gray-400">
                      لا توجد مواد لهذا المسار
                    </div>
                  )}

                  {subjects.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSubjectClick(s)}
                      className="
                        cursor-pointer
                        bg-zinc-800
                        rounded-lg
                        p-5
                        text-center
                        border border-yellow-700/30
                        hover:border-yellow-400
                        transition
                      "
                    >
                      {s.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
