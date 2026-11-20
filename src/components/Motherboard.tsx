import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export const MOBO_HOLES: [number, number][] = [
  [30, 10],
  [145, 10],
  [236, 10],
  [30, 175],
  [145, 140],
  [236, 140],
  [30, 297],
  [145, 297],
  [236, 297],
];

/** Animated "drop into place" wrapper used for every installed part. */
export function Drop({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, y: -40, scale: 1.12 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay }}
    >
      {children}
    </motion.g>
  );
}

const label = (x: number, y: number, t: string, size = 4.2, fill = '#7c8aa0') => (
  <text x={x} y={y} fontSize={size} fill={fill} fontFamily="JetBrains Mono, monospace" textAnchor="middle" style={{ pointerEvents: 'none' }}>
    {t}
  </text>
);

export function Motherboard({ has, powered }: { has: (id: string) => boolean; powered: boolean }) {
  const cooler = has('m-cooler');
  return (
    <g>
      {/* PCB */}
      <rect x={0} y={0} width={244} height={305} rx={4} fill="#161e2b" stroke="#2c384b" strokeWidth={1.2} />
      <g stroke="#2a4a6b" strokeWidth={0.5} fill="none" opacity={0.6}>
        <path d="M 40 130 h 30 v 20 h 60 v -10 h 20" />
        <path d="M 150 215 h -40 v 20 h -40 v 30 h -50" />
        <path d="M 60 270 h 60 v 10 h 70" />
        <path d="M 205 160 v 20 h -15 v 40" />
        <path d="M 140 40 v -10 h 10" />
      </g>

      {/* mounting holes / screws */}
      {MOBO_HOLES.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={3.6} fill="#c6a15b" opacity={0.5} />
          <circle cx={x} cy={y} r={1.8} fill="#0b0f16" />
          {has('c-screws') && (
            <Drop delay={(x + y) / 900}>
              <circle cx={x} cy={y} r={3.4} fill="#d1d5db" stroke="#6b7280" strokeWidth={0.6} />
              <path d={`M ${x - 1.8} ${y} h 3.6 M ${x} ${y - 1.8} v 3.6`} stroke="#4b5563" strokeWidth={0.8} />
            </Drop>
          )}
        </g>
      ))}

      {/* rear I/O shroud */}
      <rect x={0} y={8} width={34} height={142} rx={2} fill="#2a3446" stroke="#3d4a60" strokeWidth={0.6} />
      <path d="M 6 20 l 22 30 M 6 70 l 22 30" stroke="#38bdf8" strokeWidth={0.6} opacity={0.5} />
      {label(17, 140, 'REAR I/O', 3.6)}

      {/* VRM heatsinks */}
      <rect x={38} y={16} width={100} height={16} rx={2} fill="#3a4658" />
      <rect x={38} y={34} width={18} height={84} rx={2} fill="#3a4658" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={44 + i * 8} y1={18} x2={44 + i * 8} y2={30} stroke="#2a3446" strokeWidth={1.2} />
      ))}

      {/* EPS header */}
      <rect x={44} y={2} width={26} height={11} rx={1} fill="#0b0f16" stroke="#4b5563" strokeWidth={0.5} />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={46 + (i % 4) * 6} y={3.5 + Math.floor(i / 4) * 4.5} width={4} height={3.5} fill="#1f2937" />
      ))}
      {label(84, 10, 'CPU_PWR', 3.6)}
      {has('w-eps') && (
        <Drop>
          <rect x={42.5} y={0.5} width={29} height={14} rx={1.5} fill="#111827" stroke="#6b7280" strokeWidth={0.6} />
          <rect x={52} y={-1.5} width={10} height={3} fill="#111827" />
        </Drop>
      )}

      {/* CPU_FAN header */}
      <rect x={150} y={6} width={12} height={6} fill="#f1f5f9" />
      {label(156, 4, 'CPU_FAN', 3.4)}

      {/* CPU socket */}
      <rect x={76} y={48} width={54} height={54} rx={2} fill="#8b94a1" />
      <rect x={81} y={53} width={44} height={44} fill="#1a1a1a" />
      {Array.from({ length: 100 }).map((_, i) => (
        <circle key={i} cx={84 + (i % 10) * 4.2} cy={56 + Math.floor(i / 10) * 4.2} r={0.7} fill="#c6a15b" opacity={0.8} />
      ))}
      <path d="M 77 49 l 5 0 l -5 5 z" fill="#facc15" />
      {/* lever */}
      {has('m-cpu') ? (
        <line x1={132} y1={50} x2={132} y2={102} stroke="#cbd5e1" strokeWidth={1.6} strokeLinecap="round" />
      ) : (
        <line x1={132} y1={102} x2={150} y2={60} stroke="#cbd5e1" strokeWidth={1.6} strokeLinecap="round" />
      )}
      {!has('m-cpu') && (
        <g>
          <rect x={80} y={52} width={46} height={46} rx={2} fill="#0b0b0b" opacity={0.88} />
          {label(103, 76, 'PnP CAP', 4.4, '#9ca3af')}
          {label(103, 83, 'remove after install', 3, '#6b7280')}
        </g>
      )}
      {has('m-cpu') && !cooler && (
        <Drop>
          <rect x={80} y={52} width={46} height={46} rx={2} fill="#14532d" />
          <rect x={84} y={56} width={38} height={38} rx={2} fill="url(#ihs)" stroke="#d4d4d8" strokeWidth={0.5} />
          <path d="M 81 53 l 5 0 l -5 5 z" fill="#facc15" />
          {label(103, 77, 'CPU', 5, '#52525b')}
        </Drop>
      )}
      {has('m-paste') && !cooler && (
        <Drop>
          <circle cx={103} cy={75} r={5} fill="#9ca3af" stroke="#6b7280" strokeWidth={0.6} />
          <circle cx={101.5} cy={73.5} r={1.6} fill="#e5e7eb" />
        </Drop>
      )}
      {label(103, 46, 'SOCKET AM5 / LGA1851', 3.2)}

      {/* DIMM slots */}
      {[
        [160, 'A1'],
        [170, 'A2'],
        [180, 'B1'],
        [190, 'B2'],
      ].map(([x, n]) => (
        <g key={n as string}>
          <rect x={x as number} y={22} width={6} height={130} rx={1} fill="#0e131b" stroke="#3a4658" strokeWidth={0.6} />
          <rect x={(x as number) - 0.5} y={150} width={7} height={5} rx={1} fill="#64748b" />
          {label((x as number) + 3, 162, n as string, 3.6, n === 'A2' || n === 'B2' ? '#a78bfa' : '#7c8aa0')}
        </g>
      ))}
      {[
        ['m-ram-a2', 170],
        ['m-ram-b2', 190],
      ].map(([id, x]) =>
        has(id as string) ? (
          <Drop key={id as string}>
            <rect x={(x as number) - 1.5} y={19} width={9} height={136} rx={1.5} fill="#1f2937" stroke="#64748b" strokeWidth={0.6} />
            <rect
              x={(x as number) + 1}
              y={21}
              width={4}
              height={132}
              rx={1}
              fill="url(#rgbv)"
              className={powered ? 'rgb' : undefined}
              opacity={powered ? 1 : 0.3}
            />
          </Drop>
        ) : null,
      )}

      {/* 24-pin */}
      <rect x={226} y={60} width={12} height={70} rx={1} fill="#0b0f16" stroke="#4b5563" strokeWidth={0.5} />
      {Array.from({ length: 24 }).map((_, i) => (
        <rect key={i} x={228 + (i % 2) * 4.5} y={62 + Math.floor(i / 2) * 5.6} width={3.4} height={4} fill="#1f2937" />
      ))}
      {label(221, 96, 'ATX 24', 3.4)}
      {has('w-24') && (
        <Drop>
          <rect x={224} y={58} width={16} height={74} rx={1.5} fill="#111827" stroke="#6b7280" strokeWidth={0.6} />
          <rect x={222} y={90} width={3} height={10} fill="#111827" />
        </Drop>
      )}

      {/* debug LEDs */}
      {['CPU', 'DRAM', 'VGA', 'BOOT'].map((n, i) => (
        <g key={n}>
          <circle cx={214} cy={64 + i * 8} r={1.6} fill={powered ? '#f59e0b' : '#3f2d10'} className={powered ? `led led-${i}` : undefined} />
          {label(206, 65.5 + i * 8, n, 2.6)}
        </g>
      ))}

      {/* USB-C header */}
      <rect x={228} y={140} width={10} height={10} rx={1} fill="#0b0f16" stroke="#6b7280" strokeWidth={0.5} />
      {label(221, 146, 'USB-C', 3)}
      {has('w-usbc') && (
        <Drop>
          <rect x={226} y={138} width={14} height={14} rx={2} fill="#475569" stroke="#94a3b8" strokeWidth={0.6} />
        </Drop>
      )}

      {/* USB 3 header */}
      <rect x={228} y={160} width={10} height={30} rx={1} fill="#0b0f16" stroke="#3b82f6" strokeWidth={0.6} />
      {label(221, 177, 'USB3', 3)}
      {has('w-usb3') && (
        <Drop>
          <rect x={226} y={158} width={14} height={34} rx={2} fill="#2563eb" stroke="#1e3a8a" strokeWidth={0.6} />
        </Drop>
      )}

      {/* M.2 slot 1 */}
      <rect x={56} y={120} width={6} height={20} rx={1} fill="#0b0f16" stroke="#4b5563" strokeWidth={0.5} />
      <circle cx={140} cy={130} r={2.4} fill="#c6a15b" />
      <rect x={62} y={121} width={78} height={18} fill="none" stroke="#38bdf8" strokeWidth={0.4} strokeDasharray="2 2" opacity={0.5} />
      {label(100, 132, 'M2_1 (CPU)', 3.6, '#4b6584')}
      {has('m-ssd') && (
        <Drop>
          <rect x={60} y={121} width={80} height={18} rx={1} fill="#0f172a" stroke="#334155" strokeWidth={0.6} />
          <rect x={72} y={124} width={12} height={12} rx={1} fill="#334155" />
          <rect x={90} y={124} width={18} height={12} rx={1} fill="#1e293b" stroke="#475569" strokeWidth={0.5} />
          <rect x={112} y={124} width={18} height={12} rx={1} fill="#1e293b" stroke="#475569" strokeWidth={0.5} />
          <circle cx={76} cy={130} r={1} fill="#22c55e" className={powered ? 'blink' : undefined} />
        </Drop>
      )}
      {has('m-m2screw') && (
        <Drop>
          <circle cx={140} cy={130} r={3.4} fill="#e5e7eb" stroke="#6b7280" strokeWidth={0.6} />
          <path d="M 138.2 130 h 3.6 M 140 128.2 v 3.6" stroke="#4b5563" strokeWidth={0.8} />
        </Drop>
      )}

      {/* PCIe x16 #1 */}
      <rect x={38} y={156} width={160} height={8} rx={1} fill="#0b0f16" stroke="#9ca3af" strokeWidth={0.8} />
      <rect x={197} y={155} width={5} height={10} rx={1} fill="#64748b" />
      {label(118, 170, 'PCIEX16_1 (PCIe 5.0 x16)', 3.6)}

      {/* M.2 slot 2 heatsink */}
      <rect x={58} y={190} width={82} height={22} rx={2} fill="#3a4658" />
      {label(99, 203, 'M2_2', 4, '#94a3b8')}

      {/* PCIe #2 */}
      <rect x={38} y={226} width={160} height={8} rx={1} fill="#0b0f16" stroke="#3a4658" strokeWidth={0.6} />
      {label(118, 240, 'PCIEX16_2 (x4)', 3.6)}

      {/* CMOS battery */}
      <circle cx={210} cy={210} r={11} fill="#0b0f16" stroke="#94a3b8" strokeWidth={0.8} />
      {label(210, 228, 'BAT1', 3.2)}
      {has('m-cmos') && (
        <Drop>
          <circle cx={210} cy={210} r={9.6} fill="url(#ihs)" stroke="#9ca3af" strokeWidth={0.6} />
          {label(210, 212, '+', 7, '#475569')}
        </Drop>
      )}

      {/* chipset */}
      <rect x={150} y={240} width={66} height={44} rx={3} fill="#3a4658" />
      <path d="M 160 250 l 46 24 M 160 274 l 46 -24" stroke="#2a3446" strokeWidth={1.4} />
      {label(183, 264, 'CHIPSET', 4.4, '#94a3b8')}

      {/* bottom headers */}
      <rect x={6} y={292} width={20} height={8} fill="#0b0f16" stroke="#4b5563" strokeWidth={0.5} />
      {label(16, 290, 'HD_AUDIO', 3)}
      {has('w-audio') && (
        <Drop>
          <rect x={4.5} y={290.5} width={23} height={11} rx={1} fill="#111827" stroke="#6b7280" strokeWidth={0.6} />
        </Drop>
      )}
      <rect x={60} y={292} width={16} height={8} fill="#0b0f16" stroke="#4b5563" strokeWidth={0.5} />
      {label(68, 290, 'USB2', 3)}
      <rect x={100} y={293} width={10} height={6} fill="#f1f5f9" />
      {label(105, 290, 'SYS_FAN', 3)}
      <rect x={124} y={293} width={14} height={6} fill="#0b0f16" stroke="#4b5563" strokeWidth={0.5} />
      {label(131, 290, 'ARGB', 3)}
      <rect x={200} y={291} width={22} height={10} fill="#0b0f16" stroke="#4b5563" strokeWidth={0.5} />
      {label(211, 289, 'F_PANEL', 3)}
      {has('w-fpanel') && (
        <Drop>
          {['#ef4444', '#22c55e', '#3b82f6', '#facc15'].map((c, i) => (
            <rect key={c} x={200 + i * 5.5} y={290} width={5} height={12} rx={0.6} fill="#0f172a" stroke={c} strokeWidth={0.8} />
          ))}
        </Drop>
      )}

      {/* antenna connectors on rear I/O */}
      <circle cx={8} cy={22} r={2.2} fill="#facc15" />
      <circle cx={8} cy={32} r={2.2} fill="#facc15" />

      {/* CPU cooler (top view of tower) */}
      {cooler && (
        <Drop>
          <rect x={70} y={36} width={66} height={80} rx={3} fill="url(#brushed)" stroke="#94a3b8" strokeWidth={0.8} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx={80 + i * 9.5} cy={46} r={2.6} fill="#c2410c" stroke="#7c2d12" strokeWidth={0.5} />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx={80 + i * 9.5} cy={106} r={2.6} fill="#c2410c" stroke="#7c2d12" strokeWidth={0.5} />
          ))}
          <rect x={88} y={66} width={30} height={20} rx={3} fill="#1f2937" />
          {label(103, 78, 'TOWER', 4.6, '#94a3b8')}
          {/* fan seen edge-on */}
          <rect x={136} y={30} width={14} height={92} rx={3} fill="#111827" stroke="#334155" strokeWidth={0.8} />
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={i} x1={138} y1={38 + i * 12} x2={148} y2={44 + i * 12} stroke="#475569" strokeWidth={1.2} className={powered ? 'blade' : undefined} />
          ))}
          {powered &&
            [52, 76, 100].map((y) => (
              <path key={y} d={`M 132 ${y} H 74`} stroke="#38bdf8" strokeWidth={1.2} strokeDasharray="4 6" className="flow-left" opacity={0.8} />
            ))}
        </Drop>
      )}
      {has('m-cpufan') && (
        <Drop>
          <path d="M 143 34 C 143 20, 156 22, 156 12" stroke="#f59e0b" strokeWidth={1.6} fill="none" />
          <rect x={149} y={5} width={14} height={8} rx={1} fill="#f8fafc" stroke="#f59e0b" strokeWidth={0.8} />
        </Drop>
      )}
    </g>
  );
}
