import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react';
import * as THREE from 'three';
import { MOBO_HOLES } from './Motherboard';

/*
 World axes (1 unit = 1 cm):
   x → case depth (rear = −x, front = +x)
   y → up
   z → case width (motherboard tray = −z, glass side panel = +z)
 Motherboard-local axes: x/y in the board plane, z out of the board.
 2D motherboard coordinates (mx 0..244, my 0..305, ≈ mm) map with L().
*/

type V3 = [number, number, number];
const PI = Math.PI;
const L = (mx: number, my: number): [number, number] => [(mx - 122) / 10, (152.5 - my) / 10];
const at = (mx: number, my: number, z: number): V3 => {
  const [x, y] = L(mx, my);
  return [x, y, z];
};
const BOARD_IN_CASE: V3 = [-8.3, 29.25, -9.2];
const HIGHLIGHT = new THREE.Color('#0ea5e9');

interface TagInfo {
  key: string;
  tag: string;
  name: string;
  isNew: boolean;
  obj: THREE.Object3D;
}
interface Ctx {
  hover: string | null;
  setHover: (n: string | null) => void;
  labels: boolean;
  fresh: Set<string>;
  register: (t: TagInfo) => void;
  unregister: (key: string) => void;
}
const ViewCtx = createContext<Ctx>({ hover: null, setHover: () => {}, labels: false, fresh: new Set(), register: () => {}, unregister: () => {} });

/* ───────── primitives ───────── */

function B({ s, p, c, m = 0.15, r = 0.6, e, ei = 0.6, op, rot }: { s: V3; p: V3; c: string; m?: number; r?: number; e?: string; ei?: number; op?: number; rot?: V3 }) {
  return (
    <mesh position={p} rotation={rot} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} metalness={m} roughness={r} emissive={e ?? '#000000'} emissiveIntensity={e ? ei : 0} transparent={op !== undefined} opacity={op ?? 1} depthWrite={op === undefined || op > 0.6} />
    </mesh>
  );
}

function Cy({ r, h, p, c, axis = 'y', m = 0.3, rr = 0.5, e }: { r: number; h: number; p: V3; c: string; axis?: 'x' | 'y' | 'z'; m?: number; rr?: number; e?: string }) {
  const rot: V3 = axis === 'z' ? [PI / 2, 0, 0] : axis === 'x' ? [0, 0, PI / 2] : [0, 0, 0];
  return (
    <mesh position={p} rotation={rot} castShadow>
      <cylinderGeometry args={[r, r, h, 24]} />
      <meshStandardMaterial color={c} metalness={m} roughness={rr} emissive={e ?? '#000000'} emissiveIntensity={e ? 1 : 0} />
    </mesh>
  );
}

function Cable({ pts, r = 0.35, c = '#52525b' }: { pts: V3[]; r?: number; c?: string }) {
  const key = JSON.stringify(pts);
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))), 48, r, 10, false), [key, r]);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={c} roughness={0.85} />
    </mesh>
  );
}

/**
 * A part: animates in, highlights on hover, and (optionally) carries a name tag
 * pinned at `tagAt` (in this part's own coordinates).
 */
function P({
  name,
  tag,
  tagAt = [0, 0, 0],
  tid,
  children,
  axis = 'z',
  from = 6,
  p,
  rot,
}: {
  name: string;
  tag?: string;
  tagAt?: V3;
  tid?: string;
  children: ReactNode;
  axis?: 'y' | 'z';
  from?: number;
  p?: V3;
  rot?: V3;
}) {
  const { hover, setHover, labels, fresh, register, unregister } = useContext(ViewCtx);
  const inner = useRef<THREE.Group>(null);
  const anchor = useRef<THREE.Object3D>(null);
  const key = useId();
  const t = useRef(0);
  const lit = hover === name;

  useFrame((_, dt) => {
    const g = inner.current;
    if (!g || t.current >= 1) return;
    t.current = Math.min(1, t.current + dt * 2.4);
    const k = 1 - Math.pow(1 - t.current, 3);
    g.position.set(0, axis === 'y' ? (1 - k) * from : 0, axis === 'z' ? (1 - k) * from : 0);
    g.scale.setScalar(0.7 + 0.3 * k);
  });

  // glow every mesh of this part while it is hovered (only its own meshes, not nested parts)
  useEffect(() => {
    const g = inner.current;
    if (!g) return;
    const touched: [THREE.MeshStandardMaterial, THREE.Color, number][] = [];
    const walk = (o: THREE.Object3D) => {
      if (o !== g && o.userData.part) return;
      const mat = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (lit && mat && 'emissive' in mat) {
        touched.push([mat, mat.emissive.clone(), mat.emissiveIntensity]);
        mat.emissive.copy(HIGHLIGHT);
        mat.emissiveIntensity = 0.55;
      }
      o.children.forEach(walk);
    };
    walk(g);
    return () => touched.forEach(([m, c, i]) => (m.emissive.copy(c), (m.emissiveIntensity = i)));
  }, [lit]);

  const isNew = tid ? fresh.has(tid) : false;
  useEffect(() => {
    if (!labels || !tag || !anchor.current) return;
    register({ key, tag, name, isNew, obj: anchor.current });
    return () => unregister(key);
  }, [labels, tag, name, isNew, key, register, unregister]);
  return (
    <group
      position={p}
      rotation={rot}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(name);
      }}
      onPointerOut={() => setHover(null)}
    >
      <group ref={inner} position={axis === 'y' ? [0, from, 0] : [0, 0, from]} scale={0.7} userData={{ part: true }}>
        {children}
      </group>
      {tag && <object3D ref={anchor} position={tagAt} />}
    </group>
  );
}

