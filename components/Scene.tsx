'use client'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, Lightformer, MeshReflectorMaterial, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing'
import { useEffect, useRef, useState } from 'react'
import { state, ACC } from '@/lib/state'

// camera keyframes: hero, side, wheel close-up, rear, interior peek, full reveal, drive-away
const K: [number[], number[]][] = [
  [[6, 1.5, 5], [0, .65, 0]], [[.5, 1.1, 7.4], [0, .7, 0]], [[3.4, .6, 3.8], [1.5, .4, .9]],
  [[-5.6, .9, 3.2], [-.4, .65, 0]], [[1.2, 1.9, 1.7], [0, .8, 0]], [[5, 2.2, 5.6], [0, .6, 0]], [[8, .5, .9], [0, .75, 0]]]
const ss = (x: number) => x * x * (3 - 2 * x)

function Car() {
  const { scene } = useGLTF('/models/car.glb')
  const wheels = useRef<THREE.Object3D[]>([]), paint = useRef<THREE.MeshStandardMaterial | null>(null), g = useRef<THREE.Group>(null!)
  const c = useRef(new THREE.Color(state.color)), spin = useRef(0)
  useEffect(() => {
    wheels.current = []
    scene.traverse((o) => {
      if (o.name.startsWith('wheel')) wheels.current.push(o)
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
      if (!m) return
      if (m.name === 'paint') { paint.current = m; m.envMapIntensity = 1.3 }
      if (m.name === 'lamp') { m.emissive = new THREE.Color('#fff'); m.emissiveIntensity = 6; m.toneMapped = false }
    })
  }, [scene])
  useFrame(({ pointer }, dt) => {
    const k = 1 - Math.pow(.002, dt)
    spin.current += (state.drag - spin.current) * k
    g.current.rotation.y = spin.current + pointer.x * .12 + state.p * .5
    wheels.current.forEach((w) => (w.rotation.z = state.p * 120))
    if (paint.current) { c.current.lerp(new THREE.Color(state.color), 1 - Math.pow(.004, dt)); paint.current.color.copy(c.current) }
  })
  return <group ref={g}><primitive object={scene} /></group>
}

function Rig() {
  const tp = useRef(new THREE.Vector3()), tl = useRef(new THREE.Vector3(0, .65, 0)), l = useRef(new THREE.Vector3(0, .65, 0)), tmp = useRef(new THREE.Vector3())
  useFrame(({ camera, pointer, size }, dt) => {
    const u = state.p * (K.length - 1), i = Math.min(Math.floor(u), K.length - 2), f = ss(u - i), m = size.width < 768 ? 1.5 : 1
    tp.current.fromArray(K[i][0]).lerp(tmp.current.fromArray(K[i + 1][0]), f).multiplyScalar(m)
    tl.current.fromArray(K[i][1]).lerp(tmp.current.fromArray(K[i + 1][1]), f)
    tp.current.x += pointer.x * .6; tp.current.y -= pointer.y * .3
    const k = 1 - Math.pow(.0005, dt)
    camera.position.lerp(tp.current, k); l.current.lerp(tl.current, k); camera.lookAt(l.current)
  })
  return null
}

export default function Scene() {
  const [small, setSmall] = useState(false)
  useEffect(() => { setSmall(innerWidth < 768) }, [])
  return (
    <Canvas className="!fixed inset-0 z-10" dpr={[1, 2]} camera={{ fov: 32, position: [6, 1.5, 5], near: .1, far: 80 }} gl={{ antialias: !small, toneMappingExposure: 1.1 }}>
      <fog attach="fog" args={['#07070a', 10, 26]} />
      <AdaptiveDpr pixelated />
      <spotLight position={[4, 8, 3]} angle={.5} penumbra={1} intensity={120} />
      <pointLight position={[-3, 1.6, -3]} color={ACC} intensity={30} distance={14} />
      <pointLight position={[4, 1.2, 4]} color={ACC} intensity={14} distance={10} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={5} position={[0, 6, 0]} scale={[16, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2.5} position={[-9, 3, 0]} scale={[16, 5, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={2.5} position={[9, 3, 2]} scale={[10, 5, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" color={ACC} intensity={4} position={[0, 2, -10]} scale={6} />
      </Environment>
      <Car />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.001}>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial blur={[300, 100]} resolution={small ? 512 : 1024} mixBlur={1} mixStrength={small ? 20 : 40} roughness={1} depthScale={1} minDepthThreshold={.4} maxDepthThreshold={1.4} color="#0a0a0c" metalness={.5} mirror={0} />
      </mesh>
      <Rig />
      {!small && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={1} intensity={.9} />
          <ChromaticAberration offset={new THREE.Vector2(.0008, .0008)} radialModulation={false} modulationOffset={0} />
          <Vignette eskil={false} offset={.2} darkness={.8} />
          <Noise opacity={.05} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
useGLTF.preload('/models/car.glb')
