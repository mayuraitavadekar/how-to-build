import { RoundedBox } from '@react-three/drei';
import { MOBO_HOLES } from '../Motherboard';
import { at, B, BFace, Cable, Cy, Heatsink, L, P, PI, RGB, type V3 } from './core';
import { Fan } from './Fan';
import { Gpu } from './Gpu';
import { brandLabel, brushedTexture, cpuLabel, pcbTexture, ramLabel, ssdLabel } from './textures';

const DARK = '#0b0f16';

/** One rear-panel port (faces −x). */
function Port({ y, z, kind }: { y: number; z: number; kind: 'usb3' | 'usb10' | 'usbc' | 'lan' | 'hdmi' | 'dp' | 'sma' | 'btn' | 'jack' | 'optical'; jack?: string }) {
  const x = -13.35;
  const face = -14.3;
  switch (kind) {
    case 'sma':
      return (
        <group>
          <Cy r={0.32} h={1.4} p={[face + 0.2, y, z]} axis="x" c="#d4a017" m={1} rr={0.25} />
          <Cy r={0.14} h={0.1} p={[face - 0.5, y, z]} axis="x" c="#111" />
        </group>
      );
    case 'btn':
      return (
        <group>
          <B s={[1.9, 0.7, 0.9]} p={[x, y, z]} c="#1f2937" />
          <B s={[0.15, 0.45, 0.6]} p={[face - 0.05, y, z]} c="#e5e7eb" />
        </group>
      );
    case 'usbc':
      return (
        <group>
          <RoundedBox args={[1.9, 0.42, 1.0]} radius={0.18} smoothness={3} position={[x, y, z]}>
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.25} />
          </RoundedBox>
          <B s={[0.1, 0.25, 0.78]} p={[face - 0.01, y, z]} c="#050505" />
        </group>
      );
    case 'lan':
      return (
        <group>
          <B s={[1.9, 1.35, 1.65]} p={[x, y, z]} c="#cbd5e1" m={0.85} r={0.3} />
          <B s={[0.12, 1.05, 1.25]} p={[face - 0.01, y - 0.05, z]} c="#050505" />
          <B s={[0.05, 0.2, 0.25]} p={[face - 0.08, y + 0.5, z - 0.6]} c="#22c55e" e="#22c55e" ei={1} />
          <B s={[0.05, 0.2, 0.25]} p={[face - 0.08, y + 0.5, z + 0.6]} c="#f59e0b" e="#f59e0b" ei={1} />
        </group>
      );
    case 'hdmi':
    case 'dp':
      return (
        <group>
          <B s={[1.9, 0.62, 1.6]} p={[x, y, z]} c="#cbd5e1" m={0.85} r={0.3} />
          <B s={[0.1, 0.4, 1.35]} p={[face - 0.01, y, z]} c="#050505" />
        </group>
      );
    case 'jack':
    case 'optical':
      return (
        <group>
          <B s={[1.9, 0.95, 0.95]} p={[x, y, z]} c="#111827" />
          {kind === 'jack' ? <Cy r={0.18} h={0.1} p={[face - 0.01, y, z]} axis="x" c="#000" /> : <B s={[0.1, 0.4, 0.4]} p={[face - 0.01, y, z]} c="#000" />}
        </group>
      );
    default: {
      const tongue = kind === 'usb3' ? '#2563eb' : '#dc2626';
      return (
        <group>
          <B s={[1.9, 0.62, 1.45]} p={[x, y, z]} c="#cbd5e1" m={0.85} r={0.3} />
          <B s={[0.1, 0.46, 1.25]} p={[face - 0.01, y, z]} c="#050505" />
          <B s={[0.12, 0.14, 1.1]} p={[face - 0.03, y + 0.08, z]} c={tongue} />
        </group>
      );
    }
  }
}

const JACKS = ['#84cc16', '#ec4899', '#3b82f6', '#f97316', '#111827'];

