import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Homework() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [answer, setAnswer] = React.useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const saveHomework = async () => {
    if (!answer.trim()) {
      alert("اكتب إجابتك أولاً");
      return;
    }

    await setDoc(doc(db, "lessons", lessonId, "homework", user.uid), {
      studentId: user.uid,
      answer,
      submittedAt: Date.now(),
    });

    alert("تم تسليم الواجب بنجاح");
    navigate(`/student/lesson/${lessonId}/exam`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl text-yellow-400 font-bold mb-4">
        واجب الدرس
      </h2>

      <textarea
        className="w-full h-40 p-4 rounded-lg bg-gray-900 border border-yellow-600 text-white"
        placeholder="اكتب إجابتك هنا..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      ></textarea>

      <button
        onClick={saveHomework}
        className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-bold"
      >
        تسليم الواجب
      </button>
    </div>
  );
}
