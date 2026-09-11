// src/pages/Register.jsx

import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

import {
  setDoc,
  doc,
} from "firebase/firestore";

import { auth, db } from "../firebase.js";

import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";


export default function Register() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  /* =====================================================
     منع المسجل من فتح التسجيل
  ===================================================== */

  useEffect(() => {

    const unsub = onAuthStateChanged(auth, (user) => {

      if (user) {
        navigate("/student");
      }

    });

    return () => unsub();

  }, [navigate]);


  /* =====================================================
     FORM DATA
  ===================================================== */

  const [formData, setFormData] = useState({

    fullName: "",
    email: "",
    password: "",

    phone: "",

    governorate: "",

    parentName: "",
    parentPhone: "",

    dateOfBirth: "",

    /* ===== الدراسة ===== */

    systemId: "",
    trackId: "",
    gradeId: "",
    subjectId: "",

  });


  /* =====================================================
     المحافظات
  ===================================================== */

  const governorates = [

    "القاهرة",
    "الجيزة",
    "الإسكندرية",
    "الشرقية",
    "الدقهلية",
    "القليوبية",
    "المنوفية",
    "كفر الشيخ",
    "الغربية",
    "البحيرة",
    "الفيوم",
    "بني سويف",
    "المنيا",
    "أسيوط",
    "سوهاج",
    "قنا",
    "الأقصر",
    "أسوان",
    "البحر الأحمر",
    "السويس",
    "بورسعيد",
    "الإسماعيلية",
    "دمياط",
    "مطروح",
    "شمال سيناء",
    "جنوب سيناء",

  ];


  /* =====================================================
     كود الدفع
  ===================================================== */

  const generatePaymentCode = () =>
    Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();


  /* =====================================================
     تغيير البيانات
  ===================================================== */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData((prev) => ({

      ...prev,

      [name]: value,

      /*
       * عند تغيير النظام الدراسي
       * نمسح الصف والشعبة والمادة
       */

      ...(name === "systemId"
        ? {
            trackId: "",
            gradeId: "",
            subjectId: "",
          }
        : {}),


      /*
       * عند تغيير الصف
       * نمسح المادة
       */

      ...(name === "gradeId"
        ? {
            subjectId: "",
          }
        : {}),


      /*
       * عند تغيير الشعبة
       * نمسح المادة
       */

      ...(name === "trackId"
        ? {
            subjectId: "",
          }
        : {}),

    }));

  };


  /* =====================================================
     تحديد الصفوف
  ===================================================== */

  const getGrades = () => {

    if (formData.systemId === "general") {

      return [

        {
          id: "sec1",
          name: "الصف الأول الثانوي",
        },

        {
          id: "sec2",
          name: "الصف الثاني الثانوي",
        },

        {
          id: "sec3",
          name: "الصف الثالث الثانوي",
        },

      ];

    }


    if (formData.systemId === "bac") {

      return [

        {
          id: "bac1",
          name: "الصف الأول بكالوريا",
        },

        {
          id: "bac2",
          name: "الصف الثاني بكالوريا",
        },

        {
          id: "bac3",
          name: "الصف الثالث بكالوريا",
        },

      ];

    }


    return [];

  };


  /* =====================================================
     تحديد المواد
  ===================================================== */

  const getSubjects = () => {

    /* ===================================================
       الثانوية العامة
    =================================================== */

    if (formData.systemId === "general") {

      /* ===== أولى ثانوي ===== */

      if (formData.gradeId === "sec1") {

        return [

          {
            id: "history",
            name: "التاريخ",
          },

        ];

      }


      /* ===== ثانية وثالثة ===== */

      if (
        formData.gradeId === "sec2" ||
        formData.gradeId === "sec3"
      ) {

        /* ===== أدبي ===== */

        if (formData.trackId === "literary") {

          return [

            {
              id: "history",
              name: "التاريخ",
            },

            {
              id: "geography",
              name: "الجغرافيا",
            },

          ];

        }


        /* ===== علمي ===== */

        if (formData.trackId === "scientific") {

          return [

            {
              id: "history",
              name: "التاريخ",
            },

          ];

        }

      }

    }


    /* ===================================================
       البكالوريا
    =================================================== */

    if (formData.systemId === "bac") {

      /* ===== أولى بكالوريا ===== */

      if (formData.gradeId === "bac1") {

        return [

          {
            id: "history",
            name: "التاريخ",
          },

        ];

      }


      /* ===== ثانية بكالوريا ===== */

      if (formData.gradeId === "bac2") {

        return [

          {
            id: "national-history",
            name: "التاريخ الوطني",
          },

        ];

      }


      /* ===== ثالثة بكالوريا ===== */

      if (formData.gradeId === "bac3") {

        return [

          {
            id: "economics",
            name: "الاقتصاد",
          },

          {
            id: "geography",
            name: "الجغرافيا",
          },

        ];

      }

    }


    return [];

  };


  /* =====================================================
     التسجيل
  ===================================================== */

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setMessage("");


    /* ===================================================
       تاريخ الميلاد
    =================================================== */

    if (
      formData.dateOfBirth &&
      new Date(formData.dateOfBirth) > new Date()
    ) {

      setMessage(
        "❌ تاريخ الميلاد غير صحيح"
      );

      setLoading(false);

      return;
    }


    /* ===================================================
       التحقق من بيانات الدراسة
    =================================================== */

    if (!formData.systemId) {

      setMessage(
        "❌ يرجى اختيار النظام الدراسي"
      );

      setLoading(false);

      return;
    }


    if (!formData.gradeId) {

      setMessage(
        "❌ يرجى اختيار الصف الدراسي"
      );

      setLoading(false);

      return;
    }


    /*
     * الشعبة مطلوبة فقط للثانوية
     * الصف الثاني والثالث
     */

    if (
      formData.systemId === "general" &&
      (
        formData.gradeId === "sec2" ||
        formData.gradeId === "sec3"
      ) &&
      !formData.trackId
    ) {

      setMessage(
        "❌ يرجى اختيار الشعبة: علمي أو أدبي"
      );

      setLoading(false);

      return;
    }


    if (!formData.subjectId) {

      setMessage(
        "❌ يرجى اختيار المادة"
      );

      setLoading(false);

      return;
    }


    /* ===================================================
       CREATE FIREBASE ACCOUNT
    =================================================== */

    try {

      const {
        user,
      } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );


      /* =================================================
         ROLE
      ================================================= */

      let role = "student";

      let isSuperAdmin = false;


      if (
        formData.email
          .toLowerCase() ===
        "khalafmahrous2000@gmail.com"
      ) {

        role = "superadmin";

        isSuperAdmin = true;

      }


      /* =================================================
         PAYMENT CODE
      ================================================= */

      const paymentCode =
        role === "student"
          ? generatePaymentCode()
          : null;


      /* =================================================
         EXPIRATION
      ================================================= */

      const expiresAt =
        role === "student"
          ? new Date(
              Date.now() +
              24 * 60 * 60 * 1000
            )
          : null;


      /* =================================================
         DATA TO FIRESTORE
      ================================================= */

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {

          /* ===== البيانات الأساسية ===== */

          fullName:
            formData.fullName,

          email:
            formData.email,

          phone:
            formData.phone,

          governorate:
            formData.governorate,

          parentName:
            formData.parentName,

          parentPhone:
            formData.parentPhone,

          dateOfBirth:
            formData.dateOfBirth,


          /* ===== الدراسة ===== */

          systemId:
            formData.systemId,

          trackId:
            formData.trackId || null,

          gradeId:
            formData.gradeId,

          subjectId:
            formData.subjectId,


          /* ===== الإدارة ===== */

          role,

          isSuperAdmin,

          createdAt:
            new Date(),

          status:
            role === "student"
              ? "waiting_payment"
              : "active",


          /* ===== الدفع ===== */

          paymentCode,

          expiresAt,

          subscriptionEnds:
            null,


          /* ===== بيانات إضافية ===== */

          teacherId:
            null,

        }
      );


      /* =================================================
         LOCAL STORAGE
      ================================================= */

      localStorage.setItem(
        "user",
        JSON.stringify({

          uid:
            user.uid,

          email:
            formData.email,

          role,

          isSuperAdmin,

          systemId:
            formData.systemId,

          trackId:
            formData.trackId || null,

          gradeId:
            formData.gradeId,

          subjectId:
            formData.subjectId,

        })
      );


      /* =================================================
         رسالة نجاح
      ================================================= */

      setMessage(
        "✔ تم إنشاء الحساب بنجاح"
      );


      /* =================================================
         WHATSAPP - رسالة الطالب
         
         الرسالة المعتمدة:
         الاسم + المادة + الصف
         + الكود + رقم التحويل
         + صلاحية 24 ساعة
         
         بدون إيموجي حتى لا يظهر الرمز �
      ================================================= */

      if (role === "student") {

        const selectedGrade =
          getGrades().find(
            (g) =>
              g.id === formData.gradeId
          );


        const selectedSubject =
          getSubjects().find(
            (s) =>
              s.id === formData.subjectId
          );


        const gradeName =
          selectedGrade?.name || "";


        const subjectName =
          selectedSubject?.name || "";


        const whatsappText = `
مرحبًا بك يا ${formData.fullName}

أبديت رغبتك في الانضمام إلى منصة المستشار التعليمية في مادة ${subjectName} للصف ${gradeName}.

كودك التسلسلي: ${paymentCode}

قم بتحويل قيمة الاشتراك على:
01012002317

فودافون كاش / InstaPay

الكود صالح لمدة 24 ساعة.
`;


        /* ===============================================
           فتح واتساب على رقم الطالب
        =============================================== */

        window.open(
          `https://wa.me/${formData.phone.replace(
            /^0/,
            "20"
          )}?text=${encodeURIComponent(
            whatsappText
          )}`,
          "_blank"
        );

      }


      /* =================================================
         LOGIN
      ================================================= */

      setTimeout(
        () => navigate("/login"),
        2500
      );


    } catch (error) {

      console.error(
        "Register Error:",
        error
      );


      if (
        error.code ===
        "auth/email-already-in-use"
      ) {

        setMessage(
          "❌ هذا البريد مسجل بالفعل — قم بتسجيل الدخول"
        );

      } else {

        setMessage(
          "❌ " +
          error.message
        );

      }

    }


    setLoading(false);

  };


  /* =====================================================
     OPTIONS
  ===================================================== */

  const grades =
    getGrades();


  const subjects =
    getSubjects();


  const showTrack =
    formData.systemId === "general" &&
    (
      formData.gradeId === "sec2" ||
      formData.gradeId === "sec3"
    );


  /* =====================================================
     UI
  ===================================================== */

  return (

    <motion.div

      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gray-900
        text-white
        py-10
        px-4
      "

      initial={{
        opacity: 0,
      }}

      animate={{
        opacity: 1,
      }}

    >

      <form

        onSubmit={handleSubmit}

        className="
          bg-gray-800
          p-8
          rounded-2xl
          shadow-lg
          w-full
          max-w-lg
        "

      >

        {/* =================================================
           TITLE
        ================================================= */}

        <h2
          className="
            text-3xl
            font-bold
            mb-6
            text-center
            text-yellow-400
          "
        >
          إنشاء حساب جديد
        </h2>


        <div className="space-y-4">


          {/* =================================================
             NAME
          ================================================= */}

          <input
            name="fullName"
            placeholder="الاسم الكامل"
            value={
              formData.fullName
            }
            onChange={
              handleChange
            }
            required
            className="
              w-full
              p-3
              rounded
              bg-gray-700
            "
          />


          {/* =================================================
             EMAIL
          ================================================= */}

          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            value={
              formData.email
            }
            onChange={
              handleChange
            }
            required
            className="
              w-full
              p-3
              rounded
              bg-gray-700
            "
          />


          {/* =================================================
             PASSWORD
          ================================================= */}

          <input
            type="password"
            name="password"
            placeholder="كلمة المرور"
            value={
              formData.password
            }
            onChange={
              handleChange
            }
            required
            minLength={6}
            className="
              w-full
              p-3
              rounded
              bg-gray-700
            "
          />


          {/* =================================================
             BIRTH DATE
          ================================================= */}

          <div
            className="
              flex
              flex-col
            "
          >

            <label
              className="
                mb-1
                text-sm
                text-yellow-400
                font-semibold
              "
            >
              Birth Date
            </label>


            <input
              type="date"
              name="dateOfBirth"
              lang="en"
              value={
                formData.dateOfBirth
              }
              onChange={
                handleChange
              }
              required
              className="
                w-full
                p-3
                rounded
                bg-gray-700
                text-white
                [color-scheme:dark]
              "
            />

          </div>


          {/* =================================================
             PHONE
          ================================================= */}

          <input
            type="tel"
            name="phone"
            placeholder="رقم الهاتف"
            value={
              formData.phone
            }
            pattern="01[0-9]{9}"
            onChange={
              handleChange
            }
            required
            className="
              w-full
              p-3
              rounded
              bg-gray-700
            "
          />


          {/* =================================================
             GOVERNORATE
          ================================================= */}

          <select
            name="governorate"
            value={
              formData.governorate
            }
            onChange={
              handleChange
            }
            required
            className="
              w-full
              p-3
              rounded
              bg-gray-700
            "
          >

            <option value="">
              اختر المحافظة
            </option>


            {governorates.map(
              (g) => (

                <option
                  key={g}
                  value={g}
                >
                  {g}
                </option>

              )
            )}

          </select>


          {/* =================================================
             PARENT NAME
          ================================================= */}

          <input
            name="parentName"
            placeholder="اسم ولي الأمر"
            value={
              formData.parentName
            }
            onChange={
              handleChange
            }
            required
            className="
              w-full
              p-3
              rounded
              bg-gray-700
            "
          />


          {/* =================================================
             PARENT PHONE
          ================================================= */}

          <input
            type="tel"
            name="parentPhone"
            placeholder="رقم ولي الأمر"
            value={
              formData.parentPhone
            }
            pattern="01[0-9]{9}"
            onChange={
              handleChange
            }
            required
            className="
              w-full
              p-3
              rounded
              bg-gray-700
            "
          />


          {/* =================================================
             SUBSCRIPTION SECTION
          ================================================= */}

          <div
            className="
              border
              border-yellow-500
              rounded-xl
              p-5
              mt-6
            "
          >

            <h3
              className="
                text-xl
                font-bold
                text-yellow-400
                mb-5
              "
            >
              بيانات الاشتراك الدراسي
            </h3>


            {/* =================================================
               SYSTEM
            ================================================= */}

            <label className="block mb-2">
              النظام الدراسي
            </label>


            <select
              name="systemId"
              value={
                formData.systemId
              }
              onChange={
                handleChange
              }
              required
              className="
                w-full
                p-3
                rounded
                bg-gray-700
                mb-4
              "
            >

              <option value="">
                اختر النظام الدراسي
              </option>


              <option value="general">
                الثانوية العامة
              </option>


              <option value="bac">
                البكالوريا المصرية
              </option>

            </select>


            {/* =================================================
               GRADE
            ================================================= */}

            {formData.systemId && (

              <>

                <label className="block mb-2">
                  الصف الدراسي
                </label>


                <select
                  name="gradeId"
                  value={
                    formData.gradeId
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="
                    w-full
                    p-3
                    rounded
                    bg-gray-700
                    mb-4
                  "
                >

                  <option value="">
                    اختر الصف الدراسي
                  </option>


                  {grades.map(
                    (grade) => (

                      <option
                        key={
                          grade.id
                        }
                        value={
                          grade.id
                        }
                      >
                        {
                          grade.name
                        }
                      </option>

                    )
                  )}

                </select>

              </>

            )}


            {/* =================================================
               TRACK
            ================================================= */}

            {showTrack && (

              <>

                <label className="block mb-2">
                  الشعبة
                </label>


                <select
                  name="trackId"
                  value={
                    formData.trackId
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="
                    w-full
                    p-3
                    rounded
                    bg-gray-700
                    mb-4
                  "
                >

                  <option value="">
                    اختر الشعبة
                  </option>


                  <option value="literary">
                    أدبي
                  </option>


                  <option value="scientific">
                    علمي
                  </option>

                </select>

              </>

            )}


            {/* =================================================
               SUBJECT
            ================================================= */}

            {subjects.length > 0 && (

              <>

                <label className="block mb-2">
                  المادة
                </label>


                <select
                  name="subjectId"
                  value={
                    formData.subjectId
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="
                    w-full
                    p-3
                    rounded
                    bg-gray-700
                  "
                >

                  <option value="">
                    اختر المادة
                  </option>


                  {subjects.map(
                    (subject) => (

                      <option
                        key={
                          subject.id
                        }
                        value={
                          subject.id
                        }
                      >
                        {
                          subject.name
                        }
                      </option>

                    )
                  )}

                </select>

              </>

            )}

          </div>

        </div>


        {/* =================================================
           REGISTER BUTTON
        ================================================= */}

        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            mt-6
            py-3
            bg-yellow-500
            hover:bg-yellow-400
            text-black
            font-bold
            rounded-lg
            transition
            disabled:opacity-50
          "
        >

          {loading
            ? "جارٍ التسجيل..."
            : "تسجيل"}

        </button>


        {/* =================================================
           MESSAGE
        ================================================= */}

        {message && (

          <p
            className="
              text-center
              mt-4
              text-yellow-400
              leading-7
            "
          >
            {message}
          </p>

        )}

      </form>

    </motion.div>

  );

}