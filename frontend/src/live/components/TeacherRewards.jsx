export default function TeacherRewards({studentId,giveCup}){

 return(

  <button
   className="cup-btn"
   onClick={()=>giveCup(studentId)}
  >

   🏆

  </button>

 )

}