import {useState} from "react"
import "../styles/reactions.css"

export default function ReactionsBar({role="student"}){

const [reactions,setReactions]=useState([])

function spawn(icon){

const id=Date.now()+Math.random()

setReactions(r=>[...r,{id,icon}])

setTimeout(()=>{

setReactions(r=>r.filter(x=>x.id!==id))

},4000)

}

return(

<>

<div className="reactions-layer">

{reactions.map(r=>(

<div key={r.id} className="reaction-float">

{r.icon}

</div>

))}

</div>

<div className="reaction-toolbar">

<button onClick={()=>spawn("👍")}>👍</button>

<button onClick={()=>spawn("❤️")}>❤️</button>

<button onClick={()=>spawn("👏")}>👏</button>

{role==="teacher" && (
<button onClick={()=>spawn("🏆")}>🏆</button>
)}

</div>

</>

)

}