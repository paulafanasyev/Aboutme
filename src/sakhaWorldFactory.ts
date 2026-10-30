// @ts-nocheck
import * as THREE from 'three'

/** Build high-detail Sakha landscape into an existing scene. */
export function buildSakhaWorld(scene, isLight) {
  const interactiveTargets = []

  const groundGeometry = new THREE.BufferGeometry()
  const groundSegments = 96
  const groundRings = 28
  const groundPositions = [0, 0, 0]
  const groundColors = []
  const c0 = new THREE.Color(isLight ? 0x3f916c : 0x1b5147)
  groundColors.push(c0.r, c0.g, c0.b)
  for (let ring = 1; ring <= groundRings; ring += 1) {
    const radius = 8.6 * ring / groundRings
    for (let segment = 0; segment < groundSegments; segment += 1) {
      const angle = segment / groundSegments * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const e1 = Math.sin(x * 1.55 + z * 0.62) * 0.065
      const e2 = Math.cos(z * 2.1 - x * 0.52) * 0.035
      const e3 = Math.sin(x * 3.4 + z * 2.8) * 0.012
      const elevation = (e1 + e2 + e3) * (1 - ring / (groundRings * 1.32))
      groundPositions.push(x, z, elevation)
      const base = isLight ? 0x3f916c : 0x1b5147
      const edge = isLight ? 0x7eb89a : 0x0a2830
      const high = isLight ? 0x6fbf8c : 0x4a7b5a
      const color = new THREE.Color(base).lerp(new THREE.Color(edge), Math.min(0.78, radius / 11))
      color.lerp(new THREE.Color(high), Math.max(0, elevation) * (isLight ? 2.4 : 1.6))
      if ((segment + ring * 7) % 11 === 0) color.lerp(new THREE.Color(isLight ? 0x8a9a7a : 0x2a4038), 0.22)
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
    color: 0xffffff, vertexColors: true, roughness: isLight ? 0.8 : 0.88, metalness: isLight ? 0.02 : 0.04,
  }))
  ground.position.y = -1.36
  ground.scale.set(1, 0.72, 1)
  ground.receiveShadow = true
  scene.add(ground)

  const contourMat = new THREE.MeshBasicMaterial({
    color: isLight ? 0x2a9d8f : 0x75e0cf, transparent: true, opacity: isLight ? 0.2 : 0.13, side: THREE.DoubleSide, depthWrite: false,
  })
  ;[2.0, 3.2, 4.5, 5.7, 6.9].forEach((radius) => {
    const contour = new THREE.Mesh(new THREE.RingGeometry(radius - 0.014, radius, 96), contourMat)
    contour.rotation.x = -Math.PI / 2
    contour.position.y = -1.32
    contour.scale.set(1, 0.72, 1)
    scene.add(contour)
  })

  const waterGeometry = new THREE.CircleGeometry(1, 160)
  waterGeometry.scale(2.5, 0.85, 1)
  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(isLight ? 0x1a7f8e : 0x0c3b45) },
      uMid: { value: new THREE.Color(isLight ? 0x3aa8a0 : 0x1a5a58) },
      uGlint: { value: new THREE.Color(isLight ? 0xd0f8ef : 0x9cebd9) },
    },
    vertexShader: [
      'uniform float uTime;', 'varying vec2 vUv;', 'varying vec3 vPos;',
      'void main() {',
      'vUv = uv; vec3 p = position;',
      'p.z += sin(p.x * 4.8 + uTime * 0.85) * 0.014;',
      'p.z += sin(p.y * 7.5 - uTime * 0.7) * 0.009;',
      'p.z += sin((p.x + p.y) * 3.2 + uTime * 1.1) * 0.005;',
      'vec4 wp = modelMatrix * vec4(p, 1.0); vPos = wp.xyz;',
      'gl_Position = projectionMatrix * viewMatrix * wp;',
      '}',
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime;', 'uniform vec3 uDeep;', 'uniform vec3 uMid;', 'uniform vec3 uGlint;',
      'varying vec2 vUv;', 'varying vec3 vPos;',
      'void main() {',
      'float wA = sin(vPos.x * 7.4 + uTime * 0.7 + cos(vPos.z * 5.2)) * 0.5 + 0.5;',
      'float wB = sin(vPos.z * 10.5 - uTime * 0.48) * 0.5 + 0.5;',
      'float wC = sin((vPos.x + vPos.z) * 4.0 + uTime * 0.9) * 0.5 + 0.5;',
      'float glint = smoothstep(0.78, 0.98, wA * 0.5 + wB * 0.3 + wC * 0.2);',
      'float edge = 1.0 - smoothstep(0.3, 0.5, length(vUv - vec2(0.5)));',
      'vec3 col = mix(uDeep, uMid, edge * 0.35 + wA * 0.15);',
      'col = mix(col, uGlint, glint * 0.32 + edge * 0.1);',
      'gl_FragColor = vec4(col, 0.96);',
      '}',
    ].join('\n'),
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  })
  const water = new THREE.Mesh(waterGeometry, waterMaterial)
  water.rotation.x = -Math.PI / 2
  water.position.set(0, -1.25, -1.45)
  water.renderOrder = 1
  scene.add(water)
  const waterLight = new THREE.PointLight(isLight ? 0x5ecfc4 : 0x4dc6bc, isLight ? 0.7 : 0.9, 6)
  waterLight.position.set(0, -0.2, -1.3)
  scene.add(waterLight)

  const mountainMat = new THREE.MeshStandardMaterial({ color: isLight ? 0x2d635c : 0x123e43, roughness: isLight ? 0.9 : 1, flatShading: true })
  const snowMat = new THREE.MeshStandardMaterial({ color: isLight ? 0xe8f4ef : 0xc8e8e0, roughness: 0.85, flatShading: true })
  ;[
    [-5.8, -0.45, -4.3, 1.5, 2.05, 1.2], [-3.8, -0.45, -4.8, 2.15, 3.0, 1.05],
    [-1.5, -0.55, -4.2, 1.65, 2.1, 0.95], [0.4, -0.5, -4.6, 2.05, 2.85, 1.15],
    [2.9, -0.55, -4.2, 1.6, 2.2, 1.0], [5.1, -0.5, -4.6, 2.05, 2.65, 1.05],
    [6.6, -0.65, -3.5, 1.35, 1.8, 1.0], [-6.5, -0.7, -3.2, 1.2, 1.55, 0.9],
  ].forEach(([x, y, z, sx, sy, sz], index) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(1, 1, index % 2 ? 5 : 6), mountainMat)
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.y = index * 0.37
    m.castShadow = true; m.receiveShadow = true; scene.add(m)
    if (sy > 2.3) {
      const snow = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.28, 5), snowMat)
      snow.position.set(x, y + sy * 0.42, z); snow.scale.set(sx * 0.55, 1, sz * 0.55); scene.add(snow)
    }
  })

  const trunkMat = new THREE.MeshStandardMaterial({ color: isLight ? 0x8b6540 : 0x815d39, roughness: 0.95 })
  const pineMat = new THREE.MeshStandardMaterial({ color: isLight ? 0x1c5244 : 0x0a292e, roughness: isLight ? 0.88 : 1, flatShading: true })
  const addPine = (x, z, size = 1) => {
    const pine = new THREE.Group()
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.055, 0.44, 6), trunkMat)
    trunk.position.y = -1.05; pine.add(trunk)
    ;[[0.5, 0.92, 0.46], [0.22, 0.72, 0.36], [-0.04, 0.52, 0.26], [-0.26, 0.34, 0.16]].forEach(([y, h, r]) => {
      const crown = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), pineMat)
      crown.position.y = y - 0.48; crown.castShadow = true; pine.add(crown)
    })
    pine.position.set(x, 0, z); pine.scale.setScalar(size)
    pine.traverse((p) => { if (p.isMesh) { p.castShadow = true; p.receiveShadow = true } })
    scene.add(pine)
  }
  ;[
    [-5.2, 0.6, 1.08], [-4.4, -0.25, 0.78], [-3.5, 0.8, 0.72], [-4.9, 1.4, 0.55],
    [3.4, 0.7, 0.88], [4.3, 0.0, 1.02], [5.3, 0.8, 0.72], [4.8, 1.5, 0.5],
    [-2.8, -1.0, 0.58], [2.5, -1.0, 0.62], [-5.9, -1.0, 0.62], [5.9, -1.0, 0.68],
    [-1.8, 1.6, 0.45], [1.9, 1.55, 0.48],
  ].forEach(([x, z, s]) => addPine(x, z, s))
  for (let row = 0; row < 5; row += 1) {
    const z = -3.5 + row * 0.62
    for (let side = -1; side <= 1; side += 2) {
      for (let tree = 0; tree < 5; tree += 1) {
        addPine(side * (4.15 + tree * 0.52 + (row % 2) * 0.2), z, 0.36 + ((tree + row * 3) % 5) * 0.1)
      }
    }
  }

  const sergeMat = new THREE.MeshStandardMaterial({ color: isLight ? 0xc9955a : 0xd1a46b, roughness: isLight ? 0.45 : 0.55, metalness: isLight ? 0.1 : 0.12 })
  const registerInteractive = (object, section) => {
    object.traverse((child) => { if (child.isMesh) { child.userData.section = section; interactiveTargets.push(child) } })
  }
  const addSerge = (x, z, scale, section) => {
    const serge = new THREE.Group()
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.09, 1.9, 8), sergeMat)
    post.position.y = -0.4; serge.add(post)
    ;[0.08, 0.36].forEach((y, index) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, index ? 0.9 : 0.68, 6), sergeMat)
      arm.position.set(index ? 0.08 : -0.05, y, 0); arm.rotation.z = Math.PI / 2; serge.add(arm)
    })
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), sergeMat)
    cap.position.y = 0.55; serge.add(cap)
    serge.position.set(x, 0, z); serge.scale.setScalar(scale)
    serge.traverse((p) => { if (p.isMesh) { p.castShadow = true; p.receiveShadow = true } })
    scene.add(serge); registerInteractive(serge, section)
  }
  addSerge(-2.45, 0.05, 0.84, 'about')
  addSerge(2.5, 0.0, 0.9, 'contact')

  const stoneMat = new THREE.MeshStandardMaterial({
    color: isLight ? 0x3aafa0 : 0x5bc8b8, emissive: isLight ? 0x1a6b62 : 0x0d534e,
    emissiveIntensity: isLight ? 0.22 : 0.55, roughness: 0.4, metalness: isLight ? 0.2 : 0.25,
  })
  const stones = []
  ;[[-1.55, -0.98, 1.25], [-0.54, -1.02, 1.5], [0.62, -0.97, 1.25], [1.6, -0.99, 1.55], [0.1, -1.0, 1.85]].forEach(([x, y, z], index) => {
    const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(index % 2 ? 0.17 : 0.22, 1), stoneMat)
    stone.position.set(x, y, z); stone.rotation.set(index * 0.4, index * 0.6, index * 0.2)
    stone.castShadow = true; scene.add(stone)
    if (index === 0 || index === 1) { stone.userData.section = index === 0 ? 'services' : 'projects'; interactiveTargets.push(stone) }
    stones.push({ mesh: stone, baseY: y, phase: index * 1.15 })
  })
  const hearth = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshStandardMaterial({
    color: 0xe9b86e, emissive: 0xd67f39, emissiveIntensity: isLight ? 1.2 : 1.8, roughness: 0.28,
  }))
  hearth.position.set(0, -0.75, 1.1); scene.add(hearth)

  if (!isLight) {
    const starPositions = new Float32Array(270)
    for (let i = 0; i < 90; i += 1) {
      starPositions[i * 3] = Math.sin(i * 127.1) * 7.2
      starPositions[i * 3 + 1] = 1.4 + ((i * 37) % 41) / 10
      starPositions[i * 3 + 2] = -5.5 + ((i * 19) % 30) / 10
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xd6f5e9, size: 0.035, transparent: true, opacity: 0.82, depthWrite: false })))
    const aurora = new THREE.Group()
    ;[0x67e8cb, 0x2eb4a6, 0x5a9dba].forEach((color, layer) => {
      const points = []
      for (let i = 0; i <= 18; i += 1) {
        points.push(new THREE.Vector3(-5.7 + i * 0.63, 2.0 + Math.sin(i * 0.54 + layer * 0.8) * (0.48 + layer * 0.12) + layer * 0.22, -3.4 - layer * 0.42 + Math.cos(i * 0.42 + layer) * 0.18))
      }
      aurora.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 84, 0.035 + layer * 0.012, 5, false), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.34 - layer * 0.055, depthWrite: false, blending: THREE.AdditiveBlending })))
    })
    scene.add(aurora)
  } else {
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false })
    ;[[-3, 3.2, -4], [2.5, 3.5, -5], [0, 3.8, -3.5]].forEach(([x, y, z], i) => {
      const cloud = new THREE.Group()
      ;[[0, 0, 0, 0.5], [0.4, 0.05, 0.1, 0.35], [-0.35, 0.02, -0.1, 0.3]].forEach(([cx, cy, cz, r]) => {
        const s = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), cloudMat)
        s.position.set(cx, cy, cz); cloud.add(s)
      })
      cloud.position.set(x, y, z); cloud.scale.setScalar(1 + i * 0.15); scene.add(cloud)
    })
  }

  return { waterMaterial, stones, hearth, interactiveTargets }
}

