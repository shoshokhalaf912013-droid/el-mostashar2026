import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";

const OWNER_EMAIL = "khalafmahrous2000@gmail.com";

function NavCard({
  title,
  subtitle,
  icon,
  onClick,
  danger = false,
  active = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group
        w-full
        text-right
        p-4
        rounded-2xl
        border
        transition-all
        duration-300

        ${
          danger
            ? `
              border-red-500/40
              hover:border-red-500
              hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]
            `
            : `
              border-yellow-400/40
              hover:border-yellow-400
              hover:shadow-[0_0_20px_rgba(250,204,21,0.6)]
            `
        }

        ${
          active
            ? danger
              ? "bg-red-500/10"
              : "bg-yellow-400/10"
            : "bg-black"
        }

        hover:-translate-y-1
      `}
    >

      <div className="flex items-center justify-between">

        <div className="text-2xl">
          {icon}
        </div>

        <div className="text-left">

          <div
            className={`
              text-sm
              ${
                danger
                  ? "text-red-400"
                  : "text-yellow-400"
              }
              font-semibold
            `}
          >
            {title}
          </div>

          <div className="text-xs opacity-70 mt-1">
            {subtitle}
          </div>

        </div>

      </div>

    </button>
  );
}

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const auth = getAuth();
  const user = auth.currentUser;

  const isOwner =
    user &&
    user.email &&
    user.email.toLowerCase() ===
      OWNER_EMAIL.toLowerCase();

  return (
    <div
      className="flex min-h-screen bg-black text-white"
      dir="rtl"
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className="
          w-72
          shrink-0
          bg-[#0b0b0b]
          border-l
          border-gray-800
          p-4
          space-y-4
        "
      >

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-4">

          <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            👑 Super Admin
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            لوحة التحكم الرئيسية
          </p>

        </div>


        {/* =========================
            HOME
        ========================= */}

        <NavCard
          icon="🏠"
          title="الرئيسية"
          subtitle="لوحة التحكم العامة"
          active={
            location.pathname === "/super-admin" ||
            location.pathname === "/super-admin/"
          }
          onClick={() =>
            navigate("/super-admin")
          }
        />


        {/* =========================
            USERS
        ========================= */}

        <NavCard
          icon="👥"
          title="إدارة المستخدمين"
          subtitle="التحكم الكامل بالمستخدمين"
          active={location.pathname.includes("/super-admin/users")}
          onClick={() =>
            navigate("/super-admin/users")
          }
        />


        {/* =========================
            TEACHERS
        ========================= */}

        <NavCard
          icon="🎓"
          title="إدارة المدرسين"
          subtitle="إضافة وتعديل المدرسين"
          active={location.pathname.includes("/super-admin/manage-teachers")}
          onClick={() =>
            navigate("/super-admin/manage-teachers")
          }
        />


        {/* =========================
            MANAGE EXAMS
        ========================= */}

        <NavCard
          icon="📝"
          title="إدارة الامتحانات"
          subtitle="عرض ونشر وحذف الاختبارات"
          active={location.pathname.includes("/super-admin/manage-exams")}
          onClick={() =>
            navigate("/super-admin/manage-exams")
          }
        />


        {/* =========================
            ADD EXAM
        ========================= */}

        <NavCard
          icon="➕"
          title="إضافة امتحان"
          subtitle="إنشاء اختبار جديد"
          active={location.pathname === "/super-admin/add-exam"}
          onClick={() =>
            navigate("/super-admin/add-exam")
          }
        />


        {/* =========================
            IMPORT EXAM FROM FILES
        ========================= */}

        <NavCard
          icon="📥"
          title="استيراد امتحان من ملفات"
          subtitle="رفع الأسئلة ونموذج الإجابة واستخراجهما"
          active={location.pathname.includes("/super-admin/import-exam")}
          onClick={() =>
            navigate("/super-admin/import-exam")
          }
        />


        {/* =========================
            ADD VIDEO
        ========================= */}

        <NavCard
          icon="🎥"
          title="إضافة فيديو"
          subtitle="إضافة وحماية فيديو YouTube"
          active={location.pathname.includes("/super-admin/lessons-management")}
          onClick={() =>
            navigate("/super-admin/lessons-management")
          }
        />


        {/* =========================
            QUESTION BANK
        ========================= */}

        <NavCard
          icon="📚"
          title="بنك الأسئلة"
          subtitle="إدارة ومراجعة أسئلة البنك"
          active={location.pathname.includes("/super-admin/question-bank")}
          onClick={() =>
            navigate("/super-admin/question-bank")
          }
        />


        {/* =========================
            STATISTICS
        ========================= */}

        <NavCard
          icon="📊"
          title="الإحصائيات"
          subtitle="مؤشرات وتحليلات المنصة"
          active={location.pathname.includes("/super-admin/statistics")}
          onClick={() =>
            navigate("/super-admin/statistics")
          }
        />


        {/* =========================
            OWNER OPERATIONS
        ========================= */}

        {isOwner && (
          <>
            <div className="border-t border-gray-800 my-2" />

            <NavCard
              icon="☠️"
              title="غرفة العمليات"
              subtitle="صلاحيات خطيرة للغاية"
              danger
              active={location.pathname.includes("/super-admin/__critical")}
              onClick={() =>
                navigate("/super-admin/__critical")
              }
            />
          </>
        )}

      </aside>


      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="flex-1 min-w-0 p-6">

        <Outlet />

      </main>

    </div>
  );
}