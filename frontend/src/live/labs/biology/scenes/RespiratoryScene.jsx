import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default function RespiratoryScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return

    // ================= SCENE =================
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)

    // ================= CAMERA =================
    const width = mountRef.current.clientWidth || window.innerWidth
    const height = mountRef.current.clientHeight || 500

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 1, 10)

    // ================= RENDERER =================
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    // ================= CONTROLS =================
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    // ================= LIGHT =================
    const light1 = new THREE.DirectionalLight(0xffffff, 1)
    light1.position.set(5, 5, 5)

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5)
    light2.position.set(-5, -3, 3)

    const ambient = new THREE.AmbientLight(0xffffff, 0.4)

    scene.add(light1, light2, ambient)

    // ================= MATERIALS =================
    const lungMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8b0000,
      roughness: 0.7,
      clearcoat: 0.2
    })

    const heartMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8b0000,
      roughness: 0.6,
      clearcoat: 0.3
    })

    const vesselRed = new THREE.MeshStandardMaterial({ color: 0xff0000 })
    const vesselBlue = new THREE.MeshStandardMaterial({ color: 0x0000ff })

    const tracheaMaterial = new THREE.MeshStandardMaterial({
      color: 0xc2a385
    })

    // ================= GROUP =================
    const chest = new THREE.Group()
    scene.add(chest)

    // ================= LUNGS =================
    function createLung(x) {
      const g = new THREE.Group()

      const p1 = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 32, 32),
        lungMaterial
      )
      p1.scale.set(1, 1.5, 1)

      const p2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.9, 32, 32),
        lungMaterial
      )
      p2.position.y = -1

      g.add(p1, p2)
      g.position.x = x
      return g
    }

    const leftLung = createLung(-1.8)
    const rightLung = createLung(1.8)
    chest.add(leftLung, rightLung)

    // ================= ❤️ REAL HEART =================
    function createRealHeart() {
      const points = []

      // شكل منحني يمثل نصف القلب
      for (let i = 0; i < 10; i++) {
        const x = Math.sin(i * 0.2) * 0.8
        const y = (i - 5) * 0.3
        points.push(new THREE.Vector2(x, y))
      }

      const geometry = new THREE.LatheGeometry(points, 32)

      const mesh = new THREE.Mesh(geometry, heartMaterial)

      // deformation بسيط
      mesh.scale.set(1, 1.2, 0.8)

      // ميل تشريحي
      mesh.rotation.z = -0.5
      mesh.rotation.y = 0.4

      return mesh
    }

    const heart = createRealHeart()
    heart.scale.set(0.8, 0.8, 0.8)
    heart.position.set(0.3, -0.6, 1)
    chest.add(heart)

    // ================= TRACHEA =================
    const trachea = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 4, 32),
      tracheaMaterial
    )
    trachea.position.set(0, 2, 0)
    chest.add(trachea)

    // ================= RINGS =================
    for (let i = -1.5; i <= 1.5; i += 0.4) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.04, 16, 50),
        new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
      )
      ring.rotation.x = Math.PI / 2
      ring.position.y = i + 2
      chest.add(ring)
    }

    // ================= VESSELS =================
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.3, 0.3, 1),
      new THREE.Vector3(0.8, 1.8, 0.5),
      new THREE.Vector3(0.2, 2.8, -0.5),
      new THREE.Vector3(-0.5, 2.2, -1)
    ])

    const pulmonaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 0.4, 1),
      new THREE.Vector3(-1.2, 1.2, 0.3),
      new THREE.Vector3(-2, 0.5, 0)
    ])

    const aorta = new THREE.Mesh(
      new THREE.TubeGeometry(aortaCurve, 64, 0.07, 16),
      vesselRed
    )

    const pulmonary = new THREE.Mesh(
      new THREE.TubeGeometry(pulmonaryCurve, 64, 0.07, 16),
      vesselBlue
    )

    chest.add(aorta, pulmonary)

    // ================= BLOOD FLOW =================
    function createBloodFlow(curve, color) {
      const count = 60
      const positions = new Float32Array(count * 3)

      for (let i = 0; i < count; i++) {
        const t = i / count
        const p = curve.getPoint(t)
        positions[i * 3] = p.x
        positions[i * 3 + 1] = p.y
        positions[i * 3 + 2] = p.z
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

      const material = new THREE.PointsMaterial({
        color,
        size: 0.1
      })

      return new THREE.Points(geometry, material)
    }

    const bloodAorta = createBloodFlow(aortaCurve, 0xff3333)
    const bloodPulmonary = createBloodFlow(pulmonaryCurve, 0x3399ff)

    chest.add(bloodAorta, bloodPulmonary)

    // ================= ANIMATION =================
    let t = 0

    function animate() {
      requestAnimationFrame(animate)
      t += 0.05

      const pulse = 1 + Math.sin(t * 2) * 0.05
      heart.scale.set(0.8 * pulse, 0.8 * pulse, 0.8 * pulse)

      const breath = 1 + Math.sin(t) * 0.05
      leftLung.scale.set(1, breath, 1)
      rightLung.scale.set(1, breath, 1)

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
}