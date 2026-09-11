export default function TeacherControls({giveCup,studentId}){

return(

<button
className="cup-btn"
onClick={()=>giveCup(studentId)}
>

🏆 اعطاء كأس

</button>

)

}