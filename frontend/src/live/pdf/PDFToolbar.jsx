export default function PDFToolbar({

setTool,
setColor,
nextPage,
prevPage,
savePDF

}){

return(

<div className="pdf-toolbar">

<button onClick={()=>setTool("pen")}>✏ Pen</button>

<button onClick={()=>setTool("highlight")}>
🖍 Highlight
</button>

<button onClick={()=>setTool("text")}>
T Text
</button>

<button onClick={()=>setTool("rect")}>
⬜ Rect
</button>

<button onClick={()=>setTool("circle")}>
⭕ Circle
</button>

<input
type="color"
onChange={(e)=>setColor(e.target.value)}
/>

<button onClick={prevPage}>◀ Prev</button>

<button onClick={nextPage}>Next ▶</button>

<button onClick={savePDF}>
💾 حفظ النسخة
</button>

</div>

)

}