import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { alaasInput } from './sakha/input'
import { SakhaWorld } from './sakha/world'

type SceneLanguage = 'ru' | 'en' | 'vi'

export default function SakhaThreeScene({ lang = 'ru' }: { lang?: SceneLanguage }) {
  const [ready, setReady] = useState(false)
  const joystick = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLSpanElement>(null)
  const origin = useRef<{ x: number; y: number } | null>(null)
  const controlCopy = ({
    ru: { label: 'Игровое управление', hint: 'WASD или джойстик — идти по аласу' },
    en: { label: 'Game controls', hint: 'WASD or joystick — walk the alas' },
    vi: { label: 'Điều khiển', hint: 'WASD hoặc joystick — đi trên thảo nguyên' },
  })[lang]
  const loadingLabel = ({ ru: 'Создаю мир Саха…', en: 'Building the Sakha world…', vi: 'Đang dựng không gian Saha…' })[lang]

  useEffect(() => {
    const node = joystick.current
    const cap = knob.current
    if (!node || !cap) return
    const max = 42
    const move = (e: PointerEvent) => {
      if (!origin.current) return
      const dx = Math.max(-max, Math.min(max, e.clientX - origin.current.x))
      const dy = Math.max(-max, Math.min(max, e.clientY - origin.current.y))
      alaasInput.joyX = dx / max
      alaasInput.joyY = -dy / max
      cap.style.transform = `translate(${dx}px, ${dy}px)`
    }
    const end = () => {
      origin.current = null
      alaasInput.joyX = 0
      alaasInput.joyY = 0
      cap.style.transform = 'translate(0px, 0px)'
    }
    const down = (e: PointerEvent) => {
      node.setPointerCapture(e.pointerId)
      origin.current = { x: e.clientX, y: e.clientY }
    }
    node.addEventListener('pointerdown', down)
    node.addEventListener('pointermove', move)
    node.addEventListener('pointerup', end)
    node.addEventListener('pointercancel', end)
    return () => {
      node.removeEventListener('pointerdown', down)
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerup', end)
      node.removeEventListener('pointercancel', end)
      alaasInput.joyX = 0
      alaasInput.joyY = 0
    }
  }, [])

  return (
    <>
      <div className="threeSceneMount">
        <Canvas
          shadows
          camera={{ position: [0, 2.7, 46], fov: 52 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          onCreated={() => setReady(true)}
        >
          <SakhaWorld />
        </Canvas>
      </div>
      {!ready && (
        <div className="sceneLoading" role="status">
          <img src={import.meta.env.BASE_URL + 'logo-pavel.svg'} alt="" />
          <span>{loadingLabel}</span>
        </div>
      )}
      <div className="sceneControls" aria-label={controlCopy.label}>
        <span className="sceneControlsHint">{controlCopy.hint}</span>
        <div className="sceneJoystick" role="group" aria-label={controlCopy.label} ref={joystick}>
          <span className="sceneJoystickRing">
            <span className="sceneJoystickKnob" ref={knob} />
          </span>
        </div>
      </div>
    </>
  )
}
