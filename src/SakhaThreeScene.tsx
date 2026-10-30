// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { buildSakhaWorld } from './sakhaWorldFactory'
import { buildPlayer } from './sakhaPlayer'

export default function SakhaThreeScene({ lang = 'ru', theme = 'dark' }) {
  const mountRef = useRef(null)
  const [sceneReady, setSceneReady] = useState(false)
  const isLight = true
  const controlCopy = ({
    ru: { label: 'Игровое управление', hint: 'Джойстик · БЕГ · A — прыжок · E — открыть', interact: 'Открыть ориентир', run: 'БЕГ', jump: 'ПРЫЖОК', fullscreen: 'На весь экран', exitFullscreen: 'Свернуть' },
    en: { label: 'Game controls', hint: 'Joystick · RUN · A — jump · E — interact', interact: 'Open landmark', run: 'RUN', jump: 'JUMP', fullscreen: 'Fullscreen', exitFullscreen: 'Exit fullscreen' },
    vi: { label: 'Điều khiển', hint: 'Joystick · CHẠY · A — nhảy · E — tương tác', interact: 'Mở địa điểm', run: 'CHẠY', jump: 'NHẢY', fullscreen: 'Toàn màn hình', exitFullscreen: 'Thoát' },
  })[lang] || { label: 'Controls', hint: 'WASD · E interact', interact: 'Open', run: 'RUN', jump: 'JUMP', fullscreen: 'Fullscreen', exitFullscreen: 'Exit' }
  const loadingLabel = ({ ru: 'Создаю мир Саха…', en: 'Building the Sakha world…', vi: 'Đang dựng không gian Saha…' })[lang] || 'Building…'

  useEffect(() => {
    const mount = mountRef.current
    const map = mount?.closest('.alasMap')
    if (!mount || !map) return undefined
    const controlsEl = map.querySelector('.sceneControls')
    let renderer, frameId = 0, disposed = false, visible = !('IntersectionObserver' in window)
    let pointerX = 0, pointerY = 0, lastFrame = 0
    const pressedDirections = new Set()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xc9e5df, 13, 34)
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 90)
    camera.position.set(0, 1.65, 9.5)
    camera.lookAt(0, 0.15, 0)

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance', precision: 'highp' })
    } catch {
      mount.dataset.fallback = 'true'
      if (controlsEl) controlsEl.hidden = true
      setSceneReady(true)
      return undefined
    }
    if (controlsEl) controlsEl.hidden = false
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.18
    renderer.domElement.className = 'sakhaWorldCanvas'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.dataset.fallback = 'false'
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xf4fbff, 0x789b70, 1.65))
    const key = new THREE.DirectionalLight(0xfff4dc, 2.65)
    key.position.set(-7, 12, 5)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.near = 0.5; key.shadow.camera.far = 32
    key.shadow.camera.left = -10; key.shadow.camera.right = 10
    key.shadow.camera.top = 9; key.shadow.camera.bottom = -9
    key.shadow.bias = -0.0003; key.shadow.normalBias = 0.025
    key.shadow.camera.updateProjectionMatrix()
    scene.add(key)
    const fill = new THREE.PointLight(0xc5e9ff, 0.75, 22)
    fill.position.set(1.6, isLight ? 4.4 : 3.4, -1.8)
    scene.add(fill)
    const hearthLight = new THREE.PointLight(0xffc77b, 0.55, 4.2)
    hearthLight.position.set(0, -0.1, 1.2)
    scene.add(hearthLight)
    if (true) {
      const rim = new THREE.DirectionalLight(0xb5e0d4, 0.6)
      rim.position.set(-6.5, 3.2, -4); scene.add(rim)
      const bounce = new THREE.DirectionalLight(0xf5e6c8, 0.35)
      bounce.position.set(2, 1.5, 6); scene.add(bounce)
    }

    const { waterMaterial, stones, hearth, interactiveTargets } = buildSakhaWorld(scene, isLight)
    const { player, legPivots, armPivots, feetHalo, basePlayerY } = buildPlayer(isLight)
    scene.add(player)

    const worldBounds = { minX: -7.1, maxX: 7.1, minZ: -5.8, maxZ: 4.4 }
    let jumpVelocity = 0, jumpHeight = 0, runHeld = false
    let moveVector = { x: 0, y: 0 }, joystickPointerId = null
    const joystick = map.querySelector('.sceneJoystick')
    const joystickKnob = map.querySelector('.sceneJoystickKnob')
    const runButton = map.querySelector('[data-scene-action="run"]')
    const jumpButton = map.querySelector('[data-scene-action="jump"]')
    const fullscreenButton = map.querySelector('[data-scene-action="fullscreen"]')

    const setJoystick = (x, y) => {
      const m = Math.hypot(x, y), s = m > 1 ? 1 / m : 1
      moveVector = { x: x * s, y: y * s }
      if (joystickKnob) joystickKnob.style.transform = `translate(${moveVector.x * 34}px, ${moveVector.y * 34}px)`
    }
    const startJump = () => { if (jumpHeight <= 0.001) jumpVelocity = 4.5 }
    const toggleFullscreen = async () => {
      try {
        if (document.fullscreenElement === map) await document.exitFullscreen()
        else if (map.requestFullscreen) await map.requestFullscreen()
      } catch { /* */ }
    }
    const syncFullscreenLabel = () => {
      if (!fullscreenButton) return
      fullscreenButton.textContent = document.fullscreenElement === map ? controlCopy.exitFullscreen : controlCopy.fullscreen
    }
    const openSection = (section) => {
      if (!section) return
      const el = document.getElementById(section)
      if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    }
    const nearestSection = () => {
      let nearest = null, dMin = Infinity
      const wp = new THREE.Vector3()
      interactiveTargets.forEach((obj) => {
        obj.getWorldPosition(wp)
        const d = Math.hypot(wp.x - player.position.x, wp.z - player.position.z)
        if (d < dMin && d < 1.8) { dMin = d; nearest = obj.userData.section }
      })
      return nearest
    }

    const raycaster = new THREE.Raycaster()
    const rayPointer = new THREE.Vector2()
    const sectionAtPointer = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      rayPointer.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1
      rayPointer.y = -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1)
      raycaster.setFromCamera(rayPointer, camera)
      return raycaster.intersectObjects(interactiveTargets, false)[0]?.object?.userData?.section || null
    }

    const onKeyDown = (e) => {
      if (!map.contains(document.activeElement) && !map.matches(':hover')) return
      const mapKey = { ArrowUp: 'up', KeyW: 'up', w: 'up', ArrowDown: 'down', KeyS: 'down', s: 'down', ArrowLeft: 'left', KeyA: 'left', a: 'left', ArrowRight: 'right', KeyD: 'right', d: 'right' }
      const dir = mapKey[e.key] || mapKey[e.code]
      if (dir) { pressedDirections.add(dir); e.preventDefault() }
      if (e.code === 'KeyE' || e.key === 'e') { openSection(nearestSection()); e.preventDefault() }
      if (e.code === 'Space') startJump()
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') runHeld = true
    }
    const onKeyUp = (e) => {
      const mapKey = { ArrowUp: 'up', KeyW: 'up', w: 'up', ArrowDown: 'down', KeyS: 'down', s: 'down', ArrowLeft: 'left', KeyA: 'left', a: 'left', ArrowRight: 'right', KeyD: 'right', d: 'right' }
      const dir = mapKey[e.key] || mapKey[e.code]
      if (dir) pressedDirections.delete(dir)
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') runHeld = false
    }
    const onPointerMove = (e) => {
      const rect = map.getBoundingClientRect()
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    const onJoystickDown = (e) => { joystickPointerId = e.pointerId; joystick?.setPointerCapture?.(e.pointerId); e.preventDefault() }
    const onJoystickMove = (e) => {
      if (joystickPointerId !== e.pointerId || !joystick) return
      const rect = joystick.getBoundingClientRect(), r = rect.width / 2
      setJoystick((e.clientX - (rect.left + r)) / r, (e.clientY - (rect.top + r)) / r)
    }
    const onJoystickUp = (e) => { if (joystickPointerId === e.pointerId) { joystickPointerId = null; setJoystick(0, 0) } }
    const onPadDown = (e) => { const c = e.target.closest?.('[data-scene-dir]'); if (c && map.contains(c)) { e.preventDefault(); pressedDirections.add(c.dataset.sceneDir) } }
    const onPadUp = (e) => { const c = e.target.closest?.('[data-scene-dir]'); if (c?.dataset?.sceneDir) pressedDirections.delete(c.dataset.sceneDir) }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    map.addEventListener('pointermove', onPointerMove, { passive: true })
    map.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0 }, { passive: true })
    joystick?.addEventListener('pointerdown', onJoystickDown)
    joystick?.addEventListener('pointermove', onJoystickMove)
    joystick?.addEventListener('pointerup', onJoystickUp)
    joystick?.addEventListener('pointercancel', onJoystickUp)
    runButton?.addEventListener('pointerdown', (e) => { e.preventDefault(); runHeld = true; runButton.classList.add('is-active') })
    runButton?.addEventListener('pointerup', () => { runHeld = false; runButton.classList.remove('is-active') })
    runButton?.addEventListener('pointerleave', () => { runHeld = false; runButton.classList.remove('is-active') })
    jumpButton?.addEventListener('click', (e) => { e.preventDefault(); startJump() })
    fullscreenButton?.addEventListener('click', (e) => { e.preventDefault(); toggleFullscreen() })
    document.addEventListener('fullscreenchange', syncFullscreenLabel)
    syncFullscreenLabel()
    map.addEventListener('pointerdown', onPadDown)
    map.addEventListener('pointerup', onPadUp)
    map.addEventListener('pointercancel', onPadUp)
    map.addEventListener('click', (e) => { if (e.target.closest?.('[data-scene-action="interact"]')) openSection(nearestSection()) })
    renderer.domElement.addEventListener('click', (e) => { const s = sectionAtPointer(e); if (s) openSection(s) })
    renderer.domElement.addEventListener('pointermove', (e) => { renderer.domElement.style.cursor = sectionAtPointer(e) ? 'pointer' : 'grab' })

    const resize = () => {
      const w = mount.clientWidth || 1, h = mount.clientHeight || 1
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false)
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(mount)
    let vo
    if ('IntersectionObserver' in window) {
      vo = new IntersectionObserver((entries) => { visible = entries.some((e) => e.isIntersecting) }, { threshold: 0.01 })
      vo.observe(map)
    }

    const animate = (time) => {
      frameId = requestAnimationFrame(animate)
      if (disposed || !visible) return
      const dt = Math.min(0.05, (time - lastFrame) / 1000 || 0.016)
      lastFrame = time
      const t = time * 0.001
      let dx = moveVector.x, dz = moveVector.y
      if (pressedDirections.has('left')) dx -= 1
      if (pressedDirections.has('right')) dx += 1
      if (pressedDirections.has('up')) dz -= 1
      if (pressedDirections.has('down')) dz += 1
      const len = Math.hypot(dx, dz)
      if (len > 0.01) {
        dx /= len; dz /= len
        const speed = (runHeld ? 3.2 : 1.7) * dt
        player.position.x = THREE.MathUtils.clamp(player.position.x + dx * speed, worldBounds.minX, worldBounds.maxX)
        player.position.z = THREE.MathUtils.clamp(player.position.z + dz * speed, worldBounds.minZ, worldBounds.maxZ)
        player.rotation.y = Math.atan2(dx, dz)
        const swing = Math.sin(t * (runHeld ? 14 : 9)) * 0.4
        legPivots[0].rotation.x = swing; legPivots[1].rotation.x = -swing
        armPivots[0].rotation.x = 0.12 - swing * 0.7; armPivots[1].rotation.x = 0.12 + swing * 0.7
      } else {
        legPivots.forEach((p) => { p.rotation.x *= 0.85 })
        armPivots.forEach((p, i) => { p.rotation.x = THREE.MathUtils.lerp(p.rotation.x, 0.12, 0.12) })
      }
      jumpVelocity -= 14 * dt
      jumpHeight = Math.max(0, jumpHeight + jumpVelocity * dt)
      if (jumpHeight <= 0) { jumpHeight = 0; jumpVelocity = 0 }
      player.position.y = basePlayerY + jumpHeight
      if (!reduceMotion) {
        waterMaterial.uniforms.uTime.value = t
        stones.forEach((s) => { s.mesh.position.y = s.baseY + Math.sin(t * 1.4 + s.phase) * 0.04; s.mesh.rotation.y += dt * 0.25 })
        hearth.rotation.y += dt * 0.8
        hearth.rotation.x = Math.sin(t * 2.2) * 0.08
        feetHalo.material.opacity = 0.45 + Math.sin(t * 2.5) * 0.2
      }
      camera.position.x += (player.position.x * 0.12 + pointerX * 0.25 - camera.position.x) * 0.06
      camera.position.y += (1.65 + jumpHeight * 0.15 - camera.position.y) * 0.06
      camera.position.z += (9.5 + (player.position.z - 2.1) * 0.08 - camera.position.z) * 0.06
      camera.lookAt(player.position.x * 0.12, 0.15, (player.position.z - 2.1) * 0.12)
      renderer.render(scene, camera)
    }
    setSceneReady(true)
    frameId = requestAnimationFrame(animate)

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      ro.disconnect(); vo?.disconnect()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('fullscreenchange', syncFullscreenLabel)
      const geos = new Set(), mats = new Set()
      scene.traverse((o) => {
        if (o.geometry) geos.add(o.geometry)
        if (Array.isArray(o.material)) o.material.forEach((m) => mats.add(m))
        else if (o.material) mats.add(o.material)
      })
      geos.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose())
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [theme])

  return (
    <>
      <div className="threeSceneMount" ref={mountRef} aria-hidden="true" />
      {!sceneReady && <div className="sceneLoading" role="status"><img src={import.meta.env.BASE_URL + 'logo-pavel.svg'} alt=""/><span>{loadingLabel}</span></div>}
      <div className="sceneControls" aria-label={controlCopy.label}>
        <span className="sceneControlsHint">{controlCopy.hint}</span>
        <button type="button" className="sceneFullscreen" data-scene-action="fullscreen">⛶ {controlCopy.fullscreen}</button>
        <div className="sceneJoystick" role="group" aria-label={controlCopy.label}>
          <span className="sceneJoystickRing"><span className="sceneJoystickKnob" /></span>
        </div>
        <div className="sceneActionButtons">
          <button type="button" className="sceneRunButton" data-scene-action="run">{controlCopy.run}</button>
          <button type="button" className="sceneJumpButton" data-scene-action="jump">A<br/><small>{controlCopy.jump}</small></button>
          <button type="button" className="sceneInteract" data-scene-action="interact">E · {controlCopy.interact}</button>
        </div>
      </div>
    </>
  )
}
