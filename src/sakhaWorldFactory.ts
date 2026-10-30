// @ts-nocheck
import * as THREE from 'three'

/** High-detail Sakha landscape (terrain, water, mountains, forest, serge, stones). */
export function buildSakhaWorld(scene, isLight) {
  const interactiveTargets = []

  // ── Terrain (multi-octave, higher res) ─────────────────────────────────────
  const groundGeometry = new THREE.BufferGeometry()
  const groundSegments = 128
  const groundRings = 36
  const groundPositions = [0, 0, 0]
  const groundColors = []
  const c0 = new THREE.Color(isLight ? 0x3f916c : 0x1b5147)
  groundColors.push(c0.r, c0.g, c0.b)
  for (let ring = 1; ring <= groundRings; ring += 1) {
    const radius = 9.2 * ring / groundRings
    for (let segment = 0; segment < groundSegments; segment += 1) {
      const angle = segment / groundSegments * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      // multi-octave elevation
      const e1 = Math.sin(x * 1.42 + z * 0.68) * 0.072
      const e2 = Math.cos(z * 2.35 - x * 0.55) * 0.038
      const e3 = Math.sin(x * 3.9 + z * 3.1) * 0.015
      const e4 = Math.sin(x * 7.2 - z * 5.6) * 0.006
      const falloff = 1 - ring / (groundRings * 1.28)
      const elevation = (e1 + e2 + e3 + e4) * falloff
      groundPositions.push(x, z, elevation)
      const base = isLight ? 0x3f916c : 0x1b5147
      const edge = isLight ? 0x7eb89a : 0x0a2830
      const high = isLight ? 0x6fbf8c : 0x4a7b5a
      const moss = isLight ? 0x8a9a7a : 0x2a4038
      const color = new THREE.Color(base).lerp(new THREE.Color(edge), Math.min(0.82, radius / 12))
      color.lerp(new THREE.Color(high), Math.max(0, elevation) * (isLight ? 2.6 : 1.7))
      if ((segment + ring * 11) % 13 === 0) color.lerp(new THREE.Color(moss), 0.28)
      if ((segment * 3 + ring) % 17 === 0) color.lerp(new THREE.Color(isLight ? 0x5a8a6a : 0x163830), 0.18)
      groundColors.push(color.r, color.g, color.b)
    }
  }
  const groundIndices = []
  for (let segment = 0; segment < groundSegments; segment += 1) {
    groundIndices.push(0, 1 + segment, 1 + (segment + 1) % groundSegments)
  }
  for (let ring = 1; ring < groundRings; ring += 1) {
    const innerBase = 1 + (ring - 1) * groundSegments
    const outerBase = 1 + ring * groundSegments
    for (let segment = 0; segment < groundSegments; segment += 1) {
      const next = (segment + 1) % groundSegments
      const a = innerBase + segment, b = innerBase + next, c = outerBase + segment, d = outerBase + next
      groundIndices.push(a, c, b, b, c, d)
    }
  }
  groundGeometry.setAttribute('position', new THREE.Float32BufferAttribute(groundPositions, 3))
  groundGeometry.setAttribute('color', new THREE.Float32BufferAttribute(groundColors, 3))
  groundGeometry.setIndex(groundIndices)
  groundGeometry.rotateX(-Math.PI / 2)
  groundGeometry.computeVertexNormals()
  const ground = new THREE.Mesh(groundGeometry, new THREE.MeshStandardMaterial({
    color: 0xffffff, vertexColors: true, roughness: isLight ? 0.78 : 0.9, metalness: isLight ? 0.02 : 0.03,
  }))
  ground.position.y = -1.36
  ground.scale.set(1, 0.72, 1)
  ground.receiveShadow = true
  scene.add(ground)

  // Contour rings
  const contourMat = new THREE.MeshBasicMaterial({
    color: isLight ? 0x2a9d8f : 0x75e0cf, transparent: true, opacity: isLight ? 0.18 : 0.12, side: THREE.DoubleSide, depthWrite: false,
  })
  ;[1.8, 2.9, 4.1, 5.3, 6.5, 7.7].forEach((radius) => {
    const contour = new THREE.Mesh(new THREE.RingGeometry(radius - 0.012, radius, 112), contourMat)
    contour.rotation.x = -Math.PI / 2
    contour.position.y = -1.32
    contour.scale.set(1, 0.72, 1)
    scene.add(contour)
  })

  // ── Water (richer shader) ──────────────────────────────────────────────────
  const waterGeometry = new THREE.CircleGeometry(1, 192)
  waterGeometry.scale(2.55, 0.88, 1)
  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(isLight ? 0x1a7f8e : 0x0c3b45) },
      uMid: { value: new THREE.Color(isLight ? 0x3aa8a0 : 0x1a5a58) },
      uGlint: { value: new THREE.Color(isLight ? 0xd0f8ef : 0x9cebd9) },
      uFoam: { value: new THREE.Color(isLight ? 0xe8fff8 : 0xc8f5e8) },
    },
    vertexShader: [
      'uniform float uTime;', 'varying vec2 vUv;', 'varying vec3 vPos;',
      'void main() {',
      'vUv = uv; vec3 p = position;',
      'p.z += sin(p.x * 5.2 + uTime * 0.9) * 0.016;',
      'p.z += sin(p.y * 8.1 - uTime * 0.75) * 0.01;',
      'p.z += sin((p.x + p.y) * 3.6 + uTime * 1.15) * 0.006;',
      'p.z += sin(p.x * 12.0 + p.y * 9.0 + uTime * 1.4) * 0.003;',
      'vec4 wp = modelMatrix * vec4(p, 1.0); vPos = wp.xyz;',
      'gl_Position = projectionMatrix * viewMatrix * wp;',
      '}',
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime;', 'uniform vec3 uDeep;', 'uniform vec3 uMid;', 'uniform vec3 uGlint;', 'uniform vec3 uFoam;',
      'varying vec2 vUv;', 'varying vec3 vPos;',
      'void main() {',
      'float wA = sin(vPos.x * 7.8 + uTime * 0.72 + cos(vPos.z * 5.6)) * 0.5 + 0.5;',
      'float wB = sin(vPos.z * 11.2 - uTime * 0.5) * 0.5 + 0.5;',
      'float wC = sin((vPos.x + vPos.z) * 4.3 + uTime * 0.95) * 0.5 + 0.5;',
      'float wD = sin(vPos.x * 18.0 - vPos.z * 14.0 + uTime * 1.6) * 0.5 + 0.5;',
      'float glint = smoothstep(0.76, 0.97, wA * 0.45 + wB * 0.28 + wC * 0.18 + wD * 0.09);',
      'float foam = smoothstep(0.88, 0.99, wD) * 0.45;',
      'float edge = 1.0 - smoothstep(0.28, 0.52, length(vUv - vec2(0.5)));',
      'vec3 col = mix(uDeep, uMid, edge * 0.4 + wA * 0.18);',
      'col = mix(col, uGlint, glint * 0.35 + edge * 0.12);',
      'col = mix(col, uFoam, foam * edge);',
      'gl_FragColor = vec4(col, 0.97);',
      '}',
    ].join('\n'),
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  })
  const water = new THREE.Mesh(waterGeometry, waterMaterial)
  water.rotation.x = -Math.PI / 2
  water.position.set(0, -1.25, -1.45)
  water.renderOrder = 1
  scene.add(water)
  const waterLight = new THREE.PointLight(isLight ? 0x5ecfc4 : 0x4dc6bc, isLight ? 0.75 : 0.95, 6.5)
  waterLight.position.set(0, -0.15, -1.3)
  scene.add(waterLight)

  // ── Mountains (more varied, snow caps) ─────────────────────────────────────
  const mountainMat = new THREE.MeshStandardMaterial({ color: isLight ? 0x2d635c : 0x123e43, roughness: isLight ? 0.88 : 0.98, flatShading: true })
  const mountainMat2 = new THREE.MeshStandardMaterial({ color: isLight ? 0x3a7468 : 0x1a4a4e, roughness: isLight ? 0.9 : 1, flatShading: true })
  const snowMat = new THREE.MeshStandardMaterial({ color: isLight ? 0xe8f4ef : 0xc8e8e0, roughness: 0.82, flatShading: true })
  const peaks = [
    [-5.9, -0.42, -4.4, 1.55, 2.15, 1.25, 0], [-3.9, -0.42, -4.95, 2.25, 3.15, 1.1, 1],
    [-1.55, -0.52, -4.3, 1.7, 2.2, 1.0, 0], [0.45, -0.48, -4.7, 2.15, 2.95, 1.2, 1],
    [2.95, -0.52, -4.3, 1.65, 2.3, 1.05, 0], [5.2, -0.48, -4.7, 2.1, 2.75, 1.1, 1],
    [6.75, -0.62, -3.55, 1.4, 1.9, 1.05, 0], [-6.65, -0.68, -3.25, 1.25, 1.65, 0.95, 1],
    [-4.6, -0.7, -5.6, 1.15, 1.7, 0.9, 0], [4.0, -0.68, -5.5, 1.2, 1.8, 0.95, 1],
  ]
  peaks.forEach(([x, y, z, sx, sy, sz, variant], index) => {
    const mat = variant ? mountainMat2 : mountainMat
    const segs = 5 + (index % 3)
    const m = new THREE.Mesh(new THREE.ConeGeometry(1, 1, segs), mat)
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.y = index * 0.41
    m.castShadow = true; m.receiveShadow = true; scene.add(m)
    if (sy > 2.1) {
      const snow = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.32, 6), snowMat)
      snow.position.set(x, y + sy * 0.44, z); snow.scale.set(sx * 0.52, 1, sz * 0.52); scene.add(snow)
    }
  })

  // ── Pines (more layers + variation) ────────────────────────────────────────
  const trunkMat = new THREE.MeshStandardMaterial({ color: isLight ? 0x8b6540 : 0x815d39, roughness: 0.94 })
  const pineMatA = new THREE.MeshStandardMaterial({ color: isLight ? 0x1c5244 : 0x0a292e, roughness: isLight ? 0.86 : 0.98, flatShading: true })
  const pineMatB = new THREE.MeshStandardMaterial({ color: isLight ? 0x245c4c : 0x0e3238, roughness: isLight ? 0.88 : 1, flatShading: true })
  const addPine = (x, z, size = 1, seed = 0) => {
    const pine = new THREE.Group()
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.052, 0.46, 7), trunkMat)
    trunk.position.y = -1.05; pine.add(trunk)
    const layers = [
      [0.52, 0.95, 0.48], [0.28, 0.76, 0.38], [0.05, 0.56, 0.28], [-0.16, 0.38, 0.2], [-0.34, 0.24, 0.13],
    ]
    layers.forEach(([y, h, r], li) => {
      const mat = (seed + li) % 2 ? pineMatA : pineMatB
      const crown = new THREE.Mesh(new THREE.ConeGeometry(r * (0.92 + (seed % 5) * 0.02), h, 6 + (seed % 2)), mat)
      crown.position.y = y - 0.48
      crown.rotation.y = seed * 0.7 + li * 0.4
      crown.castShadow = true
      pine.add(crown)
    })
    pine.position.set(x, 0, z)
    pine.scale.setScalar(size)
    pine.rotation.y = seed * 1.3
    pine.traverse((p) => { if (p.isMesh) { p.castShadow = true; p.receiveShadow = true } })
    scene.add(pine)
  }
  // foreground / mid trees
  ;[
    [-5.25, 0.55, 1.12, 1], [-4.45, -0.3, 0.8, 2], [-3.55, 0.75, 0.74, 3], [-4.95, 1.35, 0.58, 4],
    [3.45, 0.65, 0.9, 5], [4.35, -0.05, 1.05, 6], [5.35, 0.75, 0.74, 7], [4.85, 1.45, 0.52, 8],
    [-2.85, -1.05, 0.6, 9], [2.55, -1.05, 0.64, 10], [-5.95, -1.05, 0.64, 11], [5.95, -1.05, 0.7, 12],
    [-1.85, 1.55, 0.48, 13], [1.95, 1.5, 0.5, 14], [-3.1, 1.9, 0.42, 15], [3.2, 1.85, 0.44, 16],
  ].forEach(([x, z, s, seed]) => addPine(x, z, s, seed))
  // dense side forests
  for (let row = 0; row < 6; row += 1) {
    const z = -3.6 + row * 0.58
    for (let side = -1; side <= 1; side += 2) {
      for (let tree = 0; tree < 6; tree += 1) {
        const sx = side * (4.05 + tree * 0.48 + (row % 2) * 0.22)
        const sz = z + ((tree * 3 + row) % 5) * 0.04
        addPine(sx, sz, 0.34 + ((tree + row * 4) % 6) * 0.09, tree + row * 7)
      }
    }
  }

  // ── Serge posts ────────────────────────────────────────────────────────────
  const sergeMat = new THREE.MeshStandardMaterial({ color: isLight ? 0xc9955a : 0xd1a46b, roughness: isLight ? 0.42 : 0.52, metalness: isLight ? 0.12 : 0.14 })
  const registerInteractive = (object, section) => {
    object.traverse((child) => { if (child.isMesh) { child.userData.section = section; interactiveTargets.push(child) } })
  }
  const addSerge = (x, z, scale, section) => {
    const serge = new THREE.Group()
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.088, 1.95, 10), sergeMat)
    post.position.y = -0.38; serge.add(post)
    ;[0.1, 0.38].forEach((y, index) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, index ? 0.95 : 0.72, 7), sergeMat)
      arm.position.set(index ? 0.09 : -0.06, y, 0); arm.rotation.z = Math.PI / 2; serge.add(arm)
    })
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 5), sergeMat)
    cap.position.y = 0.58; serge.add(cap)
    // small decorative bands
    ;[0.2, -0.15].forEach((by) => {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.012, 6, 16), sergeMat)
      band.position.y = by; band.rotation.x = Math.PI / 2; serge.add(band)
    })
    serge.position.set(x, 0, z); serge.scale.setScalar(scale)
    serge.traverse((p) => { if (p.isMesh) { p.castShadow = true; p.receiveShadow = true } })
    scene.add(serge); registerInteractive(serge, section)
  }
  addSerge(-2.45, 0.05, 0.84, 'about')
  addSerge(2.5, 0.0, 0.9, 'contact')

  // ── Stones + micro rocks ───────────────────────────────────────────────────
  const stoneMat = new THREE.MeshStandardMaterial({
    color: isLight ? 0x3aafa0 : 0x5bc8b8, emissive: isLight ? 0x1a6b62 : 0x0d534e,
    emissiveIntensity: isLight ? 0.2 : 0.52, roughness: 0.38, metalness: isLight ? 0.22 : 0.28,
  })
  const rockMat = new THREE.MeshStandardMaterial({ color: isLight ? 0x4a7a6a : 0x2a4a48, roughness: 0.92, flatShading: true })
  const stones = []
  ;[[-1.55, -0.98, 1.25], [-0.54, -1.02, 1.5], [0.62, -0.97, 1.25], [1.6, -0.99, 1.55], [0.1, -1.0, 1.85],
    [-1.1, -1.05, 1.7], [1.05, -1.04, 1.7]].forEach(([x, y, z], index) => {
    const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(index % 2 ? 0.16 : 0.21, 1), stoneMat)
    stone.position.set(x, y, z); stone.rotation.set(index * 0.4, index * 0.6, index * 0.2)
    stone.castShadow = true; scene.add(stone)
    if (index === 0 || index === 1) { stone.userData.section = index === 0 ? 'services' : 'projects'; interactiveTargets.push(stone) }
    stones.push({ mesh: stone, baseY: y, phase: index * 1.15 })
  })
  // scattered small rocks
  for (let i = 0; i < 18; i += 1) {
    const a = i * 2.4 + 0.3
    const r = 2.2 + (i % 5) * 0.55
    const rx = Math.cos(a) * r
    const rz = Math.sin(a) * r * 0.7 - 0.3
    if (Math.hypot(rx, rz + 1.4) < 2.0) continue // keep clear of water/center
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04 + (i % 4) * 0.015, 0), rockMat)
    rock.position.set(rx, -1.32 + (i % 3) * 0.01, rz)
    rock.rotation.set(i * 0.7, i * 1.1, i * 0.4)
    rock.castShadow = true; rock.receiveShadow = true
    scene.add(rock)
  }

  const hearth = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshStandardMaterial({
    color: 0xe9b86e, emissive: 0xd67f39, emissiveIntensity: isLight ? 1.15 : 1.75, roughness: 0.26,
  }))
  hearth.position.set(0, -0.75, 1.1); scene.add(hearth)

  // ── Sky elements ───────────────────────────────────────────────────────────
  if (!isLight) {
    const starPositions = new Float32Array(360)
    for (let i = 0; i < 120; i += 1) {
      starPositions[i * 3] = Math.sin(i * 127.1) * 8.0
      starPositions[i * 3 + 1] = 1.3 + ((i * 37) % 48) / 10
      starPositions[i * 3 + 2] = -6.0 + ((i * 19) % 36) / 10
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xd6f5e9, size: 0.032, transparent: true, opacity: 0.85, depthWrite: false })))
    const aurora = new THREE.Group()
    ;[0x67e8cb, 0x2eb4a6, 0x5a9dba, 0x8ad4c0].forEach((color, layer) => {
      const points = []
      for (let i = 0; i <= 22; i += 1) {
        points.push(new THREE.Vector3(
          -6.2 + i * 0.58,
          1.95 + Math.sin(i * 0.5 + layer * 0.9) * (0.5 + layer * 0.11) + layer * 0.2,
          -3.5 - layer * 0.38 + Math.cos(i * 0.4 + layer) * 0.2
        ))
      }
      aurora.add(new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 96, 0.032 + layer * 0.01, 6, false),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.32 - layer * 0.05, depthWrite: false, blending: THREE.AdditiveBlending })
      ))
    })
    scene.add(aurora)
  } else {
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.38, depthWrite: false })
    ;[[-3.2, 3.3, -4.2], [2.8, 3.6, -5.1], [0.2, 3.9, -3.6], [-1.5, 3.5, -5.5], [4.0, 3.4, -3.8]].forEach(([x, y, z], i) => {
      const cloud = new THREE.Group()
      ;[[0, 0, 0, 0.52], [0.42, 0.06, 0.12, 0.36], [-0.38, 0.03, -0.1, 0.32], [0.15, -0.04, -0.2, 0.28], [-0.2, 0.08, 0.18, 0.26]].forEach(([cx, cy, cz, r]) => {
        const s = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 7), cloudMat)
        s.position.set(cx, cy, cz); cloud.add(s)
      })
      cloud.position.set(x, y, z); cloud.scale.setScalar(1 + i * 0.12); scene.add(cloud)
    })
  }

  return { waterMaterial, stones, hearth, interactiveTargets }
}

