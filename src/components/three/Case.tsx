import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useContext, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { MOBO_HOLES } from '../Motherboard';
import { B, BFace, BOARD_IN_CASE, Cable, Cy, L, P, PI, ViewCtx, type V3 } from './core';
import { Fan } from './Fan';
import { brandLabel, ioShieldTexture, perfTexture, psuLabel, shroudAlpha } from './textures';

const WHITE = '#ececef';
const W_M = 0.15;
const W_R = 0.5;

/** Rear panel: one steel sheet with real cut-outs (fan, I/O, 7 slots, PSU). Spans x −22.1 … −22.5. */
function RearPanel() {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-11.5, 0);
    s.lineTo(11.5, 0);
    s.lineTo(11.5, 48);
    s.lineTo(-11.5, 48);
    s.closePath();
    const rect = (z0: number, z1: number, y0: number, y1: number) => {
      const p = new THREE.Path();
      p.moveTo(z0, y0);
      p.lineTo(z0, y1);
      p.lineTo(z1, y1);
      p.lineTo(z1, y0);
      p.closePath();
      s.holes.push(p);
    };
    const fan = new THREE.Path();
    fan.absarc(1.5, 38, 5.6, 0, Math.PI * 2, true);
    s.holes.push(fan);
    rect(-9.9, -5.1, 28.6, 44.6);
    for (let i = 0; i < 7; i++) rect(-5, 6, 25.8 - i * 2 - 0.65, 25.8 - i * 2 + 0.65);
    rect(-8, 6, 0.9, 9.6);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.4, bevelEnabled: false, curveSegments: 40 });
    g.rotateY(-PI / 2);
    return g;
  }, []);
  return (
    <mesh geometry={geo} position={[-22.1, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial color={WHITE} metalness={W_M} roughness={W_R} />
    </mesh>
  );
}

/** Top-front I/O: power button (clickable), reset, USB-A ×2, USB-C, audio, LEDs. */
function FrontIO() {
  const { powered, pressPower, canPower, setHover } = useContext(ViewCtx);
  const btn = useRef<THREE.Group>(null);
  const hdd = useRef<THREE.MeshStandardMaterial>(null);
  const [down, setDown] = useState(0);
  useFrame(({ clock }, dt) => {
    if (btn.current) btn.current.position.y = THREE.MathUtils.damp(btn.current.position.y, down > 0 ? -0.12 : 0, 18, dt);
    if (hdd.current) hdd.current.emissiveIntensity = powered && Math.sin(clock.elapsedTime * 9) * Math.sin(clock.elapsedTime * 2.3) > 0.3 ? 2 : 0;
  });
  const y = 48.06;
  const x = 19.7;
  return (
    <group>
      {/* recessed I/O strip */}
      <RoundedBox args={[3.6, 0.12, 20.5]} radius={0.05} smoothness={2} position={[x, y, 0]}>
        <meshStandardMaterial color="#27272a" metalness={0.3} roughness={0.6} />
      </RoundedBox>
      {/* power button */}
      <group position={[x, y + 0.06, 7]}>
        <Cy r={1.05} h={0.08} p={[0, 0.02, 0]} c="#a1a1aa" m={0.9} rr={0.25} />
        <mesh position={[0, 0.08, 0]} rotation={[PI / 2, 0, 0]}>
          <torusGeometry args={[0.92, 0.07, 10, 48]} />
          <meshStandardMaterial color={powered ? '#e0f2fe' : '#52525b'} emissive={powered ? '#38bdf8' : '#000'} emissiveIntensity={powered ? 2.2 : 0} />
        </mesh>
        <group
          ref={btn}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
            setHover(canPower ? 'Power button: click to turn the PC on!' : 'Power button');
          }}
          onPointerOut={() => {
            document.body.style.cursor = '';
            setHover(null);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setDown((d) => d + 1);
            setTimeout(() => setDown((d) => d - 1), 180);
            pressPower();
          }}
        >
          <Cy r={0.8} h={0.3} p={[0, 0.15, 0]} c="#d4d4d8" m={0.85} rr={0.2} />
          <mesh position={[0, 0.31, 0]} rotation={[-PI / 2, 0, 0]}>
            <ringGeometry args={[0.28, 0.36, 32, 1, 0.5, Math.PI * 2 - 1]} />
            <meshStandardMaterial color="#3f3f46" />
          </mesh>
          <B s={[0.07, 0.02, 0.36]} p={[0.18, 0.31, 0]} c="#3f3f46" />
        </group>
      </group>
      {/* reset */}
      <Cy r={0.32} h={0.14} p={[x, y + 0.1, 4.9]} c="#3f3f46" />
      {/* USB-A ×2 */}
      {[2.6, 0.4].map((z) => (
        <group key={z} position={[x, y + 0.04, z]}>
          <B s={[0.62, 0.06, 1.45]} p={[0, 0, 0]} c="#cbd5e1" m={0.9} r={0.25} />
          <B s={[0.46, 0.08, 1.25]} p={[0, 0.01, 0]} c="#050505" />
          <B s={[0.14, 0.1, 1.05]} p={[0.08, 0.02, 0]} c="#2563eb" />
        </group>
      ))}
      {/* USB-C */}
      <group position={[x, y + 0.04, -1.8]}>
        <RoundedBox args={[0.42, 0.06, 1.0]} radius={0.02} smoothness={2}>
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.25} />
        </RoundedBox>
        <B s={[0.26, 0.08, 0.8]} p={[0, 0.01, 0]} c="#050505" />
      </group>
      {/* audio combo jack */}
      <Cy r={0.36} h={0.1} p={[x, y + 0.07, -3.6]} c="#a1a1aa" m={0.9} rr={0.25} />
      <Cy r={0.18} h={0.12} p={[x, y + 0.08, -3.6]} c="#050505" />
      {/* power + drive LEDs */}
      <mesh position={[x, y + 0.08, -5.4]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#e5e7eb" emissive="#ffffff" emissiveIntensity={powered ? 2 : 0} />
      </mesh>
      <mesh position={[x, y + 0.08, -6.1]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial ref={hdd} color="#fde68a" emissive="#f59e0b" emissiveIntensity={0} />
      </mesh>
    </group>
  );
}

