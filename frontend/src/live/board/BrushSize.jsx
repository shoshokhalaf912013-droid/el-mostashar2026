import React from "react"

export default function BrushSize({ setBrushSize }){

return(

<select
className="brush-size"
onChange={(e)=>setBrushSize(Number(e.target.value))}
>

<option value="2">Thin</option>
<option value="4">Medium</option>
<option value="8">Big</option>
<option value="14">Huge</option>

</select>

)

}