import { updateDoc } from "firebase/firestore";

export default function HandRaisePanel({
lesson,
lessonRef
}) {

const allowStudent = async(uid)=>{

const speakers = lesson?.liveRoom?.speakers || []

await updateDoc(lessonRef,{
 "liveRoom.speakers":[...speakers,uid],
 "liveRoom.raisedHands":lesson.liveRoom.raisedHands.filter(id=>id!==uid)
})

}

return(

<div className="raised-hands">

<h3>الطلاب الذين رفعوا اليد</h3>

{lesson?.liveRoom?.raisedHands?.map(uid=>(
<div key={uid}>

<span>{uid}</span>

<button onClick={()=>allowStudent(uid)}>
السماح بالكلام
</button>

</div>
))}

</div>

)

}