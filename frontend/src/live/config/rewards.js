const [clappedStudents,setClappedStudents] = useState([])

const clapStudent = (studentId)=>{

  if(clappedStudents.includes(studentId)){
     return
  }

  socket.emit("student-clap",{
    student:studentId
  })

  setClappedStudents(prev=>[...prev,studentId])

}