import { updateDoc } from "firebase/firestore";

export default function LiveControls({ lessonRef, liveRoom }) {

const toggleStudentMic = async () => {
 await updateDoc(lessonRef,{
  "liveRoom.allowStudentMic": !liveRoom?.allowStudentMic
 })
}

const toggleStudentCamera = async () => {
 await updateDoc(lessonRef,{
  "liveRoom.allowStudentCamera": !liveRoom?.allowStudentCamera
 })
}

const toggleTeacherMic = async () => {
 await updateDoc(lessonRef,{
  "liveRoom.teacherMic": !liveRoom?.teacherMic
 })
}

const toggleTeacherCamera = async () => {
 await updateDoc(lessonRef,{
  "liveRoom.teacherCamera": !liveRoom?.teacherCamera
 })
}

return(

<div className="live-controls">

<button onClick={toggleTeacherMic}>
🎤 مايك المعلم
</button>

<button onClick={toggleTeacherCamera}>
📷 كاميرا المعلم
</button>

<button onClick={toggleStudentMic}>
🎤 السماح للطلاب بالكلام
</button>

<button onClick={toggleStudentCamera}>
📷 السماح بكاميرا الطلاب
</button>

</div>

)

}