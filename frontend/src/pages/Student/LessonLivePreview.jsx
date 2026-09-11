export default function LessonLivePreview({ lesson }) {
  if (!lesson?.title) return null;

  return (
    <div className="lesson-preview-box">

      <h2 className="lesson-preview-title">
        {lesson.title}
      </h2>

      {lesson.videoUrl && (
        <iframe
          src={lesson.videoUrl.replace("watch?v=", "embed/")}
          title="lesson-video"
          allowFullScreen
        />
      )}

      {lesson.pdfUrl && (
        <a
          href={lesson.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="pdf-box"
        >
          📄 فتح ملف PDF
        </a>
      )}
    </div>
  );
}