function RearIO() {
  const y = (my: number) => L(0, my)[1];
  return (
    <group>
      <Port kind="sma" y={y(18)} z={0.9} />
      <Port kind="sma" y={y(18)} z={3.0} />
      <Port kind="btn" y={y(30)} z={0.9} />
      <Port kind="btn" y={y(30)} z={3.0} />
      {[40, 48, 56].map((my) => [0.95, 2.95].map((z) => <Port key={`${my}${z}`} kind={my === 56 ? 'usb10' : 'usb3'} y={y(my)} z={z} />))}
      <Port kind="usbc" y={y(64)} z={0.95} />
      <Port kind="usbc" y={y(64)} z={2.95} />
      <Port kind="lan" y={y(78)} z={1.1} />
      <Port kind="usbc" y={y(76)} z={3.1} />
      <Port kind="usb3" y={y(82)} z={3.1} />
      <Port kind="hdmi" y={y(94)} z={1.1} />
      <Port kind="dp" y={y(94)} z={3.0} />
      {[0, 1, 2].map((i) => (
        <group key={`a${i}`}>
          <Port kind="jack" y={y(116)} z={0.8 + i * 1.15} />
          <B s={[0.05, 0.2, 0.2]} p={[-14.33, y(116) + 0.35, 0.8 + i * 1.15]} c={JACKS[i]} />
        </group>
      ))}
      {[0, 1].map((i) => (
        <group key={`b${i}`}>
          <Port kind="jack" y={y(128)} z={0.8 + i * 1.15} />
          <B s={[0.05, 0.2, 0.2]} p={[-14.33, y(128) + 0.35, 0.8 + i * 1.15]} c={JACKS[3 + i]} />
        </group>
      ))}
      <Port kind="optical" y={y(128)} z={3.1} />
    </group>
  );
}

/** Electrolytic / polymer capacitor. */
const Cap = ({ p, r = 0.3, h = 0.8, c = '#1f2937' }: { p: V3; r?: number; h?: number; c?: string }) => (
  <group>
    <Cy r={r} h={h} p={[p[0], p[1], p[2] + h / 2]} axis="z" c={c} m={0.4} rr={0.4} />
    <Cy r={r * 0.92} h={0.02} p={[p[0], p[1], p[2] + h + 0.01]} axis="z" c="#cbd5e1" m={0.9} rr={0.3} />
  </group>
);

/* ───────── motherboard (local coordinates; board surface at z = 0) ───────── */

