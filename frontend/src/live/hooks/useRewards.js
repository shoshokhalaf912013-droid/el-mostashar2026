import { useState } from "react"
import { rewardsTable } from "../utils/rewardsTable"

export default function useRewards(){

 const [cups,setCups] = useState({})
 const [rewards,setRewards] = useState({})

 const giveCup = (studentId)=>{

   const current = cups[studentId] || 0
   const newCount = current + 1

   const reward = rewardsTable[newCount-1] || null

   setCups({
     ...cups,
     [studentId]:newCount
   })

   if(reward){

     setRewards({
       ...rewards,
       [studentId]:reward
     })

   }

 }

 const getReward = (studentId)=>{
   return rewards[studentId] || null
 }

 return {
   cups,
   giveCup,
   getReward
 }

}