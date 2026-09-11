import { collection, query, where, getDocs, addDoc, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function AddUnitButton({ subject, grade, stage }) {
  const { user } = useAuth();

  const addUnit = async () => {
    if (!user || user.role !== "super-admin") return alert("غير مسموح");

    const q = query(
      collection(db, "units"),
      where("subject", "==", subject),
      where("grade", "==", grade),
      where("stage", "==", stage),
      orderBy("order", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);
    let nextOrder = 1;

    if (!snapshot.empty) {
      nextOrder = snapshot.docs[0].data().order + 1;
    }

    await addDoc(collection(db, "units"), {
      title: `الوحدة ${nextOrder}`,
      order: nextOrder,
      subject,
      grade,
      stage,
      active: true,
      createdAt: new Date()
    });

    alert("تمت إضافة الوحدة");
  };

  return (
    <button className="gold-add-unit-btn" onClick={addUnit}>
      ➕ إضافة وحدة
    </button>
  );
}
