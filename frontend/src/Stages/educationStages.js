// src/constants/educationStages.js

export const EDUCATION_STAGES = [
  {
    id: "primary",
    name: "المرحلة الابتدائية",
    hasSystems: false,
    grades: [
      { id: "p1", name: "الصف الأول الابتدائي" },
      { id: "p2", name: "الصف الثاني الابتدائي" },
      { id: "p3", name: "الصف الثالث الابتدائي" },
      { id: "p4", name: "الصف الرابع الابتدائي" },
      { id: "p5", name: "الصف الخامس الابتدائي" },
      { id: "p6", name: "الصف السادس الابتدائي" }
    ]
  },

  {
    id: "prep",
    name: "المرحلة الإعدادية",
    hasSystems: false,
    grades: [
      { id: "prep1", name: "الصف الأول الإعدادي" },
      { id: "prep2", name: "الصف الثاني الإعدادي" },
      { id: "prep3", name: "الصف الثالث الإعدادي" }
    ]
  },

  {
    id: "secondary",
    name: "المرحلة الثانوية",
    hasSystems: true,
    systems: [
      {
        id: "unified",
        name: "الصف الأول (عام + بكالوريا)",
        grades: [
          { id: "sec1", name: "الصف الأول الثانوي" }
        ]
      },
      {
        id: "general",
        name: "الثانوية العامة",
        grades: [
          { id: "sec2_general", name: "الصف الثاني الثانوي" },
          { id: "sec3_general", name: "الصف الثالث الثانوي" }
        ]
      },
      {
        id: "baccalaureate",
        name: "البكالوريا المصرية",
        grades: [
          { id: "bac2", name: "الصف الثاني" },
          { id: "bac3", name: "الصف الثالث" }
        ]
      }
    ]
  }
];
