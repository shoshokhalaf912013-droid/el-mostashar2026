import { updateDoc } from "firebase/firestore";

export default function ParticipantsList({
lesson,
lessonRef
}) {

const allowSpeak = async(uid)=>{

const speakers = lesson?.liveRoom?.speakers || []

await updateDoc(lessonRef,{
 "liveRoom.speakers":[...speakers,uid]
})

}

const muteStudent = async(uid)=>{

const muted = lesson?.liveRoom?.mutedUsers || []

await updateDoc(lessonRef,{
 "liveRoom.mutedUsers":[...muted,uid]
})

}

return(

<div className="participants">

<h3>الموجودون فى البث</h3>

{lesson?.liveRoom?.participants?.map(uid=>(
<div key={uid} className="participant">

<span>{uid}</span>

<button onClick={()=>allowSpeak(uid)}>
السماح بالكلام
</button>

<button onClick={()=>muteStudent(uid)}>
كتم
</button>

</div>
))}

</div>

)

}