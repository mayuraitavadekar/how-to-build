import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { Board } from './three/Board';
import { Case } from './three/Case';
import { at, BOARD_IN_CASE, P, PI, ViewCtx, type TagInfo, type V3, type ViewCtxValue } from './three/core';

/* ───────── camera framing ───────── */

export type ViewPreset = 'side' | 'front' | 'rear' | 'top';
const PRESETS: Record<ViewPreset, [V3, V3]> = {
  side: [[58, 60, 84], [0, 21, 0]],
  front: [[100, 42, 26], [0, 23, 0]],
  rear: [[-100, 44, -22], [0, 26, 0]],
  top: [[44, 92, 26], [10, 38, 0]],
};

function CameraRig({ mode, compact, preset }: { mode: 'empty' | 'bench' | 'case' | 'both'; compact: boolean; preset: { name: ViewPreset; n: number } | null }) {
  const { camera, controls } = useThree() as unknown as { camera: THREE.PerspectiveCamera; controls: { target: THREE.Vector3; update: () => void } | null };
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3; t: number } | null>(null);
  useEffect(() => {
    const k = compact ? 1.12 : 1;
    const conf: Record<typeof mode, [V3, V3]> = {
      empty: [[30, 28, 46], [0, 4, 0]],
      bench: [[26, 46, 46], [0, 12, 0]],
      case: PRESETS.side,
      both: [[62, 56, 108], [0, 16, 12]],
    };
    const [p, t] = conf[mode];
    goal.current = { pos: new THREE.Vector3(...p).multiplyScalar(k), target: new THREE.Vector3(...t), t: 0 };
  }, [mode, compact]);
  useEffect(() => {
    if (!preset) return;
    const [p, t] = PRESETS[preset.name];
    goal.current = { pos: new THREE.Vector3(...p), target: new THREE.Vector3(...t), t: 0 };
  }, [preset]);
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
function seeThrough(o: THREE.Object3D) {
  const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
  if (!m) return true;
  const list = Array.isArray(m) ? m : [m];
  return list.every((x) => x.transparent || (x as THREE.MeshStandardMaterial).alphaMap);
}

