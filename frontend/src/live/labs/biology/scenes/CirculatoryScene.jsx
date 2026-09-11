import React, { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"

import Heart from "../components/Heart"
import BloodFlow from "../components/BloodFlow"

export default function CirculatoryScene() {

  const [transparent, setTransparent] = useState(false)

  return (

    <Canvas camera={{ position: [0,1.5,5], fov:45 }}>

      <ambientLight intensity={0.7} />

      <directionalLight position={[5,5,5]} intensity={1} />

      <Suspense fallback={null}>

        {/* جسم الإنسان */}
        <mesh
          position={[0,1,0]}
          onClick={() => setTransparent(!transparent)}
        >

          <capsuleGeometry args={[0.5,1.5,16,32]} />

          <meshStandardMaterial
            color="#d9b08c"
            transparent={true}
            opacity={transparent ? 0.25 : 1}
          />

        </mesh>

        {/* القلب */}
        <Heart />

        {/* حركة الدم */}
        <BloodFlow />

      </Suspense>

      <OrbitControls enableZoom enablePan />

      <Environment preset="studio" />

    </Canvas>

  )
}