import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

import layer1 from "../assets/sequence/layer1.png";
import layer2 from "../assets/sequence/layer2.png";
import layer3 from "../assets/sequence/layer3.png";
import layer4 from "../assets/sequence/layer4.png";
import layer5 from "../assets/sequence/layer5.png";
import layer6 from "../assets/sequence/layer6.png";

export default function LungVolume3D() {
  const textures = useLoader(TextureLoader, [
    layer1,
    layer2,
    layer3,
    layer4,
    layer5,
    layer6,
  ]);

  return (
    <group position={[0, -0.25, 0]}>
      {textures.map((texture, i) => (
        <mesh key={i} position={[0, 0, -i * 0.4]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}