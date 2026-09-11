import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function Heart(props){

  const ref = useRef()

  useFrame(({ clock }) => {

    const beat = 1 + Math.sin(clock.elapsedTime * 3) * 0.08

    if(ref.current){
      ref.current.scale.set(beat, beat, beat)
    }

  })

  return (

    <mesh ref={ref} position={[0,1.2,0]} {...props}>

      <sphereGeometry args={[0.25,32,32]} />

      <meshStandardMaterial color="red" />

    </mesh>

  )
}