import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function PromoteButton({ currentUser, targetUser }) {
  // 🔐 يظهر فقط للسوبر أدمن
  if (!currentUser || currentUser.role !== "superAdmin") return null;

  // منع ترقية نفسه
  if (currentUser.uid === targetUser.uid) return null;

  const promoteToAdmin = async () => {
    const ok = window.confirm(
      `هل تريد ترقية المستخدم:\n${targetUser.email}\nإلى Admin ؟`
    );
    if (!ok) return;

    try {
      await updateDoc(doc(db, "users", targetUser.uid), {
        role: "admin",
      });
      alert("✅ تمت الترقية بنجاح");
    } catch (err) {
      console.error(err);
      alert("❌ فشل الترقية (تحقق من الصلاحيات)");
    }
  };

  return (
    <button
      onClick={promoteToAdmin}
      style={{
        padding: "6px 10px",
        backgroundColor: "#14532d",
        color: "white",
        borderRadius: "6px",
        fontSize: "14px",
        cursor: "pointer",
      }}
    >
      ترقية إلى Admin
    </button>
  );
}