export function Board({ has, powered }: { has: (id: string) => boolean; powered: boolean }) {
  const cooler = has('m-cooler');
  const brushed = brushedTexture();
  return (
    <group>
      {/* PCB with printed traces + silkscreen */}
      <mesh position={[0, 0, -0.08]} castShadow receiveShadow>
        <boxGeometry args={[24.4, 30.5, 0.16]} />
        {[0, 1, 2, 3, 5].map((i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color="#0d1117" />
        ))}
        <meshStandardMaterial attach="material-4" map={pcbTexture()} roughness={0.5} metalness={0.15} />
      </mesh>

      {/* rear I/O cover + ports */}
      <RoundedBox args={[3.4, 14.2, 2.6]} radius={0.3} smoothness={3} position={at(17, 79, 1.3)} castShadow>
        <meshStandardMaterial color="#3a4252" metalness={0.75} roughness={0.35} map={brushed} />
      </RoundedBox>
      <BFace s={[0.05, 8, 1.6]} p={[L(34, 0)[0] + 0.02, L(0, 90)[1], 1.6]} face={0} map={brandLabel('PROTO', '#e2e8f0', '#334155')} c="#334155" />
      <RearIO />

      {/* VRM: heatsinks, chokes, capacitors */}
      <Heatsink p={at(88, 24, 1.0)} s={[10, 1.7, 2]} fins={14} c="#4b5563" />
      <Heatsink p={at(47, 76, 1.0)} s={[1.8, 8.4, 2]} fins={10} dir="y" c="#4b5563" />
      {Array.from({ length: 8 }).map((_, i) => (
        <B key={`ch${i}`} s={[0.75, 0.75, 0.55]} p={at(46 + i * 11, 37, 0.28)} c="#52525b" m={0.4} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <B key={`cv${i}`} s={[0.75, 0.75, 0.55]} p={at(64, 44 + i * 11, 0.28)} c="#52525b" m={0.4} />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <Cap key={`c${i}`} p={at(48 + i * 12, 42.5, 0)} r={0.25} h={0.7} />
      ))}

      {/* EPS + fan headers */}
      <B s={[2.6, 1.1, 1]} p={at(57, 7, 0.5)} c={DARK} />
      <B s={[1.2, 0.6, 0.6]} p={at(156, 9, 0.3)} c="#f1f5f9" />

      {/* CPU socket: frame, load plate, lever */}
      <B s={[5.6, 5.6, 0.25]} p={at(103, 75, 0.12)} c="#9aa3ad" m={0.85} r={0.3} />
      {!has('m-cpu') && (
        <>
          <B s={[4.4, 4.4, 0.05]} p={at(103, 75, 0.27)} c="#8a6a2a" m={0.9} r={0.4} />
          <B s={[4.6, 4.6, 0.3]} p={at(103, 75, 0.45)} c="#111111" />
        </>
      )}
      <B s={[0.5, 5.4, 0.4]} p={at(76, 75, 0.25)} c="#9aa3ad" m={0.85} r={0.3} />
      <B s={[0.5, 5.4, 0.4]} p={at(130, 75, 0.25)} c="#9aa3ad" m={0.85} r={0.3} />
      <Cy r={0.12} h={5.4} p={at(133, 75, 0.3)} c="#d4d4d8" m={0.9} rr={0.25} />
      <B s={[0.9, 0.3, 0.3]} p={at(136, 49, 0.3)} c="#d4d4d8" m={0.9} r={0.25} />

      {/* DIMM slots with latches */}
      {[163, 173, 183, 193].map((x) => (
        <group key={x}>
          <B s={[0.62, 13, 0.85]} p={at(x, 87, 0.42)} c={x === 173 || x === 193 ? '#3b2a6b' : '#141922'} />
          <B s={[0.7, 0.9, 1.1]} p={at(x, 20, 0.55)} c="#e5e7eb" />
          <B s={[0.7, 0.9, 1.1]} p={at(x, 154, 0.55)} c="#e5e7eb" />
        </group>
      ))}

      {/* 24-pin, USB headers, M.2 connector */}
      <B s={[1.2, 7, 1]} p={at(232, 95, 0.5)} c={DARK} />
      <B s={[1, 1, 0.8]} p={at(233, 145, 0.4)} c={DARK} />
      <B s={[1, 3, 0.9]} p={at(233, 175, 0.45)} c="#1e3a8a" />
      <B s={[0.6, 2.2, 0.5]} p={at(59, 130, 0.25)} c={DARK} />

      {/* PCIe slots (x16 armoured) */}
      <B s={[16, 0.8, 1.1]} p={at(118, 160, 0.55)} c="#c7ccd3" m={0.9} r={0.25} />
      <B s={[15.6, 0.4, 1.12]} p={at(118, 160, 0.56)} c="#111" />
      <B s={[0.6, 1.2, 1.3]} p={at(201, 160, 0.65)} c="#e5e7eb" />
      <B s={[2.6, 0.7, 1]} p={at(52, 184, 0.5)} c={DARK} />
      <B s={[16, 0.8, 1.1]} p={at(118, 230, 0.55)} c={DARK} />

      {/* M.2_2 heatsink, chipset heatsink */}
      <BFace s={[8.2, 2.2, 0.6]} p={at(99, 201, 0.3)} map={brandLabel('M.2 SHIELD', '#cbd5e1', '#4b5563')} c="#4b5563" m={0.7} r={0.35} />
      <RoundedBox args={[6.6, 4.4, 1]} radius={0.2} smoothness={3} position={at(183, 262, 0.5)} castShadow>
        <meshStandardMaterial color="#4b5563" metalness={0.75} roughness={0.35} map={brushed} />
      </RoundedBox>
      <BFace s={[4, 1.2, 0.06]} p={at(183, 262, 1.03)} map={brandLabel('PROTO', '#e2e8f0', '#1f2937')} c="#1f2937" />

      {/* audio section: codec + gold audio caps */}
      <B s={[1, 1, 0.15]} p={at(30, 262, 0.08)} c="#18181b" />
      {[0, 1, 2, 3].map((i) => (
        <Cap key={`ac${i}`} p={at(18 + i * 7, 248, 0)} r={0.32} h={0.9} c="#ca8a04" />
      ))}

      {/* CMOS holder + bottom headers + debug LEDs */}
      <Cy r={1.15} h={0.2} p={at(210, 210, 0.1)} axis="z" c={DARK} />
      {[
        [16, 296, 2],
        [68, 296, 1.6],
        [105, 296, 1],
        [131, 296, 1.4],
        [211, 296, 2.2],
      ].map(([x, y, w]) => (
        <B key={x} s={[w, 0.8, 0.7]} p={at(x, y, 0.35)} c={x === 105 ? '#f1f5f9' : DARK} />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <Cy key={`fp${i}`} r={0.05} h={0.6} p={at(201 + (i % 5) * 4.6, 293 + Math.floor(i / 5) * 4, 0.75)} axis="z" c="#d4a017" m={1} rr={0.3} />
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
            <Cy r={0.4} h={0.22} p={at(x, y, 0.11)} axis="z" c="#d1d5db" m={0.9} rr={0.25} />
            <B s={[0.5, 0.08, 0.05]} p={at(x, y, 0.23)} c="#6b7280" />
            <B s={[0.08, 0.5, 0.05]} p={at(x, y, 0.23)} c="#6b7280" />
          </P>
        ))}

      {/* ─── installed parts ─── */}
      {has('m-cmos') && (
        <P name="CR2032 CMOS battery" tid="m-cmos" tag="CMOS battery" tagAt={at(210, 210, 0.6)} from={3}>
          <Cy r={1} h={0.32} p={at(210, 210, 0.36)} axis="z" c="#e5e7eb" m={0.95} rr={0.15} />
          <Cy r={0.85} h={0.02} p={at(210, 210, 0.53)} axis="z" c="#cbd5e1" m={0.95} rr={0.3} />
        </P>
      )}
      {has('m-cpu') && (
        <P name="CPU" tid="m-cpu" tag={cooler ? undefined : 'CPU'} tagAt={at(103, 75, 0.8)} from={4}>
          <B s={[4.4, 4.4, 0.15]} p={at(103, 75, 0.36)} c="#14532d" />
          <RoundedBox args={[3.7, 3.7, 0.3]} radius={0.12} smoothness={3} position={at(103, 75, 0.58)} castShadow>
            <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.25} />
          </RoundedBox>
          <mesh position={at(103, 75, 0.735)}>
            <planeGeometry args={[3.4, 3.4]} />
            <meshStandardMaterial map={cpuLabel()} metalness={0.8} roughness={0.3} />
          </mesh>
        </P>
      )}
      {has('m-paste') && !cooler && (
        <P name="Thermal paste" tid="m-paste" tag="Thermal paste" tagAt={at(96, 70, 0.9)} from={2}>
          <mesh position={at(103, 75, 0.78)} scale={[1, 1, 0.4]}>
            <sphereGeometry args={[0.55, 20, 12]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.35} />
          </mesh>
        </P>
      )}
      {has('m-ssd') && (
        <P name="M.2 NVMe SSD" tid="m-ssd" tag="M.2 SSD" tagAt={at(100, 130, 0.6)} from={3}>
          <B s={[8, 2.2, 0.08]} p={at(100, 130, 0.3)} c="#0f3b2a" />
          <B s={[0.4, 2.2, 0.08]} p={at(61, 130, 0.3)} c="#d4a017" m={1} r={0.3} />
          <B s={[1.3, 1.3, 0.12]} p={at(76, 130, 0.4)} c="#2a2a2e" />
          <B s={[2, 1.6, 0.14]} p={at(95, 130, 0.41)} c="#18181b" />
          <B s={[2, 1.6, 0.14]} p={at(118, 130, 0.41)} c="#18181b" />
          <mesh position={at(102, 130, 0.5)}>
            <planeGeometry args={[7.2, 1.9]} />
            <meshStandardMaterial map={ssdLabel()} roughness={0.5} />
          </mesh>
        </P>
      )}
      {has('m-m2screw') && (
        <P name="M.2 screw" tid="m-m2screw" from={2}>
          <Cy r={0.3} h={0.2} p={at(140, 130, 0.55)} axis="z" c="#e5e7eb" m={0.95} rr={0.2} />
        </P>
      )}
      {(['m-ram-a2', 'm-ram-b2'] as const).map((id, i) => {
        const x = i ? 193 : 173;
        return has(id) ? (
          <P key={id} name={`RAM stick (slot ${i ? 'B2' : 'A2'})`} tid={id} tag={i ? 'RAM B2' : 'RAM A2'} tagAt={at(x, 24, 4.4)} from={5}>
            <B s={[0.12, 13.3, 0.6]} p={at(x, 87, 1.1)} c="#14532d" />
            {[-1, 1].map((sgn) => (
              <RoundedBox key={sgn} args={[0.22, 13.4, 3.3]} radius={0.08} smoothness={2} position={[L(x, 0)[0] + sgn * 0.14, L(0, 87)[1], 2]} castShadow>
                <meshStandardMaterial color="#26292f" metalness={0.75} roughness={0.35} map={brushed} />
              </RoundedBox>
            ))}
            <mesh position={[L(x, 0)[0] + 0.26, L(0, 92)[1], 2.1]} rotation={[0, PI / 2, PI / 2]}>
              <planeGeometry args={[9, 2.1]} />
              <meshStandardMaterial map={ramLabel()} roughness={0.5} />
            </mesh>
            <RGB s={[0.5, 13.2, 0.5]} p={at(x, 87, 3.9)} powered={powered} phase={i * 0.2} op={0.9} />
          </P>
        ) : null;
      })}
      {cooler && (
        <P name="CPU air cooler" tid="m-cooler" tag="CPU cooler" tagAt={at(103, 75, 16)} from={8}>
          <group position={at(103, 75, 0)}>
            <B s={[4, 4, 0.7]} p={[0, 0, 1]} c="#b45309" m={0.9} r={0.3} />
            <B s={[6.4, 1.2, 0.4]} p={[0, 0, 1.4]} c="#a1a1aa" m={0.9} r={0.3} />
            {/* U-shaped heat pipes */}
            {[-1.35, -0.45, 0.45, 1.35].map((y) => (
              <Cable
                key={y}
                pts={[
                  [-1.6, y, 13.8],
                  [-1.6, y, 3],
                  [-1.2, y, 1.4],
                  [1.2, y, 1.4],
                  [1.6, y, 3],
                  [1.6, y, 13.8],
                ]}
                r={0.3}
                c="#c2410c"
              />
            ))}
            {Array.from({ length: 30 }).map((_, i) => (
              <B key={i} s={[5, 12.4, 0.08]} p={[0, 0, 3.8 + i * 0.38]} c="#d4d4d8" m={0.85} r={0.3} map={brushed} />
            ))}
            <RoundedBox args={[5.4, 12.8, 0.4]} radius={0.15} smoothness={3} position={[0, 0, 15.4]} castShadow>
              <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.35} />
            </RoundedBox>
            <BFace s={[3.6, 1.2, 0.05]} p={[0, -3, 15.63]} map={brandLabel('PROTO', '#e2e8f0', '#1f2937')} c="#1f2937" />
            {[-1.6, 1.6].map((x) =>
              [-1.35, -0.45, 0.45, 1.35].map((y) => <Cy key={`${x}${y}`} r={0.28} h={0.2} p={[x, y, 15.65]} axis="z" c="#c2410c" m={0.95} rr={0.2} />),
            )}
            <group position={[3.9, 0, 9.5]} rotation={[0, PI / 2, 0]}>
              <Fan size={12} depth={2.5} powered={powered} frame="#1f2937" blade="#3f3f46" hub="#3f3f46" rgb={false} speed={18} />
            </group>
            {/* wire clips */}
            {[-5.6, 5.6].map((y) => (
              <B key={y} s={[0.1, 0.1, 11]} p={[3.9, y, 9.5]} c="#d4d4d8" m={0.9} r={0.25} />
            ))}
          </group>
        </P>
      )}
      {has('m-cpufan') && (
        <P name="CPU fan cable → CPU_FAN" tid="m-cpufan" tag="CPU_FAN" tagAt={at(156, 9, 1.2)} from={2}>
          <Cable pts={[[2.4, 7.8, 4], [3.2, 12, 2.5], [3.4, 14.2, 0.6]]} r={0.16} c="#111827" />
          <B s={[1.4, 0.8, 0.8]} p={at(156, 9, 0.75)} c="#f8fafc" />
        </P>
      )}

      {/* ─── cables (enter/leave behind the board through grommets) ─── */}
      {has('w-24') && (
        <P name="24-pin ATX power cable" tid="w-24" tag="24-pin power" tagAt={at(232, 60, 2)} from={3}>
          <B s={[1.7, 7.4, 1.6]} p={at(232, 95, 1.1)} c="#18181b" />
          {[-3.1, -2.5, -1.9, -1.3, -0.7, -0.1, 0.5, 1.1, 1.7, 2.3, 2.9].map((dy) => {
            const [x, y] = L(240, 95);
            return <Cable key={dy} pts={[[x, y + dy, 1.3], [x + 1.6, y + dy, 1.5], [x + 2.6, y + dy * 0.7, -0.8]]} r={0.17} c="#27272a" />;
          })}
        </P>
      )}
      {has('w-eps') && (
        <P name="8-pin EPS CPU power cable" tid="w-eps" tag="CPU power (8-pin)" tagAt={at(57, 0, 2)} from={3}>
          <B s={[3, 1.4, 1.6]} p={at(57, 7, 1.2)} c="#18181b" />
          {[-1.05, -0.35, 0.35, 1.05].map((dx) => {
            const [x, y] = L(57 + dx * 10, 0);
            return <Cable key={dx} pts={[[x, y - 0.4, 1.4], [x, y + 1.2, 1.4], [x, y + 2.1, -0.8]]} r={0.17} c="#27272a" />;
          })}
        </P>
      )}
      {has('w-usbc') && (
        <P name="USB-C front-panel cable" tid="w-usbc" tag="USB-C header" tagAt={at(233, 145, 1.6)} from={3}>
          <B s={[1.4, 1.4, 1.2]} p={at(233, 145, 0.8)} c="#64748b" m={0.6} />
          <Cable pts={[[L(240, 145)[0], L(240, 145)[1], 0.9], [13.6, L(240, 145)[1], 0.9], [14.4, L(240, 150)[1], -0.8]]} r={0.26} c="#3f3f46" />
        </P>
      )}
      {has('w-usb3') && (
        <P name="USB 3 header cable" tid="w-usb3" tag="USB 3 header" tagAt={at(233, 178, 1.6)} from={3}>
          <B s={[1.4, 3.4, 1.4]} p={at(233, 175, 0.9)} c="#1d4ed8" />
          <Cable pts={[[L(240, 175)[0], L(240, 175)[1], 1], [13.6, L(240, 175)[1], 1.1], [14.4, L(240, 185)[1], -0.8]]} r={0.45} c="#1e3a8a" sleeve="1" />
        </P>
      )}
      {has('w-fpanel') && (
        <P name="Front-panel connectors (power / reset / LEDs)" tid="w-fpanel" tag="Front-panel pins" tagAt={at(211, 296, 1.6)} from={3}>
          {['#ef4444', '#22c55e', '#3b82f6', '#eab308'].map((c, i) => {
            const [x, y] = L(203 + i * 5.5, 296);
            return (
              <group key={c}>
                <B s={[0.45, 0.8, 1.2]} p={[x, y, 0.9]} c="#111827" />
                <Cable pts={[[x, y - 0.4, 1.2], [x + 0.3, y - 1.6, 1.3], [x + 0.6, -18.6, 0.6]]} r={0.08} c={c} />
                <Cable pts={[[x + 0.15, y - 0.4, 1.2], [x + 0.45, y - 1.6, 1.3], [x + 0.75, -18.6, 0.6]]} r={0.08} c="#f8fafc" />
              </group>
            );
          })}
        </P>
      )}
      {has('w-audio') && (
        <P name="HD Audio cable" tid="w-audio" tag="HD Audio" tagAt={at(16, 296, 1.6)} from={3}>
          <B s={[2.2, 1, 1.2]} p={at(16, 296, 0.9)} c="#111827" />
          <Cable pts={[[L(16, 296)[0], L(16, 300)[1], 1.2], [L(16, 296)[0] + 0.5, -17.5, 1.3], [L(16, 296)[0] + 1, -18.6, 0.6]]} r={0.24} c="#3f3f46" />
        </P>
      )}
      {has('w-ties') && (
        <P name="Velcro cable straps" tid="w-ties" from={3}>
          {[3.2, -3].map((y) => (
            <mesh key={y} position={[13.9, L(0, 95)[1] + y, 0.4]} rotation={[PI / 2, 0, 0]}>
              <torusGeometry args={[1, 0.22, 8, 24]} />
              <meshStandardMaterial color="#7c3aed" roughness={0.9} />
            </mesh>
          ))}
        </P>
      )}

      {/* graphics card: stands out of the board, hangs below the x16 slot */}
      {has('c-gpu') && (
        <P name="Graphics card (GPU)" tid="c-gpu" tag="Graphics card" tagAt={[-6, -1, 13.8]} from={9}>
          <group position={[2.8, -3.95, 7.1]}>
            <Gpu powered={powered} />
          </group>
        </P>
      )}
      {has('w-gpu') && (
        <P name="12V-2x6 GPU power cable" tid="w-gpu" tag="GPU power (12V-2x6)" tagAt={[6.8, -2, 14.8]} from={4}>
          <B s={[2.4, 1.1, 1]} p={[6.8, -2.65, 14.2]} c="#18181b" />
          {[-0.5, 0, 0.5].map((dz) => (
            <Cable key={dz} pts={[[6.8 + dz, -2.6, 14.6], [9.5 + dz, -4, 15.2], [11 + dz, -12, 11], [11 + dz, -18.9, 7]]} r={0.2} c="#27272a" />
          ))}
        </P>
      )}
    </group>
  );
}
