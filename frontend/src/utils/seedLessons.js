import { db } from "../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export async function seedLessons() {
  const lessonsData = [
    {
      title: "درس 1: مقدمة في الرياضيات",
      description: "مقدمة أساسية حول المفاهيم الرياضية.",
      videoUrl: "https://example.com/videos/lesson1.mp4",
    },
    {
      title: "درس 2: الأعداد الصحيحة",
      description: "شرح كامل للأعداد الصحيحة وكيفية استخدامها.",
      videoUrl: "https://example.com/videos/lesson2.mp4",
    },
    {
      title: "درس 3: المعادلات",
      description: "تعلم كيفية حل المعادلات البسيطة.",
      videoUrl: "https://example.com/videos/lesson3.mp4",
    },
  ];

  try {
    for (let lesson of lessonsData) {
      await addDoc(collection(db, "lessons"), lesson);
    }

    console.log("تم إضافة الدروس بنجاح 🎉");
  } catch (error) {
    console.error("حدث خطأ:", error);
  }
}