function RGB({ s, p, powered, phase = 0 }: { s: V3; p: V3; powered: boolean; phase?: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const m = mat.current;
    if (!m) return;
    if (powered) {
      const h = (clock.elapsedTime * 0.15 + phase) % 1;
      m.color.setHSL(h, 0.9, 0.6);
      m.emissive.setHSL(h, 0.95, 0.5);
      m.emissiveIntensity = 1.2;
    } else {
      m.color.set('#d4d4d8');
    }
  });
  return (
    <mesh position={p}>
      <boxGeometry args={s} />
      <meshStandardMaterial ref={mat} roughness={0.3} />
    </mesh>
  );
}

/** 120-style fan facing local +z. */
function Fan({ size = 12, powered, ring = '#8b5cf6', depth = 2.5 }: { size?: number; powered: boolean; ring?: string; depth?: number }) {
  const blades = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (blades.current && powered) blades.current.rotation.z -= dt * 14;
  });
  const h = size / 2;
  const bar = 0.7;
  return (
    <group>
      <B s={[size, bar, depth]} p={[0, h - bar / 2, 0]} c="#1f2937" />
      <B s={[size, bar, depth]} p={[0, -h + bar / 2, 0]} c="#1f2937" />
      <B s={[bar, size, depth]} p={[h - bar / 2, 0, 0]} c="#1f2937" />
      <B s={[bar, size, depth]} p={[-h + bar / 2, 0, 0]} c="#1f2937" />
      <mesh>
        <torusGeometry args={[h * 0.86, 0.22, 10, 48]} />
        <meshStandardMaterial color={ring} emissive={ring} emissiveIntensity={powered ? 1.4 : 0.05} />
      </mesh>
      <group ref={blades}>
        <Cy r={h * 0.28} h={depth * 0.8} p={[0, 0, 0]} c="#334155" axis="z" />
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} rotation={[0.35, 0, (i / 7) * PI * 2]} position={[Math.cos((i / 7) * PI * 2) * h * 0.52, Math.sin((i / 7) * PI * 2) * h * 0.52, 0]}>
            <boxGeometry args={[h * 0.6, h * 0.28, 0.12]} />
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.92} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ───────── motherboard (local coordinates) ───────── */

