import { useEffect } from "react";
import { updateDoc,arrayUnion,arrayRemove } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";

export default function WebRTCRoom({
lesson,
lessonRef
}){

const { currentUser } = useAuth()

useEffect(()=>{

if(!currentUser) return

updateDoc(lessonRef,{
 "liveRoom.participants":arrayUnion(currentUser.uid)
})

return ()=>{

updateDoc(lessonRef,{
 "liveRoom.participants":arrayRemove(currentUser.uid)
})

}

},[])

return(

<div className="live-room">

<h2>البث المباشر</h2>

<video autoPlay playsInline id="localVideo"></video>

</div>

)

}