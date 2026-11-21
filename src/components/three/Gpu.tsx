import { useMemo } from 'react';
import * as THREE from 'three';
import { B, BFace, Cy, PI, RGB } from './core';
import { Fan } from './Fan';
import { gpuEdgeLabel, perfTexture } from './textures';

/**
 * Graphics card in its own frame (origin = card centre).
 *   x: length (−x = I/O bracket end), y: thickness (fans face −y), z: height out of the slot (+z = top edge).
 * Size ≈ 30 × 6.4 × 12.6 cm (triple-slot, triple-fan).
 */
export function Gpu({ powered }: { powered: boolean }) {
  // bottom shroud plate with three fan openings
  const plate = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-15, -6.3);
    s.lineTo(15, -6.3);
    s.lineTo(15, 6.3);
    s.lineTo(-15, 6.3);
    s.closePath();
    for (const x of [-9.6, 0, 9.6]) {
      const h = new THREE.Path();
      h.absarc(x, 0, 4.5, 0, Math.PI * 2, true);
      s.holes.push(h);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, curveSegments: 48 });
    g.rotateX(Math.PI / 2);
    return g;
  }, []);

  return (
    <group>
      {/* PCB + gold fingers */}
      <B s={[32, 0.16, 11.2]} p={[-0.8, 1.9, -0.4]} c="#10231a" r={0.6} />
      <B s={[8.6, 0.18, 0.9]} p={[-5.5, 1.9, -6.4]} c="#d4a017" m={1} r={0.25} />
      {/* backplate with vents */}
      <B s={[30, 0.25, 12.4]} p={[0, 2.25, 0]} c="#3f3f46" m={0.75} r={0.35} />
      <mesh position={[11, 2.39, 0]} rotation={[-PI / 2, 0, 0]}>
        <planeGeometry args={[6.5, 10]} />
        <meshStandardMaterial color="#18181b" alphaMap={perfTexture(10, 16, 0.4)} alphaTest={0.5} />
      </mesh>
      {/* heatsink fin stack + heat pipes */}
      {Array.from({ length: 58 }).map((_, i) => (
        <B key={i} s={[0.07, 2.2, 11.4]} p={[-13.6 + i * 0.48, 0.6, 0]} c="#c7ccd3" m={0.85} r={0.3} />
      ))}
      {[-0.4, 0.2, 0.8, 1.4].map((y, i) => (
        <Cy key={i} r={0.3} h={27} p={[0, y, 5.9 - i * 0.05]} axis="x" c="#c2410c" m={0.9} rr={0.25} />
      ))}
      {/* shroud: bottom plate with fan holes, end caps, top-edge label + RGB */}
      <mesh geometry={plate} position={[0, -2.75, 0]} castShadow>
        <meshStandardMaterial color="#27272a" metalness={0.55} roughness={0.4} />
      </mesh>
      <B s={[30, 3.4, 0.35]} p={[0, -1.1, -6.3]} c="#27272a" m={0.55} r={0.4} />
      <BFace s={[30, 3.0, 0.35]} p={[0, -1.3, 6.3]} map={gpuEdgeLabel()} c="#27272a" m={0.5} r={0.45} />
      <RGB s={[26, 0.25, 0.2]} p={[1, -2.95, 6.35]} powered={powered} phase={0.5} />
      <B s={[0.4, 3.4, 12.6]} p={[15.1, -1.1, 0]} c="#27272a" m={0.55} r={0.4} />
      {/* silver accent strips between the fans */}
      {[-4.8, 4.8].map((x) => (
        <B key={x} s={[0.5, 0.1, 12.2]} p={[x, -3.15, 0]} c="#a1a1aa" m={0.9} r={0.25} />
      ))}
      {[-9.6, 0, 9.6].map((x, i) => (
        <group key={x} position={[x, -2.75, 0]} rotation={[PI / 2, 0, 0]}>
          <Fan size={8.8} depth={1.2} blades={11} powered={powered} frameless rgb={false} blade="#27272a" hub="#3f3f46" speed={i % 2 ? -10 : 10} />
        </group>
      ))}
      {/* 12V-2x6 socket on the top edge */}
      <B s={[2.2, 0.9, 0.7]} p={[4, 1.3, 6.6]} c="#0b0b0b" />
      {Array.from({ length: 6 }).map((_, i) => (
        <B key={i} s={[0.22, 0.25, 0.05]} p={[3.2 + i * 0.32, 1.3, 6.96]} c="#3f3f46" />
      ))}
      {/* I/O bracket with 3× DP + 1× HDMI and vents */}
      <B s={[0.12, 6.4, 12.4]} p={[-17.1, -0.6, 0]} c="#d4d4d8" m={0.9} r={0.25} />
      <B s={[0.12, 6.4, 1]} p={[-17.25, -0.6, 6.7]} c="#d4d4d8" m={0.9} r={0.25} />
      {[-4.2, -2.1, 0, 2.1].map((z, i) => (
        <group key={z} position={[-17.3, -1.1, z]}>
          <B s={[0.3, 0.75, i === 3 ? 1.55 : 1.75]} p={[0, 0, 0]} c="#1f2937" />
          <B s={[0.32, 0.45, i === 3 ? 1.25 : 1.4]} p={[-0.02, 0, 0]} c="#050505" />
        </group>
      ))}
      <mesh position={[-17.18, 1.4, 0]} rotation={[0, -PI / 2, 0]}>
        <planeGeometry args={[11, 1.6]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.25} alphaMap={perfTexture(24, 3, 0.42)} alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
