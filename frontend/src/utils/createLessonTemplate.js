export function createLesson({
  gradeId,
  subjectId,
  unitId,
  lessonOrder,
  title,
  description,
}) {
  return {
    active: true,
    gradeId,
    subjectId,
    unitId,
    lessonOrder,
    title,
    description,

    flow: [
      {
        order: 1,
        type: "video",
        videoUrl: "سيتم رفع الفيديو لاحقًا",
      },
      {
        order: 2,
        type: "text",
        content: description || title,
      },
      {
        order: 3,
        type: "pdf",
        pdfUrl: "سيتم رفع الملف لاحقًا",
      },
    ],
  };
}
