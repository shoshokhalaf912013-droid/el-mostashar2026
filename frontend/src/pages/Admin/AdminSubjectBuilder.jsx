import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function AdminSubjectBuilder() {
  const { gradeId, subjectKey } = useParams();

  const [units, setUnits] = useState([]);

  const addUnit = () => {
    setUnits([
      ...units,
      {
        id: Date.now(),
        name: "",
        lessons: [],
      },
    ]);
  };

  const updateUnitName = (unitId, value) => {
    setUnits(
      units.map((u) =>
        u.id === unitId ? { ...u, name: value } : u
      )
    );
  };

  const addLesson = (unitId) => {
    setUnits(
      units.map((u) =>
        u.id === unitId
          ? {
              ...u,
              lessons: [
                ...u.lessons,
                {
                  id: Date.now(),
                  name: "",
                },
              ],
            }
          : u
      )
    );
  };

  const updateLessonName = (unitId, lessonId, value) => {
    setUnits(
      units.map((u) =>
        u.id === unitId
          ? {
              ...u,
              lessons: u.lessons.map((l) =>
                l.id === lessonId ? { ...l, name: value } : l
              ),
            }
          : u
      )
    );
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">
        إدارة المادة – {subjectKey} / {gradeId}
      </h1>

      {/* إضافة وحدة */}
      <button
        onClick={addUnit}
        className="mb-6 px-4 py-2 bg-yellow-500 text-black rounded"
      >
        ➕ إضافة وحدة
      </button>

      {/* الوحدات */}
      {units.map((unit, unitIndex) => (
        <div
          key={unit.id}
          className="mb-6 p-4 border border-gray-700 rounded"
        >
          {/* رأس الوحدة */}
          <div className="flex items-center gap-4 mb-4">
            <div className="text-lg font-bold">
              الوحدة {unitIndex + 1}
            </div>

            <input
              type="text"
              placeholder="اسم الوحدة"
              value={unit.name}
              onChange={(e) =>
                updateUnitName(unit.id, e.target.value)
              }
              className="flex-1 p-2 bg-black border border-gray-600 rounded"
            />
          </div>

          {/* إضافة درس */}
          <button
            onClick={() => addLesson(unit.id)}
            className="mb-4 px-3 py-1 bg-blue-600 rounded"
          >
            ➕ إضافة درس
          </button>

          {/* الدروس */}
          {unit.lessons.map((lesson, lessonIndex) => (
            <div
              key={lesson.id}
              className="flex items-center gap-4 mb-2 pl-4"
            >
              <div>
                الدرس {lessonIndex + 1}
              </div>

              <input
                type="text"
                placeholder="اسم الدرس"
                value={lesson.name}
                onChange={(e) =>
                  updateLessonName(
                    unit.id,
                    lesson.id,
                    e.target.value
                  )
                }
                className="flex-1 p-2 bg-black border border-gray-600 rounded"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
