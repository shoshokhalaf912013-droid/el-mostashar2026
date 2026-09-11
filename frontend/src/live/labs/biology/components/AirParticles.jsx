import { useRef } from "react"
import { useFrame } from "@react-three/fiber"

export default function AirParticles(){

const particles = useRef([])

useFrame(()=>{

particles.current.forEach((p)=>{

p.position.y += 0.01

if(p.position.y > 1.5){

p.position.y = -0.5

}

})

})

return(

<group>

{Array.from({length:25}).map((_,i)=>(

<mesh
key={i}
ref={(el)=>particles.current[i]=el}
position={[
(Math.random()-0.5)*0.4,
Math.random(),
(Math.random()-0.5)*0.4
]}
>

<sphereGeometry args={[0.04,16,16]}/>

<meshStandardMaterial
color="#00d9ff"
emissive="#00d9ff"
emissiveIntensity={2}
/>

</mesh>

))}

</group>

)

}