import { useRef } from "react"

export default function LiveSidebar({ files, setFiles, openFile }){

const fileInput = useRef(null)

/* ================= OPEN FILE PICKER ================= */

function openFilePicker(){

if(fileInput.current){
fileInput.current.click()
}

}

/* ================= HANDLE FILES ================= */

function handleFiles(e){

const selectedFiles = Array.from(e.target.files)

if(selectedFiles.length === 0) return

const formattedFiles = selectedFiles.map(file=>{

let type = "file"

if(file.type.includes("pdf")){
type = "pdf"
}
else if(file.type.includes("image")){
type = "image"
}
else if(file.type.includes("video")){
type = "video"
}

return{

id: Date.now() + Math.random(),

name: file.name,

file: file, // مهم جداً لعرض PDF

url: URL.createObjectURL(file),

type: type

}

})

setFiles(prev => [...prev, ...formattedFiles])

/* يسمح باختيار نفس الملف مرة أخرى */
e.target.value = ""

}

/* ================= OPEN FILE ================= */

function handleOpen(file){

if(!file) return

openFile(file)

}

/* ================= UI ================= */

return(

<div className="live-sidebar">

{/* HEADER */}

<div className="sidebar-header">

<button
className="add-file-btn"
onClick={openFilePicker}
>

➕ إضافة ملف

</button>

<input
type="file"
multiple
accept="application/pdf,image/*,video/*"
ref={fileInput}
style={{display:"none"}}
onChange={handleFiles}
/>

</div>

{/* FILE LIST */}

<div className="files-list">

{files.length === 0 && (

<div style={{color:"#ccc",fontSize:"13px"}}>
لا توجد ملفات
</div>

)}

{files.map((file)=>(

<div
key={file.id}
className="file-item"
onClick={()=>handleOpen(file)}
>

{file.name}

</div>

))}

</div>

</div>

)

}