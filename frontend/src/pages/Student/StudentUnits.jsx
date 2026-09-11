import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";

/**
 * صفحة عرض الوحدات
 * المسار:
 * /student/grades/:gradeId/subjects/:subjectKey/units
 *
 * نفس ستايل كروت المواد
 * بدون أي منطق دروس
 */

const StudentUnits = () => {
  const { gradeId, subjectKey } = useParams();
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const q = query(
          collection(db, "units"),
          where("gradeId", "==", gradeId),
          where("subjectKey", "==", subjectKey),
          where("isActive", "==", true),
          orderBy("order", "asc")
        );

        const snapshot = await getDocs(q);

        const unitsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUnits(unitsData);
      } catch (error) {
        console.error("Error fetching units:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [gradeId, subjectKey]);

  if (loading) {
    return <div className="student-container">جاري تحميل الوحدات...</div>;
  }

  return (
    <div className="student-container">
      <h2 className="student-title">الوحدات</h2>

      {units.length === 0 ? (
        <p>لا توجد وحدات متاحة حاليًا</p>
      ) : (
        <div className="cards-grid">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="student-card"
              onClick={() =>
                navigate(
                  `/student/grades/${gradeId}/subjects/${subjectKey}/units/${unit.id}/lessons`
                )
              }
            >
              <h3 className="card-title">{unit.title}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentUnits;
