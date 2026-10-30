// @ts-nocheck
import * as THREE from 'three'

/** High-detail Sakha landscape (terrain, water, mountains, forest, grass, serge, stones). */
export function buildSakhaWorld(scene, isLight) {
  const interactiveTargets = []

  // ── Terrain (multi-octave, higher res + micro variation) ─────────────────
  const groundGeometry = new THREE.BufferGeometry()
  const groundSegments = 144
  const groundRings = 40
  const groundPositions = [0, 0, 0]
  const groundColors = []
  const c0 = new THREE.Color(isLight ? 0x579d69 : 0x1b5147)
  groundColors.push(c0.r, c0.g, c0.b)
  for (let ring = 1; ring <= groundRings; ring += 1) {
    const radius = 9.4 * ring / groundRings
    for (let segment = 0; segment < groundSegments; segment += 1) {
      const angle = segment / groundSegments * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const e1 = Math.sin(x * 1.38 + z * 0.72) * 0.078
      const e2 = Math.cos(z * 2.42 - x * 0.58) * 0.042
      const e3 = Math.sin(x * 4.1 + z * 3.25) * 0.016
      const e4 = Math.sin(x * 7.8 - z * 5.9) * 0.007
      const e5 = Math.cos(x * 11.2 + z * 9.4) * 0.003
      const falloff = 1 - ring / (groundRings * 1.26)
      const elevation = (e1 + e2 + e3 + e4 + e5) * falloff
      groundPositions.push(x, z, elevation)
      const base = isLight ? 0x579d69 : 0x1b5147
      const edge = isLight ? 0x9bc89a : 0x0a2830
      const high = isLight ? 0x9bcf82 : 0x4a7b5a
      const moss = isLight ? 0x8a9a7a : 0x2a4038
      const darkPatch = isLight ? 0x4a7a5c : 0x14302c
      const color = new THREE.Color(base).lerp(new THREE.Color(edge), Math.min(0.84, radius / 12.5))
      color.lerp(new THREE.Color(high), Math.max(0, elevation) * (isLight ? 2.8 : 1.85))
      if ((segment + ring * 11) % 13 === 0) color.lerp(new THREE.Color(moss), 0.3)
      if ((segment * 3 + ring) % 17 === 0) color.lerp(new THREE.Color(darkPatch), 0.2)
      if ((segment + ring * 5) % 23 === 0) color.lerp(new THREE.Color(isLight ? 0x9bb88a : 0x3a5548), 0.15)
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
    color: 0xffffff, vertexColors: true, roughness: isLight ? 0.76 : 0.9, metalness: isLight ? 0.02 : 0.03,
  }))
  ground.position.y = -1.36
  ground.scale.set(1, 0.72, 1)
  ground.receiveShadow = true
  scene.add(ground)

  // Contour rings
  const contourMat = new THREE.MeshBasicMaterial({
    color: isLight ? 0x2a9d8f : 0x75e0cf, transparent: true, opacity: isLight ? 0.16 : 0.11, side: THREE.DoubleSide, depthWrite: false,
  })
  ;[1.7, 2.7, 3.8, 4.9, 6.0, 7.1, 8.2].forEach((radius) => {
    const contour = new THREE.Mesh(new THREE.RingGeometry(radius - 0.011, radius, 128), contourMat)
    contour.rotation.x = -Math.PI / 2
    contour.position.y = -1.32
    contour.scale.set(1, 0.72, 1)
    scene.add(contour)
  })

  // ── Water (richer multi-layer waves + foam) ────────────────────────────────
  const waterGeometry = new THREE.CircleGeometry(1, 220)
  waterGeometry.scale(2.58, 0.9, 1)
  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(isLight ? 0x187a8a : 0x0b3640) },
      uMid: { value: new THREE.Color(isLight ? 0x36a49c : 0x185654) },
      uGlint: { value: new THREE.Color(isLight ? 0xd0f8ef : 0x9cebd9) },
      uFoam: { value: new THREE.Color(isLight ? 0xeafef8 : 0xc8f5e8) },
    },
    vertexShader: [
      'uniform float uTime;', 'varying vec2 vUv;', 'varying vec3 vPos;',
      'void main() {',
      'vUv = uv; vec3 p = position;',
      'p.z += sin(p.x * 5.4 + uTime * 0.92) * 0.017;',
      'p.z += sin(p.y * 8.4 - uTime * 0.78) * 0.011;',
      'p.z += sin((p.x + p.y) * 3.8 + uTime * 1.2) * 0.0065;',
      'p.z += sin(p.x * 13.0 + p.y * 9.5 + uTime * 1.45) * 0.0035;',
      'p.z += cos(p.x * 2.1 - p.y * 4.2 + uTime * 0.55) * 0.004;',
      'vec4 wp = modelMatrix * vec4(p, 1.0); vPos = wp.xyz;',
      'gl_Position = projectionMatrix * viewMatrix * wp;',
      '}',
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime;', 'uniform vec3 uDeep;', 'uniform vec3 uMid;', 'uniform vec3 uGlint;', 'uniform vec3 uFoam;',
      'varying vec2 vUv;', 'varying vec3 vPos;',
      'void main() {',
      'float wA = sin(vPos.x * 7.6 + uTime * 0.72 + cos(vPos.z * 5.4)) * 0.5 + 0.5;',
      'float wB = sin(vPos.z * 11.0 - uTime * 0.5) * 0.5 + 0.5;',
      'float wC = sin((vPos.x + vPos.z) * 4.2 + uTime * 0.95) * 0.5 + 0.5;',
      'float wD = sin(vPos.x * 15.0 - vPos.z * 12.0 + uTime * 1.3) * 0.5 + 0.5;',
      'float glint = smoothstep(0.76, 0.97, wA * 0.42 + wB * 0.28 + wC * 0.18 + wD * 0.12);',
      'float foam = smoothstep(0.88, 0.99, wA * 0.35 + wB * 0.35 + wC * 0.3) * 0.55;',
      'float edge = 1.0 - smoothstep(0.28, 0.52, length(vUv - vec2(0.5)));',
      'vec3 col = mix(uDeep, uMid, edge * 0.38 + wA * 0.14);',
      'col = mix(col, uGlint, glint * 0.34 + edge * 0.08);',
      'col = mix(col, uFoam, foam * edge * 0.45);',
      'gl_FragColor = vec4(col, 0.965);',
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

  // ── Mountains (more peaks, secondary cones, better snow) ───────────────────
  const mountainMatA = new THREE.MeshStandardMaterial({ color: isLight ? 0x2d635c : 0x123e43, roughness: isLight ? 0.88 : 1, flatShading: true })
  const mountainMatB = new THREE.MeshStandardMaterial({ color: isLight ? 0x245850 : 0x0e353a, roughness: isLight ? 0.9 : 1, flatShading: true })
  const snowMat = new THREE.MeshStandardMaterial({ color: isLight ? 0xe8f4ef : 0xc8e8e0, roughness: 0.82, flatShading: true })
  const mountainData = [
    [-5.9, -0.42, -4.4, 1.55, 2.15, 1.25, 0], [-3.9, -0.42, -4.9, 2.2, 3.15, 1.1, 1],
    [-1.55, -0.52, -4.3, 1.7, 2.2, 0.98, 0], [0.45, -0.48, -4.7, 2.1, 2.95, 1.18, 1],
    [2.95, -0.52, -4.3, 1.65, 2.3, 1.05, 0], [5.2, -0.48, -4.7, 2.1, 2.75, 1.1, 1],
    [6.7, -0.62, -3.6, 1.4, 1.9, 1.05, 0], [-6.6, -0.68, -3.3, 1.25, 1.65, 0.95, 1],
    [-4.6, -0.7, -5.5, 1.1, 1.45, 0.85, 0], [3.8, -0.68, -5.4, 1.15, 1.55, 0.9, 1],
  ]
  mountainData.forEach(([x, y, z, sx, sy, sz, matIdx], index) => {
    const mat = matIdx ? mountainMatB : mountainMatA
    const segs = 5 + (index % 3)
    const m = new THREE.Mesh(new THREE.ConeGeometry(1, 1, segs), mat)
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.y = index * 0.41
    m.castShadow = true; m.receiveShadow = true; scene.add(m)
    if (sy > 2.0) {
      const shoulder = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.7, 5), mat)
      shoulder.position.set(x + sx * 0.35, y + sy * 0.12, z + 0.15)
      shoulder.scale.set(sx * 0.55, sy * 0.35, sz * 0.55)
      shoulder.rotation.y = index * 0.7
      shoulder.castShadow = true; scene.add(shoulder)
    }
    if (sy > 2.2) {
      const snow = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.32, 6), snowMat)
      snow.position.set(x, y + sy * 0.44, z)
      snow.scale.set(sx * 0.52, 1, sz * 0.52)
      scene.add(snow)
      const snow2 = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.18, 5), snowMat)
      snow2.position.set(x + sx * 0.12, y + sy * 0.38, z - 0.08)
      snow2.scale.set(sx * 0.35, 0.9, sz * 0.35)
      scene.add(snow2)
    }
  })

  // ── Pines (5–6 crown tiers, color variation, denser stands) ────────────────
  const trunkMat = new THREE.MeshStandardMaterial({ color: isLight ? 0x8b6540 : 0x815d39, roughness: 0.94 })
  const pineMatA = new THREE.MeshStandardMaterial({ color: isLight ? 0x286c43 : 0x0a292e, roughness: isLight ? 0.86 : 1, flatShading: true })
  const pineMatB = new THREE.MeshStandardMaterial({ color: isLight ? 0x1d5c39 : 0x082228, roughness: isLight ? 0.88 : 1, flatShading: true })
  const addPine = (x, z, size = 1, seed = 0) => {
    const pine = new THREE.Group()
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.028 * size, 0.052 * size, 0.48 * size, 7), trunkMat)
    trunk.position.y = -1.05
    pine.add(trunk)
    const tiers = [
      [0.52, 0.95, 0.48], [0.28, 0.78, 0.38], [0.06, 0.58, 0.28],
      [-0.14, 0.4, 0.2], [-0.3, 0.26, 0.13], [-0.42, 0.16, 0.08],
    ]
    tiers.forEach(([y, h, r], ti) => {
      const mat = (seed + ti) % 2 ? pineMatA : pineMatB
      const crown = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6 + (ti % 2)), mat)
      crown.position.y = y - 0.48
      crown.rotation.y = (seed * 0.7 + ti * 0.35) % (Math.PI * 2)
      crown.castShadow = true
      pine.add(crown)
    })
    pine.position.set(x, 0, z)
    pine.scale.setScalar(size)
    pine.rotation.y = seed * 1.7
    pine.traverse((p) => { if (p.isMesh) { p.castShadow = true; p.receiveShadow = true } })
    scene.add(pine)
  }
  ;[
    [-5.3, 0.55, 1.12, 1], [-4.5, -0.3, 0.82, 2], [-3.55, 0.75, 0.76, 3], [-5.0, 1.35, 0.58, 4],
    [3.45, 0.65, 0.92, 5], [4.35, -0.05, 1.05, 6], [5.35, 0.75, 0.75, 7], [4.85, 1.45, 0.52, 8],
    [-2.85, -1.05, 0.62, 9], [2.55, -1.05, 0.66, 10], [-6.0, -1.05, 0.64, 11], [6.0, -1.05, 0.7, 12],
    [-1.85, 1.55, 0.48, 13], [1.95, 1.5, 0.5, 14], [-3.2, 1.9, 0.42, 15], [3.1, 1.85, 0.44, 16],
  ].forEach(([x, z, s, seed]) => addPine(x, z, s, seed))
  for (let row = 0; row < 6; row += 1) {
    const z = -3.55 + row * 0.58
    for (let side = -1; side <= 1; side += 2) {
      for (let tree = 0; tree < 6; tree += 1) {
        const x = side * (4.05 + tree * 0.5 + (row % 2) * 0.22 + ((tree * 3 + row) % 5) * 0.04)
        const s = 0.34 + ((tree + row * 3) % 6) * 0.09
        addPine(x, z + ((tree * 7) % 5) * 0.04, s, tree * 11 + row * 3)
      }
    }
  }
  for (let i = 0; i < 14; i += 1) {
    const t = i / 13
    addPine(-6.2 + t * 12.4, -5.2 + Math.sin(i * 1.7) * 0.35, 0.28 + (i % 4) * 0.08, i * 17)
  }

  // ── Grass tufts near water and path ────────────────────────────────────────
  const grassMat = new THREE.MeshStandardMaterial({
    color: isLight ? 0x3a8f5c : 0x1a4a38, roughness: 0.92, flatShading: true, side: THREE.DoubleSide,
  })
  const grassMat2 = new THREE.MeshStandardMaterial({
    color: isLight ? 0x4aa06a : 0x225544, roughness: 0.9, flatShading: true, side: THREE.DoubleSide,
  })
  const addGrassClump = (x, z, scale = 1, seed = 0) => {
    const clump = new THREE.Group()
    for (let b = 0; b < 5; b += 1) {
      const h = (0.12 + (b % 3) * 0.04) * scale
      const blade = new THREE.Mesh(
        new THREE.ConeGeometry(0.012 * scale, h, 3),
        (seed + b) % 2 ? grassMat : grassMat2
      )
      blade.position.set(
        Math.cos(b * 1.4 + seed) * 0.04 * scale,
        -1.28 + h * 0.5,
        Math.sin(b * 1.4 + seed) * 0.04 * scale
      )
      blade.rotation.z = (b - 2) * 0.18
      blade.rotation.x = (seed % 3 - 1) * 0.08
      clump.add(blade)
    }
    clump.position.set(x, 0, z)
    scene.add(clump)
  }
  const grassSpots = [
    [-1.8, -0.6], [-1.2, -0.9], [-0.5, -0.7], [0.4, -0.85], [1.1, -0.65], [1.7, -0.95],
    [-2.2, 0.4], [-1.6, 0.7], [1.5, 0.55], [2.1, 0.35], [-0.8, 1.2], [0.9, 1.15],
    [-3.0, -0.2], [2.9, -0.15], [-2.5, 1.1], [2.4, 1.0],
  ]
  grassSpots.forEach(([x, z], i) => {
    addGrassClump(x, z, 0.9 + (i % 4) * 0.15, i * 3)
    if (i % 2 === 0) addGrassClump(x + 0.22, z + 0.15, 0.7, i * 5 + 1)
  })

  // ── Serge posts (traditional with rings) ───────────────────────────────────
  const sergeMat = new THREE.MeshStandardMaterial({
    color: isLight ? 0xc9955a : 0xd1a46b, roughness: isLight ? 0.42 : 0.52, metalness: isLight ? 0.12 : 0.14,
  })
  const sergeDark = new THREE.MeshStandardMaterial({
    color: isLight ? 0xa87840 : 0xb08048, roughness: 0.55, metalness: 0.08,
  })
  const registerInteractive = (object, section) => {
    object.traverse((child) => { if (child.isMesh) { child.userData.section = section; interactiveTargets.push(child) } })
  }
  const addSerge = (x, z, scale, section) => {
    const serge = new THREE.Group()
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.088, 1.95, 10), sergeMat)
    post.position.y = -0.38; serge.add(post)
    ;[0.15, 0.42, 0.72].forEach((y) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 16), sergeDark)
      ring.position.y = y; ring.rotation.x = Math.PI / 2; serge.add(ring)
    })
    ;[0.08, 0.38].forEach((y, index) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, index ? 0.95 : 0.72, 7), sergeMat)
      arm.position.set(index ? 0.1 : -0.06, y, 0); arm.rotation.z = Math.PI / 2; serge.add(arm)
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), sergeDark)
      tip.position.set(index ? 0.55 : -0.42, y, 0); serge.add(tip)
    })
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), sergeMat)
    cap.position.y = 0.58; serge.add(cap)
    const topSpike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 5), sergeDark)
    topSpike.position.y = 0.68; serge.add(topSpike)
    serge.position.set(x, 0, z); serge.scale.setScalar(scale)
    serge.traverse((p) => { if (p.isMesh) { p.castShadow = true; p.receiveShadow = true } })
    scene.add(serge); registerInteractive(serge, section)
  }
  addSerge(-2.45, 0.05, 0.86, 'about')
  addSerge(2.5, 0.0, 0.92, 'contact')

  // ── Stones (interactive + scatter) ─────────────────────────────────────────
  const stoneMat = new THREE.MeshStandardMaterial({
    color: isLight ? 0x3aafa0 : 0x5bc8b8, emissive: isLight ? 0x1a6b62 : 0x0d534e,
    emissiveIntensity: isLight ? 0.08 : 0.52, roughness: 0.38, metalness: isLight ? 0.22 : 0.28,
  })
  const rockMat = new THREE.MeshStandardMaterial({
    color: isLight ? 0x6a8a7a : 0x2a4038, roughness: 0.92, flatShading: true,
  })
  const stones = []
  ;[[-1.55, -0.98, 1.25], [-0.54, -1.02, 1.5], [0.62, -0.97, 1.25], [1.6, -0.99, 1.55], [0.1, -1.0, 1.85], [-0.9, -0.96, 1.7]].forEach(([x, y, z], index) => {
    const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(index % 2 ? 0.16 : 0.21, 1), stoneMat)
    stone.position.set(x, y, z); stone.rotation.set(index * 0.4, index * 0.6, index * 0.2)
    stone.castShadow = true; scene.add(stone)
    if (index <= 2) {
      stone.userData.section = ['services', 'projects', 'skills'][index]
      interactiveTargets.push(stone)
    }
    stones.push({ mesh: stone, baseY: y, phase: index * 1.15 })
  })
  for (let i = 0; i < 22; i += 1) {
    const a = (i / 22) * Math.PI * 2 + 0.4
    const r = 2.8 + (i % 5) * 0.55 + (i % 3) * 0.2
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.06 + (i % 4) * 0.025, 0),
      rockMat
    )
    rock.position.set(Math.cos(a) * r, -1.28 + (i % 3) * 0.01, Math.sin(a) * r * 0.7 - 0.3)
    rock.rotation.set(i * 0.5, i * 0.8, i * 0.3)
    rock.castShadow = true
    scene.add(rock)
  }

  const hearth = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshStandardMaterial({
    color: 0xe9b86e, emissive: 0xd67f39, emissiveIntensity: isLight ? 0.45 : 1.75, roughness: 0.26,
  }))
  hearth.position.set(0, -0.75, 1.1); scene.add(hearth)
  ;[[-0.18, -0.95, 1.05], [0.2, -0.94, 1.08], [0.02, -0.96, 1.28]].forEach(([x, y, z], i) => {
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 0), rockMat)
    s.position.set(x, y, z); s.rotation.y = i; scene.add(s)
  })

  // ── Sky elements ───────────────────────────────────────────────────────────
  if (!isLight) {
    const starPositions = new Float32Array(420)
    for (let i = 0; i < 140; i += 1) {
      starPositions[i * 3] = Math.sin(i * 127.1) * 8.2
      starPositions[i * 3 + 1] = 1.25 + ((i * 37) % 52) / 10
      starPositions[i * 3 + 2] = -6.2 + ((i * 19) % 40) / 10
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({
      color: 0xd6f5e9, size: 0.03, transparent: true, opacity: 0.88, depthWrite: false,
    })))
    const aurora = new THREE.Group()
    ;[0x67e8cb, 0x2eb4a6, 0x5a9dba, 0x8ad4c0].forEach((color, layer) => {
      const points = []
      for (let i = 0; i <= 24; i += 1) {
        points.push(new THREE.Vector3(
          -6.4 + i * 0.55,
          1.9 + Math.sin(i * 0.48 + layer * 0.95) * (0.52 + layer * 0.12) + layer * 0.18,
          -3.55 - layer * 0.36 + Math.cos(i * 0.38 + layer) * 0.22
        ))
      }
      aurora.add(new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 100, 0.03 + layer * 0.011, 6, false),
        new THREE.MeshBasicMaterial({
          color, transparent: true, opacity: 0.3 - layer * 0.048, depthWrite: false, blending: THREE.AdditiveBlending,
        })
      ))
    })
    scene.add(aurora)
  } else {
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.36, depthWrite: false })
    ;[[-3.2, 3.35, -4.2], [2.8, 3.65, -5.1], [0.2, 3.95, -3.6], [-1.5, 3.55, -5.5], [4.0, 3.45, -3.8], [-4.5, 3.7, -4.8]].forEach(([x, y, z], i) => {
      const cloud = new THREE.Group()
      ;[[0, 0, 0, 0.52], [0.42, 0.06, 0.12, 0.36], [-0.38, 0.03, -0.1, 0.32], [0.15, -0.04, -0.2, 0.28], [-0.2, 0.08, 0.18, 0.26], [0.28, -0.02, -0.15, 0.22]].forEach(([cx, cy, cz, r]) => {
        const s = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 7), cloudMat)
        s.position.set(cx, cy, cz); cloud.add(s)
      })
      cloud.position.set(x, y, z); cloud.scale.setScalar(1 + i * 0.1); scene.add(cloud)
    })
  }

  return { waterMaterial, stones, hearth, interactiveTargets }
}

export function buildPlayer(isLight) {
  const player = new THREE.Group()
  const bodyMat = new THREE.MeshStandardMaterial({ color: isLight ? 0x1a8a7a : 0x16796f, roughness: 0.68, metalness: 0.08 })
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xe9b86e, roughness: 0.36, metalness: 0.2 })
  const faceMat = new THREE.MeshStandardMaterial({ color: 0xe4c5a0, roughness: 0.74 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x09232d, roughness: 0.9 })
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.23, 0.48, 10), bodyMat)
  torso.position.y = 0.43; player.add(torso)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 10), faceMat)
  head.position.y = 0.78; player.add(head)
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), darkMat)
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
