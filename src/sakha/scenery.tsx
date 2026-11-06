import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createFieldTextures } from "./textures";

const chromeMat = new THREE.MeshStandardMaterial({
  color: "#c5ccd1",
  metalness: 0.92,
  roughness: 0.28,
  envMapIntensity: 1.1,
});

export function ChromeEnv() {
  const { gl } = useThree();
  useLayoutEffect(() => {
    gl.toneMappingExposure = 1.05;
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    chromeMat.map = createFieldTextures().steel;
    chromeMat.envMap = env;
    chromeMat.color.set("#d5dee4");
    chromeMat.metalness = 0.78;
    chromeMat.roughness = 0.34;
    chromeMat.needsUpdate = true;
    return () => {
      chromeMat.envMap = null;
      chromeMat.needsUpdate = true;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl]);
  return null;
}

let sakhaFont: Promise<void> | null = null;

function ensureSakhaFont() {
  if (!sakhaFont) {
    const face = new FontFace("PT Serif Sakha", "url(/fonts/PTSerif-Bold.ttf)");
    sakhaFont = face.load().then((loaded) => {
      document.fonts.add(loaded);
    });
  }
  return sakhaFont;
}

export function SkySign({ title, x, z }: { title: string; x: number; z: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();

  useEffect(() => {
    let alive = true;
    void ensureSakhaFont().then(() => {
      if (!alive || !mat.current) return;
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 280;
      const g = canvas.getContext("2d");
      if (!g) return;
      g.clearRect(0, 0, canvas.width, canvas.height);
      g.font = '700 92px "PT Serif Sakha"';
      let size = 92;
      while (g.measureText(title).width > 1180 && size > 40) {
        size -= 4;
        g.font = `700 ${size}px "PT Serif Sakha"`;
      }
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.lineWidth = 14;
      g.strokeStyle = "rgba(18, 42, 72, 0.72)";
      g.strokeText(title, 640, 145);
      g.fillStyle = "#fff6df";
      g.fillText(title, 640, 145);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      mat.current.map = tex;
      mat.current.needsUpdate = true;
    });
    return () => {
      alive = false;
    };
  }, [title]);

  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.lookAt(camera.position.x, mesh.current.position.y, camera.position.z);
  });

  return (
    <mesh ref={mesh} position={[x, 4.15, z]}>
      <planeGeometry args={[2.35, 0.58]} />
      <meshBasicMaterial ref={mat} transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

function useLook() {
  return useMemo(() => createFieldTextures(), []);
}

export function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uSun: { value: new THREE.Vector3(-12, 22, 8).normalize() } },
        vertexShader: `
          varying vec3 vDir;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vDir = normalize(w.xyz);
            gl_Position = projectionMatrix * viewMatrix * w;
          }
        `,
        fragmentShader: `
          varying vec3 vDir;
          uniform vec3 uSun;
          void main() {
            float h = clamp(vDir.y, 0.0, 1.0);
            vec3 top = vec3(0.36, 0.66, 0.90);
            vec3 mid = vec3(0.62, 0.82, 0.93);
            vec3 hor = vec3(0.98, 0.86, 0.68);
            vec3 col = mix(hor, mid, smoothstep(0.0, 0.18, h));
            col = mix(col, top, smoothstep(0.12, 0.7, h));
            float sun = pow(max(dot(normalize(vDir), uSun), 0.0), 48.0);
            col += vec3(1.0, 0.86, 0.45) * sun;
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  );
  return (
    <mesh frustumCulled={false}>
      <sphereGeometry args={[180, 24, 16]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

export function Ground() {
  const look = useLook();
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(100, 96);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y =
        Math.sin(x * 0.08) * 0.18 +
        Math.cos(z * 0.07) * 0.14 +
        Math.sin((x + z) * 0.21) * 0.05;
      const edge = Math.hypot(x, z);
      pos.setY(i, edge > 8 ? y : y * 0.25);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial map={look.grass} roughness={1} metalness={0} />
    </mesh>
  );
}

export function Water() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(16, 96);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  useFrame((state) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uCam.value.copy(state.camera.position);
  });
  return (
    <mesh geometry={geo} position={[0, 0.06, 0]}>
      <shaderMaterial
        ref={mat}
        transparent
        uniforms={{ uTime: { value: 0 }, uCam: { value: new THREE.Vector3() } }}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vWorld;
          varying float vWave;
          void main() {
            vUv = uv;
            vec3 p = position;
            float w = sin(p.x * 0.42 + uTime * 0.9) * cos(p.z * 0.37 - uTime * 0.7);
            w += sin(p.x * 1.3 - p.z * 0.8 + uTime * 1.4) * 0.35;
            p.y += w * 0.06;
            vWave = w;
            vec4 world = modelMatrix * vec4(p, 1.0);
            vWorld = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          varying vec3 vWorld;
          varying float vWave;
          uniform vec3 uCam;
          void main() {
            vec3 viewDir = normalize(uCam - vWorld);
            float fres = pow(1.0 - max(dot(viewDir, vec3(0.0, 1.0, 0.0)), 0.0), 2.6);
            vec3 sunDir = normalize(vec3(-0.55, 0.78, 0.28));
            vec3 halfDir = normalize(sunDir + viewDir);
            float spec = pow(max(dot(vec3(0.0, 1.0, 0.0), halfDir), 0.0), 220.0);
            float shore = smoothstep(0.2, 0.5, length(vUv - 0.5));
            vec3 shallow = vec3(0.22, 0.52, 0.5);
            vec3 deep = vec3(0.03, 0.16, 0.28);
            vec3 sky = vec3(0.62, 0.78, 0.9);
            vec3 col = mix(shallow, deep, shore);
            col = mix(col, sky, fres * 0.55);
            col += vec3(1.0, 0.93, 0.75) * spec * 0.85;
            float glint = smoothstep(0.62, 1.0, vWave);
            col += vec3(0.75, 0.86, 0.9) * glint * 0.16;
            float alpha = mix(0.78, 0.96, shore);
            gl_FragColor = vec4(col, alpha);
          }
        `}
      />
    </mesh>
  );
}

