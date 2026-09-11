import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const grades = [
  { id: "grade1", name: "الصف الأول الثانوي", sections: [{ id: "all", name: "عام / بكالوريا" }] },
  { id: "grade2", name: "الصف الثاني الثانوي", sections: [{ id: "scientific", name: "علمي" }, { id: "literary", name: "أدبي" }] },
  { id: "grade3", name: "الصف الثالث الثانوي", sections: [{ id: "literary", name: "أدبي" }] } // ملاحظة: الصف الثالث لا يوجد علمي
];

export default function GradeSelector() {
  const nav = useNavigate();
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");

  const onNext = () => {
    if (!grade) return alert("اختر الصف أولاً");
    // اذا ليس هناك قسم مختار و الصف لديه قسم افتراضي:
    if (!section) {
      const g = grades.find(g => g.id === grade);
      if (g && g.sections.length === 1) setSection(g.sections[0].id);
      else return alert("اختر الشعبة أو القسم");
    }
    // نحدد المواد تبعًا للاختيارات وندخل لوحة الكورس العامة
    nav(`/courses/${grade}/${section}`);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-[#111] text-white rounded">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">اختر صفك</h2>

      <select className="w-full p-2 mb-3 bg-[#222]" value={grade} onChange={e => { setGrade(e.target.value); setSection(""); }}>
        <option value="">📚 اختر الصف</option>
        {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>

      {grade && (
        <select className="w-full p-2 mb-3 bg-[#222]" value={section} onChange={e => setSection(e.target.value)}>
          <option value="">🔍 اختر الشعبة (إن وجدت)</option>
          {grades.find(g => g.id === grade).sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      )}

      <button className="bg-yellow-600 px-4 py-2 rounded" onClick={onNext}>التالي ➜</button>
    </div>
  );
}
