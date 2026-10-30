// @ts-nocheck
import * as THREE from 'three'

/** Pixar-style Yakut Bootur warrior in stylized armor. */
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
    color: isLight ? 0xc8d4dc : 0xa8b8c4, roughness: 0.28, metalness: 0.85,
  })
  const steelEdge = new THREE.MeshStandardMaterial({
    color: isLight ? 0xe8f0f4 : 0xd0dce4, roughness: 0.18, metalness: 0.9,
  })

  // ── Torso / breastplate (heroic Pixar proportions) ───────────────────────
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.42, 12), armor)
  torso.position.y = 0.48
  player.add(torso)
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.12), armorDark)
  chest.position.set(0, 0.5, 0.12)
  player.add(chest)
  const chestTrim = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.13), gold)
  chestTrim.position.set(0, 0.58, 0.125)
  player.add(chestTrim)
  const chestTrim2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.13), gold)
  chestTrim2.position.set(0, 0.42, 0.125)
  player.add(chestTrim2)
  ;[-1, 1].forEach((side) => {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.7), armor)
    pad.position.set(side * 0.22, 0.62, 0)
    pad.scale.set(1.1, 0.7, 1.15)
    player.add(pad)
    const padRim = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 6, 14), gold)
    padRim.position.set(side * 0.22, 0.62, 0.02)
    padRim.rotation.x = Math.PI / 2
    player.add(padRim)
  })
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.06, 12), leather)
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

  // ── Head + warrior helmet ────────────────────────────────────────────────
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 12), skin)
  head.position.y = 0.82
  player.add(head)
  ;[-0.045, 0.045].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), dark)
    eye.position.set(x, 0.84, 0.12)
    player.add(eye)
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffffff }))
    pupil.position.set(x + 0.006, 0.845, 0.135)
    player.add(pupil)
  })
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.04, 5), skin)
  nose.position.set(0, 0.81, 0.13)
  nose.rotation.x = Math.PI / 2
  player.add(nose)
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.155, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58), armorDark)
  helm.position.set(0, 0.88, -0.01)
  player.add(helm)
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.22), gold)
  crest.position.set(0, 0.98, -0.02)
  player.add(crest)
  ;[-1, 1].forEach((side) => {
    const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.08), armorDark)
    cheek.position.set(side * 0.12, 0.78, 0.05)
    player.add(cheek)
  })
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 8, 16), fur)
  collar.position.set(0, 0.66, 0)
  collar.rotation.x = Math.PI / 2
  player.add(collar)

  // ── Pack ─────────────────────────────────────────────────────────────────
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.1), leather)
  pack.position.set(0, 0.48, -0.18)
  player.add(pack)
  const packStrap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.02), leather)
  packStrap.position.set(0.12, 0.52, -0.08)
  packStrap.rotation.x = 0.2
  player.add(packStrap)

  // ── Legs: thigh + knee + shin + boot ─────────────────────────────────────
  const legPivots = []
  ;[-0.1, 0.1].forEach((x) => {
    const pivot = new THREE.Group()
    pivot.position.set(x, 0.26, 0)
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.2, 8), cloth)
    thigh.position.y = -0.1
    pivot.add(thigh)
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), armor)
    knee.position.y = -0.2
    pivot.add(knee)
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.18, 8), armorDark)
    shin.position.y = -0.3
    pivot.add(shin)
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.16), leather)
    boot.position.set(0, -0.4, 0.03)
    pivot.add(boot)
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
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.18, 8), armor)
    upper.position.y = -0.1
    pivot.add(upper)
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), armorDark)
    elbow.position.y = -0.2
    pivot.add(elbow)
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.16, 8), armorDark)
    forearm.position.y = -0.3
    pivot.add(forearm)
    const bracer = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.04, 8), gold)
    bracer.position.y = -0.28
    pivot.add(bracer)
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), skin)
    hand.position.y = -0.4
    pivot.add(hand)

    // Sword in right hand (side === 1)
    if (side === 1) {
      const sword = new THREE.Group()
      // blade
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.52, 0.012), steel)
      blade.position.y = -0.28
      sword.add(blade)
      // fuller / center ridge
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.48, 0.014), steelEdge)
      ridge.position.y = -0.28
      sword.add(ridge)
      // tip
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 4), steel)
      tip.position.y = -0.58
      tip.rotation.y = Math.PI / 4
      sword.add(tip)
      // crossguard
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.03), gold)
      guard.position.y = -0.02
      sword.add(guard)
      const guardTipL = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), gold)
      guardTipL.position.set(-0.07, -0.02, 0)
      sword.add(guardTipL)
      const guardTipR = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), gold)
      guardTipR.position.set(0.07, -0.02, 0)
      sword.add(guardTipR)
      // grip
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.12, 8), leather)
      grip.position.y = 0.06
      sword.add(grip)
      // grip wrap rings
      ;[0.02, 0.06, 0.1].forEach((y) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 5, 10), gold)
        ring.position.y = y
        ring.rotation.x = Math.PI / 2
        sword.add(ring)
      })
      // pommel
      const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), gold)
      pommel.position.y = 0.14
      sword.add(pommel)

      // hold pointing down-forward from the hand
      sword.position.set(0.02, -0.42, 0.02)
      sword.rotation.z = 0.15
      sword.rotation.x = 0.05
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

  player.position.set(0.05, -1.34, 2.1)
  player.traverse((p) => { if (p.isMesh) p.castShadow = true })
  return { player, legPivots, armPivots, feetHalo, basePlayerY: -1.34 }
}
