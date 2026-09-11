import React from "react";

export default function Contact() {
  return (
    <div className="p-6 text-gray-200 leading-relaxed">
      <h1 className="text-3xl font-bold text-[var(--gold)] mb-4 text-center">
        اتصل بنا
      </h1>
      <p className="mb-4 text-center">
        يسعدنا تواصلك معنا في أي وقت عبر الأرقام التالية أو من خلال البريد الإلكتروني.
      </p>

      <div className="text-center">
        <p>📞 <strong>01012002317</strong></p>
        <p>📞 <strong>01021751263</strong></p>
        <p>📞 <strong>01222793179</strong></p>
        <p>📞 <strong>01034956764</strong></p>
        <p className="mt-3">✉️ <strong>support@almustashar2026.com</strong></p>
      </div>

      <div className="mt-8 text-center">
        <p className="text-yellow-500 font-semibold">
          نحن هنا لمساعدتك — تواصل معنا لأي استفسار أو اقتراح ❤️
        </p>
      </div>
    </div>
  );
}
