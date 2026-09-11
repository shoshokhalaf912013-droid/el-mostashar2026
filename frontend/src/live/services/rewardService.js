import { rewardLevels } from "../config/rewardLevels"

export const calculateReward = (cups)=>{

 if(cups <= 0) return 0

 if(cups > rewardLevels.length){

   return rewardLevels[rewardLevels.length-1]

 }

 return rewardLevels[cups-1]

}