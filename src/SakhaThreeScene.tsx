// @ts-nocheck
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Lightweight WebGL layer for the Sakha-inspired alas. The CSS landscape is
 * deliberately kept underneath as a graceful fallback when WebGL is blocked.
 */
export default function SakhaThreeScene({ lang = 'ru' }) {
  const mountRef = useRef(null)
  const controlCopy = ({
    ru: { label: 'Управление сценой', hint: 'WASD / стрелки · E — открыть рядом', up: 'Вперёд', down: 'Назад', left: 'Влево', right: 'Вправо', interact: 'Открыть ближайший ориентир' },
    en: { label: 'Scene controls', hint: 'WASD / arrows · E — interact nearby', up: 'Forward', down: 'Back', left: 'Left', right: 'Right', interact: 'Open nearest landmark' },
    vi: { label: 'Điều khiển cảnh', hint: 'WASD / phím mũi tên · E — tương tác gần nhất', up: 'Tiến lên', down: 'Lùi lại', left: 'Sang trái', right: 'Sang phải', interact: 'Mở địa điểm gần nhất' },
  })[lang] || { label: 'Scene controls', hint: 'WASD / arrows · E — interact nearby', up: 'Forward', down: 'Back', left: 'Left', right: 'Right', interact: 'Open nearest landmark' }

  useEffect(() => {
    const mount = mountRef.current
    const map = mount?.parentElement
    if (!mount || !map) return undefined

    let renderer
    let frameId = 0
    let resizeObserver
    let visibilityObserver
    let disposed = false
    let visible = !('IntersectionObserver' in window)
    let pointerX = 0
    let pointerY = 0
    let lastFrame = 0
    const pressedDirections = new Set()
    const interactiveTargets = []
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 90)
    camera.position.set(0, 1.65, 9.5)
    camera.lookAt(0, 0.15, 0)

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: window.innerWidth > 560,
        powerPreference: 'low-power',
        precision: 'mediump',
      })
    } catch {
      mount.dataset.fallback = 'true'
      return undefined
    }

    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 560 ? 1.2 : 1.55))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.domElement.className = 'sakhaWorldCanvas'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.dataset.fallback = 'false'
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xb7eee2, 0x071923, 1.6))
    const moon = new THREE.DirectionalLight(0xd0f8ed, 1.55)
    moon.position.set(-4, 8, 5)
    scene.add(moon)
    const auroraLight = new THREE.PointLight(0x48d6bd, 2.4, 15)
    auroraLight.position.set(1.6, 3.4, -1.8)
    scene.add(auroraLight)
    const hearthLight = new THREE.PointLight(0xe9b86e, 1.5, 4)
    hearthLight.position.set(0, -0.1, 1.2)
    scene.add(hearthLight)

    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b3839,
      roughness: 0.95,
      metalness: 0.02,
    })
    const ground = new THREE.Mesh(new THREE.CircleGeometry(8.5, 80), groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1.36
    ground.scale.set(1, 0.72, 1)
    scene.add(ground)

    const contourMaterial = new THREE.MeshBasicMaterial({
      color: 0x75e0cf,
      transparent: true,
      opacity: 0.13,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    ;[2.1, 3.35, 4.6, 5.85].forEach((radius) => {
      const contour = new THREE.Mesh(new THREE.RingGeometry(radius - 0.012, radius, 90), contourMaterial)
      contour.rotation.x = -Math.PI / 2
      contour.position.y = -1.325
      contour.scale.set(1, 0.72, 1)
      scene.add(contour)
    })

    const mountainMaterial = new THREE.MeshStandardMaterial({
      color: 0x123e43,
      roughness: 1,
      flatShading: true,
    })
    const mountainPositions = [
      [-5.8, -0.45, -4.3, 1.5, 2.0, 1.2],
      [-3.8, -0.45, -4.8, 2.1, 2.9, 1.0],
      [-1.5, -0.55, -4.2, 1.6, 2.0, 0.95],
      [0.4, -0.5, -4.6, 2.0, 2.7, 1.1],
      [2.9, -0.55, -4.2, 1.55, 2.1, 1.0],
      [5.1, -0.5, -4.6, 2.0, 2.55, 1.0],
      [6.6, -0.65, -3.5, 1.3, 1.7, 1.0],
    ]
    mountainPositions.forEach(([x, y, z, sx, sy, sz], index) => {
      const mountain = new THREE.Mesh(new THREE.ConeGeometry(1, 1, index % 2 ? 4 : 5), mountainMaterial)
      mountain.position.set(x, y, z)
      mountain.scale.set(sx, sy, sz)
      mountain.rotation.y = index * 0.34
      scene.add(mountain)
    })

    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x815d39, roughness: 1 })
    const pineMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a292e,
      roughness: 1,
      flatShading: true,
    })
    const addPine = (x, z, size = 1) => {
      const pine = new THREE.Group()
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.42, 5), trunkMaterial)
      trunk.position.y = -1.06
      pine.add(trunk)
      ;[
        [0.48, 0.88, 0.44],
        [0.2, 0.7, 0.34],
        [-0.06, 0.5, 0.25],
      ].forEach(([y, height, radius]) => {
        const crown = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 5), pineMaterial)
        crown.position.y = y - 0.5
        pine.add(crown)
      })
      pine.position.set(x, 0, z)
      pine.scale.setScalar(size)
      scene.add(pine)
    }
    ;[
      [-5.2, 0.6, 1.05], [-4.4, -0.25, 0.75], [-3.5, 0.8, 0.7],
      [3.4, 0.7, 0.85], [4.3, 0.0, 1.0], [5.3, 0.8, 0.7],
      [-2.8, -1.0, 0.55], [2.5, -1.0, 0.6], [-5.9, -1.0, 0.6],
      [5.9, -1.0, 0.65],
    ].forEach(([x, z, scale]) => addPine(x, z, scale))

    const sergeMaterial = new THREE.MeshStandardMaterial({
      color: 0xd1a46b,
      roughness: 0.55,
      metalness: 0.12,
    })
    const registerInteractive = (object, section) => {
      object.traverse((child) => {
        if (child.isMesh) {
          child.userData.section = section
          interactiveTargets.push(child)
        }
      })
    }
    const addSerge = (x, z, scale = 1, section = 'about') => {
      const serge = new THREE.Group()
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.09, 1.85, 6), sergeMaterial)
      post.position.y = -0.42
      serge.add(post)
      ;[0.05, 0.34].forEach((y, index) => {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, index ? 0.86 : 0.66, 5), sergeMaterial)
        arm.position.set(index ? 0.07 : -0.04, y, 0)
        arm.rotation.z = Math.PI / 2
        serge.add(arm)
      })
      serge.position.set(x, 0, z)
      serge.scale.setScalar(scale)
      scene.add(serge)
      registerInteractive(serge, section)
    }
    addSerge(-2.45, 0.05, 0.82, 'about')
    addSerge(2.5, 0.0, 0.88, 'contact')

    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x5bc8b8,
      emissive: 0x0d534e,
      emissiveIntensity: 0.6,
      roughness: 0.38,
      metalness: 0.25,
    })
    const stones = []
    ;[
      [-1.55, -0.98, 1.25], [-0.54, -1.02, 1.5], [0.62, -0.97, 1.25], [1.6, -0.99, 1.55],
    ].forEach(([x, y, z], index) => {
      const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(index % 2 ? 0.18 : 0.23, 0), stoneMaterial)
      stone.position.set(x, y, z)
      stone.rotation.set(index * 0.4, index * 0.6, index * 0.2)
      scene.add(stone)
      if (index === 0 || index === 1) {
        stone.userData.section = index === 0 ? 'services' : 'projects'
        interactiveTargets.push(stone)
      }
      stones.push({ mesh: stone, baseY: y, phase: index * 1.2 })
    })

    const hearth = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22, 0),
      new THREE.MeshStandardMaterial({
        color: 0xe9b86e,
        emissive: 0xd67f39,
        emissiveIntensity: 1.8,
        roughness: 0.3,
      }),
    )
    hearth.position.set(0, -0.75, 1.1)
    scene.add(hearth)

    const player = new THREE.Group()
    const playerBodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x16796f,
      roughness: 0.75,
      metalness: 0.05,
    })
    const playerTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0xe9b86e,
      roughness: 0.42,
      metalness: 0.14,
    })
    const playerFaceMaterial = new THREE.MeshStandardMaterial({
      color: 0xe4c5a0,
      roughness: 0.8,
    })
    const playerDarkMaterial = new THREE.MeshStandardMaterial({
      color: 0x09232d,
      roughness: 0.9,
    })
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.23, 0.48, 7), playerBodyMaterial)
    torso.position.y = 0.43
    player.add(torso)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 8, 6), playerFaceMaterial)
    head.position.y = 0.78
    player.add(head)
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.16, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.62), playerDarkMaterial)
    hood.position.set(0, 0.82, -0.025)
    player.add(hood)
    const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.075, 0.21), playerTrimMaterial)
    scarf.position.set(0, 0.59, 0.015)
    player.add(scarf)
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.28, 0.12), playerDarkMaterial)
    pack.position.set(0, 0.43, -0.19)
    player.add(pack)
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x102d35, roughness: 0.95 })
    ;[-0.09, 0.09].forEach((x) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.23, 6), legMaterial)
      leg.position.set(x, 0.13, 0)
      player.add(leg)
    })
    const feetHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.24, 0.3, 32),
      new THREE.MeshBasicMaterial({ color: 0x75e0cf, transparent: true, opacity: 0.68, side: THREE.DoubleSide }),
    )
    feetHalo.rotation.x = -Math.PI / 2
    feetHalo.position.y = 0.025
    player.add(feetHalo)
    player.position.set(0.05, -1.34, 2.1)
    scene.add(player)
    const worldBounds = { minX: -3.15, maxX: 3.15, minZ: -2.5, maxZ: 3.15 }
    const movePlayer = (direction, distance) => {
      if (direction === 'up') player.position.z -= distance
      if (direction === 'down') player.position.z += distance
      if (direction === 'left') player.position.x -= distance
      if (direction === 'right') player.position.x += distance
      player.position.x = THREE.MathUtils.clamp(player.position.x, worldBounds.minX, worldBounds.maxX)
      player.position.z = THREE.MathUtils.clamp(player.position.z, worldBounds.minZ, worldBounds.maxZ)
      const forward = direction === 'up' ? -1 : direction === 'down' ? 1 : 0
      const side = direction === 'left' ? -1 : direction === 'right' ? 1 : 0
      if (forward || side) player.rotation.y = Math.atan2(side, forward)
    }
    const nearestSection = () => {
      let nearest = null
      let nearestDistance = Infinity
      const worldPosition = new THREE.Vector3()
      interactiveTargets.forEach((target) => {
        if (!target.userData.section) return
        target.getWorldPosition(worldPosition)
        const distance = Math.hypot(worldPosition.x - player.position.x, worldPosition.z - player.position.z)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearest = target.userData.section
        }
      })
      return nearestDistance <= 1.7 ? nearest : null
    }
    const openSection = (section) => {
      if (!section) return
      const destination = document.getElementById(section)
      destination?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    }
    const keyDirection = (key) => ({
      ArrowUp: 'up', KeyW: 'up', w: 'up', W: 'up',
      ArrowDown: 'down', KeyS: 'down', s: 'down', S: 'down',
      ArrowLeft: 'left', KeyA: 'left', a: 'left', A: 'left',
      ArrowRight: 'right', KeyD: 'right', d: 'right', D: 'right',
    })[key] || null

    const starPositions = new Float32Array(270)
    for (let i = 0; i < 90; i += 1) {
      starPositions[i * 3] = Math.sin(i * 127.1) * 7.2
      starPositions[i * 3 + 1] = 1.4 + ((i * 37) % 41) / 10
      starPositions[i * 3 + 2] = -5.5 + ((i * 19) % 30) / 10
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xd6f5e9, size: 0.035, transparent: true, opacity: 0.82, depthWrite: false }),
    )
    scene.add(stars)

    const aurora = new THREE.Group()
    const auroraColors = [0x67e8cb, 0x2eb4a6, 0x5a9dba]
    auroraColors.forEach((color, layer) => {
      const points = []
      for (let i = 0; i <= 18; i += 1) {
        const x = -5.7 + i * 0.63
        const y = 2.0 + Math.sin(i * 0.54 + layer * 0.8) * (0.48 + layer * 0.12) + layer * 0.22
        const z = -3.4 - layer * 0.42 + Math.cos(i * 0.42 + layer) * 0.18
        points.push(new THREE.Vector3(x, y, z))
      }
      const curve = new THREE.CatmullRomCurve3(points)
      const ribbon = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 84, 0.035 + layer * 0.012, 5, false),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.34 - layer * 0.055,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      )
      aurora.add(ribbon)
    })
    scene.add(aurora)

    const raycaster = new THREE.Raycaster()
    const rayPointer = new THREE.Vector2()
    const sectionAtPointer = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      rayPointer.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1
      rayPointer.y = -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1)
      raycaster.setFromCamera(rayPointer, camera)
      const hit = raycaster.intersectObjects(interactiveTargets, false)[0]
      return hit?.object?.userData?.section || null
    }
    const onSceneClick = (event) => {
      const section = sectionAtPointer(event)
      if (section) openSection(section)
    }
    const onScenePointerMove = (event) => {
      const section = sectionAtPointer(event)
      renderer.domElement.style.cursor = section ? 'pointer' : 'grab'
    }
    const resize = () => {
      if (!renderer || disposed) return
      const rect = mount.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      if (reduceMotion || !visible) renderer.render(scene, camera)
    }
    const onPointerMove = (event) => {
      const rect = map.getBoundingClientRect()
      pointerX = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2
      pointerY = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2
      if (reduceMotion) {
        camera.position.x = pointerX * 0.28
        camera.position.y = 1.65 - pointerY * 0.12
        camera.lookAt(0, 0.15, 0)
        renderer.render(scene, camera)
      }
    }
    const onPointerLeave = () => {
      pointerX = 0
      pointerY = 0
      if (reduceMotion) {
        camera.position.set(0, 1.65, 9.5)
        camera.lookAt(0, 0.15, 0)
        renderer.render(scene, camera)
      }
    }
    map.tabIndex = map.tabIndex >= 0 ? map.tabIndex : 0
    const onKeyDown = (event) => {
      const direction = keyDirection(event.key)
      const active = document.activeElement
      const isEditing = active && (['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) || active.isContentEditable)
      if (isEditing || !(map.contains(active) || map.matches(':hover'))) return
      if (direction) {
        event.preventDefault()
        if (reduceMotion) {
          if (!event.repeat) movePlayer(direction, 0.22)
          renderer.render(scene, camera)
        } else {
          pressedDirections.add(direction)
        }
        return
      }
      if ((event.key === 'e' || event.key === 'E') && !event.repeat) {
        event.preventDefault()
        openSection(nearestSection())
      }
    }
    const onKeyUp = (event) => {
      const direction = keyDirection(event.key)
      if (direction) pressedDirections.delete(direction)
    }
    const onPadDown = (event) => {
      const control = event.target.closest?.('[data-scene-dir]')
      if (!control || !map.contains(control)) return
      event.preventDefault()
      const direction = control.dataset.sceneDir
      if (reduceMotion) {
        movePlayer(direction, 0.22)
        renderer.render(scene, camera)
      } else {
        pressedDirections.add(direction)
      }
    }
    const onPadUp = (event) => {
      const control = event.target.closest?.('[data-scene-dir]')
      if (control?.dataset?.sceneDir) pressedDirections.delete(control.dataset.sceneDir)
    }
    const onPadClick = (event) => {
      const action = event.target.closest?.('[data-scene-action="interact"]')
      if (action) {
        event.preventDefault()
        openSection(nearestSection())
      }
    }
    const clearDirections = () => pressedDirections.clear()
    map.addEventListener('pointermove', onPointerMove, { passive: true })
    map.addEventListener('pointerleave', onPointerLeave, { passive: true })
    map.addEventListener('pointerdown', onPadDown)
    map.addEventListener('pointerup', onPadUp)
    map.addEventListener('pointercancel', onPadUp)
    map.addEventListener('click', onPadClick)
    renderer.domElement.addEventListener('click', onSceneClick)
    renderer.domElement.addEventListener('pointermove', onScenePointerMove, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearDirections)
    window.addEventListener('resize', resize, { passive: true })
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(mount)
    }
    resize()
    renderer.render(scene, camera)

    const animate = (timestamp = performance.now()) => {
      if (disposed || !visible || reduceMotion) return
      frameId = window.requestAnimationFrame(animate)
      const delta = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.05) : 0
      lastFrame = timestamp
      const directionX = Number(pressedDirections.has('right')) - Number(pressedDirections.has('left'))
      const directionZ = Number(pressedDirections.has('down')) - Number(pressedDirections.has('up'))
      const magnitude = Math.hypot(directionX, directionZ) || 1
      if (directionX || directionZ) {
        const distance = 2.25 * delta / magnitude
        player.position.x = THREE.MathUtils.clamp(player.position.x + directionX * distance, worldBounds.minX, worldBounds.maxX)
        player.position.z = THREE.MathUtils.clamp(player.position.z + directionZ * distance, worldBounds.minZ, worldBounds.maxZ)
        player.rotation.y = Math.atan2(directionX, directionZ)
      }
      const time = performance.now() * 0.001
      aurora.position.x = Math.sin(time * 0.19) * 0.16
      aurora.rotation.y = Math.sin(time * 0.12) * 0.025
      auroraLight.intensity = 2.1 + Math.sin(time * 0.7) * 0.35
      hearth.rotation.y += 0.004
      stones.forEach(({ mesh, baseY, phase }) => {
        mesh.position.y = baseY + Math.sin(time * 0.8 + phase) * 0.045
        mesh.rotation.y += 0.003
      })
      camera.position.x += (player.position.x * 0.12 + pointerX * 0.25 - camera.position.x) * 0.025
      camera.position.y += (1.65 - pointerY * 0.13 - camera.position.y) * 0.025
      camera.position.z += (9.5 + (player.position.z - 2.1) * 0.08 - camera.position.z) * 0.025
      camera.lookAt(player.position.x * 0.12, 0.15, (player.position.z - 2.1) * 0.12)
      renderer.render(scene, camera)
    }

    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver((entries) => {
        visible = Boolean(entries[0]?.isIntersecting)
        if (visible && !reduceMotion && !frameId) frameId = window.requestAnimationFrame(animate)
        if (!visible && frameId) {
          window.cancelAnimationFrame(frameId)
          frameId = 0
        }
        if (visible) renderer.render(scene, camera)
      }, { threshold: 0.02 })
      visibilityObserver.observe(map)
    } else if (!reduceMotion) {
      frameId = window.requestAnimationFrame(animate)
    }

    return () => {
      disposed = true
      if (frameId) window.cancelAnimationFrame(frameId)
      visibilityObserver?.disconnect()
      resizeObserver?.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearDirections)
      map.removeEventListener('pointermove', onPointerMove)
      map.removeEventListener('pointerleave', onPointerLeave)
      map.removeEventListener('pointerdown', onPadDown)
      map.removeEventListener('pointerup', onPadUp)
      map.removeEventListener('pointercancel', onPadUp)
      map.removeEventListener('click', onPadClick)
      renderer.domElement.removeEventListener('click', onSceneClick)
      renderer.domElement.removeEventListener('pointermove', onScenePointerMove)
      const geometries = new Set()
      const materials = new Set()
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry)
        if (Array.isArray(object.material)) object.material.forEach((material) => materials.add(material))
        else if (object.material) materials.add(object.material)
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <>
      <div className="threeSceneMount" ref={mountRef} aria-hidden="true" />
      <div className="sceneControls" aria-label={controlCopy.label}>
        <span className="sceneControlsHint">{controlCopy.hint}</span>
        <div className="scenePad" role="group" aria-label={controlCopy.label}>
          <span />
          <button type="button" data-scene-dir="up" aria-label={controlCopy.up}>↑</button>
          <span />
          <button type="button" data-scene-dir="left" aria-label={controlCopy.left}>←</button>
          <button type="button" data-scene-dir="down" aria-label={controlCopy.down}>↓</button>
          <button type="button" data-scene-dir="right" aria-label={controlCopy.right}>→</button>
        </div>
        <button type="button" className="sceneInteract" data-scene-action="interact">E · {controlCopy.interact}</button>
      </div>
    </>
  )
}
