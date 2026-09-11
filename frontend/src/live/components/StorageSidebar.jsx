import React from "react"

export default function StorageSidebar({files,onSelect}){

return(

<div className="storage-sidebar">

<h3>Storage</h3>

{files.length===0 && (
<p className="empty">No files yet</p>
)}

{files.map(file=>(

<div
key={file.id}
className="storage-item"
onClick={()=>onSelect(file)}
>

<span className="type">{file.type.toUpperCase()}</span>

<span className="name">
{file.name}
</span>

</div>

))}

</div>

)

}