export function buildPlayer(isLight) {
  const player = new THREE.Group()
  const bodyMat = new THREE.MeshStandardMaterial({ color: isLight ? 0x1a8a7a : 0x16796f, roughness: 0.7, metalness: 0.07 })
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xe9b86e, roughness: 0.38, metalness: 0.18 })
  const faceMat = new THREE.MeshStandardMaterial({ color: 0xe4c5a0, roughness: 0.76 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x09232d, roughness: 0.9 })
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.23, 0.48, 9), bodyMat)
  torso.position.y = 0.43; player.add(torso)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 9), faceMat)
  head.position.y = 0.78; player.add(head)
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.16, 9, 7, 0, Math.PI * 2, 0, Math.PI * 0.62), darkMat)
  hood.position.set(0, 0.82, -0.025); player.add(hood)
  const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.075, 0.21), trimMat)
  scarf.position.set(0, 0.59, 0.015); player.add(scarf)
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.28, 0.12), darkMat)
  pack.position.set(0, 0.43, -0.19); player.add(pack)
  const legMat = new THREE.MeshStandardMaterial({ color: 0x102d35, roughness: 0.95 })
  const legPivots = [], armPivots = []
  ;[-0.09, 0.09].forEach((x) => {
    const pivot = new THREE.Group(); pivot.position.set(x, 0.25, 0)
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.25, 8), legMat)
    leg.position.y = -0.12
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.19), darkMat)
    boot.position.set(0, -0.23, 0.035); pivot.add(leg, boot); player.add(pivot); legPivots.push(pivot)
  })
  ;[-0.22, 0.22].forEach((x) => {
    const pivot = new THREE.Group(); pivot.position.set(x, 0.55, 0)
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.29, 8), bodyMat)
    sleeve.position.y = -0.13; pivot.add(sleeve); player.add(pivot); armPivots.push(pivot)
  })
  const feetHalo = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.3, 36), new THREE.MeshBasicMaterial({
    color: isLight ? 0x2a9d8f : 0x75e0cf, transparent: true, opacity: 0.65, side: THREE.DoubleSide,
  }))
  feetHalo.rotation.x = -Math.PI / 2; feetHalo.position.y = 0.025; player.add(feetHalo)
  player.position.set(0.05, -1.34, 2.1)
  player.traverse((p) => { if (p.isMesh) p.castShadow = true })
  return { player, legPivots, armPivots, feetHalo, basePlayerY: -1.34 }
}
