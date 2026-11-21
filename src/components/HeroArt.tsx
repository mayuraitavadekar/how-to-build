import { motion } from 'motion/react';

/**
 * Detailed 2D illustration of the finished build for the home page hero.
 * 2.5D view: glass side panel (front-on), front mesh panel + top panel drawn in oblique projection.
 */

// oblique projection for the front and top faces
const DX = 56;
const DY = -34;
const K = DY / DX; // -0.607

const LABELS: { text: string; dot: [number, number]; at: [number, number]; side: 'l' | 'r' }[] = [
  { text: 'Power button', dot: [464, 67], at: [514, 30], side: 'r' },
  { text: 'DDR5 RAM', dot: [336, 150], at: [514, 112], side: 'r' },
  { text: 'Front fans', dot: [478, 206], at: [514, 250], side: 'r' },
  { text: '24-pin power', dot: [362, 196], at: [514, 172], side: 'r' },
  { text: 'GPU support', dot: [403, 420], at: [514, 410], side: 'r' },
  { text: 'CPU cooler', dot: [226, 160], at: [118, 140], side: 'l' },
  { text: 'M.2 SSD', dot: [236, 275], at: [118, 262], side: 'l' },
  { text: 'Graphics card', dot: [190, 322], at: [118, 330], side: 'l' },
  { text: 'Power supply', dot: [210, 510], at: [118, 498], side: 'l' },
];

function Fan({ r, ring = 'url(#ha-rgb)', frame = '#1f2937', blade = '#e5e7eb' }: { r: number; ring?: string; frame?: string; blade?: string }) {
  return (
    <g>
      <rect x={-r - 4} y={-r - 4} width={2 * r + 8} height={2 * r + 8} rx={r * 0.22} fill={frame} />
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sy]) => (
        <circle key={`${sx}${sy}`} cx={sx * (r - 1)} cy={sy * (r - 1)} r={r * 0.06} fill="#0b0f16" />
      ))}
      <circle r={r} fill="#0b0f16" />
      <circle r={r - 1.5} fill="none" stroke={ring} strokeWidth={2.6} className="ha-glow" />
      <g className="spin" style={{ animationDuration: '1.1s' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <path
            key={i}
            d={`M 0 0 C ${r * 0.35} ${-r * 0.18}, ${r * 0.78} ${-r * 0.2}, ${r * 0.9} ${r * 0.02} C ${r * 0.6} ${r * 0.08}, ${r * 0.3} ${r * 0.1}, 0 0 Z`}
            fill={blade}
            opacity={0.92}
            transform={`rotate(${i * 40})`}
          />
        ))}
        <circle r={r * 0.26} fill="#d4d4d8" />
        <circle r={r * 0.16} fill="#a1a1aa" />
      </g>
    </g>
  );
}