function TagProjector({ tags, els, hover }: { tags: MutableRefObject<TagInfo[]>; els: MutableRefObject<Map<string, HTMLDivElement>>; hover: MutableRefObject<string | null> }) {
  const { camera, size, scene } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const hidden = useRef(new Map<string, boolean>());
  const frame = useRef(0);
  useFrame(() => {
    // every few frames: is each label's anchor hidden behind something solid?
    if (frame.current++ % 8 === 0) {
      const camPos = camera.getWorldPosition(new THREE.Vector3());
      const p = new THREE.Vector3();
      for (const t of tags.current) {
        t.obj.getWorldPosition(p);
        const dir = p.clone().sub(camPos);
        const dist = dir.length();
        ray.set(camPos, dir.normalize());
        ray.far = dist - 0.9;
        const hit = ray.intersectObjects(scene.children, true).find((h) => (h.object as THREE.Mesh).isMesh && !seeThrough(h.object));
        hidden.current.set(t.key, !!hit);
      }
    }
    const items: { el: HTMLDivElement; x: number; y: number; rank: number }[] = [];
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
      const lit = hover.current === t.name;
      if (hidden.current.get(t.key) && !lit) {
        el.style.visibility = 'hidden';
        continue;
      }
      items.push({ el, x, y, rank: (lit ? 0 : t.isNew ? 1 : 2) + v.z });
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

/** Studio lighting baked into an environment map: no HDR download needed. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer intensity={2.2} position={[0, 30, 0]} rotation-x={PI / 2} scale={[80, 80, 1]} />
      <Lightformer intensity={1.4} position={[0, 20, 60]} scale={[90, 30, 1]} />
      <Lightformer intensity={0.8} position={[-60, 20, 0]} rotation-y={PI / 2} scale={[60, 30, 1]} />
      <Lightformer intensity={1.1} position={[60, 20, 0]} rotation-y={-PI / 2} scale={[60, 30, 1]} />
      <Lightformer form="ring" color="#bae6fd" intensity={1.5} position={[30, 40, 40]} scale={12} />
    </Environment>
  );
}

/* ───────── viewer ───────── */

export default function Viewer3D({
  has,
  powered,
  compact = false,
  fresh = [],
  canPower = false,
  onPower,
}: {
  has: (id: string) => boolean;
  powered: boolean;
  compact?: boolean;
  /** target ids from the current step: their labels are marked NEW */
  fresh?: string[];
  /** the build is complete and waiting to be switched on */
  canPower?: boolean;
  onPower?: () => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [spin, setSpin] = useState(false);
  const [labels, setLabels] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [preset, setPreset] = useState<{ name: ViewPreset; n: number } | null>(null);
  const inCase = has('c-mobo');
  const boardOut = has('p-mobo') && !inCase;
  const caseOn = has('c-case');
  const mode = caseOn ? (boardOut ? 'both' : 'case') : boardOut ? 'bench' : 'empty';
  const boxPos: V3 = caseOn ? [0, 0, 32] : [0, 0, 0];

  const [tags, setTags] = useState<TagInfo[]>([]);
  const tagsRef = useRef<TagInfo[]>([]);
  tagsRef.current = tags;
  const hoverRef = useRef<string | null>(null);
  hoverRef.current = hover;
  const els = useRef(new Map<string, HTMLDivElement>());
  const register = useCallback((t: TagInfo) => setTags((list) => [...list.filter((x) => x.key !== t.key), t]), []);
  const unregister = useCallback((k: string) => setTags((list) => list.filter((x) => x.key !== k)), []);

  const msgTimer = useRef<number>(0);
  const say = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout(msgTimer.current);
    msgTimer.current = window.setTimeout(() => setMsg(null), 2600);
  }, []);
  const pressPower = useCallback(() => {
    if (compact || !onPower) return;
    if (powered) say('Your PC is already running. Nice build!');
    else if (canPower) onPower();
    else say('Not yet: finish every build step, then press the power button.');
  }, [compact, onPower, powered, canPower, say]);

  const freshKey = fresh.join(',');
  const ctx = useMemo<ViewCtxValue>(
    () => ({
      hover,
      setHover: compact ? () => {} : setHover,
      labels: labels && !compact,
      fresh: new Set(fresh),
      register,
      unregister,
      powered,
      pressPower,
      canPower,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hover, compact, labels, freshKey, register, unregister, powered, pressPower, canPower],
  );

  return (
    <div className={`viewer3d ${compact ? 'compact' : ''}`}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [56, 46, 82], fov: 38, near: 0.5, far: 600 }} onPointerMissed={() => setHover(null)}>
        <color attach="background" args={['#eef2f6']} />
        <Studio />
        <ambientLight intensity={0.25} />
        <directionalLight position={[30, 60, 40]} intensity={1.3} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004}>
          <orthographicCamera attach="shadow-camera" args={[-60, 60, 60, -60, 1, 200]} />
        </directionalLight>
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
                <RoundedBox args={[28, 7.6, 34]} radius={0.4} smoothness={3} position={[0, 3.8, 0]} castShadow receiveShadow>
                  <meshStandardMaterial color="#c08a55" roughness={0.9} />
                </RoundedBox>
              </P>
              <P name="Motherboard" tid="p-mobo" tag="Motherboard" tagAt={at(60, 262, 0.4)} axis="y" from={6} p={[0, 7.7, 0]} rot={[-PI / 2, 0, 0]}>
                <Board has={has} powered={powered} />
              </P>
            </group>
          )}
        </ViewCtx.Provider>
        <mesh rotation={[-PI / 2, 0, 0]} position={[0, -0.91, 0]} receiveShadow>
          <circleGeometry args={[120, 64]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>
        <ContactShadows position={[0, -0.9, 0]} scale={130} blur={2.2} opacity={0.4} far={60} />
        <OrbitControls makeDefault enablePan={!compact} enableZoom={!compact} autoRotate={compact || spin} autoRotateSpeed={compact ? 1.1 : 0.6} minDistance={12} maxDistance={190} maxPolarAngle={PI / 2 - 0.02} />
        <CameraRig mode={mode} compact={compact} preset={preset} />
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
                {t.isNew && <b>{t.tag === 'Power button' ? 'PRESS' : 'NEW'}</b>}
                {t.tag}
              </span>
              <span className="tag-line" />
              <span className="tag-dot" />
            </div>
          </div>
        ))}
      </div>
      {mode === 'empty' && <div className="viewer-empty">Your build will appear here in 3D as you add parts.</div>}
      {msg && <div className="viewer-msg">{msg}</div>}
      {!compact && (
        <>
          <div className="viewer-hover">{hover ?? 'Hover a part or label to highlight it'}</div>
          {caseOn && (
            <div className="viewer-presets" role="group" aria-label="Camera angle">
              {(['side', 'front', 'rear', 'top'] as ViewPreset[]).map((p) => (
                <button key={p} className={preset?.name === p ? 'on' : ''} onClick={() => setPreset((o) => ({ name: p, n: (o?.n ?? 0) + 1 }))}>
                  {p === 'side' ? 'Glass side' : p === 'front' ? 'Front' : p === 'rear' ? 'Rear' : 'Top'}
                </button>
              ))}
            </div>
          )}
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
