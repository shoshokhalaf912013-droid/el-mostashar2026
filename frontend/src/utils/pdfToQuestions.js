// this is pseudo-code helper to be used on backend (Cloud Functions)
// نصيحة: نفّذ هذه الوظيفة على server/Cloud Function مع مفتاح OpenAI
export async function pdfToQuestions(pdfBuffer) {
  // 1. استخدم pdf-parse أو Tesseract لاستخراج النص من الـ PDF
  // 2. بقسم النص إلى فقرات ثم أرسل للـ OpenAI مع prompt: "حوّل النص التالي إلى أسئلة MCQ"
  // 3. قم بتحويل الإجابة إلى JSON وأعدها للـ frontend
  return []; // ترجع قائمة أسئلة جاهزة للحفظ
}