function Board({ has, powered }: { has: (id: string) => boolean; powered: boolean }) {
  const cooler = has('m-cooler');
  return (
    <group>
      {/* PCB + fixed components */}
      <B s={[24.4, 30.5, 0.16]} p={[0, 0, -0.08]} c="#1b2433" r={0.7} />
      <B s={[3.4, 14.2, 2.4]} p={at(17, 79, 1.2)} c="#3a4658" m={0.5} r={0.4} />
      <B s={[10, 1.6, 1.8]} p={at(88, 24, 0.9)} c="#475569" m={0.6} r={0.35} />
      <B s={[1.8, 8.4, 1.8]} p={at(47, 76, 0.9)} c="#475569" m={0.6} r={0.35} />
      <B s={[5.4, 5.4, 0.3]} p={at(103, 75, 0.15)} c="#9aa3ad" m={0.7} r={0.3} />
      <B s={[2.6, 1.1, 1]} p={at(57, 7, 0.5)} c="#0b0f16" />
      <B s={[1.2, 0.6, 0.6]} p={at(156, 9, 0.3)} c="#f1f5f9" />
      {[163, 173, 183, 193].map((x) => (
        <B key={x} s={[0.6, 13, 0.8]} p={at(x, 87, 0.4)} c={x === 173 || x === 193 ? '#4c1d95' : '#0e131b'} />
      ))}
      <B s={[1.2, 7, 1]} p={at(232, 95, 0.5)} c="#0b0f16" />
      <B s={[1, 1, 0.8]} p={at(233, 145, 0.4)} c="#0b0f16" />
      <B s={[1, 3, 0.9]} p={at(233, 175, 0.45)} c="#1e3a8a" />
      <B s={[0.6, 2, 0.5]} p={at(59, 130, 0.25)} c="#0b0f16" />
      <B s={[16, 0.8, 1.1]} p={at(118, 160, 0.55)} c="#a1a1aa" m={0.8} r={0.3} />
      <B s={[8.2, 2.2, 0.6]} p={at(99, 201, 0.3)} c="#475569" m={0.6} r={0.35} />
      <B s={[16, 0.8, 1.1]} p={at(118, 230, 0.55)} c="#0b0f16" />
      <B s={[6.6, 4.4, 1]} p={at(183, 262, 0.5)} c="#475569" m={0.6} r={0.35} />
      <Cy r={1.15} h={0.2} p={at(210, 210, 0.1)} c="#0b0f16" axis="z" />
      {[
        [16, 296, 2],
        [68, 296, 1.6],
        [105, 296, 1],
        [131, 296, 1.4],
        [211, 296, 2.2],
      ].map(([x, y, w]) => (
        <B key={x} s={[w, 0.8, 0.7]} p={at(x, y, 0.35)} c={x === 105 ? '#f1f5f9' : '#0b0f16'} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={at(214, 64 + i * 8, 0.15)}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={powered ? 1.5 : 0} />
        </mesh>
      ))}
      {has('c-screws') &&
        MOBO_HOLES.map(([x, y], i) => (
          <P key={`${x}-${y}`} name="Motherboard screws" tid="c-screws" tag={i === 0 ? 'Screws' : undefined} tagAt={at(x, y, 0.3)} from={2}>
            <Cy r={0.38} h={0.22} p={at(x, y, 0.11)} c="#d1d5db" axis="z" m={0.9} rr={0.25} />
          </P>
        ))}

      {/* installed parts */}
      {!has('m-cpu') && <B s={[4.6, 4.6, 0.25]} p={at(103, 75, 0.42)} c="#111111" />}
      {has('m-cmos') && (
        <P name="CR2032 CMOS battery" tid="m-cmos" tag="CMOS battery" tagAt={at(210, 210, 0.6)} from={3}>
          <Cy r={1} h={0.32} p={at(210, 210, 0.36)} c="#e5e7eb" axis="z" m={0.9} rr={0.2} />
        </P>
      )}
      {has('m-cpu') && (
        <P name="CPU" tid="m-cpu" tag={cooler ? undefined : 'CPU'} tagAt={at(103, 75, 0.8)} from={4}>
          <B s={[4.4, 4.4, 0.15]} p={at(103, 75, 0.38)} c="#166534" />
          <B s={[3.6, 3.6, 0.28]} p={at(103, 75, 0.6)} c="#d4d4d8" m={0.9} r={0.25} />
        </P>
      )}
      {has('m-paste') && !cooler && (
        <P name="Thermal paste" tid="m-paste" tag="Thermal paste" tagAt={at(96, 70, 0.9)} from={2}>
          <Cy r={0.5} h={0.15} p={at(103, 75, 0.82)} c="#9ca3af" axis="z" />
        </P>
      )}
      {has('m-ssd') && (
        <P name="M.2 NVMe SSD" tid="m-ssd" tag="M.2 SSD" tagAt={at(100, 130, 0.6)} from={3}>
          <B s={[8, 2.2, 0.25]} p={at(100, 130, 0.4)} c="#0f172a" />
          <B s={[2, 1.4, 0.12]} p={at(80, 130, 0.58)} c="#334155" />
          <B s={[5, 1.6, 0.05]} p={at(112, 130, 0.55)} c="#0ea5e9" />
        </P>
      )}
      {has('m-m2screw') && (
        <P name="M.2 screw" tid="m-m2screw" from={2}>
          <Cy r={0.35} h={0.25} p={at(140, 130, 0.6)} c="#e5e7eb" axis="z" m={0.9} rr={0.2} />
        </P>
      )}
      {(['m-ram-a2', 'm-ram-b2'] as const).map((id, i) =>
        has(id) ? (
          <P key={id} name={`RAM stick (slot ${i ? 'B2' : 'A2'})`} tid={id} tag={i ? 'RAM B2' : 'RAM A2'} tagAt={at(i ? 193 : 173, 24, 4)} from={5}>
            <B s={[0.5, 13.3, 3.4]} p={at(i ? 193 : 173, 87, 2)} c="#1f2937" m={0.5} r={0.4} />
            <RGB s={[0.55, 13.2, 0.35]} p={at(i ? 193 : 173, 87, 3.85)} powered={powered} phase={i * 0.2} />
          </P>
        ) : null,
      )}
      {cooler && (
        <P name="CPU air cooler" tid="m-cooler" tag="CPU cooler" tagAt={at(103, 75, 15.6)} from={8}>
          <group position={at(103, 75, 0)}>
            <B s={[4, 4, 0.8]} p={[0, 0, 1]} c="#b45309" m={0.8} r={0.3} />
            {[-1.3, -0.45, 0.45, 1.3].map((y) =>
              [-1.2, 1.2].map((x) => <Cy key={`${x}${y}`} r={0.3} h={14} p={[x, y, 8.3]} c="#c2410c" axis="z" m={0.9} rr={0.25} />),
            )}
            {Array.from({ length: 28 }).map((_, i) => (
              <B key={i} s={[5, 12.5, 0.12]} p={[0, 0, 4 + i * 0.4]} c="#d4d4d8" m={0.8} r={0.3} />
            ))}
            <B s={[5.2, 12.6, 0.3]} p={[0, 0, 15.3]} c="#1f2937" m={0.4} />
            <group position={[3.8, 0, 9.5]} rotation={[0, PI / 2, 0]}>
              <Fan size={12} powered={powered} ring="#38bdf8" />
            </group>
          </group>
        </P>
      )}
      {has('m-cpufan') && (
        <P name="CPU fan cable → CPU_FAN" tid="m-cpufan" tag="CPU_FAN" tagAt={at(156, 9, 1.2)} from={2}>
          <Cable pts={[[1.9, 7.8, 4], [3.2, 12, 2.5], [3.4, 14.2, 0.6]]} r={0.18} c="#f59e0b" />
          <B s={[1.4, 0.8, 0.8]} p={at(156, 9, 0.75)} c="#f8fafc" />
        </P>
      )}

      {/* power + front-panel cables (enter/leave behind the board) */}
      {has('w-24') && (
        <P name="24-pin ATX power cable" tid="w-24" tag="24-pin power" tagAt={at(232, 60, 2)} from={3}>
          <B s={[1.7, 7.4, 1.6]} p={at(232, 95, 1.1)} c="#27272a" />
          {[-3, -1.8, -0.6, 0.6, 1.8, 3].map((dy) => {
            const [x, y] = L(240, 95);
            return <Cable key={dy} pts={[[x, y + dy, 1.2], [x + 1.6, y + dy, 1.4], [x + 2.6, y + dy * 0.7, -0.8]]} r={0.32} c={dy > 0 ? '#71717a' : '#52525b'} />;
          })}
        </P>
      )}
      {has('w-eps') && (
        <P name="8-pin EPS CPU power cable" tid="w-eps" tag="CPU power (8-pin)" tagAt={at(57, 0, 2)} from={3}>
          <B s={[3, 1.4, 1.6]} p={at(57, 7, 1.2)} c="#27272a" />
          {[-0.8, 0, 0.8].map((dx) => {
            const [x, y] = L(57 + dx * 10, 0);
            return <Cable key={dx} pts={[[x, y - 0.4, 1.4], [x, y + 1.2, 1.4], [x, y + 2.1, -0.8]]} r={0.3} c="#52525b" />;
          })}
        </P>
      )}
      {has('w-usbc') && (
        <P name="USB-C front-panel cable" tid="w-usbc" tag="USB-C header" tagAt={at(233, 145, 1.6)} from={3}>
          <B s={[1.4, 1.4, 1.2]} p={at(233, 145, 0.8)} c="#64748b" />
          <Cable pts={[[L(240, 145)[0], L(240, 145)[1], 0.9], [13.6, L(240, 145)[1], 0.9], [14.4, L(240, 150)[1], -0.8]]} r={0.28} c="#71717a" />
        </P>
      )}
      {has('w-usb3') && (
        <P name="USB 3 header cable" tid="w-usb3" tag="USB 3 header" tagAt={at(233, 178, 1.6)} from={3}>
          <B s={[1.4, 3.4, 1.4]} p={at(233, 175, 0.9)} c="#2563eb" />
          <Cable pts={[[L(240, 175)[0], L(240, 175)[1], 1], [13.6, L(240, 175)[1], 1.1], [14.4, L(240, 185)[1], -0.8]]} r={0.45} c="#2563eb" />
        </P>
      )}
      {has('w-fpanel') && (
        <P name="Front-panel connectors (power / reset / LEDs)" tid="w-fpanel" tag="Front-panel pins" tagAt={at(211, 296, 1.6)} from={3}>
          {['#ef4444', '#22c55e', '#3b82f6', '#eab308'].map((c, i) => {
            const [x, y] = L(203 + i * 5.5, 296);
            return (
              <group key={c}>
                <B s={[0.45, 0.8, 1.2]} p={[x, y, 0.9]} c="#111827" />
                <Cable pts={[[x, y - 0.4, 1.2], [x + 0.3, y - 1.6, 1.3], [x + 0.6, -18.6, 0.6]]} r={0.1} c={c} />
              </group>
            );
          })}
        </P>
      )}
      {has('w-audio') && (
        <P name="HD Audio cable" tid="w-audio" tag="HD Audio" tagAt={at(16, 296, 1.6)} from={3}>
          <B s={[2.2, 1, 1.2]} p={at(16, 296, 0.9)} c="#111827" />
          <Cable pts={[[L(16, 296)[0], L(16, 300)[1], 1.2], [L(16, 296)[0] + 0.5, -17.5, 1.3], [L(16, 296)[0] + 1, -18.6, 0.6]]} r={0.28} c="#71717a" />
        </P>
      )}
      {has('w-ties') && (
        <P name="Velcro cable straps" tid="w-ties" from={3}>
          {[3.2, -3].map((y) => (
            <mesh key={y} position={[13.9, L(0, 95)[1] + y, 0.4]} rotation={[PI / 2, 0, 0]}>
              <torusGeometry args={[1, 0.25, 8, 24]} />
              <meshStandardMaterial color="#8b5cf6" />
            </mesh>
          ))}
        </P>
      )}

      {/* graphics card (stands out of the board, hangs below the x16 slot) */}
      {has('c-gpu') && (
        <P name="Graphics card (GPU)" tid="c-gpu" tag="Graphics card" tagAt={[-6, -1, 13.8]} from={9}>
          <group position={[2.8, -3.95, 7.1]}>
            <B s={[30, 5.2, 12.6]} p={[0, -0.45, 0]} c="#1f2937" m={0.4} r={0.45} />
            <B s={[30, 0.3, 12.8]} p={[0, 2.25, 0]} c="#3f3f46" m={0.7} r={0.3} />
            <B s={[24, 0.2, 0.1]} p={[1, 0.5, 6.35]} c="#475569" />
            <RGB s={[26, 0.3, 0.2]} p={[1, -1.3, 6.4]} powered={powered} phase={0.5} />
            {[-9.5, 0, 9.5].map((x) => (
              <group key={x} position={[x, -3.15, 0]} rotation={[PI / 2, 0, 0]}>
                <Fan size={9} powered={powered} ring="#64748b" depth={0.6} />
              </group>
            ))}
            <B s={[0.2, 6.4, 12]} p={[-15.1, -0.2, 0]} c="#cbd5e1" m={0.9} r={0.25} />
            <B s={[0.6, 0.9, 1.5]} p={[-15.4, -1.5, 2]} c="#0b0f16" />
            <B s={[0.6, 0.9, 1.5]} p={[-15.4, -1.5, -0.5]} c="#0b0f16" />
            <B s={[0.6, 0.9, 1.5]} p={[-15.4, -1.5, -3]} c="#0b0f16" />
            <B s={[2.2, 0.8, 0.6]} p={[4, 1.4, 6.5]} c="#0b0f16" />
          </group>
        </P>
      )}
      {has('w-gpu') && (
        <P name="12V-2x6 GPU power cable" tid="w-gpu" tag="GPU power (12V-2x6)" tagAt={[6.8, -2, 14.8]} from={4}>
          <B s={[2.4, 1.1, 1]} p={[6.8, -2.55, 14.2]} c="#27272a" />
          <Cable pts={[[6.8, -2.6, 14.6], [9.5, -4, 15.2], [11, -12, 11], [11, -18.9, 7]]} r={0.55} c="#52525b" />
        </P>
      )}
    </group>
  );
}

