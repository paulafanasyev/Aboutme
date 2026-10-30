// @ts-nocheck
import * as THREE from 'three'

/** Grounded, stylized-realistic Yakut Bootur warrior with articulated armor. */
export function buildPlayer(isLight) {
  const player = new THREE.Group()

  const skin = new THREE.MeshStandardMaterial({ color: 0xe8c4a0, roughness: 0.72, metalness: 0.02 })
  const armor = new THREE.MeshStandardMaterial({
    color: isLight ? 0x1f6f62 : 0x145a52, roughness: 0.45, metalness: 0.35,
  })
  const armorDark = new THREE.MeshStandardMaterial({
    color: isLight ? 0x0f4a42 : 0x0a3530, roughness: 0.5, metalness: 0.4,
  })
  const gold = new THREE.MeshStandardMaterial({
    color: 0xe9b86e, roughness: 0.32, metalness: 0.55,
  })
  const leather = new THREE.MeshStandardMaterial({
    color: isLight ? 0x6b4428 : 0x5a3a22, roughness: 0.85, metalness: 0.05,
  })
  const fur = new THREE.MeshStandardMaterial({
    color: isLight ? 0xc8b090 : 0xa89070, roughness: 0.95, metalness: 0,
  })
  const cloth = new THREE.MeshStandardMaterial({
    color: isLight ? 0x1a5a50 : 0x123f3a, roughness: 0.8, metalness: 0.05,
  })
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 0.9 })
  const steel = new THREE.MeshStandardMaterial({
    color: isLight ? 0xb8c4cc : 0x8a98a4, roughness: 0.22, metalness: 0.92,
  })
  const steelDark = new THREE.MeshStandardMaterial({
    color: isLight ? 0x7a8894 : 0x5a6874, roughness: 0.3, metalness: 0.88,
  })
  const steelBright = new THREE.MeshStandardMaterial({
    color: isLight ? 0xdce4ea : 0xc0ccd4, roughness: 0.12, metalness: 0.95,
  })

  // ── Torso / breastplate (heroic Pixar proportions) ───────────────────────
  const torsoProfile = [
    new THREE.Vector2(0.16, -0.22), new THREE.Vector2(0.205, -0.16),
    new THREE.Vector2(0.22, -0.04), new THREE.Vector2(0.205, 0.1),
    new THREE.Vector2(0.17, 0.21), new THREE.Vector2(0, 0.22),
  ]
  const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoProfile, 28), armor)
  torso.position.y = 0.48
  player.add(torso)
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.205, 24, 18), armorDark)
  chest.position.set(0, 0.5, 0.115)
  chest.scale.set(1.0, 0.72, 0.38)
  player.add(chest)
  ;[0.58, 0.42].forEach((y) => {
    const chestTrim = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.012, 7, 24, Math.PI), gold)
    chestTrim.position.set(0, y, 0.145)
    chestTrim.rotation.z = Math.PI
    player.add(chestTrim)
  })
  const chestRidge = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.19, 0.012), gold)
  chestRidge.position.set(0, 0.5, 0.196)
  player.add(chestRidge)
  ;[-1, 1].forEach((side) => {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.7), armor)
    pad.position.set(side * 0.22, 0.62, 0)
    pad.scale.set(1.02, 0.66, 1.08)
    player.add(pad)
    const padRim = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 6, 14), gold)
    padRim.position.set(side * 0.22, 0.62, 0.02)
    padRim.rotation.x = Math.PI / 2
    player.add(padRim)
  })
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.06, 24), leather)
  belt.position.y = 0.28
  player.add(belt)
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.04), gold)
  buckle.position.set(0, 0.28, 0.23)
  player.add(buckle)
  ;[-0.1, 0.1].forEach((x) => {
    const flap = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.06), armorDark)
    flap.position.set(x, 0.18, 0.08)
    flap.rotation.x = 0.15
    player.add(flap)
  })
  const tabardShape = new THREE.Shape()
  tabardShape.moveTo(-0.115, 0.13)
  tabardShape.lineTo(0.115, 0.13)
  tabardShape.lineTo(0.1, -0.105)
  tabardShape.lineTo(0, -0.19)
  tabardShape.lineTo(-0.1, -0.105)
  tabardShape.closePath()
  const tabard = new THREE.Mesh(new THREE.ExtrudeGeometry(tabardShape, { depth: 0.018, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.008, bevelThickness: 0.006 }), leather)
  tabard.position.set(0, 0.18, 0.125)
  player.add(tabard)
  const tabardStripe = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.24, 0.012), gold)
  tabardStripe.position.set(0, 0.18, 0.154)
  player.add(tabardStripe)
  ;[-1, 1].forEach((side) => {
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.09, 0.065), leather)
    pouch.position.set(side * 0.18, 0.25, 0.06)
    player.add(pouch)
    const pouchFlap = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.024, 0.07), gold)
    pouchFlap.position.set(side * 0.18, 0.292, 0.067)
    player.add(pouchFlap)
  })

  // ── Head + warrior helmet ────────────────────────────────────────────────
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 24, 18), skin)
  head.position.y = 0.82
  head.scale.set(0.94, 1.08, 0.95)
  player.add(head)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.072, 0.12, 16), skin)
  neck.position.set(0, 0.69, 0)
  player.add(neck)
  ;[-1, 1].forEach((side) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), skin)
    ear.scale.set(0.62, 1, 0.7)
    ear.position.set(side * 0.132, 0.81, 0.005)
    player.add(ear)
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.023, 12, 10), new THREE.MeshStandardMaterial({ color: 0xf6eee0, roughness: 0.38 }))
    eyeWhite.scale.set(1.0, 0.68, 0.55)
    eyeWhite.position.set(side * 0.045, 0.84, 0.118)
    player.add(eyeWhite)
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 10), dark)
    iris.position.set(side * 0.045, 0.84, 0.132)
    player.add(iris)
    const catchlight = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }))
    catchlight.position.set(side * 0.045 - 0.003, 0.845, 0.141)
    player.add(catchlight)
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.012, 0.018), dark)
    brow.position.set(side * 0.045, 0.872, 0.115)
    brow.rotation.z = side * -0.12
    player.add(brow)
    const cheekHighlight = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshStandardMaterial({ color: 0xd9ae8d, roughness: 0.82 }))
    cheekHighlight.scale.set(1.0, 0.55, 0.35)
    cheekHighlight.position.set(side * 0.082, 0.795, 0.092)
    player.add(cheekHighlight)
  })
  const noseBridge = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), skin)
  noseBridge.scale.set(0.72, 1.45, 0.72)
  noseBridge.position.set(0, 0.824, 0.128)
  player.add(noseBridge)
  const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), skin)
  noseTip.scale.set(0.9, 0.7, 0.85)
  noseTip.position.set(0, 0.802, 0.145)
  player.add(noseTip)
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.155, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.44), armorDark)
  helm.position.set(0, 0.88, -0.01)
  player.add(helm)
  const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.034, 0.13, 7), gold)
  crest.position.set(0, 0.99, -0.015)
  player.add(crest)
  const helmetRidge = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.12, 0.19), steelDark)
  helmetRidge.position.set(0, 0.94, -0.01)
  player.add(helmetRidge)
  ;[-1, 1].forEach((side) => {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 10), armorDark)
    cheek.scale.set(0.55, 1.05, 0.72)
    cheek.position.set(side * 0.12, 0.78, 0.045)
    player.add(cheek)
    const cheekRivet = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), gold)
    cheekRivet.position.set(side * 0.135, 0.78, 0.105)
    player.add(cheekRivet)
  })
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 8, 16), fur)
  collar.position.set(0, 0.66, 0)
  collar.rotation.x = Math.PI / 2
  player.add(collar)

  // Fine Yakut-inspired craft details: etched chest bands, rivets and layered leather.
  ;[-1, 1].forEach((side) => {
    const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), gold)
    rivet.position.set(side * 0.115, 0.5, 0.19)
    player.add(rivet)
  })
  const moustacheMat = new THREE.MeshStandardMaterial({ color: 0x493629, roughness: 0.92 })
  ;[-1, 1].forEach((side) => {
    const moustache = new THREE.Mesh(new THREE.SphereGeometry(0.027, 10, 8), moustacheMat)
    moustache.scale.set(1.1, 0.42, 0.45)
    moustache.position.set(side * 0.022, 0.779, 0.137)
    moustache.rotation.z = side * -0.16
    player.add(moustache)
  })
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.006, 0.006), dark)
  mouth.position.set(0, 0.758, 0.137)
  player.add(mouth)
  const helmetBand = new THREE.Mesh(new THREE.TorusGeometry(0.132, 0.012, 8, 24), gold)
  helmetBand.position.set(0, 0.925, -0.005)
  helmetBand.rotation.x = Math.PI / 2
  player.add(helmetBand)
  const crestGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.035, 1), new THREE.MeshStandardMaterial({ color: 0x3eaaa0, roughness: 0.24, metalness: 0.45 }))
  crestGem.position.set(0, 0.965, 0.105)
  player.add(crestGem)

  // ── Pack ─────────────────────────────────────────────────────────────────
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.1), leather)
  pack.position.set(0, 0.48, -0.18)
  player.add(pack)
  const packSeam = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.012, 0.012), gold)
  packSeam.position.set(0, 0.55, -0.125)
  player.add(packSeam)
  const packStrap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.02), leather)
  packStrap.position.set(0.12, 0.52, -0.08)
  packStrap.rotation.x = 0.2
  player.add(packStrap)

  // ── Legs: thigh + knee + shin + boot ─────────────────────────────────────
  const legPivots = []
  ;[-0.1, 0.1].forEach((x) => {
    const pivot = new THREE.Group()
    pivot.position.set(x, 0.26, 0)
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.2, 12, 2), cloth)
    thigh.position.y = -0.1
    pivot.add(thigh)
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), armor)
    knee.position.y = -0.2
    pivot.add(knee)
    const kneeGuard = new THREE.Mesh(new THREE.SphereGeometry(0.062, 14, 10), armorDark)
    kneeGuard.scale.set(0.9, 0.72, 0.48)
    kneeGuard.position.set(0, -0.2, 0.045)
    pivot.add(kneeGuard)
    const kneeMark = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.012, 0.012), gold)
    kneeMark.position.set(0, -0.2, 0.077)
    pivot.add(kneeMark)
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.18, 8), armorDark)
    shin.position.y = -0.3
    pivot.add(shin)
    const boot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), leather)
    boot.scale.set(0.82, 0.62, 1.35)
    boot.position.set(0, -0.4, 0.045)
    pivot.add(boot)
    const bootCuff = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.012, 8, 14), gold)
    bootCuff.position.set(0, -0.34, 0.015)
    bootCuff.rotation.x = Math.PI / 2
    pivot.add(bootCuff)
    const bootTip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.06), leather)
    bootTip.position.set(0, -0.38, 0.1)
    pivot.add(bootTip)
    player.add(pivot)
    legPivots.push(pivot)
  })

  // ── Arms: shoulder → upper → elbow → forearm → hand ──────────────────────
  const armPivots = []
  ;[-1, 1].forEach((side) => {
    const pivot = new THREE.Group()
    pivot.position.set(side * 0.26, 0.6, 0)
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.18, 12, 2), armor)
    upper.position.y = -0.1
    pivot.add(upper)
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), armorDark)
    elbow.position.y = -0.2
    pivot.add(elbow)
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.16, 12, 2), armorDark)
    forearm.position.y = -0.3
    pivot.add(forearm)
    const bracer = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.04, 8), gold)
    bracer.position.y = -0.28
    pivot.add(bracer)
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 10), skin)
    hand.scale.set(0.82, 0.9, 0.72)
    hand.position.y = -0.4
    pivot.add(hand)
    ;[-1, -0.33, 0.33, 1].forEach((finger, index) => {
      const digit = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.025, 3, 6), skin)
      digit.position.set(finger * 0.021, -0.43 - (index === 1 || index === 2 ? 0.006 : 0), 0.014)
      digit.rotation.z = finger * 0.16
      pivot.add(digit)
    })

    // Realistic sword in right hand
    if (side === 1) {
      const sword = new THREE.Group()

      // Tapered blade: 4 segments, wider near guard → narrow at tip
      const bladeSegs = [
        { y: -0.08, w: 0.042, t: 0.014, h: 0.12 },
        { y: -0.2, w: 0.038, t: 0.012, h: 0.14 },
        { y: -0.34, w: 0.03, t: 0.01, h: 0.14 },
        { y: -0.46, w: 0.02, t: 0.008, h: 0.1 },
      ]
      bladeSegs.forEach(({ y, w, t, h }) => {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), steel)
        seg.position.y = y
        sword.add(seg)
        // edge bevels (slightly brighter, thinner)
        const edgeL = new THREE.Mesh(new THREE.BoxGeometry(0.006, h * 0.98, t * 0.7), steelBright)
        edgeL.position.set(-w * 0.48, y, 0)
        sword.add(edgeL)
        const edgeR = new THREE.Mesh(new THREE.BoxGeometry(0.006, h * 0.98, t * 0.7), steelBright)
        edgeR.position.set(w * 0.48, y, 0)
        sword.add(edgeR)
      })

      // Fuller (central groove) — darker recessed look
      const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.42, 0.016), steelDark)
      fuller.position.set(0, -0.26, 0)
      sword.add(fuller)

      // Pointed tip
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.07, 6), steelBright)
      tip.position.y = -0.545
      tip.rotation.y = Math.PI / 6
      sword.add(tip)

      // Ricasso (flat section above guard)
      const ricasso = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.04, 0.013), steel)
      ricasso.position.y = -0.01
      sword.add(ricasso)

      // Crossguard — slightly curved quillons
      const guardBar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.022, 0.028), gold)
      guardBar.position.y = 0.02
      sword.add(guardBar)
      // quillon ends bend slightly toward blade
      ;[-1, 1].forEach((s) => {
        const quillon = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.05, 6), gold)
        quillon.position.set(s * 0.09, 0.005, 0)
        quillon.rotation.z = s * 0.35
        sword.add(quillon)
        const qTip = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 5), gold)
        qTip.position.set(s * 0.115, -0.01, 0)
        sword.add(qTip)
      })
      // central langet toward blade
      const langet = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.02), gold)
      langet.position.y = -0.005
      sword.add(langet)

      // Grip — tapered octagonal feel
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.13, 8), leather)
      grip.position.y = 0.1
      sword.add(grip)
      // leather wrap bands
      ;[0.05, 0.085, 0.12, 0.155].forEach((y, i) => {
        const band = new THREE.Mesh(
          new THREE.CylinderGeometry(0.021, 0.021, 0.012, 8),
          i % 2 ? dark : leather
        )
        band.position.y = y
        sword.add(band)
      })

      // Wheel pommel
      const pommelDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.022, 12), gold)
      pommelDisk.position.y = 0.19
      pommelDisk.rotation.x = Math.PI / 2
      sword.add(pommelDisk)
      const pommelCap = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), gold)
      pommelCap.position.y = 0.21
      sword.add(pommelCap)
      // peen / rivet on pommel
      const peen = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 5), steelDark)
      peen.position.y = 0.225
      sword.add(peen)

      // Hold: blade down, slight natural angle in the hand
      sword.position.set(0.025, -0.42, 0.015)
      sword.rotation.z = 0.12
      sword.rotation.x = 0.08
      sword.rotation.y = -0.05
      sword.scale.setScalar(0.58) // compact one-handed short sword
      pivot.add(sword)
    }

    pivot.rotation.x = 0.12
    pivot.rotation.z = side * 0.08
    player.add(pivot)
    armPivots.push(pivot)
  })

  // ── Halo ─────────────────────────────────────────────────────────────────
  const feetHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.26, 0.34, 40),
    new THREE.MeshBasicMaterial({
      color: isLight ? 0x2a9d8f : 0x75e0cf,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    })
  )
  feetHalo.rotation.x = -Math.PI / 2
  feetHalo.position.y = 0.02
  player.add(feetHalo)

  player.scale.setScalar(1.12)
  player.position.set(0.05, -1.34, 2.1)
  player.traverse((part) => {
    if (part.isMesh) {
      part.castShadow = true
      part.receiveShadow = true
    }
  })
  return { player, legPivots, armPivots, feetHalo, basePlayerY: -1.34 }
}
