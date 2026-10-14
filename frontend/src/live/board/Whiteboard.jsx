import { useEffect, useRef, useState } from "react"

import { getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore"

import BoardCanvas from "./BoardCanvas"
import PdfDrawingOverlay from "./PdfDrawingOverlay"
import Toolbar from "./Toolbar"

import ScientificCalculator from "../tools/ScientificCalculator"
import VirtualPDFViewer from "../pdf/VirtualPDFViewer"
import RespiratoryScene from "../labs/biology/scenes/RespiratoryScene"

import "../styles/Whiteboard.css"


/*
=========================================================
FIREBASE STORAGE + FIRESTORE
=========================================================

This component assumes Firebase has already been initialized
somewhere in the frontend application.

We use getApps()/getApp() so we do not initialize Firebase
a second time.
*/

const firebaseApp =
  getApps().length > 0
    ? getApp()
    : null

const firebaseAuth =
  firebaseApp
    ? getAuth(firebaseApp)
    : null

const firebaseStorage =
  firebaseApp
    ? getStorage(firebaseApp)
    : null

const firebaseDb =
  firebaseApp
    ? getFirestore(firebaseApp)
    : null


function getBrowserOwnerId() {

  if (firebaseAuth?.currentUser?.uid) {
    return firebaseAuth.currentUser.uid
  }

  const key =
    "elmostashar_whiteboard_anonymous_id"

  let anonymousId =
    localStorage.getItem(key)

  if (!anonymousId) {

    anonymousId =
      `anonymous-${crypto.randomUUID()}`

    localStorage.setItem(
      key,
      anonymousId
    )
  }

  return anonymousId
}


function getWhiteboardContext() {

  /*
   * Keeps files separated by the current lesson/page.
   * Example:
   * /student/live/sec1/history/unit/123
   */

  const path =
    window.location.pathname

  return path
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .slice(0, 300) || "default"
}



export default function Whiteboard({ readOnly = false }) {

  const ownerIdRef =
    useRef(null)

  const contextKeyRef =
    useRef(null)

  if (!ownerIdRef.current) {
    ownerIdRef.current =
      getBrowserOwnerId()
  }

  if (!contextKeyRef.current) {
    contextKeyRef.current =
      getWhiteboardContext()
  }

  const [tool, setTool] = useState("pen")
  const [color, setColor] = useState("#ff0000")
  const [brushSize, setBrushSize] = useState(4)

  const [showCalculator, setShowCalculator] = useState(false)
  const [activeScene, setActiveScene] = useState(null)
  const [showGraph, setShowGraph] = useState(false)

  const [darkMode, setDarkMode] = useState(false)

  const [gridType, setGridType] = useState("none")
  const [gridSpacing, setGridSpacing] = useState(40)

  const [files, setFiles] = useState([])
  const [activeFile, setActiveFile] = useState(null)

  /* =====================================================
     WHITEBOARD ZOOM
  ===================================================== */

  const [boardZoom, setBoardZoom] = useState(1)

  const boardStageRef = useRef(null)

  const undoRef = useRef(null)
  const redoRef = useRef(null)
  const clearRef = useRef(null)


  /* =====================================================
     LOAD FILES FROM FIREBASE
  ===================================================== */

  useEffect(() => {

    let cancelled = false


    async function loadFiles() {

      if (!firebaseDb) {

        console.error(
          "Firebase Firestore is not initialized."
        )

        return
      }


      try {

        const filesQuery =
          query(
            collection(
              firebaseDb,
              "whiteboardFiles"
            ),
            where(
              "ownerId",
              "==",
              ownerIdRef.current
            )
          )


        const snapshot =
          await getDocs(
            filesQuery
          )


        if (cancelled) return


        const loadedFiles =
          snapshot.docs
            .map(item => ({
              id:
                item.id,

              ...item.data()
            }))
            .filter(
              item =>
                item.contextKey ===
                contextKeyRef.current
            )
            .sort(
              (a, b) =>
                (a.createdAtMs || 0) -
                (b.createdAtMs || 0)
            )


        setFiles(
          loadedFiles
        )


        if (
          loadedFiles.length > 0
        ) {

          setActiveFile(
            loadedFiles[0]
          )

        }


      } catch (error) {

        console.error(
          "Firebase files loading error:",
          error
        )

      }

    }


    loadFiles()


    return () => {

      cancelled = true

    }

  }, [])


  /* =====================================================
     ADD FILE
  ===================================================== */

  async function handleFile(e) {

    const file =
      e.target.files?.[0]

    if (!file) return


    /*
    =====================================================
    VALIDATION
    =====================================================
    */

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ]

    if (!allowedTypes.includes(file.type)) {

      alert(
        "يسمح فقط بملفات PDF والصور."
      )

      e.target.value = ""
      return
    }


    if (
      !firebaseStorage ||
      !firebaseDb
    ) {

      console.error(
        "Firebase Storage/Firestore is not initialized."
      )

      alert(
        "Firebase غير مهيأ في الواجهة الأمامية."
      )

      e.target.value = ""
      return
    }


    try {

      /*
      =====================================================
      UNIQUE FILE NAME
      =====================================================
      */

      const safeName =
        file.name
          .replace(/[^a-zA-Z0-9._-]/g, "_")

      const uniqueName =
        `${Date.now()}-${crypto.randomUUID()}-${safeName}`


      /*
      =====================================================
      FIREBASE STORAGE PATH
      =====================================================
      */

      const storagePath =
        `whiteboard-files/${ownerIdRef.current}/${contextKeyRef.current}/${uniqueName}`


      const fileStorageRef =
        storageRef(
          firebaseStorage,
          storagePath
        )


      /*
      =====================================================
      UPLOAD REAL FILE
      =====================================================
      */

      console.log(
        "Uploading file to Firebase Storage:",
        storagePath
      )


      const snapshot =
        await uploadBytes(
          fileStorageRef,
          file,
          {
            contentType: file.type
          }
        )


      /*
      =====================================================
      DOWNLOAD URL
      =====================================================
      */

      const downloadURL =
        await getDownloadURL(
          snapshot.ref
        )


      /*
      =====================================================
      FIRESTORE METADATA
      =====================================================
      */

      const fileData = {

        name:
          file.name,

        url:
          downloadURL,

        storagePath:
          storagePath,

        type:
          file.type,

        size:
          file.size,

        ownerId:
          ownerIdRef.current,

        contextKey:
          contextKeyRef.current,

        createdAtMs:
          Date.now()

      }


      const firestoreRef =
        await addDoc(
          collection(
            firebaseDb,
            "whiteboardFiles"
          ),
          fileData
        )


      /*
      =====================================================
      LOCAL UI OBJECT
      =====================================================
      */

      const newFile = {

        id:
          firestoreRef.id,

        name:
          file.name,

        url:
          downloadURL,

        storagePath:
          storagePath,

        type:
          file.type,

        size:
          file.size,

        ownerId:
          ownerIdRef.current,

        contextKey:
          contextKeyRef.current,

        createdAtMs:
          fileData.createdAtMs

      }


      setFiles(prev => [
        ...prev,
        newFile
      ])


      setActiveFile(
        newFile
      )


      console.log(
        "Firebase upload completed:",
        newFile
      )


    } catch (error) {

      console.error(
        "Firebase Storage upload error:",
        error
      )

      alert(
        `حدث خطأ أثناء رفع الملف إلى Firebase: ${error?.message || error}`
      )

    } finally {

      e.target.value = ""

    }

  }


  /* =====================================================
     DELETE FILE
  ===================================================== */

  async function removeFile(id) {

    if (!firebaseDb) {
      alert("Firebase Firestore غير مهيأ.")
      return
    }


    const file =
      files.find(
        item => item.id === id
      )


    if (!file) return


    try {

      /*
      =====================================================
      DELETE FROM FIREBASE STORAGE
      =====================================================
      */

      if (
        firebaseStorage &&
        file.storagePath
      ) {

        const fileStorageRef =
          storageRef(
            firebaseStorage,
            file.storagePath
          )

        await deleteObject(
          fileStorageRef
        )

      }


      /*
      =====================================================
      DELETE METADATA FROM FIRESTORE
      =====================================================
      */

      await deleteDoc(
        doc(
          firebaseDb,
          "whiteboardFiles",
          id
        )
      )


      /*
      =====================================================
      UPDATE UI
      =====================================================
      */

      setFiles(prev =>
        prev.filter(
          item =>
            item.id !== id
        )
      )


      if (
        activeFile?.id === id
      ) {

        setActiveFile(
          null
        )

      }


      console.log(
        "File deleted from Firebase:",
        file.name
      )


    } catch (error) {

      console.error(
        "Firebase file deletion error:",
        error
      )

      alert(
        `حدث خطأ أثناء حذف الملف من Firebase: ${error?.message || error}`
      )

    }

  }


  /* =====================================================
     GRID
  ===================================================== */

  function changeGrid(type, spacing) {

    setGridType(type)

    if (spacing) {
      setGridSpacing(spacing)
    }
  }


  /* =====================================================
     INTERNAL ZOOM
     Ctrl + Mouse Wheel
  ===================================================== */

  useEffect(() => {

    const stage = boardStageRef.current

    if (!stage) return


    function handleZoomWheel(e) {

      /*
         فقط Ctrl + Wheel
      */

      if (!e.ctrlKey) {
        return
      }


      /*
         منع Zoom المتصفح
      */

      e.preventDefault()
      e.stopPropagation()


      /*
         التكبير / التصغير
      */

      setBoardZoom(prev => {

        const step = 0.1

        let next

        if (e.deltaY < 0) {

          next = prev + step

        } else {

          next = prev - step

        }


        /*
           أقل Zoom = 50%
           أكبر Zoom = 300%
        */

        next = Math.max(
          0.5,
          Math.min(
            3,
            next
          )
        )


        return Number(
          next.toFixed(2)
        )

      })

    }


    /*
       passive:false مهم جدًا
       حتى نستطيع منع Browser Zoom
    */

    stage.addEventListener(
      "wheel",
      handleZoomWheel,
      {
        passive: false
      }
    )


    return () => {

      stage.removeEventListener(
        "wheel",
        handleZoomWheel
      )

    }

  }, [])


  /* =====================================================
     RESET ZOOM
  ===================================================== */

  function resetZoom() {

    setBoardZoom(1)

  }


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div
      className={`whiteboardContainer ${
        darkMode
          ? "darkMode"
          : "dayMode"
      }`}
    >

      {/* =================================================
          FLOATING TOOLBAR
          خارج منطقة الـZoom
      ================================================= */}

      {!readOnly && (
        <div className="floatingToolbar">

        <Toolbar

          setTool={setTool}

          setColor={setColor}

          setBrushSize={setBrushSize}

          undo={() => {
            undoRef.current?.()
          }}

          redo={() => {
            redoRef.current?.()
          }}

          clearBoard={() => {
            clearRef.current?.()
          }}

          toggleCalculator={() => {
            setShowCalculator(
              prev => !prev
            )
          }}

          toggleBiologyLab={() => {

            setActiveScene(prev =>
              prev === "respiratory"
                ? null
                : "respiratory"
            )

          }}

          toggleTheme={() => {
            setDarkMode(
              prev => !prev
            )
          }}

          toggleGrid={(type, spacing) => {
            changeGrid(
              type,
              spacing
            )
          }}

          openGraph={() => {
            setShowGraph(true)
          }}

        />

        </div>
      )}


      {/* =================================================
          FILE SIDEBAR
          خارج الـZoom
      ================================================= */}

      <aside className="liveSidebar">

        {!readOnly && (
          <label className="addFileBtn">

          + إضافة ملف

          <input
            type="file"
            accept=".pdf,image/*"
            onChange={handleFile}
            style={{
              display: "none"
            }}
          />

          </label>
        )}


        <div className="filesList">

          {files.map(file => (

            <div
              key={file.id}
              className={`fileItem ${
                activeFile?.id === file.id
                  ? "active"
                  : ""
              }`}
            >

              <button
                className="fileSelectBtn"
                onClick={() =>
                  setActiveFile(file)
                }
              >
                {file.name}
              </button>


              {!readOnly && (
                <button
                  className="fileDeleteBtn"
                  onClick={() =>
                    removeFile(file.id)
                  }
                >
                  ×
                </button>
              )}

            </div>

          ))}

        </div>

      </aside>


      {/* =================================================
          BOARD VIEWPORT
      ================================================= */}

      <main
        ref={boardStageRef}
        className={`boardStage grid-${gridType}`}
        style={{
          "--grid-spacing":
            `${gridSpacing}px`
        }}
      >

        {/* =================================================
            ZOOM TOOL
        ================================================= */}

        {!readOnly && (
          <div className="zoomControls">

          <button
            onClick={() =>
              setBoardZoom(prev =>
                Math.min(
                  3,
                  Number(
                    (prev + 0.1)
                      .toFixed(2)
                  )
                )
              )
            }
            title="Zoom In"
          >
            +
          </button>


          <span>
            {Math.round(
              boardZoom * 100
            )}%
          </span>


          <button
            onClick={() =>
              setBoardZoom(prev =>
                Math.max(
                  0.5,
                  Number(
                    (prev - 0.1)
                      .toFixed(2)
                  )
                )
              )
            }
            title="Zoom Out"
          >
            −
          </button>


          <button
            onClick={resetZoom}
            title="Reset Zoom"
          >
            100%
          </button>

          </div>
        )}


        {/* =================================================
            ZOOM SPACE
            هذا هو الجزء الوحيد الذي يكبر
        ================================================= */}

        <div
          className="zoomSpace"
          style={{
            width:
              `${boardZoom * 100}%`,

            minHeight:
              `${boardZoom * 1400}px`,

            display:
              "flex",

            /*
               IMPORTANT:
               Keep the unscaled board anchored to the left.
               The board itself uses transformOrigin: top center,
               which is what keeps the PDF centered while zooming.
               Centering the board here causes the PDF to drift right
               when zooming in and left when zooming out.
            */
            justifyContent:
              "flex-start",

            alignItems:
              "flex-start"
          }}
        >

          <div
            className="boardContent"
            style={{
              transform:
                `scale(${boardZoom})`,

              /*
                 Keep the zoom centered around the board center.

                 At 200%, the zoomSpace is 200% wide and the
                 unscaled board is centered inside it. Scaling around
                 the center keeps the PDF centered in the viewport
                 instead of pushing it toward the right side.
              */
              transformOrigin:
                "top center",

              width:
                `${100 / boardZoom}%`,

              minHeight:
                "1400px",

              flex:
                "0 0 auto"
            }}
          >

            {/* =============================================
                FILE
            ============================================= */}

            <div className="fileLayer">

              <div className="fileBody">

                {activeFile &&
                  activeFile.type?.includes("image") && (

                    <img
                      src={activeFile.url}
                      className="boardImage"
                      alt={activeFile.name}
                      draggable="false"
                    />

                  )}


                {activeFile &&
                  activeFile.type?.includes("pdf") && (

                    <VirtualPDFViewer
                      fileUrl={activeFile.url}
                    />

                  )}

              </div>

            </div>


            {/* =============================================
                DRAWING
            ============================================= */}

            {!readOnly && (
              <div className="drawingLayer">

                {activeFile?.type?.includes("pdf") ? (

                <PdfDrawingOverlay
                  tool={tool}
                  color={color}
                  brushSize={brushSize}
                  undoRef={undoRef}
                  redoRef={redoRef}
                  clearRef={clearRef}
                />

              ) : (

                <BoardCanvas
                  tool={tool}
                  color={color}
                  brushSize={brushSize}
                  undoRef={undoRef}
                  redoRef={redoRef}
                  clearRef={clearRef}
                />

                )}

              </div>
            )}


            {/* =============================================
                BIOLOGY
            ============================================= */}

            {!readOnly && activeScene === "respiratory" && (

              <div className="r3fLayer">

                <RespiratoryScene />

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            GRAPH
        ================================================= */}

        {!readOnly && showGraph && (

          <div
            className="graphLayer"
            style={{
              pointerEvents: "none",
            }}
          >

            <div
              className="graphPanel"
              style={{
                background:
                  "rgba(255,255,255,0.38)",
                pointerEvents: "none",
              }}
            >

              <div
                className="graphHeader"
                style={{
                  pointerEvents: "auto",
                  position: "relative",
                  zIndex: 2,
                }}
              >

                <strong>
                  📊 الرسم البياني
                </strong>

                <button
                  onClick={() =>
                    setShowGraph(false)
                  }
                >
                  ✕
                </button>

              </div>


              <div
                className="graphBody"
                style={{
                  pointerEvents: "none",
                }}
              >

                <div className="graphAxis">

                  <span className="axisY">
                    Y
                  </span>

                  <div className="graphGrid">

                    <div className="graphLine line1" />
                    <div className="graphLine line2" />
                    <div className="graphLine line3" />
                    <div className="graphLine line4" />

                    <div className="graphX" />
                    <div className="graphY" />

                  </div>

                  <span className="axisX">
                    X
                  </span>

                </div>

              </div>


              <div
                className="graphFooter"
                style={{
                  pointerEvents: "auto",
                  position: "relative",
                  zIndex: 2,
                }}
              >

                <button
                  onClick={() =>
                    setShowGraph(false)
                  }
                >
                  إغلاق
                </button>

              </div>

            </div>

          </div>

        )}

      </main>


      {/* =================================================
          CALCULATOR
      ================================================= */}

      {!readOnly && showCalculator && (

        <div className="calculatorLayer">

          <button
            className="closeCalc"
            onClick={() =>
              setShowCalculator(false)
            }
          >
            ✕
          </button>

          <ScientificCalculator />

        </div>

      )}

    </div>

  )
}