/* ───────── case (world coordinates) ───────── */

function Case({ has, powered }: { has: (id: string) => boolean; powered: boolean }) {
  const metal = '#e7e7ea';
  return (
    <group>
      <B s={[45, 0.4, 23]} p={[0, 0.2, 0]} c={metal} m={0.2} r={0.55} />
      <B s={[45, 0.4, 23]} p={[0, 47.8, 0]} c={metal} m={0.2} r={0.55} />
      <B s={[0.4, 48, 23]} p={[-22.3, 24, 0]} c={metal} m={0.2} r={0.55} />
      <B s={[0.6, 48, 23]} p={[22.3, 24, 0]} c="#d4d4d8" m={0.1} r={0.85} />
      <B s={[45, 48, 0.4]} p={[0, 24, -11.3]} c={metal} m={0.2} r={0.55} />
      <B s={[43.5, 46.5, 0.15]} p={[0, 24, -10.05]} c="#f4f4f5" m={0.1} r={0.6} />
      {/* rear PCIe slot covers + I/O opening */}
      {Array.from({ length: 7 }).map((_, i) => (
        <B key={i} s={[0.15, 1.4, 11]} p={[-22.6, 25.8 - i * 2, 0.5]} c={has('c-gpu') && i < 3 ? '#3f3f46' : '#d4d4d8'} />
      ))}
      <B s={[0.1, 16, 4.8]} p={[-22.55, 36.6, -7.5]} c="#09090b" />
      {/* grommets */}
      <B s={[2, 9, 0.3]} p={[7.2, 34.5, -9.9]} c="#27272a" r={0.9} />
      <B s={[2, 9, 0.3]} p={[7.2, 22, -9.9]} c="#27272a" r={0.9} />
      {/* PSU shroud: solid top, see-through side */}
      <B s={[44, 0.4, 21.6]} p={[0, 10.5, 0.4]} c="#e4e4e7" m={0.2} r={0.55} />
      <B s={[44, 10, 0.2]} p={[0, 5.4, 11]} c="#d4d4d8" op={0.3} />
      {/* feet + power button */}
      {[
        [-18, -8],
        [18, -8],
        [-18, 8],
        [18, 8],
      ].map(([x, z]) => (
        <Cy key={`${x}${z}`} r={1.4} h={0.8} p={[x, -0.4, z]} c="#18181b" />
      ))}
      <Cy r={0.6} h={0.3} p={[18, 48.1, 3]} c="#3f3f46" e={powered ? '#22c55e' : undefined} />

      {has('c-io') && (
        <P name="Rear I/O shield" tid="c-io" tag="I/O shield" tagAt={[-22.1, 44.6, -7.5]} axis="y" from={4}>
          <B s={[0.15, 15.8, 4.6]} p={[-22.05, 36.6, -7.5]} c="#d4d4d8" m={0.9} r={0.3} />
        </P>
      )}
      {has('c-standoffs') &&
        MOBO_HOLES.map(([mx, my], i) => {
          const [lx, ly] = L(mx, my);
          const pos: V3 = [BOARD_IN_CASE[0] + lx, BOARD_IN_CASE[1] + ly, -9.6];
          return (
            <P key={`${mx}${my}`} name="Motherboard standoffs" tid="c-standoffs" tag={i === 4 && !has('c-mobo') ? 'Standoffs' : undefined} tagAt={pos} axis="y" from={3}>
              <Cy r={0.35} h={0.75} p={pos} c="#d97706" axis="z" m={0.8} rr={0.3} />
            </P>
          );
        })}
      {has('c-psu') && (
        <P name="Power supply (PSU)" tid="c-psu" tag="Power supply" tagAt={[-14.2, 9.6, 6]} axis="y" from={8}>
          <B s={[15, 8.6, 14]} p={[-14.2, 5.1, -1]} c="#18181b" m={0.4} r={0.5} />
          <B s={[6, 2.2, 0.05]} p={[-14.2, 6, 6.03]} c="#eab308" />
          <B s={[2, 2.6, 2]} p={[-6.4, 5.5, 3]} c="#27272a" />
          <B s={[2, 2.6, 2]} p={[-6.4, 5.5, -1]} c="#27272a" />
          <B s={[0.2, 1.6, 1]} p={[-21.8, 3, 3]} c={powered ? '#16a34a' : '#b91c1c'} />
        </P>
      )}
      {has('c-psuscrews') &&
        [
          [8.5, -6.5],
          [8.5, 4.5],
          [1.6, -6.5],
          [1.6, 4.5],
        ].map(([y, z]) => (
          <P key={`${y}${z}`} name="PSU screws" tid="c-psuscrews" axis="y" from={2}>
            <Cy r={0.35} h={0.3} p={[-22.65, y, z]} c="#d1d5db" axis="x" m={0.9} rr={0.25} />
          </P>
        ))}
      {has('c-fan-f1') && (
        <P name="Front intake fan (top)" tid="c-fan-f1" tag="Front fan 1" tagAt={[0, 6.4, 0]} axis="y" from={6} p={[20.6, 33.5, 0]} rot={[0, PI / 2, 0]}>
          <Fan size={12} powered={powered} />
        </P>
      )}
      {has('c-fan-f2') && (
        <P name="Front intake fan (bottom)" tid="c-fan-f2" tag="Front fan 2" tagAt={[0, 6.4, 0]} axis="y" from={6} p={[20.6, 20.8, 0]} rot={[0, PI / 2, 0]}>
          <Fan size={12} powered={powered} />
        </P>
      )}
      {has('c-fan-r') && (
        <P name="Rear exhaust fan" tid="c-fan-r" tag="Rear fan" tagAt={[0, 6.4, 0]} axis="y" from={6} p={[-20.6, 38, 1.5]} rot={[0, PI / 2, 0]}>
          <Fan size={12} powered={powered} />
        </P>
      )}
      {has('c-gpuscrews') &&
        [25.8, 23.8].map((y) => (
          <P key={y} name="PCIe bracket screws" tid="c-gpuscrews" axis="y" from={2}>
            <Cy r={0.4} h={0.4} p={[-22.75, y, 5.3]} c="#e5e7eb" axis="x" m={0.9} rr={0.25} />
          </P>
        ))}
      {has('c-gpubracket') && (
        <P name="GPU support bracket" tid="c-gpubracket" tag="GPU support" tagAt={[8.5, 14, -2]} axis="y" from={5}>
          <Cy r={0.45} h={11.3} p={[8.5, 16.4, -2]} c="#a1a1aa" m={0.8} rr={0.3} />
          <Cy r={1.3} h={0.4} p={[8.5, 10.9, -2]} c="#3f3f46" />
        </P>
      )}
      {has('w-wifi') && (
        <P name="Wi-Fi antenna" tid="w-wifi" tag="Wi-Fi antenna" tagAt={[-16, 57.6, -4]} axis="y" from={5}>
          <Cy r={2.4} h={0.8} p={[-16, 48.4, -4]} c="#18181b" />
          <B s={[0.8, 9, 0.8]} p={[-17.2, 53, -4]} c="#27272a" rot={[0, 0, 0.12]} />
          <B s={[0.8, 9, 0.8]} p={[-14.8, 53, -4]} c="#27272a" rot={[0, 0, -0.12]} />
          <Cable pts={[[-22.6, 43.5, -8.5], [-24, 46, -7], [-20, 48.6, -4.5], [-16, 48.8, -4]]} r={0.12} c="#eab308" />
        </P>
      )}
      {has('f-power') && (
        <P name="AC power cord" tid="f-power" tag="Power cord" tagAt={[-30, 6.4, -1]} axis="y" from={4}>
          <B s={[1.6, 2.8, 3.4]} p={[-23.4, 6, -1]} c="#27272a" />
          <Cable pts={[[-24.2, 6, -1], [-29, 6, -1], [-34, 1, 4], [-44, 0.3, 8]]} r={0.45} c="#18181b" />
        </P>
      )}
      {has('f-display') && (
        <P name="DisplayPort cable (to GPU)" tid="f-display" tag="Display cable" tagAt={[-29, 23.5, -7.5]} axis="y" from={4}>
          <B s={[1.6, 1.4, 2.4]} p={[-23.4, 23.8, -6.7]} c="#64748b" m={0.6} />
          <Cable pts={[[-24.2, 23.8, -6.7], [-30, 22, -8], [-36, 5, -9], [-44, 0.3, -10]]} r={0.35} c="#18181b" />
        </P>
      )}
      {has('f-panel') && (
        <P name="Tempered-glass side panel" tid="f-panel" tag="Glass side panel" tagAt={[16, 46, 11.7]} axis="y" from={3}>
          <mesh position={[0, 24, 11.5]}>
            <boxGeometry args={[44.6, 47.6, 0.4]} />
            <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.16} roughness={0.05} metalness={0.1} depthWrite={false} />
          </mesh>
        </P>
      )}
    </group>
  );
}

