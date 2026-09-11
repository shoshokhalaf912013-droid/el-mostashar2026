import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import SubjectsByGrade from "../../data/SubjectsByGrade";

export default function SelectSubject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjectsData, setSubjectsData] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          setSubjectsData(null);
          return;
        }

        const { gradeId } = snap.data();

        if (!gradeId || !SubjectsByGrade[gradeId]) {
          setSubjectsData(null);
          return;
        }

        setSubjectsData(SubjectsByGrade[gradeId]);
      } catch (err) {
        console.error("SELECT_SUBJECT_ERROR:", err);
        setSubjectsData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-yellow-400 text-xl">
        ⏳ جاري تحميل المواد...
      </div>
    );
  }

  if (!subjectsData) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400 text-xl">
        ❌ لا توجد مواد لهذا الصف
      </div>
    );
  }

  const { commonAdded = [], commonNotAdded = [], tracks = {} } = subjectsData;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-12 text-yellow-400">
        المواد الدراسية
      </h1>

      {commonAdded.length > 0 && (
        <Section title="📘 مواد تُضاف للمجموع" items={commonAdded} />
      )}

      {Object.keys(tracks).length > 0 && (
        <div className="mb-16">
          <h2 className="text-xl text-center mb-6 text-yellow-300">
            🧭 المسارات
          </h2>

          {Object.entries(tracks).map(([trackName, subjects]) => (
            <Section
              key={trackName}
              title={trackName}
              items={subjects}
            />
          ))}
        </div>
      )}

      {commonNotAdded.length > 0 && (
        <Section
          title="📕 مواد لا تُضاف للمجموع"
          items={commonNotAdded}
          dimmed
        />
      )}
    </div>
  );
}

function Section({ title, items, dimmed }) {
  return (
    <div className="mb-10">
      <h3 className="text-lg text-center mb-4 text-yellow-300">
        {title}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {items.map((item) => (
          <div
            key={item}
            className={`p-6 rounded-xl text-center border ${
              dimmed
                ? "border-gray-700 opacity-70"
                : "border-yellow-600"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}