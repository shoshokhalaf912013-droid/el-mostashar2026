import { useLoader } from "@react-three/fiber"
import * as THREE from "three"

export default function LungImage() {

  const texture = useLoader(
    THREE.TextureLoader,
    "/src/live/labs/biology/assets/lungs.png"
  )

  return (
    <mesh position={[0,0,0]}>
      <boxGeometry args={[3,3,0.4]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}