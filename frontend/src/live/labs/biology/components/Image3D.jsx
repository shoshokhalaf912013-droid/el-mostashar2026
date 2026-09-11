import { useLoader } from "@react-three/fiber"
import * as THREE from "three"

export default function Image3D({ image }) {

  const texture = useLoader(THREE.TextureLoader, image)

  return (
    <mesh>

      {/* مجسم بسمك أكبر */}
      <boxGeometry args={[4,4,1]} />

      <meshStandardMaterial
        map={texture}
        roughness={0.8}
        metalness={0.1}
      />

    </mesh>
  )
}