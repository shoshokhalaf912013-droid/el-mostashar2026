import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

export default function CreateTeacherModal() {
  const { permissions } = useAuth();

  /* 🔐 حماية داخلية */
  if (!permissions?.isSuperAdmin) return null;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    stageId: "",
    systemId: "",
    gradeId: "",
    subject: ""
  });

  /* ================================
     STAGES
  ================================= */
  const stages = [
    { id: "primary", title: "المرحلة الابتدائية" },
    { id: "preparatory", title: "المرحلة الإعدادية" },
    { id: "secondary", title: "المرحلة الثانوية" }
  ];

  /* ================================
     SYSTEMS (للثانوي فقط)
  ================================= */
  const systems = [
    { id: "general", stageId: "secondary", title: "ثانوي عام" },
    { id: "bac", stageId: "secondary", title: "بكالوريا مصرية" }
  ];

  /* ================================
     GRADES
  ================================= */
  const grades = [
    { id: "primary1", stageId: "primary", title: "الصف الأول" },
    { id: "primary2", stageId: "primary", title: "الصف الثاني" },
    { id: "primary3", stageId: "primary", title: "الصف الثالث" },
    { id: "primary4", stageId: "primary", title: "الصف الرابع" },
    { id: "primary5", stageId: "primary", title: "الصف الخامس" },
    { id: "primary6", stageId: "primary", title: "الصف السادس" },

    { id: "prep1", stageId: "preparatory", title: "الأول الإعدادي" },
    { id: "prep2", stageId: "preparatory", title: "الثاني الإعدادي" },
    { id: "prep3", stageId: "preparatory", title: "الثالث الإعدادي" },

    { id: "sec1", stageId: "secondary", systemId: "general", title: "الأول الثانوي" },
    { id: "sec2", stageId: "secondary", systemId: "general", title: "الثاني الثانوي" },
    { id: "sec3", stageId: "secondary", systemId: "general", title: "الثالث الثانوي" },

    { id: "bac1", stageId: "secondary", systemId: "bac", title: "الأول بكالوريا" },
    { id: "bac2", stageId: "secondary", systemId: "bac", title: "الثاني بكالوريا" },
    { id: "bac3", stageId: "secondary", systemId: "bac", title: "الثالث بكالوريا" }
  ];

  /* ================================
     SUBJECTS
  ================================= */
  const subjects = [
    { value: "ProgrammingComputerScience", label: "البرمجة وعلوم الحاسب" },
    { value: "accounting", label: "المحاسبة" },
    { value: "arabic", label: "اللغة العربية" },
    { value: "biology", label: "الأحياء" },
    { value: "businessAdministration", label: "إدارة الأعمال" },
    { value: "chemistry", label: "الكيمياء" },
    { value: "computer", label: "الحاسب الآلي" },
    { value: "economics", label: "الاقتصاد" },
    { value: "english", label: "اللغة الإنجليزية" },
    { value: "geography", label: "الجغرافيا" },
    { value: "history", label: "التاريخ" },
    { value: "ict", label: "ICT" },
    { value: "integratedScience", label: "العلوم المتكاملة" },
    { value: "math", label: "الرياضيات" },
    { value: "multidisciplinary", label: "متعدد التخصصات" },
    { value: "nationalEducation", label: "التربية الوطنية" },
    { value: "philosophyLogic", label: "الفلسفة والمنطق" },
    { value: "physics", label: "الفيزياء" },
    { value: "programming", label: "البرمجة" },
    { value: "psychology", label: "علم النفس" },
    { value: "religionChristian", label: "التربية الدينية المسيحية" },
    { value: "religionIslamic", label: "التربية الدينية الإسلامية" },
    { value: "science", label: "العلوم" },
    { value: "secondLanguageFrench", label: "لغة ثانية فرنسية" },
    { value: "secondLanguageGerman", label: "لغة ثانية ألمانية" },
    { value: "secondLanguageItalian", label: "لغة ثانية إيطالية" },
    { value: "secondLanguageSpanish", label: "لغة ثانية إسبانية" },
    { value: "socialStudies", label: "الدراسات الاجتماعية" },
    { value: "statistics", label: "الإحصاء" },
    { value: "tokkatsu", label: "توكاتسو" },
    { value: "values", label: "القيم والأخلاق" }
  ];

  /* ================================
     HANDLE CHANGE
  ================================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "stageId") {
      setFormData({
        ...formData,
        stageId: value,
        systemId: "",
        gradeId: ""
      });
    } else if (name === "systemId") {
      setFormData({
        ...formData,
        systemId: value,
        gradeId: ""
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  /* ================================
     FILTERING
  ================================= */
  const filteredSystems = systems.filter(
    (sys) => sys.stageId === formData.stageId
  );

  const filteredGrades = grades.filter((grade) => {
    if (formData.stageId !== "secondary") {
      return grade.stageId === formData.stageId;
    }
    return (
      grade.stageId === "secondary" &&
      grade.systemId === formData.systemId
    );
  });

  /* ================================
     SUBMIT
  ================================= */
  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.stageId ||
      !formData.gradeId ||
      !formData.subject ||
      (formData.stageId === "secondary" && !formData.systemId)
    ) {
      alert("من فضلك أكمل جميع البيانات");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "teachers"), {
        ...formData,
        active: true,
        createdAt: serverTimestamp()
      });

      alert("تم إضافة المعلم بنجاح ✅");

      setFormData({
        name: "",
        email: "",
        stageId: "",
        systemId: "",
        gradeId: "",
        subject: ""
      });

      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الإضافة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-yellow-400 hover:bg-yellow-300 text-black px-5 py-2 rounded-lg font-bold transition"
      >
        ➕ إضافة معلم
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 w-full max-w-lg p-8 rounded-2xl border border-yellow-500/40 space-y-5">

            <h3 className="text-2xl font-bold text-yellow-400">
              إضافة معلم جديد
            </h3>

            <input
              type="text"
              name="name"
              placeholder="اسم المعلم"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded bg-black border border-gray-700"
            />

            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded bg-black border border-gray-700"
            />

            {/* Stage */}
            <select
              name="stageId"
              value={formData.stageId}
              onChange={handleChange}
              className="w-full p-3 rounded bg-black border border-gray-700"
            >
              <option value="">اختر المرحلة</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.title}
                </option>
              ))}
            </select>

            {/* System */}
            {formData.stageId === "secondary" && (
              <select
                name="systemId"
                value={formData.systemId}
                onChange={handleChange}
                className="w-full p-3 rounded bg-black border border-gray-700"
              >
                <option value="">اختر النظام</option>
                {filteredSystems.map((sys) => (
                  <option key={sys.id} value={sys.id}>
                    {sys.title}
                  </option>
                ))}
              </select>
            )}

            {/* Grade */}
            {formData.stageId && (
              <select
                name="gradeId"
                value={formData.gradeId}
                onChange={handleChange}
                className="w-full p-3 rounded bg-black border border-gray-700"
              >
                <option value="">اختر الصف</option>
                {filteredGrades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.title}
                  </option>
                ))}
              </select>
            )}

            {/* Subject */}
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-3 rounded bg-black border border-gray-700"
            >
              <option value="">اختر المادة</option>
              {subjects.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
              >
                إلغاء
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold disabled:opacity-50"
              >
                {loading ? "جارٍ الإضافة..." : "حفظ"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}