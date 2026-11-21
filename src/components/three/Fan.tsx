import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { B, useRgb, type V3 } from './core';
import { hubLabel } from './textures';

const pol = (r: number, a: number) => new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r);

/**
 * Fan facing local +z (air blows toward −z… direction doesn't matter visually).
 * Square extruded frame with mounting holes, curved pitched blades, labelled hub, optional RGB ring.
 */
export function Fan({
  size = 12,
  depth = 2.5,
  blades = 9,
  powered,
  frame = '#f4f4f5',
  blade = '#f8fafc',
  hub = '#e4e4e7',
  rgb = true,
  frameless = false,
  speed = 14,
  phase = 0,
}: {
  size?: number;
  depth?: number;
  blades?: number;
  powered: boolean;
  frame?: string;
  blade?: string;
  hub?: string;
  rgb?: boolean;
  frameless?: boolean;
  speed?: number;
  phase?: number;
}) {
  const spin = useRef<THREE.Group>(null);
  const ringMat = useRgb(powered && rgb, phase, frame);
  useFrame((_, dt) => {
    if (spin.current && powered) spin.current.rotation.z -= dt * speed;
  });

  const g = useMemo(() => {
    const h = size / 2;
    const R = size * 0.46;
    const cr = size * 0.08;
    const s = new THREE.Shape();
    s.moveTo(-h + cr, -h);
    s.lineTo(h - cr, -h);
    s.quadraticCurveTo(h, -h, h, -h + cr);
    s.lineTo(h, h - cr);
    s.quadraticCurveTo(h, h, h - cr, h);
    s.lineTo(-h + cr, h);
    s.quadraticCurveTo(-h, h, -h, h - cr);
    s.lineTo(-h, -h + cr);
    s.quadraticCurveTo(-h, -h, -h + cr, -h);
    const hole = new THREE.Path();
    hole.absarc(0, 0, R, 0, Math.PI * 2, true);
    s.holes.push(hole);
    for (const [x, y] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const ph = new THREE.Path();
      ph.absarc(x * (h - size * 0.065), y * (h - size * 0.065), size * 0.02, 0, Math.PI * 2, true);
      s.holes.push(ph);
    }
    const frameGeo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2, curveSegments: 40 });
    frameGeo.translate(0, 0, -depth / 2);

    const r0 = size * 0.16;
    const Rb = R * 0.96;
    const b = new THREE.Shape();
    const p1 = pol(r0, -0.2);
    const p2 = pol(Rb, 0.02);
    const p3 = pol(Rb, 0.58);
    const p4 = pol(r0, 0.42);
    const c1 = pol(r0 + (Rb - r0) * 0.55, -0.16);
    const c2 = pol(Rb * 1.04, 0.3);
    const c3 = pol(r0 + (Rb - r0) * 0.5, 0.62);
    b.moveTo(p1.x, p1.y);
    b.quadraticCurveTo(c1.x, c1.y, p2.x, p2.y);
    b.quadraticCurveTo(c2.x, c2.y, p3.x, p3.y);
    b.quadraticCurveTo(c3.x, c3.y, p4.x, p4.y);
    b.closePath();
    const bladeGeo = new THREE.ExtrudeGeometry(b, { depth: Math.max(0.04, size * 0.005), bevelEnabled: false, curveSegments: 14 });
    bladeGeo.translate(0, 0, -size * 0.0025);
    return { frameGeo, bladeGeo, R, r0 };
  }, [size, depth]);

  const hubTex = hubLabel(hub === '#e4e4e7' ? '#a1a1aa' : '#3f3f46');
  const pad = size * 0.11;

  return (
    <group>
      {!frameless && (
        <>
          <mesh geometry={g.frameGeo} castShadow receiveShadow>
            <meshStandardMaterial color={frame} roughness={0.55} metalness={0.05} />
          </mesh>
          {/* rubber anti-vibration corners */}
          {[
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
          ].map(([x, y]) =>
            [1, -1].map((zs) => (
              <B key={`${x}${y}${zs}`} s={[pad, pad, 0.12]} p={[x * (size / 2 - pad / 2), y * (size / 2 - pad / 2), zs * (depth / 2 + 0.08)] as V3} c="#9ca3af" r={0.9} />
            )),
          )}
        </>
      )}
      {frameless && (
        <mesh>
          <torusGeometry args={[g.R + 0.12, 0.12, 8, 48]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.5} roughness={0.4} />
        </mesh>
      )}
      {rgb && (
        <mesh position={[0, 0, depth / 2 - 0.15]}>
          <torusGeometry args={[g.R - 0.05, 0.1, 8, 64]} />
          <meshStandardMaterial ref={ringMat} roughness={0.3} />
        </mesh>
      )}
      {/* motor struts on the back */}
      {[0, 1, 2, 3].map((i) => (
        <B key={i} s={[g.R, size * 0.025, size * 0.03]} p={[Math.cos((i * PI2) / 4 + 0.4) * g.R * 0.5, Math.sin((i * PI2) / 4 + 0.4) * g.R * 0.5, -depth / 2 + 0.1]} rot={[0, 0, (i * PI2) / 4 + 0.4]} c={frame} r={0.6} />
      ))}
      <group ref={spin}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[g.r0, g.r0 * 1.05, depth * 0.75, 32]} />
          <meshStandardMaterial color={hub} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, depth * 0.38]}>
          <circleGeometry args={[g.r0 * 0.92, 32]} />
          <meshStandardMaterial map={hubTex} roughness={0.5} />
        </mesh>
        {Array.from({ length: blades }).map((_, i) => (
          <group key={i} rotation={[0, 0, (i / blades) * PI2]}>
            <group rotation={[0, 0, 0.2]}>
              <mesh geometry={g.bladeGeo} rotation={[0.5, 0, -0.2]} castShadow>
                <meshStandardMaterial color={blade} roughness={0.4} transparent opacity={0.94} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}

const PI2 = Math.PI * 2;
