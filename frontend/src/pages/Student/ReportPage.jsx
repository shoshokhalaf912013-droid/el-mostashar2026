import React, { useEffect, useState } from "react";
import "./styles/report.css";

const ReportPage = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    // محاكاة جلب التقرير من السيرفر
    setReport({
      examTitle: "امتحان على الدرس الأول",
      correct: 7,
      total: 10,
      time: "12 دقيقة",
      tips: [
        "راجع السؤال رقم 3 — كان يحتاج مزيدًا من التركيز.",
        "أعد قراءة الدرس الثاني قبل الامتحان القادم.",
        "أحسنت! مستواك يتحسن بشكل ملحوظ.",
      ],
    });
  }, []);

  if (!report) return <div className="report-loading">جار تحميل التقرير...</div>;

  const percentage = Math.round((report.correct / report.total) * 100);

  return (
    <div className="report-container">
      <h2 className="report-title">تقرير امتحانك</h2>

      <div className="report-box">
        <h3 className="report-exam-name">{report.examTitle}</h3>

        <div className="report-stats">
          <div className="stat">
            <span>النتيجة:</span>
            <b>{report.correct} / {report.total}</b>
          </div>

          <div className="stat">
            <span>نسبة النجاح:</span>
            <b className={percentage >= 60 ? "gold" : "red"}>
              {percentage}%
            </b>
          </div>

          <div className="stat">
            <span>الوقت المستغرق:</span>
            <b>{report.time}</b>
          </div>
        </div>

        <div className="report-tips">
          <h4>توصيات:</h4>
          <ul>
            {report.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="report-actions">
          <button className="report-btn gold-btn">
            إعادة الامتحان 🔁
          </button>

          <button className="report-btn black-btn">
            الذهاب للدرس التالي ➜
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
