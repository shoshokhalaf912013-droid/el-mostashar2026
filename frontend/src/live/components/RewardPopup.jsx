import React from "react"

export default function RewardPopup({ role, reward }){

 if(role !== "teacher" && role !== "admin"){
  return null
 }

 if(!reward) return null

 return(

  <div className="reward-popup">

   🎉 فاز الطالب بجائزة

   <h2>{reward} جنيه</h2>

  </div>

 )

}