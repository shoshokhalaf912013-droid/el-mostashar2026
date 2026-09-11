import { useEffect, useRef, useState } from "react"

export default function TeacherVideo(){

const videoRef = useRef(null)
const [error,setError] = useState(false)

useEffect(()=>{

async function startCamera(){

try{

const stream = await navigator.mediaDevices.getUserMedia({
video:true,
audio:true
})

if(videoRef.current){
videoRef.current.srcObject = stream
}

}catch(e){

console.log("camera error",e)
setError(true)

}

}

startCamera()

},[])

return(

<div className="teacher-video-box">

{!error ? (

<video
ref={videoRef}
autoPlay
playsInline
muted
className="teacher-video"
/>

) : (

<div style={{
color:"gold",
fontSize:"14px",
textAlign:"center"
}}>
لا توجد كاميرا متصلة
</div>

)}

</div>

)

}