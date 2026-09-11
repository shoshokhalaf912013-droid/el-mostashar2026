import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function TracksView() {
  const navigate = useNavigate();
  const { stageId, systemId } = useParams();

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔒 أمان: الصفحة دي للبكالوريا فقط
    if (systemId !== "bac") return;

    const fetchTracks = async () => {
      try {
        const q = query(
          collection(db, "trackSubjects"),
          where("active", "==", true),
          where("systemId", "==", "bac"),
          where("stageId", "==", stageId),
          orderBy("order", "asc")
        );

        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTracks(data);
      } catch (err) {
        console.error("❌ Error loading tracks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [stageId, systemId]);

  if (systemId !== "bac") {
    return (
      <div className="text-center text-red-400 mt-20">
        هذه الصفحة مخصصة للبكالوريا فقط
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold text-center text-yellow-400 mb-10">
        اختر المسار
      </h1>

      {loading ? (
        <div className="text-center text-gray-400 mt-20">
          جاري تحميل المسارات...
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center text-red-400 text-xl mt-20">
          ❌ لا توجد مسارات
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tracks.map((track) => (
            <div
              key={track.id}
              onClick={() =>
                navigate(
                  `/student/subjects/${stageId}/${systemId}?trackId=${track.id}`
                )
              }
              className="cursor-pointer bg-[#111] border border-yellow-700/40 rounded-xl p-6 text-center hover:border-yellow-400 transition"
            >
              <h2 className="text-xl text-yellow-300 font-bold">
                {track.title}
              </h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
