import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SelectClass() {
  const navigate = useNavigate();
  const location = useLocation();

  // المرحلة القادمة من الصفحة السابقة (مؤقتًا)
  const stageId = location.state?.stageId;

  // حماية
  if (!stageId) {
    navigate("/student/select-stage");
    return null;
  }

  // الصفوف حسب المرحلة
  const classesByStage = {
    primary: [
      "الصف الأول الابتدائي",
      "الصف الثاني الابتدائي",
      "الصف الثالث الابتدائي",
      "الصف الرابع الابتدائي",
      "الصف الخامس الابتدائي",
      "الصف السادس الابتدائي",
    ],
    preparatory: [
      "الصف الأول الإعدادي",
      "الصف الثاني الإعدادي",
      "الصف الثالث الإعدادي",
    ],
    "secondary-general": [
      "الصف الأول الثانوي",
      "الصف الثاني الثانوي",
      "الصف الثالث الثانوي",
    ],
    "secondary-bac": [
      "الصف الأول الثانوي (بكالوريا)",
      "الصف الثاني الثانوي (بكالوريا)",
      "الصف الثالث الثانوي (بكالوريا)",
    ],
    special: ["كورسات خاصة"],
  };

  const classes = classesByStage[stageId] || [];

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* العنوان */}
      <h1 className="text-3xl font-extrabold text-yellow-400 text-center mb-10">
        اختر الصف الدراسي
      </h1>

      {/* الشبكة */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {classes.map((cls, index) => (
          <div
            key={index}
            onClick={() => {
              alert(`اخترت: ${cls}`);
              // لاحقًا: navigate("/student/select-subject", { state: { className: cls } })
            }}
            className="
              bg-[#111]
              border border-[#222]
              rounded-2xl
              p-6
              text-center
              cursor-pointer
              transition-all duration-300
              hover:-translate-y-1
              hover:shadow-lg hover:shadow-yellow-500/20
            "
          >
            <h2 className="text-xl font-bold mb-2">{cls}</h2>
          </div>
        ))}
      </div>

      {/* رجوع */}
      <div className="text-center mt-12">
        <button
          onClick={() => navigate("/student/select-stage")}
          className="text-gray-400 hover:text-white transition text-sm"
        >
          ⬅ الرجوع لاختيار المرحلة
        </button>
      </div>
    </div>
  );
}
