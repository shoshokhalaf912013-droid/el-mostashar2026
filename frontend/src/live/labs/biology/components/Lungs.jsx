import { useRef } from "react"
import { useFrame } from "@react-three/fiber"

export default function Lungs(){

const leftLung = useRef()
const rightLung = useRef()
const particles = useRef([])

useFrame(({clock})=>{

const t = clock.getElapsedTime()

// حركة التنفس
const breathe = 1 + Math.sin(t*2)*0.06

if(leftLung.current && rightLung.current){

leftLung.current.scale.set(breathe,breathe,breathe)
rightLung.current.scale.set(breathe,breathe,breathe)

}

// حركة الهواء
particles.current.forEach((p)=>{

if(!p) return

p.position.y -= 0.02

// عندما يصل للرئتين يعاد للأعلى
if(p.position.y < -0.5){

p.position.y = 1.8
p.position.x = (Math.random()-0.5)*0.4

}

})

})

return(

<group>

{/* القصبة الهوائية */}

<mesh position={[0,1.2,0]}>

<cylinderGeometry args={[0.15,0.15,1.5,32]} />

<meshStandardMaterial color="#dddddd"/>

</mesh>


{/* الرئة اليسرى */}

<mesh
ref={leftLung}
position={[-1.1,0,0]}
scale={[1,1.4,1]}
>

<sphereGeometry args={[0.9,32,32]} />

<meshStandardMaterial color="#ff4d4d"/>

</mesh>


{/* الرئة اليمنى */}

<mesh
ref={rightLung}
position={[1.1,0,0]}
scale={[1,1.4,1]}
>

<sphereGeometry args={[0.9,32,32]} />

<meshStandardMaterial color="#ff4d4d"/>

</mesh>


{/* جزيئات الهواء */}

{Array.from({length:25}).map((_,i)=>(

<mesh
key={i}
ref={(el)=>particles.current[i]=el}
position={[
(Math.random()-0.5)*0.4,
Math.random()*2+0.5,
(Math.random()-0.5)*0.4
]}
>

<sphereGeometry args={[0.05,16,16]} />

<meshStandardMaterial color="#66ccff"/>

</mesh>

))}

</group>

)

}