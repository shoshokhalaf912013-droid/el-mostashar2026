import { useRef, useEffect } from "react"

export default function StudentCamera({track}){

const videoRef = useRef()

useEffect(()=>{

if(track && videoRef.current){

track.attach(videoRef.current)

}

},[track])

return(

<video
ref={videoRef}
autoPlay
playsInline
className="student-video"
/>

)

}