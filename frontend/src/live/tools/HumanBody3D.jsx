import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

export default function HumanBody3D(){

return(

<div style={{height:"500px"}}>

<Canvas>

<ambientLight intensity={1} />

<OrbitControls />

<mesh>

<sphereGeometry args={[1,32,32]} />

<meshStandardMaterial color="pink"/>

</mesh>

</Canvas>

</div>

)

}