import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db, auth } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";

export default function UploadReceipt() {
  const [file, setFile] = useState(null);
  const user = auth.currentUser;

  const uploadReceipt = async () => {
    if (!file) {
      alert("❗ من فضلك اختر صورة الإيصال أولاً");
      return;
    }

    if (!user) {
      alert("⚠ يجب تسجيل الدخول أولًا");
      return;
    }

    try {
      const storageRef = ref(storage, `receipts/${user.uid}.jpg`);
      await uploadBytes(storageRef, file);
      const receiptUrl = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", user.uid), {
        receiptUrl,
        subscriptionStatus: "verification",
      });

      alert("📤 تم رفع الإيصال بنجاح وسيتم مراجعته خلال ساعات.");
    } catch (error) {
      console.error(error);
      alert("❌ حدث خطأ أثناء الرفع.");
    }
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4 text-white">رفع إيصال الدفع</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="text-white mb-4"
      />

      <button
        onClick={uploadReceipt}
        className="bg-blue-600 text-white p-3 rounded-lg mt-4"
      >
        📤 رفع الإيصال
      </button>
    </div>
  );
}