/* ───────── camera framing ───────── */

function CameraRig({ mode, compact }: { mode: 'empty' | 'bench' | 'case' | 'both'; compact: boolean }) {
  const { camera, controls } = useThree() as unknown as { camera: THREE.PerspectiveCamera; controls: { target: THREE.Vector3; update: () => void } | null };
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3; t: number } | null>(null);
  useEffect(() => {
    const k = compact ? 1.15 : 1;
    const conf: Record<typeof mode, [V3, V3]> = {
      empty: [[30, 28, 46], [0, 4, 0]],
      bench: [[22, 36, 36], [0, 8, 0]],
      case: [[50, 44, 86], [0, 22, 0]],
      both: [[60, 56, 108], [0, 16, 12]],
    };
    const [p, t] = conf[mode];
    goal.current = { pos: new THREE.Vector3(...p).multiplyScalar(k), target: new THREE.Vector3(...t), t: 0 };
  }, [mode, compact]);
  useFrame((_, dt) => {
    const g = goal.current;
    if (!g || !controls) return;
    g.t += dt;
    const a = 1 - Math.exp(-Math.min(dt, 0.1) * 4);
    camera.position.lerp(g.pos, a);
    controls.target.lerp(g.target, a);
    controls.update();
    if (g.t > 2.5 && camera.position.distanceTo(g.pos) < 0.5) goal.current = null;
  });
  return null;
}

