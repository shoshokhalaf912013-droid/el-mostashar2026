export default function StudentTile({

student,
cups,
reward,
giveCup

}){

return(

<div className="student-tile">

<div className="student-name">

{student.name}

</div>

<div>

🏆 {cups}

</div>

<div>

💰 {reward} جنيه

</div>

<button
onClick={()=>giveCup(student.id)}
>

🏆

</button>

</div>

)

}