export function HeroArt() {
  return (
    <svg viewBox="0 0 640 600" className="hero-art" role="img" aria-label="Illustration of a finished white gaming PC with glass side panel, RGB fans and labelled parts">
      <defs>
        <linearGradient id="ha-rgb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f43f5e" />
          <stop offset="0.35" stopColor="#a855f7" />
          <stop offset="0.7" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="ha-rgbv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="0.5" stopColor="#a855f7" />
          <stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
        <linearGradient id="ha-side" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e8ecf1" />
        </linearGradient>
        <linearGradient id="ha-front" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#eef1f5" />
          <stop offset="1" stopColor="#d9dee5" />
        </linearGradient>
        <linearGradient id="ha-top" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f1f4f8" />
        </linearGradient>
        <linearGradient id="ha-tray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset="1" stopColor="#e9eef4" />
        </linearGradient>
        <linearGradient id="ha-fins" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c7ccd3" />
          <stop offset="0.5" stopColor="#f1f5f9" />
          <stop offset="1" stopColor="#b8bec7" />
        </linearGradient>
        <linearGradient id="ha-gpu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3d45" />
          <stop offset="1" stopColor="#17191d" />
        </linearGradient>
        <linearGradient id="ha-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.25" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#bae6fd" stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id="ha-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0f172a" stopOpacity="0.28" />
          <stop offset="1" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ha-under" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        <pattern id="ha-mesh" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.55" fill="#9aa3af" />
        </pattern>
        <pattern id="ha-fine" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#4b5563" />
        </pattern>
        <pattern id="ha-vent" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="2.4" fill="#cbd5e1" />
        </pattern>
        <pattern id="ha-pcb" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 10 H14 L20 16 H40 M10 0 V8 M26 40 V28 L32 22 H40 M0 30 H8" stroke="#2b4466" strokeWidth="1" fill="none" />
          <circle cx="20" cy="16" r="1.3" fill="#64748b" />
          <circle cx="26" cy="28" r="1.3" fill="#64748b" />
        </pattern>
        <clipPath id="ha-glassclip">
          <rect x="142" y="102" width="296" height="446" rx="4" />
        </clipPath>
      </defs>

      {/* floor shadow + RGB under-glow */}
      <ellipse cx="318" cy="572" rx="250" ry="20" fill="url(#ha-floor)" />
      <ellipse cx="300" cy="566" rx="170" ry="14" fill="url(#ha-under)" className="ha-hue" />

      {/* feet */}
      {[150, 410].map((x) => (
        <rect key={x} x={x} y={556} width={34} height={9} rx={3} fill="#27272a" />
      ))}

      {/* ─── top face ─── */}
      <g transform={`matrix(1 0 1 ${K} 130 90)`}>
        <rect x={0} y={0} width={320} height={DX} fill="url(#ha-top)" stroke="#d4d8de" strokeWidth={1} />
        {/* dust filter */}
        <rect x={26} y={8} width={220} height={40} rx={3} fill="#2b2f36" />
        <rect x={26} y={8} width={220} height={40} rx={3} fill="url(#ha-fine)" opacity={0.6} />
        {/* front I/O strip */}
        <rect x={268} y={6} width={40} height={44} rx={4} fill="#2a2d33" />
        <rect x={276} y={10} width={6} height={8} rx={1} fill="#cbd5e1" />
        <rect x={276} y={21} width={6} height={8} rx={1} fill="#cbd5e1" />
        <rect x={277.5} y={11.5} width={3} height={5} fill="#2563eb" />
        <rect x={277.5} y={22.5} width={3} height={5} fill="#2563eb" />
        <rect x={286} y={12} width={4} height={8} rx={2} fill="#cbd5e1" />
        <circle cx={288} cy={26} r={2.4} fill="#0b0b0b" stroke="#a1a1aa" strokeWidth={0.8} />
        <circle cx={298} cy={18} r={1.6} fill="#3f3f46" />
        <circle cx={296} cy={38} r={7} fill="#d4d4d8" stroke="#a1a1aa" />
        <circle cx={296} cy={38} r={8.2} fill="none" stroke="#38bdf8" strokeWidth={1.6} className="ha-pulse" />
        <path d="M 296 34 v 4 M 293 35.5 a 4 4 0 1 0 6 0" stroke="#52525b" strokeWidth={1.2} fill="none" />
      </g>
      {/* Wi-Fi antenna */}
      <g>
        <rect x={168} y={78} width={34} height={8} rx={4} fill="#1f2328" />
        <rect x={174} y={30} width={6} height={50} rx={3} fill="#2a2d33" transform="rotate(-5 177 80)" />
        <rect x={190} y={30} width={6} height={50} rx={3} fill="#2a2d33" transform="rotate(5 193 80)" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${170 - i * 8} ${22 - i * 7} q ${16 + i * 8} -${12 + i * 4} ${34 + i * 16} 0`} stroke="#38bdf8" strokeWidth={2} fill="none" className="ha-wave" style={{ animationDelay: `${i * 0.35}s` }} />
        ))}
      </g>

      {/* ─── front face (mesh + fans behind it) ─── */}
      <g transform={`matrix(1 ${K} 0 1 450 90)`}>
        <rect x={0} y={0} width={DX} height={470} fill="url(#ha-front)" stroke="#cfd5dc" />
        <rect x={0} y={0} width={DX} height={470} fill="#20242b" opacity={0.5} />
        {[130, 262].map((cy) => (
          <g key={cy} transform={`translate(28 ${cy}) scale(0.42 1)`}>
            <Fan r={56} frame="#f4f4f5" blade="#f8fafc" />
          </g>
        ))}
        <rect x={0} y={0} width={DX} height={470} fill="url(#ha-mesh)" opacity={0.85} />
        <rect x={4} y={6} width={DX - 8} height={458} rx={3} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.9} />
        <text x={28} y={440} textAnchor="middle" fontSize={9} fontWeight={800} fill="#6b7280" letterSpacing={2}>
          PROTO
        </text>
      </g>

      {/* ─── glass side ─── */}
      <rect x={130} y={90} width={320} height={470} rx={8} fill="url(#ha-side)" stroke="#cfd5dc" />
      <g clipPath="url(#ha-glassclip)">
        <rect x={142} y={102} width={296} height={446} fill="url(#ha-tray)" />
        {/* grommets + tie points */}
        <rect x={392} y={128} width={12} height={72} rx={6} fill="#1f2328" />
        <rect x={392} y={214} width={12} height={72} rx={6} fill="#1f2328" />
        <rect x={200} y={104} width={70} height={7} rx={3.5} fill="#1f2328" />

        {/* rear exhaust fan (edge view) */}
        <rect x={143} y={118} width={10} height={98} rx={2} fill="#f4f4f5" stroke="#d4d4d8" />
        <rect x={152} y={118} width={2.4} height={98} fill="url(#ha-rgbv)" className="ha-hue" />

        {/* ─── motherboard ─── */}
        <rect x={160} y={114} width={212} height={262} rx={4} fill="#151c28" />
        <rect x={160} y={114} width={212} height={262} rx={4} fill="url(#ha-pcb)" opacity={0.85} />
        {/* rear I/O cover + VRM heatsinks */}
        <rect x={160} y={120} width={28} height={118} rx={4} fill="#3a4252" />
        <path d="M166 130 l16 20 M166 170 l16 20" stroke="#64748b" strokeWidth={2} />
        <text x={174} y={226} fontSize={6} fill="#cbd5e1" textAnchor="middle" fontWeight={700} transform="rotate(-90 174 226)">
          PROTO
        </text>
        <rect x={196} y={120} width={100} height={16} rx={3} fill="#4b5563" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={199 + i * 8} y={122} width={3.5} height={12} rx={1} fill="#6b7280" />
        ))}
        <rect x={192} y={140} width={10} height={82} rx={3} fill="#4b5563" />
        {/* EPS cable going up through the top cut-out */}
        <rect x={212} y={102} width={22} height={16} fill="#27272a" />
        {[214, 218, 222, 226, 230].map((x) => (
          <line key={x} x1={x} y1={102} x2={x} y2={116} stroke="#3f3f46" strokeWidth={1.2} />
        ))}

        {/* CPU cooler: fin stack + heat pipes + fan */}
        <rect x={204} y={146} width={84} height={112} rx={3} fill="url(#ha-fins)" />
        {Array.from({ length: 27 }).map((_, i) => (
          <line key={i} x1={204} y1={149 + i * 4} x2={288} y2={149 + i * 4} stroke="#9aa3ad" strokeWidth={0.8} />
        ))}
        <rect x={202} y={142} width={88} height={8} rx={3} fill="#1f2937" />
        {[214, 226, 266, 278].map((x) => (
          <circle key={x} cx={x} cy={146} r={3} fill="#c2410c" stroke="#7c2d12" strokeWidth={0.6} />
        ))}
        <g transform="translate(246 204)">
          <Fan r={38} frame="#1f2328" blade="#3f444c" />
        </g>
        {/* fan cable to CPU_FAN */}
        <path d="M 288 160 C 300 150, 296 132, 304 128" stroke="#111" strokeWidth={2} fill="none" />

        {/* RAM: 4 slots, 2 sticks with RGB */}
        {[304, 314, 324, 334].map((x) => (
          <rect key={x} x={x} y={124} width={5} height={116} rx={1} fill="#0e131b" />
        ))}
        {[312, 332].map((x, i) => (
          <g key={x}>
            <rect x={x} y={120} width={10} height={124} rx={2} fill="#26292f" />
            <rect x={x + 1.5} y={130} width={7} height={44} rx={1} fill="#3a3f47" />
            <rect x={x + 3.5} y={120} width={3} height={124} rx={1.5} fill="url(#ha-rgbv)" className="ha-hue" style={{ animationDelay: `${i * -0.6}s` }} />
          </g>
        ))}

        {/* 24-pin + sleeved bundle into grommet */}
        <rect x={356} y={158} width={12} height={74} rx={2} fill="#18181b" />
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d={`M 368 ${162 + i * 7} C 382 ${162 + i * 7}, 386 ${150 + i * 6}, 398 ${150 + i * 6}`} stroke={i % 2 ? '#2a2d33' : '#3f444c'} strokeWidth={4} fill="none" />
        ))}
        <rect x={384} y={160} width={6} height={44} rx={2} fill="#8b5cf6" />
        {/* USB 3 header cable */}
        <rect x={358} y={248} width={10} height={26} rx={2} fill="#1d4ed8" />
        <path d="M 368 260 C 384 262, 384 248, 398 246" stroke="#1e3a8a" strokeWidth={7} fill="none" />

        {/* M.2 heatsink + SSD peek, chipset, CMOS */}
        <rect x={204} y={266} width={92} height={16} rx={3} fill="#4b5563" />
        <text x={250} y={277} fontSize={8} fontWeight={800} fill="#d1d5db" textAnchor="middle" letterSpacing={1}>
          M.2 · NVMe Gen5
        </text>
        <rect x={300} y={350} width={58} height={22} rx={4} fill="#4b5563" />
        <text x={329} y={364} fontSize={7} fontWeight={800} fill="#d1d5db" textAnchor="middle">
          PROTO
        </text>
        <circle cx={282} cy={362} r={7} fill="#e5e7eb" stroke="#9ca3af" />

        {/* graphics card */}
        <rect x={150} y={294} width={12} height={58} rx={1} fill="#cbd5e1" />
        <rect x={160} y={294} width={270} height={52} rx={7} fill="url(#ha-gpu)" />
        <rect x={160} y={294} width={270} height={7} rx={3} fill="#4b5058" />
        <path d="M 176 346 L 206 306 H 384 L 414 346" stroke="#55595f" strokeWidth={2} fill="none" />
        <path d="M 236 346 L 250 316 H 340 L 354 346" stroke="#2c2f35" strokeWidth={6} fill="none" />
        <text x={295} y={331} fontSize={13} fontWeight={900} fill="#e4e4e7" textAnchor="middle" letterSpacing={4}>
          GRAPHICS
        </text>
        <rect x={168} y={339} width={254} height={3} rx={1.5} fill="url(#ha-rgb)" className="ha-hue" />
        {/* 12V-2x6 cable */}
        <rect x={326} y={286} width={20} height={9} rx={2} fill="#18181b" />
        <path d="M 340 286 C 344 270, 382 272, 384 300 L 386 470" stroke="#2a2d33" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M 340 286 C 344 270, 382 272, 384 300 L 386 470" stroke="#52565e" strokeWidth={8} strokeDasharray="2 3" fill="none" opacity={0.6} />
        {/* GPU support stand */}
        <rect x={400} y={346} width={6} height={124} fill="#a1a1aa" />
        <rect x={392} y={464} width={22} height={6} rx={2} fill="#3f3f46" />

        {/* front-panel + audio wires down to the shroud */}
        {['#ef4444', '#22c55e', '#3b82f6', '#eab308'].map((c, i) => (
          <path key={c} d={`M ${346 + i * 4} 376 C ${346 + i * 4} 420, ${352 + i * 3} 440, ${352 + i * 3} 472`} stroke={c} strokeWidth={1.6} fill="none" />
        ))}
        <path d="M 180 376 C 180 420, 186 440, 186 472" stroke="#3f444c" strokeWidth={4} fill="none" />

        {/* PSU shroud with window + vents */}
        <rect x={142} y={470} width={296} height={78} fill="#ffffff" stroke="#e2e8f0" />
        <rect x={156} y={484} width={128} height={52} rx={6} fill="#141416" />
        <text x={172} y={514} fontSize={18} fontWeight={900} fill="#eab308">
          850W
        </text>
        <text x={172} y={527} fontSize={7} fontWeight={700} fill="#d4d4d8" letterSpacing={0.5}>
          80 PLUS GOLD · ATX 3.1
        </text>
        <rect x={300} y={484} width={124} height={50} fill="url(#ha-vent)" />
        <rect x={200} y={471} width={28} height={4} rx={2} fill="#1f2328" />
        <rect x={340} y={471} width={30} height={4} rx={2} fill="#1f2328" />

        {/* glass reflections */}
        <rect x={142} y={102} width={296} height={446} fill="url(#ha-glass)" />
        <path d="M 160 102 L 226 102 L 142 236 L 142 132 Z" fill="#ffffff" opacity={0.22} />
        <path d="M 250 102 L 268 102 L 142 302 L 142 274 Z" fill="#ffffff" opacity={0.12} />
      </g>
      {/* glass frame + thumbscrews */}
      <rect x={140} y={100} width={300} height={450} rx={5} fill="none" stroke="#16181c" strokeWidth={5} />
      {[
        [146, 106],
        [434, 106],
        [146, 544],
        [434, 544],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={4} fill="#e5e7eb" stroke="#9ca3af" />
      ))}

      {/* ─── labels ─── */}
      {LABELS.map((l, i) => {
        const w = l.text.length * 6.6 + 22;
        const x = l.side === 'l' ? l.at[0] - w : l.at[0];
        const anchorX = l.side === 'l' ? l.at[0] : l.at[0];
        return (
          <motion.g key={l.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.12, duration: 0.4 }}>
            <path d={`M ${l.dot[0]} ${l.dot[1]} L ${anchorX} ${l.at[1]}`} stroke="#64748b" strokeWidth={1.2} strokeDasharray="3 3" fill="none" />
            <circle cx={l.dot[0]} cy={l.dot[1]} r={5} fill="#0ea5e9" opacity={0.25} className="ha-ping" />
            <circle cx={l.dot[0]} cy={l.dot[1]} r={3} fill="#ffffff" stroke="#0ea5e9" strokeWidth={2} />
            <rect x={x} y={l.at[1] - 12} width={w} height={24} rx={12} fill="#ffffff" stroke="#e2e8f0" filter="url(#ha-shadow)" />
            <circle cx={x + 11} cy={l.at[1]} r={3} fill="#0ea5e9" />
            <text x={x + 19} y={l.at[1] + 4} fontSize={11.5} fontWeight={700} fill="#0f172a">
              {l.text}
            </text>
          </motion.g>
        );
      })}
      <defs>
        <filter id="ha-shadow" x="-10%" y="-30%" width="120%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.14" />
        </filter>
      </defs>
    </svg>
  );
}
