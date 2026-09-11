import React, { useState } from "react";
/**
 * AddLessonWizard.jsx
 * Timeline-style wizard (vertical) for creating a lesson.
 * - Step 1: Lesson details
 * - Step 2: YouTube video link (Unlisted) — optional
 * - Step 3: Additional files (PDFs / images) — optional
 * - Step 4: Assignment / Quiz — optional
 * - Step 5: Review & Create (shows upload progress for queued uploads)
 *
 * Assumptions:
 * - Tailwind CSS is available
 * - You export `db` and `storage` from your project's ./firebase file OR pass them as props
 *
 * Usage:
 *  import AddLessonWizard from "./components/AddLessonWizard.jsx";
 *  <AddLessonWizard courseId={courseId} />
 */

import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// try to import default exports if user exports them from ./firebase
let storageFallback = null;
let dbFallback = null;
try {
  // eslint-disable-next-line import/no-unresolved, global-require
  const fb = require("../firebase");
  storageFallback = fb.storage || fb.getStorage || fb.storageInstance || null;
  dbFallback = fb.db || null;
} catch (e) {
  // ignore — we'll expect props then
}

export default function AddLessonWizard({ courseId, storage = storageFallback, db = dbFallback, onCreated }) {
  const [step, setStep] = useState(1);

  // Step data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoMode, setVideoMode] = useState("none"); // none, link
  const [videoLink, setVideoLink] = useState("");
  const [videoURL, setVideoURL] = useState(null);

  const [pdfFiles, setPdfFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [otherFiles, setOtherFiles] = useState([]);

  const [uploadsProgress, setUploadsProgress] = useState([]); // {id, name, progress, status}

  // Assignment / Quiz
  const [hasAssignment, setHasAssignment] = useState(false);
  const [assignmentText, setAssignmentText] = useState("");
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizPlaceholder, setQuizPlaceholder] = useState("");

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Helpers
  function goNext() { setStep(s => Math.min(5, s+1)); window.scrollTo(0,0); }
  function goPrev() { setStep(s => Math.max(1, s-1)); window.scrollTo(0,0); }

  function onPdfChange(e) { setPdfFiles(Array.from(e.target.files)); }
  function onImageChange(e) { setImageFiles(Array.from(e.target.files)); }
  function onOtherChange(e) { setOtherFiles(Array.from(e.target.files)); }

  // Upload non-video files to Firebase Storage with progress callback
  async function uploadFileToStorage(file, pathPrefix = "lessons") {
    if (!storage) throw new Error("Firebase storage instance not provided (pass storage prop or export from ../firebase)");
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const path = `${pathPrefix}/${id}_${file.name}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, file, { contentType: file.type });

    // add to uploadsProgress
    setUploadsProgress(s => [...s, { id, name: file.name, progress: 0, status: 'uploading' }]);

    return new Promise((resolve, reject) => {
      task.on('state_changed', snapshot => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadsProgress(s => s.map(u => u.id === id ? { ...u, progress: prog } : u));
      }, err => {
        setUploadsProgress(s => s.map(u => u.id === id ? { ...u, status: 'error' } : u));
        reject(err);
      }, async () => {
        try {
          const downloadURL = await getDownloadURL(task.snapshot.ref);
          setUploadsProgress(s => s.map(u => u.id === id ? { ...u, progress: 100, status: 'done', url: downloadURL } : u));
          resolve({ id, url: downloadURL });
        } catch (e) {
          setUploadsProgress(s => s.map(u => u.id === id ? { ...u, status: 'error' } : u));
          reject(e);
        }
      });
    });
  }

  // YouTube is the primary video storage method.
  // We save only the YouTube Embed URL; no video bytes are uploaded to Firebase Storage.
  function extractYoutubeId(url) {
    if (!url) return null;

    try {
      const value = String(url).trim();
      const parsed = new URL(value);

      if (parsed.hostname.includes("youtu.be")) {
        return parsed.pathname.replace(/^\//, "").split("/")[0] || null;
      }

      if (parsed.hostname.includes("youtube.com")) {
        const queryId = parsed.searchParams.get("v");
        if (queryId) return queryId;

        const parts = parsed.pathname.split("/").filter(Boolean);
        const typeIndex = parts.findIndex((part) =>
          ["embed", "shorts", "live"].includes(part)
        );

        if (typeIndex !== -1 && parts[typeIndex + 1]) {
          return parts[typeIndex + 1];
        }
      }
    } catch (error) {
      console.error("Invalid YouTube URL:", error);
    }

    return null;
  }

  async function getVideoUrl() {
    if (videoMode !== "link" || !videoLink) return null;

    const youtubeId = extractYoutubeId(videoLink);

    if (!youtubeId) {
      throw new Error("يجب إدخال رابط YouTube صحيح للفيديو غير المدرج.");
    }

    const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
    setVideoURL(embedUrl);
    return embedUrl;
  }

  async function handleMultipleUploads(files, prefix) {
    const results = [];
    for (const f of files) {
      const r = await uploadFileToStorage(f, prefix);
      results.push({ name: f.name, url: r.url });
    }
    return results;
  }

  async function createLesson() {
    setError(null);
    setCreating(true);
    try {
      // 1. upload video (if any)
      const videoFinalURL = await getVideoUrl();

      // 2. upload PDFs/images/others
      const pdfs = pdfFiles.length ? await handleMultipleUploads(pdfFiles, `courses/${courseId}/pdfs`) : [];
      const images = imageFiles.length ? await handleMultipleUploads(imageFiles, `courses/${courseId}/images`) : [];
      const others = otherFiles.length ? await handleMultipleUploads(otherFiles, `courses/${courseId}/files`) : [];

      // 3. create Firestore doc
      if (!db) throw new Error('Firestore "db" not provided (pass db prop or export from ../firebase)');
      const colRef = collection(db, 'lessons');
      const payload = {
        courseId: courseId || null,
        title,
        description,
        video: videoFinalURL ? { type: 'link', provider: 'youtube', url: videoFinalURL } : null,
        pdfs,
        images,
        files: others,
        assignment: hasAssignment ? { text: assignmentText } : null,
        quiz: hasQuiz ? { placeholder: quizPlaceholder } : null,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(colRef, payload);

      setCreating(false);
      if (onCreated) onCreated(docRef.id);
      // navigate or show success
      alert('تم إنشاء الدرس بنجاح');
      // reset form
      setStep(1);
      setTitle(''); setDescription(''); setVideoMode('none'); setVideoLink(''); setPdfFiles([]); setImageFiles([]); setOtherFiles([]);
      setHasAssignment(false); setAssignmentText(''); setHasQuiz(false); setQuizPlaceholder(''); setUploadsProgress([]);

      // redirect to instructor studio lessons list if react-router navigate is available
      try {
        // navigate is injected via window.__navigate_after_create (see App.jsx wiring)
        if (typeof window !== 'undefined' && window.__navigate_after_create) {
          window.__navigate_after_create();
        }
      } catch(e) { /* ignore */ }

    } catch (err) {
      setError(err.message || String(err));
      setCreating(false);
    }
  }

  // UI pieces
  function StepIndicator() {
    const items = [
      { id: 1, label: 'تفاصيل الدرس' },
      { id: 2, label: 'إضافة فيديو (اختياري)' },
      { id: 3, label: 'ملفات داعمة' },
      { id: 4, label: 'واجب / اختبار' },
      { id: 5, label: 'مراجعة & إنشاء' },
    ];
    return (
      <div className="w-72 pr-4">
        <div className="space-y-6">
          {items.map(it => (
            <div key={it.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === it.id ? 'bg-yellow-500 text-black' : (step > it.id ? 'bg-green-500' : 'bg-gray-500 text-white')}`}>{it.id}</div>
              <div>
                <div className="font-medium">{it.label}</div>
                <div className="text-xs text-gray-400">{it.id < step ? 'مكتمل' : (it.id === step ? 'جارى' : '')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">إنشاء درس جديد</h2>
          <StepIndicator />
        </div>

        <div className="bg-white p-6 rounded shadow">
          {/* Step contents */}
          {step === 1 && (
            <div>
              <h3 className="font-semibold mb-3">تفاصيل الدرس</h3>
              <div className="space-y-3">
                <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="عنوان الدرس" className="w-full p-2 border rounded" />
                <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="وصف مختصر (اختياري)" className="w-full p-2 border rounded" rows={4} />
              </div>
              <div className="mt-4 flex justify-between">
                <button onClick={goNext} className="px-4 py-2 bg-yellow-500 text-black rounded">التالي</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-semibold mb-3">إضافة فيديو (اختياري)</h3>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-2"><input type="radio" checked={videoMode==='none'} onChange={()=>setVideoMode('none')} /> لا أريد إضافة فيديو الآن</label>
                </div>
                <div className="border rounded p-3 bg-yellow-50">
                  <div className="font-medium">طريقة الفيديو المعتمدة</div>
                  <div className="text-sm text-gray-600 mt-1">
                    ارفع الفيديو على YouTube كـ <strong>غير مدرج (Unlisted)</strong> ثم ضع الرابط في الخانة التالية.
                    لن يتم تخزين ملف الفيديو على Firebase Storage.
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2"><input type="radio" checked={videoMode==='link'} onChange={()=>setVideoMode('link')} /> استخدام رابط فيديو</label>
                  {videoMode === 'link' && (
                    <div className="mt-2">
                      <input value={videoLink} onChange={(e)=>setVideoLink(e.target.value)} placeholder="لصق رابط YouTube غير مدرج (Unlisted)" className="w-full p-2 border rounded" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <button onClick={goPrev} className="px-4 py-2 border rounded">السابق</button>
                <div className="flex gap-2">
                  <button onClick={() => { setVideoMode('none'); goNext(); }} className="px-4 py-2 border rounded">تخطي</button>
                  <button onClick={goNext} className="px-4 py-2 bg-yellow-500 text-black rounded">التالي</button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-semibold mb-3">ملفات داعمة (اختياري)</h3>
              <div className="space-y-3">
                <div>
                  <div className="font-medium">PDFs</div>
                  <input type="file" accept="application/pdf" multiple onChange={onPdfChange} className="w-full" />
                  <div className="text-sm text-gray-500">{pdfFiles.length} ملفات محددة</div>
                </div>

                <div>
                  <div className="font-medium">صور</div>
                  <input type="file" accept="image/*" multiple onChange={onImageChange} className="w-full" />
                  <div className="text-sm text-gray-500">{imageFiles.length} صور محددة</div>
                </div>

                <div>
                  <div className="font-medium">ملفات أخرى</div>
                  <input type="file" multiple onChange={onOtherChange} className="w-full" />
                  <div className="text-sm text-gray-500">{otherFiles.length} ملفات محددة</div>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <button onClick={goPrev} className="px-4 py-2 border rounded">السابق</button>
                <div className="flex gap-2">
                  <button onClick={() => { setPdfFiles([]); setImageFiles([]); setOtherFiles([]); goNext(); }} className="px-4 py-2 border rounded">تخطي</button>
                  <button onClick={goNext} className="px-4 py-2 bg-yellow-500 text-black rounded">التالي</button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="font-semibold mb-3">واجب / اختبار (اختياري)</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2"><input type="checkbox" checked={hasAssignment} onChange={(e)=>setHasAssignment(e.target.checked)} /> إضافة واجب</label>
                {hasAssignment && (
                  <textarea value={assignmentText} onChange={(e)=>setAssignmentText(e.target.value)} placeholder="تعليمات الواجب أو رفع ملف" className="w-full p-2 border rounded" rows={4} />
                )}

                <label className="flex items-center gap-2"><input type="checkbox" checked={hasQuiz} onChange={(e)=>setHasQuiz(e.target.checked)} /> إضافة اختبار بسيط</label>
                {hasQuiz && (
                  <input value={quizPlaceholder} onChange={(e)=>setQuizPlaceholder(e.target.value)} placeholder="ملاحظة/ملخص عن الاختبار" className="w-full p-2 border rounded" />
                )}
              </div>

              <div className="mt-4 flex justify-between">
                <button onClick={goPrev} className="px-4 py-2 border rounded">السابق</button>
                <div className="flex gap-2">
                  <button onClick={() => { setHasAssignment(false); setHasQuiz(false); goNext(); }} className="px-4 py-2 border rounded">تخطي</button>
                  <button onClick={goNext} className="px-4 py-2 bg-yellow-500 text-black rounded">التالي</button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h3 className="font-semibold mb-3">مراجعة & إنشاء</h3>

              <div className="space-y-3">
                <div><strong>العنوان:</strong> {title || '(فارغ)'}</div>
                <div><strong>الوصف:</strong> {description || '(فارغ)'}</div>
                <div><strong>فيديو:</strong> {videoMode==='none' ? 'لا يوجد' : videoLink || 'لم يتم إدخال رابط YouTube'}</div>
                <div><strong>PDFs:</strong> {pdfFiles.length}</div>
                <div><strong>صور:</strong> {imageFiles.length}</div>
                <div><strong>ملفات أخرى:</strong> {otherFiles.length}</div>
                <div><strong>واجب:</strong> {hasAssignment ? 'موجود' : 'لا'}</div>
                <div><strong>اختبار:</strong> {hasQuiz ? 'موجود' : 'لا'}</div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium">حالة الرفع</h4>
                <div className="space-y-2 mt-2">
                  {uploadsProgress.length === 0 ? <div className="text-sm text-gray-500">لا توجد عمليات رفع حالية</div> : uploadsProgress.map(u => (
                    <div key={u.id} className="border p-2 rounded">
                      <div className="flex justify-between"><div>{u.name}</div><div>{u.progress}%</div></div>
                      <div className="w-full bg-gray-200 h-2 rounded mt-2 overflow-hidden"><div style={{width: `${u.progress}%`}} className="h-2 bg-yellow-500" /></div>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="text-red-500 mt-3">{error}</div>}

              <div className="mt-4 flex justify-between items-center">
                <button onClick={goPrev} className="px-4 py-2 border rounded">السابق</button>
                <div className="flex gap-2">
                  <button onClick={() => { /* allow editing by going back */ setStep(1); }} className="px-4 py-2 border rounded">تعديل</button>
                  <button onClick={createLesson} disabled={creating} className="px-4 py-2 bg-green-600 text-white rounded">{creating ? 'جاري الإنشاء...' : 'إنشاء الدرس'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
