import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { alaasInput } from './input'
import {
  Chorons,
  ChromeEnv,
  Clouds,
  Forest,
  Ground,
  Hills,
  Horse,
  Meadow,
  Person,
  Reeds,
  Serge,
  Shore,
  Sky,
  Stones,
  Urasa,
  Water,
} from './scenery'

const SERGE = Array.from({ length: 9 }, (_, i) => {
  const t = i / 8
  const a = -1.15 + t * 2.3
  return { id: i, x: Math.sin(a) * 11, z: 30 - Math.cos(a) * 1.6 }
})

const BIRCH = treeRing(36, 50, 2.15)
const LARCH = treeRing(28, 56, 2.7)
const TREES = [...BIRCH, ...LARCH]

function treeRing(count: number, radius: number, step: number) {
  return Array.from({ length: count }, (_, i) => {
    const ang = i * 2.399963
    const r = radius + (i % 6) * step
    return [Math.cos(ang) * r, Math.sin(ang) * r] as const
  })
}

function pushOut(pos: THREE.Vector3, cx: number, cz: number, radius: number) {
  const dx = pos.x - cx
  const dz = pos.z - cz
  const d = Math.hypot(dx, dz)
  if (d < radius && d > 0.001) {
    pos.x = cx + (dx / d) * radius
    pos.z = cz + (dz / d) * radius
  }
}

function Walker() {
  const { camera } = useThree()
  const group = useRef<THREE.Group>(null)
  const leftLeg = useRef<THREE.Group>(null)
  const rightLeg = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const yaw = useRef(0)
  const pos = useRef(new THREE.Vector3(0, 0, 40))
  const speed = useRef(0)
  const phase = useRef(0)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      alaasInput.keys.add(e.code)
    }
    const up = (e: KeyboardEvent) => {
      alaasInput.keys.delete(e.code)
    }
    const blur = () => alaasInput.keys.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const has = (code: string) => alaasInput.keys.has(code) || alaasInput.injected.has(code)
    let steer = 0
    if (has('KeyA') || has('ArrowLeft')) steer += 1
    if (has('KeyD') || has('ArrowRight')) steer -= 1
    steer -= alaasInput.joyX
    steer = Math.max(-1, Math.min(1, steer))
    yaw.current += steer * 1.9 * dt

    let throttle = 0
    if (has('KeyW') || has('ArrowUp')) throttle += 1
    if (has('KeyS') || has('ArrowDown')) throttle -= 1
    throttle += alaasInput.joyY
    throttle = Math.max(-1, Math.min(1, throttle))
    const move = throttle * 6.5
    speed.current = move
    const fx = -Math.sin(yaw.current)
    const fz = -Math.cos(yaw.current)
    pos.current.x += fx * move * dt
    pos.current.z += fz * move * dt
    pushOut(pos.current, 0, 0, 17.4)
    pushOut(pos.current, 0, 20, 2.4)
    for (const [x, z] of TREES) pushOut(pos.current, x, z, 0.7)
    const edge = Math.hypot(pos.current.x, pos.current.z)
    if (edge > 64) {
      pos.current.x *= 64 / edge
      pos.current.z *= 64 / edge
    }
    const g = group.current
    if (!g) return
    g.position.copy(pos.current)
    g.rotation.y = yaw.current + Math.PI
    phase.current += Math.abs(move) * dt * 2.4
    const swing = Math.sin(phase.current) * Math.min(1, Math.abs(move) / 2.5) * 0.65
    if (leftLeg.current) leftLeg.current.rotation.x = swing
    if (rightLeg.current) rightLeg.current.rotation.x = -swing
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.8
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.8
    camera.position.set(pos.current.x - fx * 6.4, 2.7, pos.current.z - fz * 6.4)
    camera.lookAt(pos.current.x + fx * 2, 1.3, pos.current.z + fz * 2)
  })

  return (
    <group ref={group} position={[0, 0, 40]}>
      <Person leftLeg={leftLeg} rightLeg={rightLeg} leftArm={leftArm} rightArm={rightArm} />
    </group>
  )
}

export function SakhaWorld() {
  return (
    <>
      <color attach="background" args={['#8ec6ea']} />
      <fog attach="fog" args={['#c5d8ea', 55, 130]} />
      <hemisphereLight args={['#d7e8ff', '#5d7a3c', 0.42]} />
      <ambientLight intensity={0.08} color="#fff6e8" />
      <ChromeEnv />
      <directionalLight
        position={[-18, 28, 12]}
        intensity={2.15}
        color="#fff3d6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-camera-left={-46}
        shadow-camera-right={46}
        shadow-camera-top={46}
        shadow-camera-bottom={-46}
        shadow-bias={-0.0004}
      />
      <Sky />
      <Ground />
      <Water />
      <Shore />
      <Meadow />
      <Reeds />
      <Forest birch={BIRCH} larch={LARCH} />
      <Urasa />
      <Chorons />
      <Horse position={[-18, 0, 8]} tint="#ffffff" phase={0.4} />
      <Horse position={[16, 0, 4]} tint="#efe8dc" phase={1.7} />
      <Horse position={[-8, 0, -12]} tint="#c48a62" phase={2.4} />
      {SERGE.map((post) => (
        <Serge key={post.id} x={post.x} z={post.z} hot={false} />
      ))}
      <Hills />
      <Stones />
      <Clouds />
      <Walker />
    </>
  )
}
