import React from "react";
import { useParams } from "react-router-dom";

export default function CoursePage() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">صفحة الكورس رقم {id}</h1>

      <p className="mt-4 text-gray-600">
        هذه الصفحة ستعرض معلومات الكورس، الدروس، الفيديوهات، وكل شيء متعلق بالكورس.
      </p>
    </div>
  );
}
