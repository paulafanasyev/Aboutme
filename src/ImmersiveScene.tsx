import { useEffect, useRef } from 'react'

type Props = { onReady: () => void; onError: () => void }
const THREE_MODULE = 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js'

export default function ImmersiveScene({ onReady, onError }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let disposed = false
    let frame = 0
    let renderer: any
    let resizeHandler: (() => void) | undefined
    let pointerHandler: ((event: PointerEvent) => void) | undefined
    let leaveHandler: (() => void) | undefined
    const host = hostRef.current
    if (!host) return

    const build = async () => {
      try {
        const moduleUrl: string = THREE_MODULE
        const THREE: any = await import(/* @vite-ignore */ moduleUrl)
        if (disposed || !hostRef.current) return

        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#07120f')
        scene.fog = new THREE.FogExp2('#091b18', 0.0052)
        const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 420)
        camera.position.set(0, 10, 31)
        camera.lookAt(0, 3, -32)

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.22
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.domElement.className = 'scene3dCanvas'
        renderer.domElement.setAttribute('aria-hidden', 'true')
        host.appendChild(renderer.domElement)

        scene.add(new THREE.HemisphereLight('#9cbebc', '#17241a', 1.8))
        const moonLight = new THREE.DirectionalLight('#b4d4e4', 2.6)
        moonLight.position.set(-35, 54, 22)
        moonLight.castShadow = true
        moonLight.shadow.mapSize.set(2048, 2048)
        moonLight.shadow.camera.left = -65
        moonLight.shadow.camera.right = 65
        moonLight.shadow.camera.top = 65
        moonLight.shadow.camera.bottom = -65
        moonLight.shadow.bias = -0.00015
        scene.add(moonLight)
        const warmFill = new THREE.PointLight('#edb86a', 26, 42, 2)
        warmFill.position.set(-15, 5, -4)
        scene.add(warmFill)

        const groundHeight = (x: number, z: number) => {
          const longWave = Math.sin(x * 0.052 + z * 0.021) * 1.55
          const shortWave = Math.sin(x * 0.11 - z * 0.065) * 0.56
          const distantRidge = 8.5 * Math.exp(-Math.pow((z + 77 + 8 * Math.sin(x * 0.027)) / 20, 2))
          const sideDunes = 2.5 * Math.exp(-Math.pow((Math.abs(x) - 41) / 13, 2)) * Math.exp(-Math.pow((z + 25) / 36, 2))
          const lakeBasin = 1.75 * Math.exp(-Math.pow((x - 2.5) / 29, 2) - Math.pow((z + 20) / 13, 2))
          return -1.9 + longWave + shortWave + distantRidge + sideDunes - lakeBasin
        }

        const terrainGeometry = new THREE.BufferGeometry()
        const terrainX = 160, terrainZ = 128, width = 210, depth = 172
        const positions: number[] = [], colors: number[] = [], indices: number[] = []
        const moss = new THREE.Color('#263a2b'), nearGrass = new THREE.Color('#172d24'), ridgeGrass = new THREE.Color('#34483b')
        for (let zi = 0; zi <= terrainZ; zi++) {
          const z = 24 - (zi / terrainZ) * depth
          for (let xi = 0; xi <= terrainX; xi++) {
            const x = -width / 2 + (xi / terrainX) * width
            const y = groundHeight(x, z)
            positions.push(x, y, z)
            const color = nearGrass.clone().lerp(moss, Math.min(1, Math.max(0, (y + 3) / 11)))
            if (z < -55) color.lerp(ridgeGrass, Math.min(0.8, (-z - 55) / 58))
            colors.push(color.r, color.g, color.b)
          }
        }
        for (let z = 0; z < terrainZ; z++) for (let x = 0; x < terrainX; x++) {
          const a = z * (terrainX + 1) + x, b = a + 1, c = a + terrainX + 1, d = c + 1
          indices.push(a, b, c, b, d, c)
        }
        terrainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        terrainGeometry.setIndex(indices)
        terrainGeometry.computeVertexNormals()
        const terrain = new THREE.Mesh(terrainGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0.02 }))
        terrain.receiveShadow = true
        scene.add(terrain)

        // Distant wooded silhouettes form a layered horizon behind the terrain.
        const makeRidge = (depthOffset: number, height: number, tint: string) => {
          const shape = new THREE.Shape()
          shape.moveTo(-125, -110)
          shape.lineTo(-125, 0)
          for (let i = 0; i <= 100; i++) {
            const x = -125 + (i / 100) * 250
            shape.lineTo(x, height + 5 * Math.sin(x * 0.035 + depthOffset) + 2.4 * Math.sin(x * 0.11 + depthOffset * 2))
          }
          shape.lineTo(125, -110)
          shape.closePath()
          const ridge = new THREE.Mesh(new THREE.ShapeGeometry(shape, 3), new THREE.MeshStandardMaterial({ color: tint, roughness: 1, side: THREE.DoubleSide }))
          ridge.position.z = depthOffset
          scene.add(ridge)
        }
        makeRidge(-104, 4.7, '#1b302b')
        makeRidge(-92, 2.2, '#263a30')
        makeRidge(-79, 0.9, '#304334')

        const stars = new Float32Array(1900 * 3)
        for (let i = 0; i < 1900; i++) {
          stars[i * 3] = (Math.random() - 0.5) * 330
          stars[i * 3 + 1] = 27 + Math.random() * 115
          stars[i * 3 + 2] = -150 + Math.random() * 185
        }
        const starGeometry = new THREE.BufferGeometry()
        starGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3))
        const starField = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: '#d5e7e6', size: 0.34, sizeAttenuation: true, transparent: true, opacity: 0.78 }))
        scene.add(starField)

        const moon = new THREE.Mesh(new THREE.SphereGeometry(4.15, 48, 48), new THREE.MeshStandardMaterial({ color: '#dce9e6', emissive: '#809b9a', emissiveIntensity: 0.65, roughness: 0.82 }))
        moon.position.set(43, 47, -112)
        scene.add(moon)
        const moonHalo = new THREE.Mesh(new THREE.SphereGeometry(6.6, 36, 36), new THREE.MeshBasicMaterial({ color: '#8aaba8', transparent: true, opacity: 0.075, side: THREE.BackSide, depthWrite: false }))
        moonHalo.position.copy(moon.position)
        scene.add(moonHalo)

        const addAurora = (height: number, tint: string, phase: number, opacity: number) => {
          const points = []
          for (let i = 0; i <= 180; i++) {
            const x = -125 + (i / 180) * 250
            points.push(new THREE.Vector3(x, height + Math.sin(i * 0.055 + phase) * 7 + Math.sin(i * 0.017 + phase * 1.7) * 3.4, -118 - Math.sin(i * 0.025 + phase) * 9))
          }
          const curve = new THREE.CatmullRomCurve3(points)
          const aurora = new THREE.Mesh(new THREE.TubeGeometry(curve, 220, 0.14, 5, false), new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }))
          scene.add(aurora)
        }
        addAurora(31, '#4dbd9b', 0.7, 0.22)
        addAurora(36, '#73a6be', 2.1, 0.16)
        addAurora(27, '#6b9c83', 4.2, 0.15)

        const lakeGeometry = new THREE.CircleGeometry(1, 140)
        lakeGeometry.scale(31, 12.4, 1)
        const lakeMaterial = new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uDeep: { value: new THREE.Color('#123d3c') }, uLight: { value: new THREE.Color('#739a91') } },
          vertexShader: [
            'uniform float uTime;', 'varying vec2 vUv;', 'varying vec3 vWorld;',
            'void main() {', 'vUv = uv;', 'vec3 p = position;',
            'p.z += sin(p.x * 0.22 + uTime * 0.55) * 0.035;',
            'p.z += sin(p.y * 0.43 - uTime * 0.34) * 0.025;',
            'vec4 worldPosition = modelMatrix * vec4(p, 1.0);', 'vWorld = worldPosition.xyz;',
            'gl_Position = projectionMatrix * viewMatrix * worldPosition;', '}',
          ].join('\n'),
          fragmentShader: [
            'uniform float uTime;', 'uniform vec3 uDeep;', 'uniform vec3 uLight;',
            'varying vec2 vUv;', 'varying vec3 vWorld;', 'void main() {',
            'float waveA = sin(vWorld.x * 1.7 + uTime * 0.8 + sin(vWorld.z * 0.45)) * 0.5 + 0.5;',
            'float waveB = sin(vWorld.z * 2.6 - uTime * 0.65) * 0.5 + 0.5;',
            'float glint = smoothstep(0.70, 0.97, waveA * 0.7 + waveB * 0.3) * 0.55;',
            'float rim = smoothstep(0.72, 1.0, length(vUv - vec2(0.5)) * 2.0);',
            'vec3 color = mix(uDeep, uLight, glint * 0.8 + rim * 0.16);',
            'gl_FragColor = vec4(color, 0.96);',
            '#include <tonemapping_fragment>', '#include <colorspace_fragment>', '}',
          ].join('\n'),
          transparent: true, depthWrite: false, side: THREE.DoubleSide,
        })
        const lake = new THREE.Mesh(lakeGeometry, lakeMaterial)
        lake.rotation.x = -Math.PI / 2
        lake.position.set(2.5, -2.55, -20)
        scene.add(lake)

        const createWood = (color: string, roughness = 0.72) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.08 })
        const timber = createWood('#61452a'), timberLight = createWood('#b38a51', 0.5)
        const makeSierge = (x: number, z: number, scale: number) => {
          const group = new THREE.Group()
          const ground = groundHeight(x, z), shaftHeight = 10.5 * scale
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * scale, 0.32 * scale, shaftHeight, 12), timber)
          shaft.position.y = ground + shaftHeight / 2
          shaft.castShadow = true
          group.add(shaft)
          const finial = new THREE.Mesh(new THREE.ConeGeometry(0.42 * scale, 1.4 * scale, 8), timberLight)
          finial.position.set(0, ground + shaftHeight + 0.42 * scale, 0)
          group.add(finial)
          for (let ring = 0; ring < 4; ring++) {
            const band = new THREE.Mesh(new THREE.TorusGeometry((0.24 + ring * 0.075) * scale, 0.045 * scale, 8, 32), timberLight)
            band.rotation.x = -Math.PI / 2
            band.position.set(0, ground + shaftHeight * (0.53 + ring * 0.085), 0)
            group.add(band)
          }
          const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * scale, 0.07 * scale, 2.7 * scale, 8), timberLight)
          crossbar.rotation.z = Math.PI / 2
          crossbar.position.set(0, ground + shaftHeight * 0.79, 0)
          group.add(crossbar)
          for (let side = -1; side <= 1; side += 2) {
            const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.045 * scale, 0.11 * scale, 2.2 * scale, 8), timber)
            prong.position.set(side * 0.52 * scale, ground + shaftHeight + 0.5 * scale, 0)
            prong.rotation.z = side * -0.22
            group.add(prong)
          }
          group.position.set(x, 0, z)
          scene.add(group)
        }
        makeSierge(-42, -1, 1.1)
        makeSierge(31, -39, 0.7)

        const treeCount = 1020
        const trunkGeometry = new THREE.CylinderGeometry(0.07, 0.14, 2.1, 6)
        const coneGeometry = new THREE.ConeGeometry(1, 1.8, 7, 1)
        const trunkInstances = new THREE.InstancedMesh(trunkGeometry, createWood('#493b29'), treeCount)
        const branchA = new THREE.InstancedMesh(coneGeometry, new THREE.MeshStandardMaterial({ color: '#173b2e', roughness: 0.9 }), treeCount)
        const branchB = new THREE.InstancedMesh(coneGeometry, new THREE.MeshStandardMaterial({ color: '#24503b', roughness: 0.9 }), treeCount)
        const branchC = new THREE.InstancedMesh(coneGeometry, new THREE.MeshStandardMaterial({ color: '#2c5b42', roughness: 0.9 }), treeCount)
        const dummy = new THREE.Object3D()
        let used = 0
        for (let i = 0; i < treeCount; i++) {
          const x = (Math.random() - 0.5) * 150, z = -29 - Math.random() * 74
          if (Math.abs(x) < 15 && z > -45) continue
          if (Math.pow((x - 2.5) / 35, 2) + Math.pow((z + 20) / 13, 2) < 1.25) continue
          const scale = 0.55 + Math.random() * 1.25, baseY = groundHeight(x, z) - 0.3
          dummy.position.set(x, baseY + scale * 0.95, z)
          dummy.rotation.set(0, Math.random() * Math.PI, 0)
          dummy.scale.set(scale, scale, scale)
          dummy.updateMatrix()
          trunkInstances.setMatrixAt(used, dummy.matrix)
          const branches = [branchA, branchB, branchC]
          for (let tier = 0; tier < branches.length; tier++) {
            dummy.position.set(x, baseY + scale * (1.15 + tier * 0.53), z)
            dummy.rotation.set(0, Math.random() * Math.PI, 0)
            const branchScale = scale * (1 - tier * 0.18)
            dummy.scale.set(branchScale, scale * (1 - tier * 0.11), branchScale)
            dummy.updateMatrix()
            branches[tier].setMatrixAt(used, dummy.matrix)
          }
          used++
        }
        for (const mesh of [trunkInstances, branchA, branchB, branchC]) {
          mesh.count = used
          mesh.instanceMatrix.needsUpdate = true
          mesh.castShadow = false
          mesh.receiveShadow = false
          scene.add(mesh)
        }

        const grassCount = 1700
        const grass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.075, 0.76, 4, 1), new THREE.MeshStandardMaterial({ color: '#507453', roughness: 1, side: THREE.DoubleSide }), grassCount)
        for (let i = 0; i < grassCount; i++) {
          const x = (Math.random() - 0.5) * 100, z = 3 - Math.random() * 37
          if (Math.pow((x - 2.5) / 35, 2) + Math.pow((z + 20) / 13, 2) < 1.25) continue
          dummy.position.set(x, groundHeight(x, z) + 0.2, z)
          dummy.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.32)
          dummy.scale.set(0.45 + Math.random() * 1.3, 0.4 + Math.random() * 0.8, 0.5 + Math.random() * 1.0)
          dummy.updateMatrix()
          grass.setMatrixAt(i, dummy.matrix)
        }
        grass.instanceMatrix.needsUpdate = true
        grass.castShadow = false
        scene.add(grass)

        const firefliesGeometry = new THREE.BufferGeometry()
        const fireflies = new Float32Array(180 * 3)
        for (let i = 0; i < 180; i++) {
          fireflies[i * 3] = (Math.random() - 0.5) * 68
          fireflies[i * 3 + 1] = 0.2 + Math.random() * 5
          fireflies[i * 3 + 2] = -5 - Math.random() * 50
        }
        firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(fireflies, 3))
        const fireflyPoints = new THREE.Points(firefliesGeometry, new THREE.PointsMaterial({ color: '#e6c778', size: 0.23, transparent: true, opacity: 0.66, blending: THREE.AdditiveBlending }))
        scene.add(fireflyPoints)

        const cursor = { x: 0, y: 0, targetX: 0, targetY: 0 }
        pointerHandler = (event: PointerEvent) => {
          cursor.targetX = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2
          cursor.targetY = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2
        }
        leaveHandler = () => { cursor.targetX = 0; cursor.targetY = 0 }
        window.addEventListener('pointermove', pointerHandler, { passive: true })
        window.addEventListener('blur', leaveHandler)
        resizeHandler = () => {
          if (!renderer || disposed) return
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', resizeHandler)

        const clock = new THREE.Clock()
        const animate = () => {
          if (disposed) return
          frame = window.requestAnimationFrame(animate)
          const elapsed = clock.getElapsedTime()
          lakeMaterial.uniforms.uTime.value = elapsed
          fireflyPoints.material.opacity = 0.48 + (Math.sin(elapsed * 1.8) + 1) * 0.1
          starField.rotation.y = Math.sin(elapsed * 0.018) * 0.018
          camera.position.x += (cursor.targetX * 2.6 - camera.position.x) * 0.015
          camera.position.y += (10 - cursor.targetY * 1.2 - camera.position.y) * 0.015
          camera.lookAt(cursor.targetX * 1.6, 3 + cursor.targetY * 0.55, -32)
          renderer.render(scene, camera)
        }
        renderer.render(scene, camera)
        onReady()
        frame = window.requestAnimationFrame(animate)
      } catch (error) {
        console.error('3D scene could not initialize', error)
        if (!disposed && hostRef.current) {
          hostRef.current.classList.add('scene3dFailed')
          onError()
        }
      }
    }

    void build()
    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)
      if (pointerHandler) window.removeEventListener('pointermove', pointerHandler)
      if (leaveHandler) window.removeEventListener('blur', leaveHandler)
      if (renderer) {
        renderer.dispose()
        if (renderer.domElement?.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement)
      }
    }
  }, [onReady, onError])

  return <div ref={hostRef} className="scene3d" aria-hidden="true" />
}