export function buildPlayer(isLight) {
  const player = new THREE.Group()
  const bodyMat = new THREE.MeshStandardMaterial({ color: isLight ? 0x1a8a7a : 0x16796f, roughness: 0.72, metalness: 0.06 })
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xe9b86e, roughness: 0.4, metalness: 0.16 })
  const faceMat = new THREE.MeshStandardMaterial({ color: 0xe4c5a0, roughness: 0.78 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x09232d, roughness: 0.9 })
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.23, 0.48, 8), bodyMat)
  torso.position.y = 0.43; player.add(torso)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 10, 8), faceMat)
  head.position.y = 0.78; player.add(head)
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.62), darkMat)
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
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.29, 7), bodyMat)
    sleeve.position.y = -0.13; pivot.add(sleeve); player.add(pivot); armPivots.push(pivot)
  })
  const feetHalo = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.3, 32), new THREE.MeshBasicMaterial({
    color: isLight ? 0x2a9d8f : 0x75e0cf, transparent: true, opacity: 0.65, side: THREE.DoubleSide,
  }))
  feetHalo.rotation.x = -Math.PI / 2; feetHalo.position.y = 0.025; player.add(feetHalo)
  player.position.set(0.05, -1.34, 2.1)
  player.traverse((p) => { if (p.isMesh) p.castShadow = true })
  return { player, legPivots, armPivots, feetHalo, basePlayerY: -1.34 }
}
