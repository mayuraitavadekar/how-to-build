import { useFrame } from '@react-three/fiber';
import { createContext, useContext, useEffect, useId, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';

/*
 World axes (1 unit = 1 cm):
   x → case depth (rear = −x, front = +x)
   y → up
   z → case width (motherboard tray = −z, glass side panel = +z)
 Motherboard-local axes: x/y in the board plane, z out of the board.
 2D motherboard coordinates (mx 0..244, my 0..305, ≈ mm) map with L().
*/

export type V3 = [number, number, number];
export const PI = Math.PI;
export const L = (mx: number, my: number): [number, number] => [(mx - 122) / 10, (152.5 - my) / 10];
export const at = (mx: number, my: number, z: number): V3 => {
  const [x, y] = L(mx, my);
  return [x, y, z];
};
export const BOARD_IN_CASE: V3 = [-8.3, 29.25, -9.2];
const HIGHLIGHT = new THREE.Color('#0ea5e9');

export interface TagInfo {
  key: string;
  tag: string;
  name: string;
  isNew: boolean;
  obj: THREE.Object3D;
}
export interface ViewCtxValue {
  hover: string | null;
  setHover: (n: string | null) => void;
  labels: boolean;
  fresh: Set<string>;
  register: (t: TagInfo) => void;
  unregister: (key: string) => void;
  powered: boolean;
  pressPower: () => void;
  canPower: boolean;
}
export const ViewCtx = createContext<ViewCtxValue>({
  hover: null,
  setHover: () => {},
  labels: false,
  fresh: new Set(),
  register: () => {},
  unregister: () => {},
  powered: false,
  pressPower: () => {},
  canPower: false,
});

/* ───────── primitives ───────── */

interface MatProps {
  c: string;
  m?: number;
  r?: number;
  e?: string;
  ei?: number;
  op?: number;
  map?: THREE.Texture;
  alphaMap?: THREE.Texture;
  side?: THREE.Side;
}

export function Mat({ c, m = 0.15, r = 0.6, e, ei = 0.6, op, map, alphaMap, side }: MatProps) {
  return (
    <meshStandardMaterial
      color={c}
      metalness={m}
      roughness={r}
      emissive={e ?? '#000000'}
      emissiveIntensity={e ? ei : 0}
      transparent={op !== undefined}
      opacity={op ?? 1}
      depthWrite={op === undefined || op > 0.6}
      map={map}
      alphaMap={alphaMap}
      alphaTest={alphaMap ? 0.5 : 0}
      side={side ?? (alphaMap ? THREE.DoubleSide : THREE.FrontSide)}
    />
  );
}

/** Box. */
export function B({ s, p, rot, ...mat }: { s: V3; p: V3; rot?: V3 } & MatProps) {
  return (
    <mesh position={p} rotation={rot} castShadow receiveShadow>
      <boxGeometry args={s} />
      <Mat {...mat} />
    </mesh>
  );
}

/** Box with a texture on one face only (+z by default: 4, −x: 1, +x: 0, +y: 2). */
export function BFace({ s, p, rot, face = 4, map, c, faceColor = '#ffffff', m = 0.15, r = 0.6 }: { s: V3; p: V3; rot?: V3; face?: number; map: THREE.Texture; c: string; faceColor?: string; m?: number; r?: number }) {
  return (
    <mesh position={p} rotation={rot} castShadow receiveShadow>
      <boxGeometry args={s} />
      {[0, 1, 2, 3, 4, 5].map((i) =>
        i === face ? (
          <meshStandardMaterial key={i} attach={`material-${i}`} color={faceColor} map={map} metalness={m} roughness={r} />
        ) : (
          <meshStandardMaterial key={i} attach={`material-${i}`} color={c} metalness={m} roughness={r} />
        ),
      )}
    </mesh>
  );
}

/** Cylinder along an axis. */
export function Cy({ r, h, p, axis = 'y', seg = 24, rr, ...mat }: { r: number; h: number; p: V3; axis?: 'x' | 'y' | 'z'; seg?: number; rr?: number } & Omit<MatProps, 'r'>) {
  const rot: V3 = axis === 'z' ? [PI / 2, 0, 0] : axis === 'x' ? [0, 0, PI / 2] : [0, 0, 0];
  return (
    <mesh position={p} rotation={rot} castShadow>
      <cylinderGeometry args={[r, r, h, seg]} />
      <Mat {...mat} r={rr} />
    </mesh>
  );
}

export function Cable({ pts, r = 0.35, c = '#52525b', sleeve }: { pts: V3[]; r?: number; c?: string; sleeve?: string }) {
  const key = JSON.stringify(pts);
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))), 64, r, 12, false), [key, r]);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={c} roughness={sleeve ? 0.95 : 0.7} metalness={0.05} />
    </mesh>
  );
}

