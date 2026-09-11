import { useState } from "react";
import { db } from "../../firebase.js";   // ← ضع هذا هنا
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

const AddQuestionPage = ({ examId }) => {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionType, setQuestionType] = useState("mcq");

  const handleAddQuestion = async () => {
    const newQuestion = {
      questionText,
      options,
      correctAnswer,
      questionType,
    };

    const examRef = doc(db, "exams", examId); // الوصول إلى الامتحان في Firestore

    // إضافة السؤال للمصفوفة داخل الامتحان
    await updateDoc(examRef, {
      questions: arrayUnion(newQuestion),
    });

    // إعادة تعيين الحقول بعد إضافة السؤال
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
  };

  return (
    <div>
      <h2>إضافة سؤال جديد</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          السؤال:
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </label>

        <label>
          الاختيارات:
          {options.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) =>
                setOptions(options.map((opt, i) => (i === index ? e.target.value : opt)))
              }
            />
          ))}
        </label>

        <label>
          الإجابة الصحيحة:
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
          />
        </label>

        <label>
          نوع السؤال:
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="mcq">اختيارات متعددة</option>
            <option value="truefalse">صح/خطأ</option>
            <option value="shortanswer">إجابة قصيرة</option>
          </select>
        </label>

        <button onClick={handleAddQuestion}>إضافة السؤال</button>
      </form>
    </div>
  );
};

export default AddQuestionPage;