/**
 * Projects every tag anchor to screen space each frame and moves its DOM label (no React re-render).
 * Overlapping labels are culled: hovered first, then NEW (current step), then nearest to the camera.
 */
function TagProjector({ tags, els, hover }: { tags: MutableRefObject<TagInfo[]>; els: MutableRefObject<Map<string, HTMLDivElement>>; hover: MutableRefObject<string | null> }) {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const items: { el: HTMLDivElement; x: number; y: number; z: number; rank: number }[] = [];
    for (const t of tags.current) {
      const el = els.current.get(t.key);
      if (!el) continue;
      t.obj.getWorldPosition(v).project(camera);
      if (v.z > 1 || v.z < -1) {
        el.style.display = 'none';
        continue;
      }
      el.style.display = '';
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.zIndex = String(Math.round((1 - v.z) * 100000));
      const rank = (hover.current === t.name ? 0 : t.isNew ? 1 : 2) + v.z;
      items.push({ el, x, y, z: v.z, rank });
    }
    items.sort((p, q) => p.rank - q.rank);
    const placed: [number, number, number, number][] = [];
    for (const it of items) {
      const pill = it.el.firstElementChild as HTMLElement | null;
      const w = (pill?.offsetWidth ?? 80) + 6;
      const h = (pill?.offsetHeight ?? 40) + 2;
      const r: [number, number, number, number] = [it.x - w / 2, it.y - h, it.x + w / 2, it.y];
      const hit = placed.some((p) => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1]);
      it.el.style.visibility = hit ? 'hidden' : 'visible';
      if (!hit) placed.push(r);
    }
  });
  return null;
}

