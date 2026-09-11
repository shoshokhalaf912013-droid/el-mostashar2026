export async function sendTeacherUploadNotification(type, url) {
  console.log(`📩 إرسال نسخة من ${type} للمدير\nالرابط: ${url}`);
  // قابل للتوصيل لاحقًا بخدمة مثل SendGrid / Gmail API
}