function windMaterial(map: THREE.Texture) {
  const holder: { shader?: { uniforms: Record<string, { value: number }> } } = {};
  const mat = new THREE.MeshStandardMaterial({
    map,
    alphaTest: 0.18,
    side: THREE.DoubleSide,
    roughness: 1,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = "uniform float uTime;\n" + shader.vertexShader.replace(
      "#include <begin_vertex>",
      `vec3 transformed = vec3(position);
       #ifdef USE_INSTANCING
         float seed = instanceMatrix[3][0] + instanceMatrix[3][2];
       #else
         float seed = 0.0;
       #endif
       float h = clamp(uv.y, 0.0, 1.0);
       transformed.x += sin(uTime * 1.7 + seed) * h * h * 0.25;
       transformed.z += cos(uTime * 1.15 + seed * 1.3) * h * h * 0.16;`,
    );
    holder.shader = shader;
  };
  return { mat, holder };
}

function tuftGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const height = 0.32 + (i % 4) * 0.11;
    const blade = new THREE.PlaneGeometry(0.07 + (i % 2) * 0.02, height, 1, 4);
    blade.translate(0, height * 0.5, 0);
    const pos = blade.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const hue = (i % 3) * 0.05;
    for (let v = 0; v < pos.count; v++) {
      const y = pos.getY(v);
      const t = Math.min(1, Math.max(0, y / height));
      pos.setX(v, pos.getX(v) * (1 - t * 0.86) + t * t * (0.04 + (i % 3) * 0.015));
      colors[v * 3] = 0.08 + t * 0.32 + hue;
      colors[v * 3 + 1] = 0.22 + t * 0.5;
      colors[v * 3 + 2] = 0.05 + t * 0.06;
    }
    blade.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    blade.rotateY((i / 8) * Math.PI);
    blade.translate(Math.cos(i * 1.7) * 0.06, 0, Math.sin(i * 2.1) * 0.06);
    parts.push(blade);
  }
  return mergeGeometries(parts) ?? parts[0];
}

