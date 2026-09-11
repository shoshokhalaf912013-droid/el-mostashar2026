import React,{useEffect} from "react"

import RoyalVideo from "../video/TeacherVideo"
import RoyalCalculator from "../components/RoyalCalculator"
import RoyalWhiteboard from "../board/Whiteboard"

import socket from "../socket/liveSocket"

import "../styles/royal-ui.scss"

export default function LessonWorkspace(){

useEffect(()=>{

const handleReaction = (type)=>{
showReaction(type)
}

socket.on("reaction",handleReaction)

return ()=>{
socket.off("reaction",handleReaction)
}

},[])

const showReaction = (type)=>{

let emoji="👍"

if(type==="clap") emoji="👏"
if(type==="fire") emoji="🔥"
if(type==="like") emoji="👍"
if(type==="heart") emoji="❤️"
if(type==="star") emoji="⭐"

const el=document.createElement("div")

el.innerText=emoji

el.style.position="fixed"
el.style.bottom="20px"
el.style.right="50%"
el.style.fontSize="50px"
el.style.zIndex="9999"

document.body.appendChild(el)

setTimeout(()=>{
el.remove()
},2000)

}

return(

<div className="workspace">

<RoyalVideo src="/lesson.mp4"/>

<RoyalCalculator/>

<RoyalWhiteboard/>

</div>

)

}