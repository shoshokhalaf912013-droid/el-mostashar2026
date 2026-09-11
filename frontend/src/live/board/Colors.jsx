import { useState } from "react"

export default function Colors({ setColor }) {

const [currentColor,setCurrentColor] = useState("#ffffff")

function handleChange(e){

const color = e.target.value
setCurrentColor(color)
setColor(color)

}

return(

<div className="colors-panel">

<input
type="color"
value={currentColor}
onChange={handleChange}
/>

</div>

)

}