function tuftMaterial() {
  const holder: { shader?: { uniforms: Record<string, { value: number }> } } = {};
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: 1,
    metalness: 0,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader =
      "uniform float uTime;\n" +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position);
         #ifdef USE_INSTANCING
           float seed = instanceMatrix[3][0] + instanceMatrix[3][2];
         #else
           float seed = 0.0;
         #endif
         float h = clamp(uv.y, 0.0, 1.0);
         transformed.x += sin(uTime * 1.5 + seed) * h * h * 0.12;
         transformed.z += cos(uTime * 1.05 + seed * 1.3) * h * h * 0.08;`,
      );
    holder.shader = shader;
  };
  return { mat, holder };
}

export function Meadow() {
  const look = useLook();
  const grass = useMemo(() => tuftMaterial(), []);
  const flowers = useMemo(() => windMaterial(look.flower), [look]);
  const grassRef = useRef<THREE.InstancedMesh>(null);
  const flowerRef = useRef<THREE.InstancedMesh>(null);
  const grassGeo = useMemo(() => tuftGeometry(), []);
  const flowerGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.22, 0.22);
    g.translate(0, 0.28, 0);
    return g;
  }, []);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const n = 3400;
    let placed = 0;
    let i = 0;
    while (placed < n && i < 9000) {
      const ang = i * 2.399963;
      const u = ((i * 17) % 1000) / 1000;
      const v = ((i * 43) % 1000) / 1000;
      i += 1;
      let x: number;
      let z: number;
      if (placed < 2400) {
        x = (u - 0.5) * 54;
        z = 8 + v * 46;
      } else {
        const r = 18 + u * 34;
        x = Math.cos(ang) * r;
        z = Math.sin(ang) * r;
      }
      if (Math.hypot(x, z) < 17.3) continue;
      if (Math.hypot(x, z - 20) < 3.2) continue;
      dummy.position.set(x, 0, z);
      dummy.rotation.y = ang;
      const s = 0.75 + (placed % 5) * 0.1;
      dummy.scale.set(s, 0.55 + (placed % 7) * 0.1, s);
      dummy.updateMatrix();
      grassRef.current?.setMatrixAt(placed, dummy.matrix);
      placed += 1;
    }
    if (grassRef.current) grassRef.current.instanceMatrix.needsUpdate = true;
    const fn = 48;
    for (let k = 0; k < fn; k++) {
      const ang = k * 2.399963 + 0.6;
      const r = 19 + ((k * 29) % 100) / 100 * 24;
      dummy.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
      dummy.rotation.y = ang;
      dummy.scale.setScalar(0.85);
      dummy.updateMatrix();
      flowerRef.current?.setMatrixAt(k, dummy.matrix);
    }
    if (flowerRef.current) flowerRef.current.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (grass.holder.shader) grass.holder.shader.uniforms.uTime.value = t;
    if (flowers.holder.shader) flowers.holder.shader.uniforms.uTime.value = t;
  });
  return (
    <group>
      <instancedMesh ref={grassRef} args={[grassGeo, grass.mat, 3400]} />
      <instancedMesh ref={flowerRef} args={[flowerGeo, flowers.mat, 48]} />
    </group>
  );
}

export function Forest({ birch, larch }: { birch: readonly (readonly [number, number])[]; larch: readonly (readonly [number, number])[] }) {
  const look = useLook();
  const bTrunk = useRef<THREE.InstancedMesh>(null);
  const bCrown = useRef<THREE.InstancedMesh>(null);
  const bCrown2 = useRef<THREE.InstancedMesh>(null);
  const lTrunk = useRef<THREE.InstancedMesh>(null);
  const lCrown = useRef<THREE.InstancedMesh>(null);
  const lCrown2 = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    birch.forEach(([x, z], i) => {
      const h = 1 + (i % 3) * 0.12;
      dummy.position.set(x, 1.8 * h, z);
      dummy.scale.set(1, h, 1);
      dummy.rotation.set(0, i * 0.4, 0);
      dummy.updateMatrix();
      bTrunk.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 4.05 * h, z);
      dummy.scale.set(1.15 + (i % 4) * 0.12, 0.85, 1.05);
      dummy.rotation.set(0.2, i, 0.15);
      dummy.updateMatrix();
      bCrown.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x + 0.35, 4.45 * h, z - 0.2);
      dummy.scale.set(0.85, 0.7, 0.8);
      dummy.rotation.set(-0.3, i * 0.7, 0.2);
      dummy.updateMatrix();
      bCrown2.current?.setMatrixAt(i, dummy.matrix);
      for (let c = 0; c < 5; c++) {
        const a = (c / 5) * Math.PI;
        dummy.position.set(x + Math.cos(a + i) * 0.55, 4.2 * h + (c % 2) * 0.35, z + Math.sin(a) * 0.4);
        dummy.rotation.set(0.2, a, 0.1 * c);
        dummy.scale.set(1.15, 0.85, 1);
        dummy.updateMatrix();
        leafRef.current?.setMatrixAt(i * 5 + c, dummy.matrix);
      }
    });
    larch.forEach(([x, z], i) => {
      dummy.position.set(x, 2.3, z);
      dummy.scale.set(1, 1.25, 1);
      dummy.rotation.set(0, i, 0);
      dummy.updateMatrix();
      lTrunk.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 5.1, z);
      dummy.scale.set(1.25, 1.45, 1.25);
      dummy.updateMatrix();
      lCrown.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 6.5, z);
      dummy.scale.set(0.85, 1.1, 0.85);
      dummy.updateMatrix();
      lCrown2.current?.setMatrixAt(i, dummy.matrix);
    });
    for (const m of [bTrunk, bCrown, bCrown2, lTrunk, lCrown, lCrown2, leafRef]) {
      if (m.current) {
        m.current.instanceMatrix.needsUpdate = true;
        m.current.computeBoundingSphere();
      }
    }
  }, [birch, larch]);
  return (
    <group>
      <instancedMesh ref={bTrunk} args={[undefined, undefined, birch.length]} castShadow>
        <cylinderGeometry args={[0.11, 0.18, 3.6, 12]} />
        <meshStandardMaterial map={look.birch} roughness={0.92} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={bCrown} args={[undefined, undefined, birch.length]} castShadow>
        <sphereGeometry args={[1.05, 12, 8]} />
        <meshStandardMaterial color="#5e8a43" roughness={1} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={bCrown2} args={[undefined, undefined, birch.length]}>
        <sphereGeometry args={[0.72, 10, 8]} />
        <meshStandardMaterial color="#87a85a" roughness={1} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={leafRef} args={[undefined, undefined, birch.length * 5]}>
        <planeGeometry args={[1.7, 1.15]} />
        <meshStandardMaterial
          map={look.foliage}
          alphaTest={0.35}
          side={THREE.DoubleSide}
          roughness={1}
          metalness={0}
          color="#6f9848"
        />
      </instancedMesh>
      <instancedMesh ref={lTrunk} args={[undefined, undefined, larch.length]} castShadow>
        <cylinderGeometry args={[0.16, 0.28, 4.4, 8]} />
        <meshStandardMaterial map={look.bark} roughness={1} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={lCrown} args={[undefined, undefined, larch.length]} castShadow>
        <coneGeometry args={[1.45, 2.6, 9]} />
        <meshStandardMaterial color="#2f6a38" roughness={1} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={lCrown2} args={[undefined, undefined, larch.length]}>
        <coneGeometry args={[0.95, 1.9, 9]} />
        <meshStandardMaterial color="#4d8a48" roughness={1} metalness={0} />
      </instancedMesh>
    </group>
  );
}

export function Reeds() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 110; i++) {
      const a = (i / 110) * Math.PI * 2 + (i % 3) * 0.02;
      const r = 16.4 + (i % 5) * 0.35;
      dummy.position.set(Math.cos(a) * r, 0.45, Math.sin(a) * r);
      dummy.rotation.set((i % 5) * 0.04, a, 0);
      dummy.scale.set(1, 0.7 + (i % 4) * 0.25, 1);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(i, dummy.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 110]}>
      <cylinderGeometry args={[0.02, 0.035, 1.1, 4]} />
      <meshStandardMaterial color="#3f6a32" />
    </instancedMesh>
  );
}

export function Hills() {
  const look = useLook();
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 32, 20);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const n = Math.sin(x * 5.2 + z * 3.4) * 0.05 + Math.sin(z * 8.5 + y * 3) * 0.025;
      pos.setXYZ(i, x * (1 + n), y * (1 + n * 0.3), z * (1 + n));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const spots: [number, number, number, number][] = [
    [-48, 8, -78, 1],
    [-10, 10, -90, 1.3],
    [36, 7, -82, 0.9],
    [70, 6, -40, 0.8],
    [-72, 6, -20, 0.85],
  ];
  return (
    <group>
      {spots.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y - 4, z]} scale={[26 * s, 9 * s, 18 * s]} geometry={geo}>
          <meshStandardMaterial map={look.grass} color={i % 2 ? "#b7c896" : "#c9d6a8"} roughness={1} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}

export function Stones() {
  const rocks: [number, number, number, number][] = [
    [-8.2, 0.18, 6.4, 0.55],
    [-5.4, 0.14, 11.2, 0.38],
    [7.6, 0.16, 8.8, 0.46],
    [11.4, 0.12, 14.5, 0.32],
    [-12.2, 0.15, 18.4, 0.42],
    [4.8, 0.1, 16.2, 0.28],
  ];
  return (
    <group>
      {rocks.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.2, i, 0.4]} castShadow receiveShadow>
          <dodecahedronGeometry args={[s, 0]} />
          <meshStandardMaterial color={i % 2 ? "#8d8680" : "#6f6a64"} roughness={0.92} metalness={0.04} />
        </mesh>
      ))}
    </group>
  );
}

export function Shore() {
  const look = useLook();
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]} receiveShadow>
        <ringGeometry args={[16.05, 20.6, 80]} />
        <meshStandardMaterial map={look.sand} roughness={1} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 30]} receiveShadow>
        <planeGeometry args={[1.35, 14]} />
        <meshStandardMaterial map={look.sand} roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

export function Serge({ x, z }: { x: number; z: number; hot: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.26, 0.22, 12]} />
        <meshStandardMaterial color="#8b7355" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow material={chromeMat}>
        <cylinderGeometry args={[0.09, 0.14, 3.4, 16]} />
      </mesh>
      {[1.85, 2.3, 2.7].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={chromeMat}>
          <torusGeometry args={[0.2, 0.028, 8, 20]} />
        </mesh>
      ))}
      <mesh position={[0, 3.15, 0]} material={chromeMat}>
        <sphereGeometry args={[0.11, 12, 12]} />
      </mesh>
      <mesh position={[0.16, 3.28, 0]} rotation={[0, 0, -0.6]} material={chromeMat}>
        <boxGeometry args={[0.46, 0.07, 0.07]} />
      </mesh>
    </group>
  );
}

export function Urasa() {
  const look = useLook();
  return (
    <group position={[0, 0, 20]}>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 1.35, 1.8, Math.sin(a) * 1.35]}
            rotation={[Math.cos(a) * 0.22, 0, -Math.sin(a) * 0.22]}
            castShadow
          >
            <cylinderGeometry args={[0.045, 0.06, 3.8, 5]} />
            <meshStandardMaterial map={look.birch} />
          </mesh>
        );
      })}
      <mesh position={[0, 1.85, 0]} castShadow>
        <coneGeometry args={[2.5, 3.7, 10]} />
        <meshStandardMaterial map={look.cover} roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.045, 6, 16]} />
        <meshStandardMaterial color="#8d2e28" />
      </mesh>
      <mesh position={[0, 0.85, 2.15]}>
        <boxGeometry args={[0.78, 1.35, 0.06]} />
        <meshStandardMaterial color="#241910" />
      </mesh>
      <mesh position={[-0.42, 0.85, 2.2]}>
        <boxGeometry args={[0.08, 1.4, 0.08]} />
        <meshStandardMaterial map={look.wood} />
      </mesh>
      <mesh position={[0.42, 0.85, 2.2]}>
        <boxGeometry args={[0.08, 1.4, 0.08]} />
        <meshStandardMaterial map={look.wood} />
      </mesh>
    </group>
  );
}

export function Chorons() {
  const look = useLook();
  return (
    <group position={[3.4, 0, 23.2]}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.7, 0.64, 8]} />
        <meshStandardMaterial map={look.wood} />
      </mesh>
      {[-0.32, 0, 0.32].map((x) => (
        <group key={x} position={[x, 0.78, 0]}>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.045, 0.06, 0.22, 8]} />
            <meshStandardMaterial color="#f7f3ea" />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.13, 0.05, 0.2, 10]} />
            <meshStandardMaterial color="#f4efe4" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <torusGeometry args={[0.11, 0.02, 6, 10]} />
            <meshStandardMaterial color="#c4554a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Horse({
  position,
  tint,
  phase,
}: {
  position: [number, number, number];
  tint: string;
  phase: number;
}) {
  const look = useLook();
  const ref = useRef<THREE.Group>(null);
  const neck = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) ref.current.position.y = Math.sin(t * 1.3 + phase) * 0.025;
    if (neck.current) neck.current.rotation.x = Math.sin(t * 0.8 + phase) * 0.06;
  });
  const hide = look.hide;
  return (
    <group ref={ref} position={position} rotation={[0, phase, 0]}>
      <mesh position={[0, 0.98, 0]} castShadow scale={[1.15, 0.42, 0.38]}>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshStandardMaterial map={hide} color={tint} roughness={0.82} metalness={0} />
      </mesh>
      <mesh position={[0.48, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.22, 14, 12]} />
        <meshStandardMaterial map={hide} color={tint} roughness={0.82} metalness={0} />
      </mesh>
      <group ref={neck} position={[0.62, 1.15, 0]}>
        <mesh position={[0.16, 0.18, 0]} rotation={[0, 0, -0.7]}>
          <cylinderGeometry args={[0.1, 0.14, 0.48, 7]} />
          <meshStandardMaterial map={hide} color={tint} />
        </mesh>
        <mesh position={[0.38, 0.38, 0]}>
          <boxGeometry args={[0.28, 0.16, 0.16]} />
          <meshStandardMaterial map={hide} color={tint} />
        </mesh>
        <mesh position={[0.5, 0.42, 0.06]}>
          <coneGeometry args={[0.04, 0.12, 5]} />
          <meshStandardMaterial color="#2a211c" />
        </mesh>
        <mesh position={[0.5, 0.42, -0.06]}>
          <coneGeometry args={[0.04, 0.12, 5]} />
          <meshStandardMaterial color="#2a211c" />
        </mesh>
        <mesh position={[0.18, 0.28, 0]}>
          <boxGeometry args={[0.28, 0.06, 0.05]} />
          <meshStandardMaterial color="#1c140e" />
        </mesh>
      </group>
      <mesh position={[-0.62, 1.0, 0]} rotation={[0.2, 0, 0.8]}>
        <cylinderGeometry args={[0.03, 0.07, 0.55, 4]} />
        <meshStandardMaterial color="#1c140e" />
      </mesh>
      {[
        [0.32, 0.42, 0.14],
        [0.32, 0.42, -0.14],
        [-0.32, 0.42, 0.14],
        [-0.32, 0.42, -0.14],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.045, 0.05, 0.48, 5]} />
            <meshStandardMaterial map={hide} color={tint} />
          </mesh>
          <mesh position={[0.02, -0.48, 0]}>
            <boxGeometry args={[0.1, 0.06, 0.08]} />
            <meshStandardMaterial color="#241910" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Clouds() {
  const puffs: [number, number, number, number][] = [
    [-18, 22, -6, 1],
    [-12, 23, -2, 0.7],
    [14, 20, 18, 1.2],
    [22, 24, 10, 0.8],
    [-30, 26, 24, 1.1],
    [6, 28, -30, 0.9],
  ];
  return (
    <group>
      {puffs.map(([x, y, z, s], i) => (
        <group key={i} position={[x, y, z]} scale={s}>
          {[
            [0, 0, 0, 2.1],
            [1.5, 0.2, 0.2, 1.5],
            [-1.4, 0.15, 0.1, 1.35],
            [0.4, 0.55, -0.3, 1.2],
          ].map(([px, py, pz, r], k) => (
            <mesh key={k} position={[px, py, pz]}>
              <sphereGeometry args={[r, 16, 12]} />
              <meshStandardMaterial color="#f4f7fb" transparent opacity={0.82} roughness={1} metalness={0} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function Person({
  leftLeg,
  rightLeg,
  leftArm,
  rightArm,
}: {
  leftLeg: RefObject<THREE.Group | null>;
  rightLeg: RefObject<THREE.Group | null>;
  leftArm: RefObject<THREE.Group | null>;
  rightArm: RefObject<THREE.Group | null>;
}) {
  const look = useLook();
  const skin = "#b9835a";
  const fur = "#5a4334";
  const leather = "#241910";
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[0.42, 20]} />
        <meshBasicMaterial color="#1a3214" transparent opacity={0.28} />
      </mesh>
      <group ref={leftLeg} position={[-0.1, 0.84, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.34, 4, 8]} />
          <meshStandardMaterial color="#1c2740" roughness={0.9} metalness={0} />
        </mesh>
        <mesh position={[0, -0.62, 0.02]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.28, 8]} />
          <meshStandardMaterial color={leather} roughness={0.62} />
        </mesh>
        <mesh position={[0, -0.78, 0.05]} castShadow>
          <boxGeometry args={[0.12, 0.07, 0.22]} />
          <meshStandardMaterial color="#1a140f" roughness={0.55} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.1, 0.84, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.34, 4, 8]} />
          <meshStandardMaterial color="#1c2740" roughness={0.9} metalness={0} />
        </mesh>
        <mesh position={[0, -0.62, 0.02]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.28, 8]} />
          <meshStandardMaterial color={leather} roughness={0.62} />
        </mesh>
        <mesh position={[0, -0.78, 0.05]} castShadow>
          <boxGeometry args={[0.12, 0.07, 0.22]} />
          <meshStandardMaterial color="#1a140f" roughness={0.55} />
        </mesh>
      </group>
      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.3, 0.78, 14]} />
        <meshStandardMaterial map={look.coat} roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 1.05, -0.34]}>
        <planeGeometry args={[0.16, 0.58]} />
        <meshStandardMaterial map={look.ornament} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 14]} />
        <meshStandardMaterial color={fur} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.025, 8, 16]} />
        <meshStandardMaterial color="#6e2a28" roughness={0.5} />
      </mesh>
      <mesh position={[-0.24, 1.32, 0]} castShadow>
        <sphereGeometry args={[0.1, 12, 10]} />
        <meshStandardMaterial map={look.coat} roughness={0.9} />
      </mesh>
      <mesh position={[0.24, 1.32, 0]} castShadow>
        <sphereGeometry args={[0.1, 12, 10]} />
        <meshStandardMaterial map={look.coat} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.4, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.045, 8, 16]} />
        <meshStandardMaterial color="#cbb79a" roughness={1} />
      </mesh>
      <group ref={leftArm} position={[-0.3, 1.32, 0]}>
        <mesh position={[0, -0.22, 0]} rotation={[0, 0, 0.18]} castShadow>
          <capsuleGeometry args={[0.055, 0.28, 4, 8]} />
          <meshStandardMaterial map={look.coat} roughness={0.9} />
        </mesh>
        <mesh position={[0.03, -0.42, 0.02]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={skin} roughness={0.78} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.3, 1.32, 0]}>
        <mesh position={[0, -0.22, 0]} rotation={[0, 0, -0.18]} castShadow>
          <capsuleGeometry args={[0.055, 0.28, 4, 8]} />
          <meshStandardMaterial map={look.coat} roughness={0.9} />
        </mesh>
        <mesh position={[-0.03, -0.42, 0.02]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={skin} roughness={0.78} />
        </mesh>
      </group>
      <mesh position={[0.18, 1.12, -0.18]} rotation={[0.2, 0, 0.12]} castShadow>
        <cylinderGeometry args={[0.016, 0.028, 1.25, 8]} />
        <meshStandardMaterial map={look.wood} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <cylinderGeometry args={[0.055, 0.065, 0.1, 10]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.62, 0.01]} castShadow>
        <sphereGeometry args={[0.135, 20, 16]} />
        <meshStandardMaterial color={skin} roughness={0.72} metalness={0} />
      </mesh>
      <mesh position={[0.04, 1.6, 0.1]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
      <mesh position={[-0.04, 1.6, 0.1]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.2, 12]} />
        <meshStandardMaterial color={fur} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color="#3d2c22" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.68, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.035, 8, 16]} />
        <meshStandardMaterial color="#d9c7aa" roughness={1} />
      </mesh>
    </group>
  );
}
