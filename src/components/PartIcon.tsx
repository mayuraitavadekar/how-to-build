import type { ReactElement } from 'react';
import type { PartId } from '../data/parts';

/* Small reusable drawing helpers ---------------------------------------- */

const Fan = ({ cx, cy, r, spin = true, frame = '#1f2937', blade = '#94a3b8' }: { cx: number; cy: number; r: number; spin?: boolean; frame?: string; blade?: string }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={frame} stroke="#0b1220" strokeWidth={1} />
    <g className={spin ? 'spin' : undefined}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          d={`M ${cx} ${cy} q ${r * 0.55} ${-r * 0.25} ${r * 0.85} ${-r * 0.05} q ${-r * 0.2} ${r * 0.35} ${-r * 0.85} ${r * 0.05} z`}
          fill={blade}
          transform={`rotate(${a} ${cx} ${cy})`}
          opacity={0.9}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.28} fill="#334155" />
    </g>
  </g>
);

const Pins = ({ x, y, cols, rows, size = 4, gap = 1.6, color = '#facc15' }: { x: number; y: number; cols: number; rows: number; size?: number; gap?: number; color?: string }) => (
  <g>
    {Array.from({ length: rows }).flatMap((_, r) =>
      Array.from({ length: cols }).map((__, c) => (
        <rect key={`${r}-${c}`} x={x + c * (size + gap)} y={y + r * (size + gap)} width={size} height={size} rx={0.8} fill={color} opacity={0.85} />
      )),
    )}
  </g>
);

/** A wired plug: housing with pin holes + bundle of wires going down */
const Plug = ({ cols, rows, housing, wires, w = 60, label }: { cols: number; rows: number; housing: string; wires: string[]; w?: number; label?: string }) => {
  const size = Math.min((w - 8) / cols - 1.6, 9);
  const hw = cols * (size + 1.6) + 6;
  const hh = rows * (size + 1.6) + 6;
  const x = 50 - hw / 2;
  const y = 20;
  const wireCount = Math.min(cols * rows, 12);
  return (
    <g>
      {Array.from({ length: wireCount }).map((_, i) => {
        const sx = x + 5 + (i / Math.max(1, wireCount - 1)) * (hw - 10);
        return (
          <path
            key={i}
            d={`M ${sx} ${y + hh} C ${sx} ${y + hh + 25}, ${50 + (i - wireCount / 2) * 1.5} ${70}, ${50 + (i - wireCount / 2) * 1.2} 96`}
            stroke={wires[i % wires.length]}
            strokeWidth={2.2}
            fill="none"
          />
        );
      })}
      <rect x={x} y={y} width={hw} height={hh} rx={2.5} fill={housing} stroke="#0b1220" strokeWidth={1} />
      <rect x={50 - 6} y={y - 5} width={12} height={5} rx={1} fill={housing} />
      <Pins x={x + 3} y={y + 3} cols={cols} rows={rows} size={size} color="#0b1220" />
      {label && (
        <text x={50} y={y - 8} textAnchor="middle" fontSize={8} fontWeight={700} fill="#475569" fontFamily="JetBrains Mono, monospace">
          {label}
        </text>
      )}
    </g>
  );
};

const Screw = ({ x, y, s = 1, color = '#cbd5e1' }: { x: number; y: number; s?: number; color?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-3} y={4} width={6} height={20} fill={color} opacity={0.9} />
    {[6, 10, 14, 18, 22].map((t) => (
      <line key={t} x1={-4} y1={t} x2={4} y2={t + 2} stroke="#64748b" strokeWidth={1} />
    ))}
    <ellipse cx={0} cy={4} rx={9} ry={4.5} fill={color} stroke="#475569" strokeWidth={1} />
    <path d="M -4 4 h 8 M 0 1.5 v 5" stroke="#334155" strokeWidth={1.6} />
  </g>
);

/* Icons -------------------------------------------------------------------- */

