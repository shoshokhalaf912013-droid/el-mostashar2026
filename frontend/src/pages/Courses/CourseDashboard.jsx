import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const coursesMap = {
  grade1: { all: [{ id: "history_grade1", name: "التاريخ الفرعوني" }] },
  grade2: {
    scientific: [{ id: "history_grade2_scientific", name: "التاريخ الإسلامي" }],
    literary: [{ id: "history_grade2_literary", name: "التاريخ الإسلامي" }, { id: "geography_grade2_literary", name: "جغرافية التنمية" }]
  },
  grade3: { literary: [{ id: "history_grade3_literary", name: "تاريخ مصر والعرب الحديث" }, { id: "geography_grade3_literary", name: "الجغرافيا السياسية" }] }
};

export default function CourseDashboard() {
  const { gradeId, sectionId } = useParams();
  const [list, setList] = useState([]);

  useEffect(() => {
    const arr = (coursesMap[gradeId] && coursesMap[gradeId][sectionId]) || [];
    setList(arr);
  }, [gradeId, sectionId]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#111] text-white rounded">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">المواد المتاحة</h2>
      {list.length === 0 ? <p>لا توجد مواد حالياً.</p> : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map(c => (
            <div key={c.id} className="p-4 bg-[#222] rounded border border-yellow-600">
              <h3 className="text-lg font-bold text-yellow-400">{c.name}</h3>
              <div className="mt-3 flex gap-2">
                <Link to={`/course/${c.id}`} className="px-3 py-1 bg-blue-600 rounded">ادخل الكورس</Link>
                <Link to={`/dashboard/upload/${c.id}`} className="px-3 py-1 bg-green-600 rounded">رفع محتوى</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
