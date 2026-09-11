import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"

export default function BloodFlow() {

  const redRef = useRef()
  const blueRef = useRef()

  const count = 80

  const redPositions = new Float32Array(count * 3)
  const bluePositions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {

    const angle = (i / count) * Math.PI * 2

    redPositions[i * 3] = Math.cos(angle) * 0.6
    redPositions[i * 3 + 1] = 1.2
    redPositions[i * 3 + 2] = Math.sin(angle) * 0.6

    bluePositions[i * 3] = Math.cos(angle) * 0.9
    bluePositions[i * 3 + 1] = 1.2
    bluePositions[i * 3 + 2] = Math.sin(angle) * 0.9
  }

  useFrame(({ clock }) => {

    const t = clock.elapsedTime

    if (redRef.current) {

      const positions = redRef.current.geometry.attributes.position.array

      for (let i = 0; i < count; i++) {

        const angle = (i / count) * Math.PI * 2 + t

        positions[i * 3] = Math.cos(angle) * 0.6
        positions[i * 3 + 2] = Math.sin(angle) * 0.6

      }

      redRef.current.geometry.attributes.position.needsUpdate = true
    }

    if (blueRef.current) {

      const positions = blueRef.current.geometry.attributes.position.array

      for (let i = 0; i < count; i++) {

        const angle = (i / count) * Math.PI * 2 - t

        positions[i * 3] = Math.cos(angle) * 0.9
        positions[i * 3 + 2] = Math.sin(angle) * 0.9

      }

      blueRef.current.geometry.attributes.position.needsUpdate = true
    }

  })

  return (
    <>
      <points ref={redRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={redPositions}
            count={count}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="red" size={0.05} />
      </points>

      <points ref={blueRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={bluePositions}
            count={count}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="blue" size={0.05} />
      </points>
    </>
  )
}