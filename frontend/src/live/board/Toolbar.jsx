import { useState } from "react"


export default function Toolbar({

  setTool,
  setColor,
  setBrushSize,

  undo,
  redo,
  clearBoard,

  toggleCalculator,
  toggleBiologyLab,

  toggleTheme,
  toggleGrid,

  openGraph

}) {


  const [showLabMenu, setShowLabMenu] = useState(false)

  const [showGridMenu, setShowGridMenu] = useState(false)


  /* =====================================================
     LAB MENU
  ===================================================== */

  function toggleLabMenu() {

    setShowLabMenu(prev => !prev)

    setShowGridMenu(false)

  }


  /* =====================================================
     GRID MENU
  ===================================================== */

  function toggleGridMenu() {

    setShowGridMenu(prev => !prev)

    setShowLabMenu(false)

  }


  /* =====================================================
     GRID
  ===================================================== */

  function chooseGrid(type, spacing) {

    toggleGrid(type, spacing)

    setShowGridMenu(false)

  }


  /* =====================================================
     LAB
  ===================================================== */

  function openLab() {

    toggleBiologyLab()

    setShowLabMenu(false)

  }


  return (

    <div className="toolbarLayer">


      <div className="toolbar">


        {/* =================================================
            PEN
        ================================================= */}

        <button
          className="toolBtn"
          onClick={() => setTool("pen")}
          title="Pen"
        >
          ✏️
        </button>


        {/* =================================================
            MARKER
        ================================================= */}

        <button
          className="toolBtn"
          onClick={() => setTool("marker")}
          title="Marker"
        >
          🖍️
        </button>


        {/* =================================================
            ERASER
        ================================================= */}

        <button
          className="toolBtn"
          onClick={() => setTool("eraser")}
          title="Eraser"
        >
          🧽
        </button>


        {/* =================================================
            LINE
        ================================================= */}

        <button
          className="toolBtn"
          onClick={() => setTool("line")}
          title="Line"
        >
          ╱
        </button>


        {/* =================================================
            RECTANGLE
        ================================================= */}

        <button
          className="toolBtn"
          onClick={() => setTool("rect")}
          title="Rectangle"
        >
          ▭
        </button>


        {/* =================================================
            CIRCLE
        ================================================= */}

        <button
          className="toolBtn"
          onClick={() => setTool("circle")}
          title="Circle"
        >
          ○
        </button>


        {/* =================================================
            BRUSH SIZE
        ================================================= */}

        <select
          className="sizeSelect"
          defaultValue="4"

          onChange={(e) =>
            setBrushSize(
              Number(e.target.value)
            )
          }

          title="Brush Size"
        >

          <option value="2">
            Thin
          </option>

          <option value="4">
            Normal
          </option>

          <option value="8">
            Thick
          </option>

          <option value="12">
            Very Thick
          </option>

        </select>


        {/* =================================================
            COLOR
        ================================================= */}

        <input
          type="color"
          className="colorPicker"

          defaultValue="#ff0000"

          onChange={(e) =>
            setColor(e.target.value)
          }

          title="Pen Color"
        />


        {/* =================================================
            UNDO
        ================================================= */}

        <button
          className="toolBtn"
          onClick={undo}
          title="Undo"
        >
          ↩️
        </button>


        {/* =================================================
            REDO
        ================================================= */}

        <button
          className="toolBtn"
          onClick={redo}
          title="Redo"
        >
          ↪️
        </button>


        {/* =================================================
            CLEAR
        ================================================= */}

        <button
          className="toolBtn"
          onClick={clearBoard}
          title="Clear"
        >
          🗑️
        </button>


        {/* =================================================
            DAY / DARK
        ================================================= */}

        <button
          className="toolBtn themeBtn"

          onClick={toggleTheme}

          title="Day / Dark Mode"
        >
          ☀️🌙
        </button>


        {/* =================================================
            BOARD BACKGROUND
        ================================================= */}

        <div className="toolbarMenuWrapper">


          <button
            className="toolBtn"

            onClick={toggleGridMenu}

            title="Board Background"
          >
            📐
          </button>


          {showGridMenu && (

            <div className="toolbarDropdown">


              <div className="dropdownTitle">
                📐 خلفية السبورة
              </div>


              {/* NONE */}

              <button
                onClick={() =>
                  chooseGrid("none", 30)
                }
              >
                ⬜ بدون سطور
              </button>


              {/* LINES */}

              <div className="dropdownSection">

                <span>
                  📏 السطور
                </span>


                <button
                  onClick={() =>
                    chooseGrid("lines", 20)
                  }
                >
                  كثيفة — 20px
                </button>


                <button
                  onClick={() =>
                    chooseGrid("lines", 30)
                  }
                >
                  متوسطة — 30px
                </button>


                <button
                  onClick={() =>
                    chooseGrid("lines", 40)
                  }
                >
                  واسعة — 40px
                </button>


                <button
                  onClick={() =>
                    chooseGrid("lines", 50)
                  }
                >
                  كبيرة — 50px
                </button>


                <button
                  onClick={() =>
                    chooseGrid("lines", 60)
                  }
                >
                  كبيرة جدًا — 60px
                </button>

              </div>


              {/* GRID */}

              <div className="dropdownSection">

                <span>
                  ▦ الشبكة
                </span>


                <button
                  onClick={() =>
                    chooseGrid("grid", 30)
                  }
                >
                  30 × 30
                </button>


                <button
                  onClick={() =>
                    chooseGrid("grid", 40)
                  }
                >
                  40 × 40
                </button>


                <button
                  onClick={() =>
                    chooseGrid("grid", 50)
                  }
                >
                  50 × 50
                </button>


                <button
                  onClick={() =>
                    chooseGrid("grid", 60)
                  }
                >
                  60 × 60
                </button>

              </div>


              {/* SQUARES */}

              <div className="dropdownSection">

                <span>
                  ⬜ المربعات
                </span>


                <button
                  onClick={() =>
                    chooseGrid("squares", 30)
                  }
                >
                  30 × 30
                </button>


                <button
                  onClick={() =>
                    chooseGrid("squares", 40)
                  }
                >
                  40 × 40
                </button>


                <button
                  onClick={() =>
                    chooseGrid("squares", 50)
                  }
                >
                  50 × 50
                </button>


                <button
                  onClick={() =>
                    chooseGrid("squares", 60)
                  }
                >
                  60 × 60
                </button>

              </div>


            </div>

          )}

        </div>


        {/* =================================================
            GRAPH
        ================================================= */}

        <button
          className="toolBtn"
          onClick={openGraph}
          title="Graph"
        >
          📊
        </button>




      </div>

    </div>

  )
}