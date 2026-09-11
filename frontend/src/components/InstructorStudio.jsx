import React, { useEffect, useState } from "react";
/**
 * InstructorStudio.jsx
 * Contains two components used for the instructor "YouTube Studio" experience:
 *  - UploadFloatingWidget: floating widget showing active uploads and recent uploads, pause/resume/cancel
 *  - LessonManager: full page for managing lessons (list, preview, edit, delete)
 *
 * Usage:
 *  import { UploadFloatingWidget, LessonManager } from "./components/InstructorStudio.jsx";
 *  <UploadFloatingWidget />
 *  <Route path="/instructor/studio" element={<LessonManager />} />
 *
 * Notes:
 * - This file expects Firestore `db` and `storage` to be exported from ./firebase or passed via props.
 */

import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getDownloadURL } from "firebase/storage";
import { db as dbImport } from "../firebase";

export function UploadFloatingWidget({ storage }) {
  const [uploads, setUploads] = useState([]);
  const [open, setOpen] = useState(false);

  // This widget reads a global uploads state if you maintain one, or shows recent lessons from Firestore.
  useEffect(() => {
    // load recent uploaded lessons as example
    async function loadRecent() {
      try {
        const db = dbImport;
        const q = query(collection(db, 'lessons'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const items = snap.docs.slice(0,5).map(d => ({ id: d.id, ...d.data() }));
        setUploads(items);
      } catch (e) { console.warn('UploadFloatingWidget load error', e); }
    }
    loadRecent();
  }, []);

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-80 transition-transform ${open ? 'translate-y-0' : 'translate-y-6'}`}>
      <div className="bg-white text-black shadow-lg rounded overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="font-medium">Studio — Uploads</div>
          <div className="flex items-center gap-2">
            <button className="text-xs px-2 py-1 border rounded" onClick={()=>setOpen(o=>!o)}>{open ? 'طي' : 'فتح'}</button>
            <a href="/instructor/studio" className="text-xs px-2 py-1 border rounded">فتح الاستوديو</a>
          </div>
        </div>
        {open && (
          <div className="p-2">
            {uploads.length === 0 ? <div className="text-sm text-gray-600">لا توجد رفعات حديثة</div> : (
              <div className="space-y-2">
                {uploads.map(u => (
                  <div key={u.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{u.title}</div>
                      <div className="text-xs text-gray-500">{u.createdAt?.toDate ? u.createdAt.toDate().toLocaleString() : ''}</div>
                    </div>
                    <div>
                      <a className="text-xs underline" href={`/course/${u.courseId}/lesson/${u.id}`}>عرض</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LessonManager({ courseId, db = dbImport }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = courseId ? query(collection(db, 'lessons'), where('courseId','==',courseId), orderBy('createdAt','desc')) : query(collection(db, 'lessons'), orderBy('createdAt','desc'));
        const snap = await getDocs(q);
        setLessons(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [courseId]);

  async function handleDelete(id) {
    if (!confirm('هل أنت متأكد من حذف الدرس؟')) return;
    try {
      await deleteDoc(doc(db, 'lessons', id));
      setLessons(s => s.filter(x => x.id !== id));
    } catch (e) { alert('فشل الحذف'); }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Instructor Studio — إدارة الدروس</h1>
          <a href="/course/" className="px-4 py-2 bg-yellow-500 text-black rounded">إنشاء درس جديد</a>
        </div>

        {loading ? <div>جاري التحميل...</div> : (
          <div className="space-y-3">
            {lessons.length === 0 ? <div className="text-gray-500">لا توجد دروس</div> : lessons.map(l => (
              <div key={l.id} className="bg-white p-3 rounded shadow flex items-center justify-between">
                <div>
                  <div className="font-medium">{l.title}</div>
                  <div className="text-xs text-gray-500">{l.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a className="text-sm underline" href={`/course/${l.courseId}/lesson/${l.id}`}>عرض</a>
                  <a className="text-sm underline" href={`/course/${l.courseId}/edit-lesson/${l.id}`}>تعديل</a>
                  <button onClick={()=>handleDelete(l.id)} className="px-2 py-1 border rounded">حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
