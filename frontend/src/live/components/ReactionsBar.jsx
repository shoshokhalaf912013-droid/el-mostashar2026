import socket from "../socket/liveSocket"
import { useEffect } from "react"

export default function ReactionsBar(){

function send(type){
socket.emit("reaction",type)
}

useEffect(()=>{

const emojis={
like:"👍",
heart:"❤️",
clap:"👏",
fire:"🔥",
party:"🎉"
}

const handleReaction=(type)=>{

const el=document.createElement("div")

el.className="reaction-float"

el.innerText=emojis[type] || "👍"

document.body.appendChild(el)

setTimeout(()=>{
el.remove()
},2000)

}

socket.on("reaction",handleReaction)

return ()=>{
socket.off("reaction",handleReaction)
}

},[])

return(

<div className="reactions-bar">

<button onClick={()=>send("like")}>👍</button>
<button onClick={()=>send("heart")}>❤️</button>
<button onClick={()=>send("clap")}>👏</button>
<button onClick={()=>send("fire")}>🔥</button>
<button onClick={()=>send("party")}>🎉</button>

</div>

)

}