const ICONS: Record<PartId, () => ReactElement> = {
  case: () => (
    <g>
      <rect x={22} y={8} width={56} height={84} rx={4} fill="#111827" stroke="#334155" strokeWidth={2} />
      <rect x={28} y={14} width={34} height={58} rx={2} fill="#0ea5e9" opacity={0.15} stroke="#38bdf8" strokeWidth={1} />
      <path d="M 30 16 l 10 0 l -8 30 l -2 0 z" fill="#fff" opacity={0.15} />
      <rect x={64} y={14} width={10} height={58} rx={1} fill="#1f2937" />
      {[18, 30, 42, 54].map((y) => (
        <circle key={y} cx={69} cy={y + 4} r={4} fill="none" stroke="#a78bfa" strokeWidth={1.2} className="glow" />
      ))}
      <rect x={28} y={76} width={46} height={12} rx={1.5} fill="#1f2937" />
      <circle cx={70} cy={11} r={1.5} fill="#22c55e" className="blink" />
    </g>
  ),
  motherboard: () => (
    <g>
      <rect x={14} y={8} width={72} height={86} rx={3} fill="#1e293b" stroke="#334155" strokeWidth={1.5} />
      <path d="M 20 70 h 20 v 10 h 25 M 40 30 v 18 h 10 M 70 60 h 10" stroke="#38bdf8" strokeWidth={0.7} opacity={0.4} fill="none" />
      <rect x={14} y={12} width={10} height={36} rx={1} fill="#475569" />
      <rect x={32} y={20} width={22} height={22} rx={1} fill="#94a3b8" stroke="#cbd5e1" />
      <rect x={36} y={24} width={14} height={14} fill="#64748b" />
      {[60, 64, 68, 72].map((x) => (
        <rect key={x} x={x} y={14} width={2.5} height={34} rx={0.5} fill={x === 64 || x === 72 ? '#a78bfa' : '#475569'} />
      ))}
      <rect x={78} y={20} width={4} height={18} fill="#e5e7eb" />
      <rect x={24} y={56} width={52} height={4} rx={1} fill="#64748b" />
      <rect x={30} y={48} width={28} height={5} rx={1} fill="#0f172a" stroke="#38bdf8" strokeWidth={0.6} />
      <rect x={24} y={76} width={52} height={3} rx={1} fill="#475569" />
      <rect x={58} y={64} width={18} height={14} rx={2} fill="#334155" />
      <circle cx={70} cy={86} r={3.5} fill="#cbd5e1" />
      <circle cx={42} cy={31} r={1.5} fill="#22c55e" className="blink" />
    </g>
  ),
  cmos: () => (
    <g>
      <ellipse cx={50} cy={60} rx={32} ry={10} fill="#64748b" />
      <rect x={18} y={44} width={64} height={16} fill="#94a3b8" />
      <ellipse cx={50} cy={44} rx={32} ry={10} fill="#e2e8f0" stroke="#94a3b8" />
      <text x={50} y={47} textAnchor="middle" fontSize={8} fontWeight={800} fill="#334155" fontFamily="JetBrains Mono, monospace">
        CR2032
      </text>
      <text x={50} y={30} textAnchor="middle" fontSize={14} fontWeight={800} fill="#22c55e" className="pulse">
        +
      </text>
      <text x={50} y={86} textAnchor="middle" fontSize={8} fill="#475569" fontFamily="JetBrains Mono, monospace">
        3V
      </text>
    </g>
  ),
  cpu: () => (
    <g>
      <rect x={16} y={16} width={68} height={68} rx={4} fill="#14532d" />
      <rect x={24} y={22} width={52} height={56} rx={3} fill="url(#ihs)" stroke="#d4d4d8" />
      <path d="M 18 18 l 7 0 l -7 7 z" fill="#facc15" className="pulse" />
      <text x={50} y={48} textAnchor="middle" fontSize={9} fontWeight={800} fill="#3f3f46" fontFamily="JetBrains Mono, monospace">
        CPU
      </text>
      <text x={50} y={60} textAnchor="middle" fontSize={6} fill="#52525b" fontFamily="JetBrains Mono, monospace">
        8C/16T 2026
      </text>
      <rect x={24} y={22} width={52} height={56} rx={3} fill="url(#shine)" className="sweep" />
    </g>
  ),
  ram: () => (
    <g>
      <rect x={8} y={30} width={84} height={34} rx={2} fill="#1f2937" stroke="#475569" />
      <rect x={8} y={24} width={84} height={7} rx={2} fill="url(#rgb)" className="rgb" />
      <text x={50} y={46} textAnchor="middle" fontSize={8} fontWeight={800} fill="#e2e8f0" fontFamily="JetBrains Mono, monospace">
        DDR5
      </text>
      <text x={50} y={56} textAnchor="middle" fontSize={5.5} fill="#475569" fontFamily="JetBrains Mono, monospace">
        16GB 6000 CL30
      </text>
      <rect x={8} y={64} width={84} height={8} fill="#166534" />
      {Array.from({ length: 26 }).map((_, i) => (
        <rect key={i} x={10 + i * 3.1 + (i > 12 ? 2 : 0)} y={65} width={2} height={7} fill="#facc15" />
      ))}
      <rect x={48} y={66} width={3} height={7} fill="#0b1220" />
    </g>
  ),
  ssd: () => (
    <g>
      <rect x={8} y={38} width={84} height={24} rx={2} fill="#0f172a" stroke="#334155" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={8 - 6} y={40 + i * 2.6} width={6} height={1.6} fill="#facc15" />
      ))}
      <rect x={20} y={42} width={16} height={16} rx={1} fill="#334155" />
      <rect x={42} y={42} width={18} height={16} rx={1} fill="#1e293b" stroke="#475569" />
      <rect x={64} y={42} width={18} height={16} rx={1} fill="#1e293b" stroke="#475569" />
      <path d="M 90 46 a 4 4 0 0 0 0 8" fill="#0b1220" stroke="#64748b" />
      <rect x={20} y={42} width={62} height={16} fill="#38bdf8" opacity={0.1} />
      <text x={51} y={34} textAnchor="middle" fontSize={7} fontWeight={700} fill="#38bdf8" fontFamily="JetBrains Mono, monospace">
        NVMe Gen5 2TB
      </text>
      <circle cx={28} cy={50} r={1.6} fill="#22c55e" className="blink" />
      <path d="M 14 70 h 72" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="4 6" className="flow" />
    </g>
  ),
  'm2-screw': () => (
    <g>
      <Screw x={50} y={30} s={1.6} color="#e5e7eb" />
      <text x={50} y={92} textAnchor="middle" fontSize={8} fill="#475569" fontFamily="JetBrains Mono, monospace">
        M2×3
      </text>
    </g>
  ),
  'thermal-paste': () => (
    <g transform="rotate(-30 50 50)">
      <rect x={20} y={42} width={50} height={16} rx={3} fill="#e5e7eb" opacity={0.95} />
      <rect x={24} y={45} width={34} height={10} fill="#9ca3af" />
      <rect x={10} y={44} width={10} height={12} rx={2} fill="#3b82f6" />
      <rect x={4} y={47} width={6} height={6} fill="#1d4ed8" />
      <path d="M 70 46 l 14 2 l 0 4 l -14 2 z" fill="#d1d5db" />
      <circle cx={89} cy={50} r={4} fill="#9ca3af" className="drip" />
    </g>
  ),
  cooler: () => (
    <g>
      {[30, 38, 46, 54, 62].map((x) => (
        <path key={x} d={`M ${x} 92 L ${x} 18`} stroke="#b45309" strokeWidth={3} strokeLinecap="round" />
      ))}
      <rect x={26} y={14} width={48} height={66} rx={2} fill="#cbd5e1" opacity={0.92} />
      {Array.from({ length: 16 }).map((_, i) => (
        <line key={i} x1={26} y1={18 + i * 4} x2={74} y2={18 + i * 4} stroke="#94a3b8" strokeWidth={1} />
      ))}
      <rect x={38} y={84} width={24} height={8} rx={1} fill="#d97706" />
      <Fan cx={50} cy={46} r={22} frame="#0f172a" blade="#64748b" />
    </g>
  ),
  'cpu-fan-cable': () => <Plug cols={4} rows={1} housing="#f8fafc" wires={['#111827', '#ef4444', '#facc15', '#3b82f6']} w={44} label="4-PIN PWM" />,
  standoffs: () => (
    <g>
      {[22, 50, 78].map((x, i) => (
        <g key={x} transform={`translate(${x} ${30 + (i % 2) * 14})`}>
          <g className="bob" style={{ animationDelay: `${i * 0.2}s` }}>
          <rect x={-2} y={-12} width={4} height={10} fill="#d97706" />
          <path d="M -8 -2 l 4 -4 h 8 l 4 4 v 24 l -4 4 h -8 l -4 -4 z" fill="#f59e0b" stroke="#b45309" />
          <rect x={-2} y={0} width={4} height={22} fill="#fbbf24" opacity={0.6} />
          </g>
        </g>
      ))}
      <text x={50} y={92} textAnchor="middle" fontSize={8} fill="#475569" fontFamily="JetBrains Mono, monospace">
        #6-32 ×9
      </text>
    </g>
  ),
  'io-shield': () => (
    <g>
      <rect x={30} y={6} width={40} height={88} rx={1.5} fill="#cbd5e1" stroke="#64748b" />
      {[12, 22, 32].map((y) => (
        <rect key={y} x={36} y={y} width={12} height={6} rx={1} fill="#1e293b" />
      ))}
      {[12, 22, 32].map((y) => (
        <rect key={y} x={52} y={y} width={12} height={6} rx={1} fill="#1d4ed8" />
      ))}
      <rect x={36} y={44} width={28} height={10} rx={1} fill="#1e293b" />
      <circle cx={42} cy={64} r={3} fill="#facc15" />
      <circle cx={58} cy={64} r={3} fill="#facc15" />
      {[74, 80, 86].map((y) => (
        <g key={y}>
          <circle cx={40} cy={y} r={2} fill="#22c55e" />
          <circle cx={50} cy={y} r={2} fill="#ec4899" />
          <circle cx={60} cy={y} r={2} fill="#3b82f6" />
        </g>
      ))}
      <rect x={30} y={6} width={40} height={88} fill="url(#shine)" className="sweep" opacity={0.5} />
    </g>
  ),
  'mobo-screws': () => (
    <g>
      <Screw x={30} y={20} s={1.1} />
      <Screw x={52} y={36} s={1.1} />
      <Screw x={74} y={22} s={1.1} />
      <text x={50} y={92} textAnchor="middle" fontSize={8} fill="#475569" fontFamily="JetBrains Mono, monospace">
        #6-32 ×9
      </text>
    </g>
  ),
  psu: () => (
    <g>
      <rect x={8} y={22} width={84} height={58} rx={4} fill="#111827" stroke="#334155" strokeWidth={2} />
      <Fan cx={36} cy={51} r={22} frame="#0b1220" blade="#475569" />
      <circle cx={36} cy={51} r={22} fill="none" stroke="#475569" strokeWidth={1} strokeDasharray="2 3" />
      {[30, 42, 54, 66].map((y) => (
        <rect key={y} x={66} y={y} width={20} height={8} rx={1} fill="#1f2937" stroke="#475569" />
      ))}
      <text x={76} y={18} textAnchor="middle" fontSize={7} fontWeight={800} fill="#facc15" fontFamily="JetBrains Mono, monospace">
        850W
      </text>
      <text x={30} y={18} textAnchor="middle" fontSize={6} fill="#475569" fontFamily="JetBrains Mono, monospace">
        ATX 3.1 GOLD
      </text>
    </g>
  ),
  'psu-screws': () => (
    <g>
      <Screw x={26} y={22} s={1} color="#334155" />
      <Screw x={44} y={34} s={1} color="#334155" />
      <Screw x={62} y={22} s={1} color="#334155" />
      <Screw x={80} y={34} s={1} color="#334155" />
      <text x={50} y={92} textAnchor="middle" fontSize={8} fill="#475569" fontFamily="JetBrains Mono, monospace">
        PSU ×4
      </text>
    </g>
  ),
  'case-fan': () => (
    <g>
      <rect x={12} y={12} width={76} height={76} rx={8} fill="#111827" stroke="#334155" strokeWidth={2} />
      {[
        [19, 19],
        [81, 19],
        [19, 81],
        [81, 81],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={3} fill="#0b1220" stroke="#475569" />
      ))}
      <circle cx={50} cy={50} r={34} fill="none" stroke="#a78bfa" strokeWidth={2} className="glow" />
      <Fan cx={50} cy={50} r={32} frame="#0b1220" blade="#c4b5fd" />
    </g>
  ),
  gpu: () => (
    <g>
      <rect x={4} y={26} width={92} height={44} rx={5} fill="#1f2937" stroke="#475569" strokeWidth={1.5} />
      <Fan cx={22} cy={48} r={13} frame="#0b1220" blade="#64748b" />
      <Fan cx={50} cy={48} r={13} frame="#0b1220" blade="#64748b" />
      <Fan cx={78} cy={48} r={13} frame="#0b1220" blade="#64748b" />
      <rect x={4} y={26} width={92} height={3} fill="url(#rgb)" className="rgb" />
      <rect x={14} y={70} width={52} height={6} fill="#166534" />
      {Array.from({ length: 22 }).map((_, i) => (
        <rect key={i} x={15 + i * 2.3} y={71} width={1.4} height={5} fill="#facc15" />
      ))}
      <rect x={72} y={20} width={14} height={6} rx={1} fill="#0b1220" stroke="#64748b" />
    </g>
  ),
  'pcie-screws': () => (
    <g>
      {[32, 68].map((x) => (
        <g key={x} transform={`translate(${x} 26)`}>
          <rect x={-3} y={10} width={6} height={18} fill="#cbd5e1" />
          <rect x={-10} y={0} width={20} height={12} rx={3} fill="#e5e7eb" stroke="#94a3b8" />
          {[-6, -2, 2, 6].map((l) => (
            <line key={l} x1={l} y1={1.5} x2={l} y2={10.5} stroke="#94a3b8" />
          ))}
        </g>
      ))}
      <text x={50} y={86} textAnchor="middle" fontSize={8} fill="#475569" fontFamily="JetBrains Mono, monospace">
        thumbscrew ×2
      </text>
    </g>
  ),
  'gpu-bracket': () => (
    <g>
      <rect x={30} y={84} width={40} height={8} rx={2} fill="#334155" />
      <rect x={45} y={20} width={10} height={64} rx={2} fill="#94a3b8" />
      {[30, 40, 50, 60, 70].map((y) => (
        <line key={y} x1={45} y1={y} x2={55} y2={y + 3} stroke="#64748b" />
      ))}
      <rect x={34} y={12} width={32} height={8} rx={2} fill="#0f172a" stroke="#a78bfa" className="glow" />
      <path d="M 50 4 v 6 m -4 -3 l 4 4 l 4 -4" stroke="#a78bfa" strokeWidth={1.5} fill="none" className="bob" />
    </g>
  ),
  'cable-24pin': () => <Plug cols={12} rows={2} housing="#0f172a" wires={['#111827', '#1f2937']} w={86} label="ATX 24-PIN" />,
  'cable-eps': () => <Plug cols={4} rows={2} housing="#0f172a" wires={['#111827', '#1f2937']} w={50} label="CPU 4+4" />,
  'cable-12v2x6': () => (
    <g>
      <Plug cols={6} rows={2} housing="#0f172a" wires={['#111827', '#1f2937']} w={66} label="12V-2x6" />
      <rect x={34} y={40} width={32} height={4} fill="#1f2937" />
      {[38, 46, 54, 62].map((x) => (
        <rect key={x} x={x - 1} y={41} width={3} height={2} fill="#facc15" />
      ))}
    </g>
  ),
  'cable-fpanel': () => (
    <g>
      {[
        ['#ef4444', 'PWR'],
        ['#22c55e', 'RST'],
        ['#3b82f6', 'LED+'],
        ['#facc15', 'HDD'],
      ].map(([c, l], i) => (
        <g key={l} transform={`translate(${16 + i * 20} ${18 + (i % 2) * 6})`}>
          <path d={`M 5 14 C 5 40, ${34 - i * 20 + 8} 60, ${34 - i * 20 + 8} 76`} stroke={c} strokeWidth={2} fill="none" />
          <path d={`M 9 14 C 9 40, ${34 - i * 20 + 11} 60, ${34 - i * 20 + 11} 76`} stroke="#e5e7eb" strokeWidth={2} fill="none" />
          <rect x={0} y={0} width={14} height={14} rx={1.5} fill="#0f172a" stroke="#475569" />
          <text x={7} y={-3} textAnchor="middle" fontSize={5.5} fill="#475569" fontFamily="JetBrains Mono, monospace">
            {l}
          </text>
        </g>
      ))}
    </g>
  ),
  'cable-usb3': () => (
    <g>
      <path d="M 50 50 C 50 70, 50 80, 50 96" stroke="#1e3a8a" strokeWidth={12} fill="none" />
      <path d="M 50 50 C 50 70, 50 80, 50 96" stroke="#3b82f6" strokeWidth={2} strokeDasharray="3 4" fill="none" className="flow" />
      <rect x={24} y={22} width={52} height={28} rx={3} fill="#2563eb" stroke="#1e3a8a" />
      <rect x={44} y={18} width={12} height={4} fill="#2563eb" />
      <Pins x={29} y={27} cols={10} rows={2} size={3} gap={1.4} color="#0b1220" />
      <text x={50} y={14} textAnchor="middle" fontSize={7} fontWeight={700} fill="#475569" fontFamily="JetBrains Mono, monospace">
        USB 3.2
      </text>
    </g>
  ),
  'cable-usbc': () => (
    <g>
      <path d="M 50 46 C 50 70, 50 80, 50 96" stroke="#111827" strokeWidth={8} fill="none" />
      <rect x={30} y={28} width={40} height={18} rx={3} fill="#475569" stroke="#94a3b8" />
      <rect x={36} y={33} width={28} height={8} rx={4} fill="#0b1220" />
      <circle cx={30} cy={37} r={3} fill="#94a3b8" />
      <circle cx={70} cy={37} r={3} fill="#94a3b8" />
      <text x={50} y={20} textAnchor="middle" fontSize={7} fontWeight={700} fill="#475569" fontFamily="JetBrains Mono, monospace">
        USB-C KEY-A
      </text>
    </g>
  ),
  'cable-audio': () => <Plug cols={5} rows={2} housing="#111827" wires={['#ef4444', '#22c55e', '#3b82f6', '#facc15', '#e5e7eb']} w={50} label="HD AUDIO" />,
  'wifi-antenna': () => (
    <g>
      <rect x={24} y={70} width={52} height={14} rx={7} fill="#111827" stroke="#334155" />
      <rect x={34} y={18} width={6} height={54} rx={3} fill="#1f2937" />
      <rect x={60} y={18} width={6} height={54} rx={3} fill="#1f2937" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${50 - 10 - i * 7} ${16 - i * 4} q ${10 + i * 7} ${-10 - i * 4} ${20 + i * 14} 0`} stroke="#38bdf8" strokeWidth={2} fill="none" className="wave" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
      <path d="M 40 84 q 0 10 -20 12 M 60 84 q 0 10 20 12" stroke="#facc15" strokeWidth={1.5} fill="none" />
    </g>
  ),
  'zip-ties': () => (
    <g>
      {[30, 50, 70].map((y, i) => (
        <path key={y} d={`M 10 ${y} C 30 ${y - 14}, 70 ${y - 14}, 90 ${y}`} stroke={['#111827', '#1f2937', '#334155'][i]} strokeWidth={8} fill="none" strokeLinecap="round" />
      ))}
      <rect x={40} y={14} width={20} height={70} rx={4} fill="#a78bfa" opacity={0.9} className="bob" />
      {[22, 32, 42, 52, 62, 72].map((y) => (
        <line key={y} x1={42} y1={y} x2={58} y2={y} stroke="#7c3aed" strokeWidth={1} />
      ))}
    </g>
  ),
  'side-panel': () => (
    <g>
      <rect x={20} y={8} width={60} height={84} rx={4} fill="#38bdf8" opacity={0.18} stroke="#7dd3fc" strokeWidth={2} />
      <path d="M 26 14 l 16 0 l -16 40 z" fill="#fff" opacity={0.25} />
      <path d="M 60 70 l 14 -20 l 0 10 l -6 10 z" fill="#fff" opacity={0.15} />
      <rect x={20} y={8} width={60} height={84} rx={4} fill="url(#shine)" className="sweep" opacity={0.7} />
      <circle cx={74} cy={14} r={2} fill="#cbd5e1" />
      <circle cx={74} cy={86} r={2} fill="#cbd5e1" />
    </g>
  ),
  'power-cord': () => (
    <g>
      <path d="M 50 54 C 50 80, 20 70, 14 96" stroke="#111827" strokeWidth={7} fill="none" />
      <path d="M 30 20 h 40 l -4 34 h -32 z" fill="#1f2937" stroke="#334155" />
      <rect x={36} y={24} width={28} height={16} rx={2} fill="#0b1220" />
      {[42, 50, 58].map((x, i) => (
        <rect key={x} x={x - 1.5} y={i === 1 ? 26 : 30} width={3} height={7} fill="#cbd5e1" />
      ))}
      <path d="M 50 4 l -5 10 h 4 l -3 8 l 9 -12 h -4 l 3 -6 z" fill="#facc15" className="pulse" />
    </g>
  ),
  'display-cable': () => (
    <g>
      <path d="M 50 50 C 50 76, 80 72, 86 96" stroke="#111827" strokeWidth={7} fill="none" />
      <path d="M 30 24 h 40 v 18 l -6 6 h -34 z" fill="#475569" stroke="#94a3b8" />
      <rect x={34} y={28} width={30} height={10} fill="#0b1220" />
      <rect x={36} y={30} width={26} height={3} fill="#facc15" opacity={0.7} />
      <text x={50} y={16} textAnchor="middle" fontSize={7} fontWeight={700} fill="#475569" fontFamily="JetBrains Mono, monospace">
        DP 2.1
      </text>
    </g>
  ),
};

export function PartIcon({ id, size = 64, animated = true }: { id: PartId; size?: number; animated?: boolean }) {
  const Icon = ICONS[id];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={animated ? 'part-icon animated' : 'part-icon'} aria-hidden="true">
      <Icon />
    </svg>
  );
}

export { Fan };