/* ───────── case (world coordinates) ───────── */

export function Case({ has, powered }: { has: (id: string) => boolean; powered: boolean }) {
  const frontMesh = perfTexture(26, 54, 0.38);
  return (
    <group>
      {/* steel shell */}
      <RoundedBox args={[45, 0.5, 23]} radius={0.2} smoothness={3} position={[0, 0.25, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={WHITE} metalness={W_M} roughness={W_R} />
      </RoundedBox>
      <RoundedBox args={[45, 0.5, 23]} radius={0.2} smoothness={3} position={[0, 47.75, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={WHITE} metalness={W_M} roughness={W_R} />
      </RoundedBox>
      {/* magnetic dust filter on top */}
      <mesh position={[-5, 48.07, 0]} rotation={[-PI / 2, 0, 0]}>
        <planeGeometry args={[30, 19]} />
        <meshStandardMaterial color="#1f2937" alphaMap={perfTexture(60, 38, 0.42)} alphaTest={0.5} />
      </mesh>
      <RoundedBox args={[30.6, 0.06, 19.6]} radius={0.03} smoothness={2} position={[-5, 48.01, 0]}>
        <meshStandardMaterial color="#d4d4d8" />
      </RoundedBox>
      <B s={[45, 48, 0.4]} p={[0, 24, -11.3]} c={WHITE} m={W_M} r={W_R} />
      <B s={[43.5, 46.5, 0.15]} p={[0, 24, -10.05]} c="#f4f4f5" m={0.1} r={0.6} />
      {/* tray grommets + tie points */}
      {[
        [7.3, 34.5],
        [7.3, 22],
      ].map(([gx, gy]) => (
        <RoundedBox key={gy} args={[2.2, 9.5, 0.3]} radius={0.15} smoothness={3} position={[gx, gy, -9.9]}>
          <meshStandardMaterial color="#18181b" roughness={0.95} />
        </RoundedBox>
      ))}
      <RoundedBox args={[9, 1.6, 0.3]} radius={0.15} smoothness={3} position={[-17, 45.4, -9.9]}>
        <meshStandardMaterial color="#18181b" roughness={0.95} />
      </RoundedBox>
      <RearPanel />

      {/* front: frame + perforated mesh (fans are visible through it) */}
      <B s={[0.8, 2.2, 23]} p={[22.1, 46.9, 0]} c={WHITE} m={W_M} r={W_R} />
      <B s={[0.8, 2.2, 23]} p={[22.1, 1.1, 0]} c={WHITE} m={W_M} r={W_R} />
      <B s={[0.8, 48, 1.1]} p={[22.1, 24, 10.95]} c={WHITE} m={W_M} r={W_R} />
      <B s={[0.8, 48, 1.1]} p={[22.1, 24, -10.95]} c={WHITE} m={W_M} r={W_R} />
      <mesh position={[22.45, 24, 0]} rotation={[0, PI / 2, 0]}>
        <planeGeometry args={[20.8, 43.6]} />
        <meshStandardMaterial color="#e4e4e7" metalness={0.3} roughness={0.5} alphaMap={frontMesh} alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
      <BFace s={[0.1, 1.2, 5]} p={[22.55, 4.6, 0]} face={0} map={brandLabel('PROTO', '#52525b', '#ececef')} c={WHITE} />
      {/* rear fan grille + unused PCIe slot covers (vented) */}
      <mesh position={[-22.52, 38, 1.5]} rotation={[0, -PI / 2, 0]}>
        <circleGeometry args={[5.6, 48]} />
        <meshStandardMaterial color={WHITE} metalness={W_M} roughness={W_R} alphaMap={perfTexture(14, 14, 0.42)} alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) =>
        has('c-gpu') && i < 3 ? null : (
          <mesh key={i} position={[-22.35, 25.8 - i * 2, 0.5]} rotation={[0, -PI / 2, 0]}>
            <planeGeometry args={[11, 1.3]} />
            <meshStandardMaterial color={WHITE} metalness={W_M} roughness={W_R} alphaMap={perfTexture(18, 2, 0.4)} alphaTest={0.5} side={THREE.DoubleSide} />
          </mesh>
        ),
      )}
      {/* rubber feet */}
      {[
        [-18, -8.5],
        [18, -8.5],
        [-18, 8.5],
        [18, 8.5],
      ].map(([x, z]) => (
        <RoundedBox key={`${x}${z}`} args={[6, 1, 3]} radius={0.35} smoothness={3} position={[x, -0.4, z]}>
          <meshStandardMaterial color="#27272a" roughness={0.95} />
        </RoundedBox>
      ))}
      <FrontIO />
      <P name="Front I/O: USB-A ×2, USB-C, audio" tag="Front I/O" tagAt={[19.7, 48.3, 0.4]} axis="y" from={0}>
        <group />
      </P>
      <P name="Power button" tid="f-boot" tag="Power button" tagAt={[19.7, 48.5, 7]} axis="y" from={0}>
        <group />
      </P>

      {/* PSU shroud: solid top, side with PSU window + vents, cable cut-outs */}
      <B s={[44, 0.4, 21.6]} p={[0, 10.5, 0.4]} c={WHITE} m={W_M} r={W_R} />
      <mesh position={[0, 5.4, 11.05]}>
        <planeGeometry args={[44, 10]} />
        <meshStandardMaterial color={WHITE} metalness={W_M} roughness={W_R} alphaMap={shroudAlpha()} alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
      {[
        [2.7, -2.2, 5, 2.6],
        [-3, -8.4, 8, 1.6],
        [-17.5, -8.4, 4, 1.6],
      ].map(([x, z, w, d]) => (
        <RoundedBox key={`${x}${z}`} args={[w, 0.1, d]} radius={0.04} smoothness={2} position={[x, 10.72, z]}>
          <meshStandardMaterial color="#18181b" roughness={0.95} />
        </RoundedBox>
      ))}

      {/* ─── installed parts ─── */}
      {has('c-io') && (
        <P name="Rear I/O shield" tid="c-io" tag="I/O shield" tagAt={[-22.3, 44.9, -7.5]} axis="y" from={4}>
          {has('c-mobo') ? (
            <B s={[0.08, 15.9, 4.7]} p={[-22.06, 36.6, -7.5]} c="#c7ccd3" m={0.9} r={0.3} op={0.35} />
          ) : (
            <BFace s={[0.08, 15.9, 4.7]} p={[-22.06, 36.6, -7.5]} face={1} map={ioShieldTexture()} c="#c7ccd3" m={0.8} r={0.35} />
          )}
        </P>
      )}
      {has('c-standoffs') &&
        MOBO_HOLES.map(([mx, my], i) => {
          const [lx, ly] = L(mx, my);
          const pos: V3 = [BOARD_IN_CASE[0] + lx, BOARD_IN_CASE[1] + ly, -9.6];
          return (
            <P key={`${mx}${my}`} name="Motherboard standoffs" tid="c-standoffs" tag={i === 4 && !has('c-mobo') ? 'Standoffs' : undefined} tagAt={pos} axis="y" from={3}>
              <Cy r={0.38} h={0.75} p={pos} axis="z" c="#d4a017" m={0.9} rr={0.3} seg={6} />
            </P>
          );
        })}
      {has('c-psu') && (
        <P name="Power supply (PSU)" tid="c-psu" tag="Power supply" tagAt={[-14.2, 9.6, 6]} axis="y" from={8}>
          <RoundedBox args={[15, 8.6, 14]} radius={0.25} smoothness={3} position={[-14.1, 5.1, -1]} castShadow>
            <meshStandardMaterial color="#141416" metalness={0.35} roughness={0.55} />
          </RoundedBox>
          <mesh position={[-14.1, 5.1, 6.02]}>
            <planeGeometry args={[12, 7]} />
            <meshStandardMaterial map={psuLabel()} roughness={0.5} />
          </mesh>
          {/* modular sockets facing the front */}
          {[0, 1, 2].map((i) => (
            <B key={i} s={[0.2, 1.4, 2.4]} p={[-6.55, 3 + i * 2.2, 2.5]} c="#0a0a0a" />
          ))}
          {/* rear: honeycomb vent, C14 inlet, rocker switch */}
          <mesh position={[-21.65, 5.1, 1.4]} rotation={[0, -PI / 2, 0]}>
            <planeGeometry args={[8.5, 7.6]} />
            <meshStandardMaterial color="#141416" alphaMap={perfTexture(14, 12, 0.42)} alphaTest={0.5} side={THREE.DoubleSide} />
          </mesh>
          <B s={[0.3, 1.9, 2.6]} p={[-21.65, 6.1, -5.2]} c="#0a0a0a" />
          {[-0.6, 0, 0.6].map((dz, i) => (
            <B key={dz} s={[0.32, 0.5, 0.12]} p={[-21.66, i === 1 ? 6.45 : 5.95, -5.2 + dz]} c="#a1a1aa" m={0.9} r={0.3} />
          ))}
          <B s={[0.3, 1.5, 1.1]} p={[-21.65, 3.2, -5.2]} c="#0a0a0a" />
          <B s={[0.25, 0.65, 0.8]} p={[-21.85, 3.2, -5.2]} rot={[0, 0, powered ? 0.3 : -0.3]} c={powered ? '#16a34a' : '#b91c1c'} />
        </P>
      )}
      {has('c-psuscrews') &&
        [
          [8.6, -7.4],
          [8.6, 5.4],
          [1.6, -7.4],
          [1.6, 5.4],
        ].map(([y, z]) => (
          <P key={`${y}${z}`} name="PSU screws" tid="c-psuscrews" axis="y" from={2}>
            <Cy r={0.38} h={0.25} p={[-22.6, y, z]} axis="x" c="#27272a" m={0.8} rr={0.3} />
          </P>
        ))}
      {has('c-fan-f1') && (
        <P name="Front intake fan (top)" tid="c-fan-f1" tag="Front fan 1" tagAt={[0, 6.4, 0]} axis="y" from={6} p={[20.4, 33.5, 0]} rot={[0, PI / 2, 0]}>
          <Fan size={12} powered={powered} phase={0} />
        </P>
      )}
      {has('c-fan-f2') && (
        <P name="Front intake fan (bottom)" tid="c-fan-f2" tag="Front fan 2" tagAt={[0, 6.4, 0]} axis="y" from={6} p={[20.4, 20.8, 0]} rot={[0, PI / 2, 0]}>
          <Fan size={12} powered={powered} phase={0.15} />
        </P>
      )}
      {has('c-fan-r') && (
        <P name="Rear exhaust fan" tid="c-fan-r" tag="Rear fan" tagAt={[0, 6.4, 0]} axis="y" from={6} p={[-20.6, 38, 1.5]} rot={[0, PI / 2, 0]}>
          <Fan size={12} powered={powered} phase={0.3} />
        </P>
      )}
      {has('c-gpuscrews') &&
        [25.8, 23.8, 21.8].map((y) => (
          <P key={y} name="PCIe bracket screws" tid="c-gpuscrews" axis="y" from={2}>
            <Cy r={0.42} h={0.45} p={[-22.8, y, 4.6]} axis="x" c="#e5e7eb" m={0.9} rr={0.25} />
          </P>
        ))}
      {has('c-gpubracket') && (
        <P name="GPU support bracket" tid="c-gpubracket" tag="GPU support" tagAt={[8.5, 14, -2]} axis="y" from={5}>
          <Cy r={0.45} h={11.3} p={[8.5, 16.4, -2]} c="#a1a1aa" m={0.85} rr={0.3} />
          <Cy r={1.4} h={0.5} p={[8.5, 10.95, -2]} c="#27272a" />
          <B s={[3, 0.4, 1.5]} p={[8.5, 22, -2]} c="#27272a" />
        </P>
      )}
      {has('w-wifi') && (
        <P name="Wi-Fi antenna" tid="w-wifi" tag="Wi-Fi antenna" tagAt={[-16, 58, -4]} axis="y" from={5}>
          <RoundedBox args={[5.4, 0.8, 3.6]} radius={0.35} smoothness={3} position={[-16, 48.4, -4]}>
            <meshStandardMaterial color="#18181b" roughness={0.6} />
          </RoundedBox>
          {[-1.4, 1.4].map((dx) => (
            <RoundedBox key={dx} args={[0.9, 9.2, 0.45]} radius={0.2} smoothness={3} position={[-16 + dx, 53.2, -4]} rotation={[0, 0, -dx * 0.06]}>
              <meshStandardMaterial color="#27272a" roughness={0.6} />
            </RoundedBox>
          ))}
          <Cable pts={[[-22.7, 42.7, -8.3], [-24.2, 45.5, -7], [-20, 48.6, -4.5], [-16, 48.85, -4]]} r={0.12} c="#18181b" />
        </P>
      )}
      {has('f-power') && (
        <P name="AC power cord" tid="f-power" tag="Power cord" tagAt={[-30, 6.8, -5]} axis="y" from={4}>
          <RoundedBox args={[2.2, 2.4, 3.2]} radius={0.3} smoothness={3} position={[-23.1, 6.1, -5.2]}>
            <meshStandardMaterial color="#18181b" roughness={0.7} />
          </RoundedBox>
          <Cable pts={[[-24.2, 6.1, -5.2], [-29, 6.1, -5.2], [-34, 1, -1], [-44, 0.3, 4]]} r={0.45} c="#18181b" />
        </P>
      )}
      {has('f-display') && (
        <P name="DisplayPort cable (to the GPU, not the motherboard)" tid="f-display" tag="Display cable" tagAt={[-29, 24, -6]} axis="y" from={4}>
          <B s={[1.6, 0.9, 2.1]} p={[-23.4, 24.2, -2.1]} c="#52525b" m={0.6} />
          <Cable pts={[[-24.2, 24.2, -2.1], [-30, 22, -3], [-36, 5, -6], [-44, 0.3, -10]]} r={0.35} c="#18181b" />
        </P>
      )}
      {has('f-panel') && (
        <P name="Tempered-glass side panel" tid="f-panel" tag="Glass side panel" tagAt={[14, 45, 11.8]} axis="y" from={3}>
          <mesh position={[0, 24, 11.55]}>
            <boxGeometry args={[44.4, 47.4, 0.4]} />
            <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.14} roughness={0.04} metalness={0.1} clearcoat={1} depthWrite={false} />
          </mesh>
          {/* dark printed border around the glass */}
          <B s={[44.4, 1.4, 0.05]} p={[0, 47, 11.78]} c="#111827" op={0.85} />
          <B s={[44.4, 1.4, 0.05]} p={[0, 1, 11.78]} c="#111827" op={0.85} />
          <B s={[1.4, 44.6, 0.05]} p={[21.5, 24, 11.78]} c="#111827" op={0.85} />
          <B s={[1.4, 44.6, 0.05]} p={[-21.5, 24, 11.78]} c="#111827" op={0.85} />
          {[
            [-20.8, 46.3],
            [20.8, 46.3],
            [-20.8, 1.7],
            [20.8, 1.7],
          ].map(([x, y]) => (
            <Cy key={`${x}${y}`} r={0.55} h={0.5} p={[x, y, 11.95]} axis="z" c="#d4d4d8" m={0.9} rr={0.2} />
          ))}
        </P>
      )}
    </group>
  );
}
