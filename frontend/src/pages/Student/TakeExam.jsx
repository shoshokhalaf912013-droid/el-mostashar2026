// src/pages/Student/TakeExam.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";

export default function TakeExam() {
  const { id } = useParams(); // attempt id
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [exam, setExam] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const heartbeatRef = useRef(null);
  const autosaveRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/attempts/${id}`);
        const att = res.data.attempt;
        setAttempt(att);

        const examRes = await api.get(`/api/exams/${att.examId}`);
        setExam(examRes.data.exam);

        const ansMap = {};
        (att.answers || []).forEach(a => { ansMap[a.questionIndex] = a.choiceIndex; });
        setAnswers(ansMap);
        setTimeLeft(att.remainingSeconds ?? (examRes.data.exam.duration || examRes.data.exam.durationMinutes || 30) * 60);
      } catch (err) {
        console.error(err);
        alert("فشل تحميل الامتحان/المحاولة");
        navigate("/");
      }
    };
    load();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft === undefined) return;
    const tick = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(tick);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [timeLeft]);

  useEffect(() => {
    if (!attempt) return;
    heartbeatRef.current = setInterval(() => {
      api.post(`/api/attempts/${id}/ping`).catch(() => {});
    }, 5000);
    return () => clearInterval(heartbeatRef.current);
  }, [attempt, id]);

  useEffect(() => {
    if (!attempt) return;
    autosaveRef.current = setInterval(() => {
      doAutosave();
    }, 10000);
    return () => clearInterval(autosaveRef.current);
    // eslint-disable-next-line
  }, [attempt, answers, timeLeft, id]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      try {
        const payload = JSON.stringify({
          answers: mapAnswersArray(),
          remainingSeconds: timeLeft
        });
        navigator.sendBeacon && navigator.sendBeacon(`/api/attempts/${id}/save`, payload);
      } catch (err) {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answers, timeLeft, id]);

  const mapAnswersArray = () => {
    const arr = [];
    for (const key in answers) arr.push({ questionIndex: Number(key), choiceIndex: answers[key] });
    return arr;
  };

  const doAutosave = async () => {
    try {
      await api.post(`/api/attempts/${id}/save`, {
        answers: mapAnswersArray(),
        remainingSeconds: timeLeft
      });
    } catch (err) {
      console.error("autosave failed", err);
    }
  };

  const selectChoice = (choiceIndex) => {
    setAnswers(prev => ({ ...prev, [currentQ]: choiceIndex }));
  };

  const gotoQuestion = (i) => {
    if (!exam.allowPrevious && i < currentQ) {
      alert("الرجوع غير مسموح في هذا الامتحان.");
      return;
    }
    setCurrentQ(i);
  };

  const handleNext = () => {
    if (currentQ < exam.questions.length - 1) setCurrentQ(currentQ + 1);
    else handleFinish();
  };

  const handleFinish = async () => {
    if (Object.keys(answers).length < exam.questions.length) {
      alert("يجب الإجابة على جميع الأسئلة قبل التسليم.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/api/attempts/${id}/save`, { answers: mapAnswersArray(), remainingSeconds: timeLeft });
      const res = await api.post(`/api/attempts/${id}/submit`);
      const { score, total } = res.data;
      navigate(`/student/exam-result/${id}`, { state: { score, total } });
    } catch (err) {
      console.error(err);
      alert("فشل في إرسال الإجابة. حاول مرة أخرى.");
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    try {
      await api.post(`/api/attempts/${id}/save`, { answers: mapAnswersArray(), remainingSeconds: 0 });
      const res = await api.post(`/api/attempts/${id}/submit`);
      const { score, total } = res.data;
      navigate(`/student/exam-result/${id}`, { state: { score, total } });
    } catch (err) {
      console.error(err);
      navigate(`/student/exam-result/${id}`, { state: { score: 0, total: exam?.questions.length || 0 } });
    }
  };

  if (!exam || !attempt) return <div className="p-6 text-white">جاري التحميل...</div>;

  const q = exam.questions[currentQ];
  const formatTime = secs => {
    const m = Math.floor(secs/60).toString().padStart(2,'0');
    const s = (secs%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  };

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl text-yellow-400">{exam.title}</h1>
        <div className="bg-gray-800 p-2 rounded">
          الوقت المتبقي: <span className="font-bold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded">
        <p className="mb-4">السؤال {currentQ+1} / {exam.questions.length}</p>
        <p className="mb-4 text-lg">{q.questionText}</p>

        <div className="space-y-2">
          {q.choices.map((c, idx) => (
            <button key={idx} onClick={() => selectChoice(idx)}
              className={`block w-full p-3 rounded text-left ${answers[currentQ]===idx ? 'bg-green-600':''} bg-gray-800`}>
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={() => gotoQuestion(Math.max(0,currentQ-1))} className="px-4 py-2 bg-yellow-600 rounded">السابق</button>
          <button onClick={handleNext} className="px-4 py-2 bg-blue-600 rounded">التالي</button>
          <button onClick={handleFinish} disabled={isSubmitting} className="ml-auto bg-green-600 px-4 py-2 rounded">تسليم</button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-yellow-400 mb-2">انتقل إلى سؤال:</h3>
        <div className="flex gap-2 flex-wrap">
          {exam.questions.map((_, i) => (
            <button key={i} onClick={() => gotoQuestion(i)}
              className={`w-10 h-10 rounded ${answers[i] !== undefined ? 'bg-green-600' : 'bg-gray-700'}`}>
              {i+1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
