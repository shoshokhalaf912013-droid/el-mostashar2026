import React from "react";
import StudentFrame from "./StudentFrame";

export default function StudentsRing({
participants = [],
activeStudent,
setActiveStudent
}){

return(

<div className="students-ring">

{participants.map((p)=>(
    
<StudentFrame
key={p.identity}
participant={p}
isActive={activeStudent === p.identity}
onSelect={()=>setActiveStudent(p.identity)}
/>

))}

</div>

);

}