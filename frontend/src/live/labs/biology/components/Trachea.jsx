import { useFrame, useLoader } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import * as THREE from "three"

function Trachea(){

  const mesh = useRef()

  // تحميل التكستشر بدون داش أو اندرسكور
  const texture = useLoader(THREE.TextureLoader, "/textures/tracheadiffuse.jpg")
  const normal = useLoader(THREE.TextureLoader, "/textures/tracheanormal.jpg")
  const roughness = useLoader(THREE.TextureLoader, "/textures/trachearoughness.jpg")

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(0.1, 0.4, 0.1),
      new THREE.Vector3(0, -0.4, 0),
      new THREE.Vector3(-0.1, -1.2, 0)
    ])
  }, [])

  useFrame(({clock})=>{
    const t = clock.elapsedTime
    mesh.current.scale.y = 1 + Math.sin(t * 2) * 0.02
  })

  return (
    <mesh ref={mesh}>
      <tubeGeometry args={[curve, 120, 0.18, 64, true]} />

      <meshStandardMaterial
        map={texture}
        normalMap={normal}
        roughnessMap={roughness}
        roughness={1}
      />
    </mesh>
  )
}

/* ================== Lungs ================== */

function Lungs(){

  const left = useRef()
  const right = useRef()

  useFrame(({clock})=>{
    const scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.05

    left.current.scale.set(scale,scale,scale)
    right.current.scale.set(scale,scale,scale)
  })

  return (
    <>
      <mesh ref={left} position={[-0.7,0,0]}>
        <sphereGeometry args={[0.5,32,32]} />
        <meshStandardMaterial color="#8b0000" roughness={0.7} />
      </mesh>

      <mesh ref={right} position={[0.7,0,0]}>
        <sphereGeometry args={[0.5,32,32]} />
        <meshStandardMaterial color="#8b0000" roughness={0.7} />
      </mesh>
    </>
  )
}

/* ================== Scene ================== */

export default function RespiratoryScene(){

  return (
    <>

      {/* إضاءة */}

      <ambientLight intensity={0.2} />

      <directionalLight position={[3,3,5]} intensity={1.2} />

      <pointLight position={[-2,-2,2]} intensity={0.5} />

      <directionalLight position={[0,0,-5]} intensity={0.6} />

      {/* العناصر */}

      <Trachea />
      <Lungs />

    </>
  )
}