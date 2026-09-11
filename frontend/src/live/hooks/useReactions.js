import { useState } from "react"

export default function useReactions(){

 const [clapped,setClapped] = useState([])
 const [reactions,setReactions] = useState([])

 const clapStudent = (studentId,userId)=>{

   const key = `${studentId}_${userId}`

   if(clapped.includes(key)) return

   setClapped([...clapped,key])

   setReactions([
     ...reactions,
     {studentId,type:"clap"}
   ])

 }

 const sendReaction = (studentId,type)=>{

   setReactions([
     ...reactions,
     {studentId,type}
   ])

 }

 return {
   reactions,
   clapStudent,
   sendReaction
 }

}