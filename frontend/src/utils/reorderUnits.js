async function reorderUnits() {
  if (!window.confirm("⚠️ إعادة ترتيب الوحدات بالكامل؟")) return;

  const arabicNumbers = [
    "الأولى","الثانية","الثالثة","الرابعة","الخامسة",
    "السادسة","السابعة","الثامنة","التاسعة","العاشرة",
  ];

  const englishNumbers = [
    "One","Two","Three","Four","Five",
    "Six","Seven","Eight","Nine","Ten",
  ];

  const sorted = [...units].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  for (let i = 0; i < sorted.length; i++) {

    const newOrder = i + 1;

    const title =
      subjectLanguage === "en"
        ? `Unit ${englishNumbers[i] || newOrder}`
        : `الوحدة ${arabicNumbers[i] || newOrder}`;

    await updateDoc(doc(db, "units", sorted[i].id), {
      order: newOrder,
      unitId: `unit-${newOrder}`,
      title,
    });
  }

  alert("✅ تم إعادة ترتيب الوحدات حسب لغة المادة");
  loadUnits();
}
