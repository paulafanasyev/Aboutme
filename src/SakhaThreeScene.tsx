// @ts-nocheck
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Lightweight WebGL layer for the Sakha-inspired alas. The CSS landscape is
 * deliberately kept underneath as a graceful fallback when WebGL is blocked.
 */
export default function SakhaThreeScene() {
  const mountRef = useRef(null)

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
    const addSerge = (x, z, scale = 1) => {
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
    }
    addSerge(-2.45, 0.05, 0.82)
    addSerge(2.5, 0.0, 0.88)

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
    map.addEventListener('pointermove', onPointerMove, { passive: true })
    map.addEventListener('pointerleave', onPointerLeave, { passive: true })
    window.addEventListener('resize', resize, { passive: true })
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(mount)
    }
    resize()
    renderer.render(scene, camera)

    const animate = () => {
      if (disposed || !visible || reduceMotion) return
      frameId = window.requestAnimationFrame(animate)
      const time = performance.now() * 0.001
      aurora.position.x = Math.sin(time * 0.19) * 0.16
      aurora.rotation.y = Math.sin(time * 0.12) * 0.025
      auroraLight.intensity = 2.1 + Math.sin(time * 0.7) * 0.35
      hearth.rotation.y += 0.004
      stones.forEach(({ mesh, baseY, phase }) => {
        mesh.position.y = baseY + Math.sin(time * 0.8 + phase) * 0.045
        mesh.rotation.y += 0.003
      })
      camera.position.x += (pointerX * 0.42 - camera.position.x) * 0.025
      camera.position.y += (1.65 - pointerY * 0.13 - camera.position.y) * 0.025
      camera.lookAt(0, 0.15, 0)
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
      map.removeEventListener('pointermove', onPointerMove)
      map.removeEventListener('pointerleave', onPointerLeave)
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

  return <div className="threeSceneMount" ref={mountRef} aria-hidden="true" />
}