/** Animated RGB colour on a material while powered. */
export function useRgb(powered: boolean, phase = 0, idle = '#e5e7eb') {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    if (powered) {
      const h = (clock.elapsedTime * 0.12 + phase) % 1;
      m.color.setHSL(h, 0.85, 0.62);
      m.emissive.setHSL(h, 0.95, 0.5);
      m.emissiveIntensity = 1.3;
    } else {
      m.color.set(idle);
      m.emissiveIntensity = 0;
    }
  });
  return ref;
}

export function RGB({ s, p, powered, phase = 0, op }: { s: V3; p: V3; powered: boolean; phase?: number; op?: number }) {
  const ref = useRgb(powered, phase);
  return (
    <mesh position={p}>
      <boxGeometry args={s} />
      <meshStandardMaterial ref={ref} roughness={0.35} transparent={op !== undefined} opacity={op ?? 1} />
    </mesh>
  );
}

/** Row of heatsink fins on a base. */
export function Heatsink({ p, s, fins, dir = 'x', c = '#4b5563', finH }: { p: V3; s: V3; fins: number; dir?: 'x' | 'y'; c?: string; finH?: number }) {
  const [w, h, d] = s;
  const fh = finH ?? d * 0.75;
  return (
    <group position={p}>
      <B s={[w, h, d - fh]} p={[0, 0, -(d / 2) + (d - fh) / 2]} c={c} m={0.7} r={0.35} />
      {Array.from({ length: fins }).map((_, i) => {
        const t = fins === 1 ? 0 : i / (fins - 1) - 0.5;
        return dir === 'x' ? (
          <B key={i} s={[(w / fins) * 0.45, h, fh]} p={[t * w * 0.94, 0, d / 2 - fh / 2]} c={c} m={0.7} r={0.35} />
        ) : (
          <B key={i} s={[w, (h / fins) * 0.45, fh]} p={[0, t * h * 0.94, d / 2 - fh / 2]} c={c} m={0.7} r={0.35} />
        );
      })}
    </group>
  );
}

/**
 * A part: animates in, glows on hover, and (optionally) carries a name tag
 * pinned at `tagAt` (in this part's own coordinates).
 */
export function P({
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

  // glow this part's own meshes (not nested parts) while hovered
  useEffect(() => {
    const g = inner.current;
    if (!g || !lit) return;
    const touched: [THREE.MeshStandardMaterial, THREE.Color, number][] = [];
    const walk = (o: THREE.Object3D) => {
      if (o !== g && o.userData.part) return;
      const mats = (o as THREE.Mesh).material;
      const list = Array.isArray(mats) ? mats : mats ? [mats] : [];
      for (const mat of list as THREE.MeshStandardMaterial[]) {
        if ('emissive' in mat) {
          touched.push([mat, mat.emissive.clone(), mat.emissiveIntensity]);
          mat.emissive.copy(HIGHLIGHT);
          mat.emissiveIntensity = 0.5;
        }
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