/* ───────── viewer ───────── */

export default function Viewer3D({
  has,
  powered,
  compact = false,
  fresh = [],
}: {
  has: (id: string) => boolean;
  powered: boolean;
  compact?: boolean;
  /** target ids from the current step: their labels are marked NEW */
  fresh?: string[];
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [spin, setSpin] = useState(false);
  const [labels, setLabels] = useState(true);
  const inCase = has('c-mobo');
  const boardOut = has('p-mobo') && !inCase;
  const caseOn = has('c-case');
  const mode = caseOn ? (boardOut ? 'both' : 'case') : boardOut ? 'bench' : 'empty';
  const boxPos: V3 = caseOn ? [0, 0, 32] : [0, 0, 0];
  const freshKey = fresh.join(',');
  const [tags, setTags] = useState<TagInfo[]>([]);
  const tagsRef = useRef<TagInfo[]>([]);
  tagsRef.current = tags;
  const hoverRef = useRef<string | null>(null);
  hoverRef.current = hover;
  const els = useRef(new Map<string, HTMLDivElement>());
  const register = useCallback((t: TagInfo) => setTags((list) => [...list.filter((x) => x.key !== t.key), t]), []);
  const unregister = useCallback((k: string) => setTags((list) => list.filter((x) => x.key !== k)), []);
  const ctx = useMemo<Ctx>(
    () => ({ hover, setHover: compact ? () => {} : setHover, labels: labels && !compact, fresh: new Set(fresh), register, unregister }),
    [hover, compact, labels, freshKey, register, unregister],
  );

  return (
    <div className={`viewer3d ${compact ? 'compact' : ''}`}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [42, 40, 72], fov: 38, near: 0.5, far: 600 }} onPointerMissed={() => setHover(null)}>
        <color attach="background" args={['#eef2f6']} />
        <hemisphereLight args={['#ffffff', '#cbd5e1', 1.1]} />
        <directionalLight position={[30, 60, 40]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-40, 30, -20]} intensity={0.5} />
        <ViewCtx.Provider value={ctx}>
          {caseOn && (
            <P name="ATX mid-tower case" tid="c-case" axis="y" from={10}>
              <Case has={has} powered={powered} />
            </P>
          )}
          {inCase && (
            <P name="Motherboard" tid="c-mobo" tag="Motherboard" tagAt={at(60, 262, 0.4)} from={6} p={BOARD_IN_CASE}>
              <Board has={has} powered={powered} />
            </P>
          )}
          {boardOut && (
            <group position={boxPos}>
              <P name="Motherboard box" axis="y" from={4}>
                <B s={[28, 7.6, 34]} p={[0, 3.8, 0]} c="#c08a55" r={0.9} />
              </P>
              <P name="Motherboard" tid="p-mobo" tag="Motherboard" tagAt={at(60, 262, 0.4)} axis="y" from={6} p={[0, 7.7, 0]} rot={[-PI / 2, 0, 0]}>
                <Board has={has} powered={powered} />
              </P>
            </group>
          )}
        </ViewCtx.Provider>
        <mesh rotation={[-PI / 2, 0, 0]} position={[0, -0.81, 0]} receiveShadow>
          <circleGeometry args={[90, 64]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <ContactShadows position={[0, -0.8, 0]} scale={120} blur={2.4} opacity={0.35} far={60} />
        <OrbitControls makeDefault enablePan={!compact} enableZoom={!compact} autoRotate={compact || spin} autoRotateSpeed={compact ? 1.2 : 0.6} minDistance={15} maxDistance={180} maxPolarAngle={PI / 2 - 0.02} />
        <CameraRig mode={mode} compact={compact} />
        <TagProjector tags={tagsRef} els={els} hover={hoverRef} />
      </Canvas>
      <div className="tag-layer">
        {tags.map((t) => (
          <div
            key={t.key}
            className="tag-pos"
            style={{ display: 'none' }}
            ref={(el) => {
              if (el) els.current.set(t.key, el);
              else els.current.delete(t.key);
            }}
          >
            <div className={`tag ${hover === t.name ? 'lit' : ''} ${t.isNew ? 'new' : ''}`} onMouseEnter={() => setHover(t.name)} onMouseLeave={() => setHover(null)}>
              <span className="tag-pill">
                {t.isNew && <b>NEW</b>}
                {t.tag}
              </span>
              <span className="tag-line" />
              <span className="tag-dot" />
            </div>
          </div>
        ))}
      </div>
      {mode === 'empty' && <div className="viewer-empty">Your build will appear here in 3D as you add parts.</div>}
      {!compact && (
        <>
          <div className="viewer-hover">{hover ?? 'Hover a part or label to highlight it'}</div>
          <div className="viewer-tools">
            <button className={`btn small ${labels ? 'on' : ''}`} onClick={() => setLabels((s) => !s)}>
              {labels ? '🏷 Labels on' : '🏷 Labels off'}
            </button>
            <button className="btn small" onClick={() => setSpin((s) => !s)}>
              {spin ? '⏸ Stop rotation' : '⟳ Auto-rotate'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
