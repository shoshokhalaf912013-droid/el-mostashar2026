import { useEffect, useRef } from "react"

import * as pdfjsLib from "pdfjs-dist"

import pdfWorker from
  "pdfjs-dist/build/pdf.worker?url"


pdfjsLib.GlobalWorkerOptions.workerSrc =
  pdfWorker


export default function VirtualPDFViewer({
  fileUrl
}) {

  const containerRef =
    useRef(null)


  useEffect(() => {

    if (!fileUrl) return

    let cancelled = false


    const boardContent =
      containerRef.current?.closest(
        ".boardContent"
      )


    const originalBoardMinHeight =
      boardContent?.style.minHeight || ""

    const originalBoardHeight =
      boardContent?.style.height || ""


    async function loadPDF() {

      const container =
        containerRef.current

      if (!container) return

      container.innerHTML = ""


      try {

        const loadingTask =
          pdfjsLib.getDocument({
            url: fileUrl,

            /*
             * IMPORTANT FOR THIS PDF: 
             * PDF.js is reporting an invalid TrueType function
             * (TT: undefined function: 32).
             *
             * Using the built-in font renderer avoids trying to
             * convert the broken embedded font into an OpenType
             * FontFace in the browser. This keeps the PDF text
             * rendered from the PDF glyph data itself.
             */
            disableFontFace: true,

            /*
             * Do not replace embedded glyphs with arbitrary system
             * fonts for this document.
             */
            useSystemFonts: false
          })

        const pdf =
          await loadingTask.promise


        if (cancelled) return


        console.log(
          "PDF Pages:",
          pdf.numPages
        )


        const PDF_SCALE = 1.5


        /*
        =====================================================
        FIRST PAGE FIRST
        =====================================================

        لا ننتظر قراءة الـ183 صفحة كلها قبل إظهار الصفحة الأولى.
        الصفحة الأولى تُجهز وتُعرض فورًا، ثم نكمل بقية الصفحات.
        هذا يمنع ظهور مساحة بيضاء طويلة أثناء تجهيز الـPDF.
        =====================================================
        */

        const firstPage =
          await pdf.getPage(1)

        if (cancelled) return

        const firstViewport =
          firstPage.getViewport({
            scale: PDF_SCALE
          })


        /*
        -----------------------------------------------------
        ESTIMATED DOCUMENT HEIGHT
        -----------------------------------------------------

        نستخدم أبعاد الصفحة الأولى كتقدير مبدئي فقط
        حتى يكون الـscroll والـdrawing surface موجودين
        من البداية.

        في النهاية نستبدله بالارتفاع الحقيقي مرة واحدة.
        -----------------------------------------------------
        */

        const estimatedHeight =
          Math.max(
            1400,
            Math.ceil(
              firstViewport.height *
                pdf.numPages +
              20 * Math.max(
                0,
                pdf.numPages - 1
              )
            )
          )


        let totalHeight =
          firstViewport.height +
          (pdf.numPages > 1 ? 20 : 0)


        let maxWidth =
          firstViewport.width


        if (boardContent) {

          boardContent.style.minHeight =
            `${estimatedHeight}px`

        }


        /*
        =====================================================
        PDF CONTAINER
        =====================================================
        */

        container.style.position =
          "relative"

        container.style.display =
          "flex"

        container.style.flexDirection =
          "column"

        container.style.alignItems =
          "center"

        container.style.width =
          `${Math.ceil(
            firstViewport.width
          )}px`

        container.style.minWidth =
          `${Math.ceil(
            firstViewport.width
          )}px`

        container.style.height =
          `${estimatedHeight}px`

        container.style.minHeight =
          `${estimatedHeight}px`

        container.style.margin =
          "0 auto"

        container.style.padding =
          "0"

        container.style.boxSizing =
          "border-box"

        container.style.pointerEvents =
          "auto"


        /*
        -----------------------------------------------------
        PAGE FACTORY
        -----------------------------------------------------
        */

        function createPageDiv(
          viewport,
          pageNumber,
          index
        ) {

          const pageDiv =
            document.createElement("div")

          pageDiv.className =
            "pdf-page"

          pageDiv.dataset.pageNumber =
            String(pageNumber)

          pageDiv.style.position =
            "relative"

          pageDiv.style.display =
            "flex"

          pageDiv.style.justifyContent =
            "center"

          pageDiv.style.alignItems =
            "flex-start"

          pageDiv.style.width =
            `${viewport.width}px`

          pageDiv.style.height =
            `${viewport.height}px`

          pageDiv.style.margin =
            index < pdf.numPages - 1
              ? "0 0 20px 0"
              : "0"

          pageDiv.style.padding =
            "0"

          pageDiv.style.background =
            "#fff"

          pageDiv.style.boxSizing =
            "border-box"

          pageDiv.style.overflow =
            "hidden"

          pageDiv.style.flex =
            "0 0 auto"

          pageDiv.style.pointerEvents =
            "auto"


          const canvas =
            document.createElement("canvas")

          const context =
            canvas.getContext(
              "2d",
              {
                alpha: false
              }
            )

          if (!context) {
            return null
          }


          canvas.width =
            Math.floor(viewport.width)

          canvas.height =
            Math.floor(viewport.height)

          canvas.style.display =
            "block"

          canvas.style.width =
            `${viewport.width}px`

          canvas.style.height =
            `${viewport.height}px`

          canvas.style.maxWidth =
            "none"

          canvas.style.maxHeight =
            "none"

          canvas.style.margin =
            "0"

          canvas.style.padding =
            "0"

          canvas.style.flexShrink =
            "0"

          canvas.style.pointerEvents =
            "auto"

          canvas.style.userSelect =
            "none"


          pageDiv.appendChild(canvas)
          container.appendChild(pageDiv)


          return {
            pageDiv,
            canvas,
            context
          }
        }


        /*
        =====================================================
        RENDER FIRST PAGE IMMEDIATELY
        =====================================================
        */

        const firstPageView =
          createPageDiv(
            firstViewport,
            1,
            0
          )

        if (!firstPageView) {
          throw new Error(
            "Could not create the first PDF page."
          )
        }


        await firstPage
          .render({
            canvasContext:
              firstPageView.context,
            viewport:
              firstViewport
          })
          .promise


        if (cancelled) return


        console.log(
          "PDF page rendered: 1/" +
          pdf.numPages
        )


        /*
        =====================================================
        RENDER REMAINING PAGES
        =====================================================
        */

        for (
          let pageNumber = 2;
          pageNumber <= pdf.numPages;
          pageNumber++
        ) {

          if (cancelled) return

          const page =
            await pdf.getPage(
              pageNumber
            )

          const viewport =
            page.getViewport({
              scale: PDF_SCALE
            })

          maxWidth =
            Math.max(
              maxWidth,
              viewport.width
            )

          totalHeight +=
            viewport.height

          if (
            pageNumber <
            pdf.numPages
          ) {
            totalHeight += 20
          }

          const pageView =
            createPageDiv(
              viewport,
              pageNumber,
              pageNumber - 1
            )

          if (!pageView) {
            continue
          }

          try {

            await page
              .render({
                canvasContext:
                  pageView.context,
                viewport
              })
              .promise

          } catch (renderError) {

            if (!cancelled) {

              console.error(
                `PDF page ${pageNumber} render error:`,
                renderError
              )

            }
          }


          if (
            pageNumber % 10 === 0 ||
            pageNumber === pdf.numPages
          ) {

            console.log(
              `PDF page rendered: ${pageNumber}/${pdf.numPages}`
            )

          }
        }


        /*
        =====================================================
        FINAL HEIGHT
        =====================================================
        */

        const finalHeight =
          Math.max(
            1400,
            Math.ceil(totalHeight)
          )


        if (boardContent) {

          boardContent.style.minHeight =
            `${finalHeight}px`

        }

        container.style.width =
          `${Math.ceil(maxWidth)}px`

        container.style.minWidth =
          `${Math.ceil(maxWidth)}px`

        container.style.height =
          `${finalHeight}px`

        container.style.minHeight =
          `${finalHeight}px`


        if (!cancelled) {

          console.log(
            "PDF rendering completed:",
            pdf.numPages
          )

          console.log(
            "PDF total height:",
            totalHeight
          )

          console.log(
            "Board height:",
            boardContent?.getBoundingClientRect().height
          )
        }


      } catch (error) {

        if (!cancelled) {

          console.error(
            "PDF loading error:",
            error
          )

        }
      }
    }


    loadPDF()


    return () => {

      cancelled = true

      if (containerRef.current) {

        containerRef.current.innerHTML = ""

      }

      if (boardContent) {

        boardContent.style.minHeight =
          originalBoardMinHeight

        boardContent.style.height =
          originalBoardHeight

      }
    }

  }, [fileUrl])


  return (

    <div
      className="virtual-pdf"
      ref={containerRef}
    />

  )
}
