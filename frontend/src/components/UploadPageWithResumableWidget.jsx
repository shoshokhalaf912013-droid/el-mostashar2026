import React, { useEffect, useRef, useState } from "react";
/**
 * UploadPageWithResumableWidget.jsx
 * Single-file React component (default export) that provides:
 *  - Full upload page (drag & drop, file list, metadata input)
 *  - Resumable uploads using Firebase Storage uploadBytesResumable
 *  - Pause / Resume / Cancel controls
 *  - Floating uploads widget (YouTube-like mini player behavior for completed video/audio)
 *
 * Requirements:
 *  - Tailwind CSS available in the project
 *  - Firebase v9 modular SDK configured and initialized elsewhere in the app
 *    (you need to import and pass `storage` and optional `firestore` if you want DB records)
 *
 * How to use:
 *  - Place this file in your frontend source (e.g. src/components/UploadPageWithResumableWidget.jsx)
 *  - Ensure Firebase is initialized in the app and pass `storage` prop (getStorage(app)) when rendering
 *
 * Example:
 *  <UploadPageWithResumableWidget storage={storage} />
 */

import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";

export default function UploadPageWithResumableWidget({ storage, onUploadedRecord }) {
  // uploads state holds each file's upload task and metadata
  const [uploads, setUploads] = useState([]);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // Helper: create an Upload object
  function createUploadObject(file) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: "queued", // queued, uploading, paused, completed, error, cancelled
      task: null,
      downloadURL: null,
      metadata: { title: file.name, description: "" },
      createdAt: new Date(),
      error: null,
    };
  }

  // Add files (from input or DnD)
  function addFiles(fileList) {
    const arr = Array.from(fileList).map(createUploadObject);
    setUploads((s) => [...arr, ...s]);
  }

  // Start uploading a single item
  function startUpload(uploadObj) {
    if (!storage) {
      console.error("Firebase storage instance not provided");
      setUploads((s) => s.map(u => u.id === uploadObj.id ? {...u, status:'error', error:'No storage provided'} : u));
      return;
    }

    const path = `uploads/${uploadObj.id}_${uploadObj.name}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, uploadObj.file, { contentType: uploadObj.type });

    setUploads((s) => s.map(u => u.id === uploadObj.id ? {...u, task, status:'uploading'} : u));

    task.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploads((s) => s.map(u => u.id === uploadObj.id ? {...u, progress} : u));
        // optional: map snapshot.state to paused/running
        if (snapshot.state === 'paused') {
          setUploads((s) => s.map(u => u.id === uploadObj.id ? {...u, status:'paused'} : u));
        } else if (snapshot.state === 'running') {
          setUploads((s) => s.map(u => u.id === uploadObj.id ? {...u, status:'uploading'} : u));
        }
      },
      (error) => {
        setUploads((s) => s.map(u => u.id === uploadObj.id ? {...u, status:'error', error: error.message} : u));
      },
      async () => {
        // completed
        try {
          const downloadURL = await getDownloadURL(task.snapshot.ref);
          setUploads((s) => s.map(u => u.id === uploadObj.id ? {...u, status:'completed', progress:100, downloadURL} : u));
          if (onUploadedRecord) onUploadedRecord({ ...uploadObj, downloadURL });
        } catch (err) {
          setUploads((s) => s.map(u => u.id === uploadObj.id ? {...u, status:'error', error: err.message} : u));
        }
      }
    );
  }

  // Controls
  function pauseUpload(u) {
    if (u.task) {
      try { u.task.pause(); } catch(e){ console.warn(e); }
    }
  }
  function resumeUpload(u) {
    if (u.task) {
      try { u.task.resume(); } catch(e){ console.warn(e); }
    } else {
      // if no active task (e.g. queued), start one
      startUpload(u);
    }
  }
  function cancelUpload(u) {
    if (u.task) {
      try { u.task.cancel(); } catch(e){ console.warn(e); }
    }
    setUploads((s) => s.map(x => x.id === u.id ? {...x, status:'cancelled'} : x));
  }

  // Start all queued uploads
  function startAll() {
    uploads.forEach(u => { if (u.status === 'queued' || u.status === 'error') startUpload(u); });
  }

  // Remove an upload from the list
  function removeUpload(u) {
    setUploads((s) => s.filter(x => x.id !== u.id));
  }

  // Drag & drop handlers
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    function onDragOver(e){ e.preventDefault(); el.classList.add('border-dashed','border-2','border-blue-400'); }
    function onDragLeave(e){ el.classList.remove('border-dashed','border-2','border-blue-400'); }
    function onDrop(e){ e.preventDefault(); el.classList.remove('border-dashed','border-2','border-blue-400'); if(e.dataTransfer.files) addFiles(e.dataTransfer.files); }
    el.addEventListener('dragover', onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('drop', onDrop);
    return () => { el.removeEventListener('dragover', onDragOver); el.removeEventListener('dragleave', onDragLeave); el.removeEventListener('drop', onDrop); };
  }, [dropRef.current, uploads]);

  // Small utility to human readable size
  function hrSize(bytes){
    const units = ['B','KB','MB','GB','TB'];
    let i=0; while(bytes>=1024 && i<units.length-1){ bytes/=1024; i++; }
    return `${bytes.toFixed(2)} ${units[i]}`;
  }

  // Floating widget: show the latest completed video/audio or image preview
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [activePreview, setActivePreview] = useState(null); // upload id

  useEffect(() => {
    // auto-open widget when there's at least one completed item
    const completed = uploads.find(u => u.status === 'completed' && (u.type.startsWith('video/') || u.type.startsWith('audio/') || u.type.startsWith('image/')));
    if (completed) {
      setActivePreview(completed.id);
      setWidgetOpen(true);
    }
  }, [uploads]);

  function renderPreviewContent(u) {
    if (!u) return <div className="p-4">لا يوجد محتوى للعرض</div>;
    if (u.type.startsWith('video/')) return <video controls className="w-full h-48 object-contain" src={u.downloadURL} />;
    if (u.type.startsWith('audio/')) return <audio controls className="w-full" src={u.downloadURL} />;
    if (u.type.startsWith('image/')) return <img src={u.downloadURL} alt={u.name} className="w-full h-48 object-contain" />;
    // generic fallback: show link and filename
    return <div className="p-3">
      <p className="font-medium">{u.name}</p>
      <a className="underline" href={u.downloadURL} target="_blank" rel="noreferrer">فتح الملف</a>
    </div>;
  }

  // UI
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">رفع الملفات — دعم الاستكمال (Resumable)</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div ref={dropRef} className="p-6 rounded border border-gray-200 bg-gray-50 text-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
            <p className="text-lg">اسحب الملفات هنا أو انقر للاختيار</p>
            <p className="text-sm text-gray-500">كل أنواع الملفات مدعومة. سيعمل النظام على رفع الملف مع إمكانية الإيقاف والاستكمال.</p>
            <input ref={fileInputRef} type="file" className="hidden" multiple onChange={(e)=> addFiles(e.target.files)} />
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={startAll} className="px-4 py-2 bg-blue-600 text-white rounded">بدء كل الملفات</button>
            <button onClick={() => setUploads([])} className="px-4 py-2 bg-red-600 text-white rounded">إفراغ القائمة</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-medium mb-3">قائمة التحميلات</h2>
            {uploads.length === 0 ? <p className="text-gray-500">لا توجد ملفات مضافة</p> : (
              <div className="space-y-3">
                {uploads.map(u => (
                  <div key={u.id} className="border p-3 rounded flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs">{u.type.split('/')[0] || 'file'}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{u.metadata.title}</div>
                          <div className="text-xs text-gray-500">{u.name} • {hrSize(u.size)}</div>
                        </div>
                        <div className="text-right text-sm">
                          <div>{u.status}</div>
                          <div className="text-xs text-gray-400">{u.progress}%</div>
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded overflow-hidden h-2">
                          <div style={{width: `${u.progress}%`}} className="h-2 bg-blue-500" />
                        </div>
                        <div className="mt-2 flex gap-2">
                          {u.status !== 'completed' && <button onClick={() => startUpload(u)} className="px-2 py-1 border rounded text-sm">بدء</button>}
                          {u.status === 'uploading' && <button onClick={() => pauseUpload(u)} className="px-2 py-1 border rounded text-sm">إيقاف مؤقت</button>}
                          {(u.status === 'paused' || u.status === 'queued' || u.status === 'error') && <button onClick={() => resumeUpload(u)} className="px-2 py-1 border rounded text-sm">استكمال</button>}
                          {u.status !== 'completed' && <button onClick={() => cancelUpload(u)} className="px-2 py-1 border rounded text-sm">إلغاء</button>}
                          <button onClick={() => removeUpload(u)} className="px-2 py-1 border rounded text-sm">حذف من القائمة</button>
                          {u.status === 'completed' && <button onClick={() => { setActivePreview(u.id); setWidgetOpen(true); }} className="px-2 py-1 border rounded text-sm">عرض عائم</button>}
                        </div>
                        {u.error && <div className="text-red-500 text-sm mt-1">{u.error}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-medium mb-3">تفاصيل الملف (تحرير قبل الرفع)</h2>
            <p className="text-sm text-gray-500">انقر على اسم الملف في القائمة لتعديله. أو أضف وصفًا عامًّا سيُخزن مع الملف إذا رغبت.</p>
            <div className="mt-3 space-y-3">
              {uploads.map(u => (
                <div key={u.id} className="border p-3 rounded">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-xs text-gray-400">{u.size ? hrSize(u.size) : ''}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    <input value={u.metadata.title} onChange={(e)=> setUploads(s => s.map(x => x.id===u.id?{...x, metadata:{...x.metadata, title: e.target.value}}:x))} className="input p-2 border rounded" placeholder="Title" />
                    <textarea value={u.metadata.description} onChange={(e)=> setUploads(s => s.map(x => x.id===u.id?{...x, metadata:{...x.metadata, description: e.target.value}}:x))} className="input p-2 border rounded" placeholder="Description" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating widget */}
      <div className={`fixed bottom-6 right-6 w-80 z-50 transition-transform ${widgetOpen ? 'translate-y-0' : 'translate-y-20'}`}>
        <div className="bg-white shadow-lg rounded overflow-hidden">
          <div className="flex items-center justify-between p-2 border-b">
            <div className="text-sm font-medium">مشغل عائم</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setWidgetOpen(open => !open)} className="p-1 text-xs border rounded">{widgetOpen ? 'طي' : 'فتح'}</button>
              <button onClick={() => { setWidgetOpen(false); setActivePreview(null); }} className="p-1 text-xs border rounded">إغلاق</button>
            </div>
          </div>
          {widgetOpen && (
            <div className="p-2">
              {(() => {
                const u = uploads.find(x => x.id === activePreview);
                return renderPreviewContent(u);
              })()}
              <div className="mt-2 text-xs text-gray-500">هذا المشغل يتيح مشاهدة الملف أثناء التصفح — يشبه واجهة YouTube المصغرة.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
