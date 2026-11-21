import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import type { PartId } from '../data/parts';
import { MOBO_TRANSFORM, SCENE_H, SCENE_W, toScene, type SceneId, type Target } from '../data/steps';
import { Drop, MOBO_HOLES, Motherboard } from './Motherboard';
import { PartIcon } from './PartIcon';

interface SceneProps {
  scene: SceneId;
  has: (id: string) => boolean;
  powered: boolean;
  activeTargets: Target[];
  draggingPart: PartId | null;
  selectedPart: PartId | null;
  hintTarget: string | null;
  wrongTarget: string | null;
  onZoneClick: (t: Target) => void;
  overlay?: ReactNode;
}

export function Scene(props: SceneProps) {
  const { scene, has, powered } = props;
  return (
    <div className="scene">
      <AnimatePresence mode="wait">
        <motion.svg
          key={scene}
          viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
          className="scene-svg"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45 }}
        >
          {scene === 'bench' ? <Bench has={has} powered={powered} /> : <CaseView has={has} powered={powered} />}
        </motion.svg>
      </AnimatePresence>
      <div className="zones">
        {props.activeTargets.map((t) => (
          <DropZone
            key={t.id}
            target={t}
            scene={scene}
            accepting={props.draggingPart === t.part || props.selectedPart === t.part}
            dragging={!!props.draggingPart || !!props.selectedPart}
            hint={props.hintTarget === t.id}
            wrong={props.wrongTarget === t.id}
            onClick={() => props.onZoneClick(t)}
          />
        ))}
      </div>
      {props.overlay}
      <div className="scene-badge">{scene === 'bench' ? 'Workbench · motherboard on its box' : has('c-case') ? 'Case · side view (glass removed)' : 'Workspace'}</div>
    </div>
  );
}

function DropZone({
  target,
  scene,
  accepting,
  dragging,
  hint,
  wrong,
  onClick,
}: {
  target: Target;
  scene: SceneId;
  accepting: boolean;
  dragging: boolean;
  hint: boolean;
  wrong: boolean;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: target.id });
  const z = toScene(target.zone, scene);
  const cls = ['zone', accepting && 'accepting', dragging && !accepting && 'dim', isOver && 'over', hint && 'hint', wrong && 'wrong', z.y < 50 && 'label-in']
    .filter(Boolean)
    .join(' ');
  return (
    <div
      ref={setNodeRef}
      className={cls}
      onClick={onClick}
      style={{
        left: `${(z.x / SCENE_W) * 100}%`,
        top: `${(z.y / SCENE_H) * 100}%`,
        width: `${(z.w / SCENE_W) * 100}%`,
        height: `${(z.h / SCENE_H) * 100}%`,
      }}
    >
      <span className="zone-label">
        <PartIcon id={target.part} size={16} animated={false} />
        {target.label}
      </span>
    </div>
  );
}

/* ───────────────────────────── BENCH ───────────────────────────── */

function Bench({ has, powered }: { has: (id: string) => boolean; powered: boolean }) {
  const t = MOBO_TRANSFORM.bench;
  return (
    <g>
      <rect width={SCENE_W} height={SCENE_H} fill="url(#desk)" />
      <rect width={SCENE_W} height={SCENE_H} fill="url(#grid)" />

      {/* motherboard box */}
      <rect x={t.x - 14} y={t.y - 14} width={244 * t.s + 28} height={305 * t.s + 28} rx={6} fill="#a87b4f" />
      <rect x={t.x - 14} y={t.y - 14} width={244 * t.s + 28} height={305 * t.s + 28} rx={6} fill="url(#cardboard)" opacity={0.5} />
      <text x={t.x + 122 * t.s} y={t.y + 152 * t.s} fontSize={30} fill="#7a5533" textAnchor="middle" fontWeight={800} opacity={0.6}>
        MOTHERBOARD BOX
      </text>
      {!has('p-mobo') && (
        <rect x={t.x} y={t.y} width={244 * t.s} height={305 * t.s} rx={8} fill="none" stroke="#fffbeb" strokeWidth={3} strokeDasharray="12 10" opacity={0.9} />
      )}
      {has('p-mobo') && (
        <Drop>
          <g transform={`translate(${t.x} ${t.y}) scale(${t.s})`}>
            <Motherboard has={has} powered={powered} />
          </g>
        </Drop>
      )}

    </g>
  );
}

/* ───────────────────────────── CASE ───────────────────────────── */

function AirArrows({ x1, x2, ys, color = '#38bdf8' }: { x1: number; x2: number; ys: number[]; color?: string }) {
  return (
    <g>
      {ys.map((y) => (
        <path key={y} d={`M ${x1} ${y} H ${x2}`} stroke={color} strokeWidth={3} strokeDasharray="10 14" className={x2 < x1 ? 'flow-left' : 'flow'} opacity={0.7} markerEnd="url(#arrow)" />
      ))}
    </g>
  );
}

function SideFan({ x, y, h, powered, dir }: { x: number; y: number; h: number; powered: boolean; dir: 'in' | 'out' }) {
  return (
    <Drop>
      <rect x={x} y={y} width={22} height={h} rx={4} fill="#111827" stroke={powered ? '#a78bfa' : '#334155'} strokeWidth={2} className={powered ? 'glow' : undefined} />
      {Array.from({ length: Math.floor(h / 16) }).map((_, i) => (
        <line key={i} x1={x + 3} y1={y + 8 + i * 16} x2={x + 19} y2={y + 14 + i * 16} stroke="#64748b" strokeWidth={2} className={powered ? 'blade' : undefined} />
      ))}
      <text x={x + 11} y={y - 6} fontSize={10} fill="#a78bfa" textAnchor="middle" fontWeight={700}>
        {dir === 'in' ? 'IN' : 'OUT'}
      </text>
    </Drop>
  );
}

function CaseView({ has, powered }: { has: (id: string) => boolean; powered: boolean }) {
  const t = MOBO_TRANSFORM.case;
  const mx = (x: number) => t.x + x * t.s;
  const my = (y: number) => t.y + y * t.s;
  return (
    <g>
      <rect width={SCENE_W} height={SCENE_H} fill="url(#desk)" />
      <rect width={SCENE_W} height={SCENE_H} fill="url(#grid)" />
      {!has('c-case') && (
        <g>
          <rect x={170} y={20} width={660} height={680} rx={16} fill="none" stroke="#d97706" strokeWidth={3} strokeDasharray="14 12" opacity={0.7} />
          <text x={500} y={360} textAnchor="middle" fontSize={26} fill="#b45309" opacity={0.8} fontWeight={700}>
            Place the case here
          </text>
        </g>
      )}
      {has('c-case') && (
        <Drop>
          {/* chassis */}
          <rect x={170} y={20} width={660} height={680} rx={16} fill="#0b111c" stroke="#2b3646" strokeWidth={5} />
          <rect x={186} y={36} width={628} height={648} rx={8} fill="#111a29" />
          {/* tray cut-out pattern */}
          <g opacity={0.25}>
            {Array.from({ length: 8 }).map((_, i) => (
              <circle key={i} cx={720} cy={80 + i * 52} r={6} fill="#020617" />
            ))}
          </g>
          {/* front mesh */}
          <rect x={814} y={36} width={12} height={648} fill="url(#mesh)" />
          {/* rear panel + slot covers */}
          <rect x={170} y={36} width={16} height={648} fill="#1a2232" />
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={172} y={282 + i * 30} width={12} height={24} rx={2} fill={has('c-gpu') && i < 3 ? '#0b111c' : '#334155'} />
          ))}
          {/* I/O opening */}
          {!has('c-io') && <rect x={196} y={56} width={40} height={228} rx={3} fill="#020617" stroke="#f59e0b" strokeDasharray="6 6" opacity={0.7} />}
          {/* grommets */}
          <rect x={612} y={110} width={22} height={100} rx={9} fill="#020617" stroke="#1f2937" strokeWidth={2} />
          <rect x={612} y={232} width={22} height={110} rx={9} fill="#020617" stroke="#1f2937" strokeWidth={2} />
          <rect x={286} y={36} width={80} height={10} rx={5} fill="#020617" />
          {/* power button + LED on top-front */}
          <rect x={760} y={12} width={30} height={10} rx={3} fill="#1f2937" />
          <circle cx={800} cy={17} r={3} fill={powered ? '#22c55e' : '#14281a'} className={powered ? 'pulse' : undefined} />
          {/* tray standoff holes (always visible until mobo arrives) */}
          {!has('c-mobo') &&
            MOBO_HOLES.map(([x, y]) => <circle key={`${x}${y}`} cx={mx(x)} cy={my(y)} r={4} fill="#020617" stroke="#334155" />)}
          {!has('c-mobo') && (
            <rect x={mx(0)} y={my(0)} width={244 * t.s} height={305 * t.s} rx={6} fill="none" stroke="#334155" strokeDasharray="8 8" />
          )}
        </Drop>
      )}

      {has('c-io') && (
        <Drop>
          <rect x={198} y={58} width={36} height={224} rx={2} fill="url(#brushed)" stroke="#94a3b8" />
          {[70, 90, 110, 130, 150].map((y) => (
            <rect key={y} x={206} y={y} width={20} height={10} rx={1} fill="#0f172a" />
          ))}
        </Drop>
      )}

      {has('c-standoffs') &&
        !has('c-mobo') &&
        MOBO_HOLES.map(([x, y], i) => (
          <Drop key={`${x}${y}`} delay={i * 0.05}>
            <circle cx={mx(x)} cy={my(y)} r={6} fill="#f59e0b" stroke="#b45309" strokeWidth={2} />
            <circle cx={mx(x)} cy={my(y)} r={2.4} fill="#78350f" />
          </Drop>
        ))}

      {/* PSU shroud + PSU */}
      {has('c-case') && (
        <g>
          <rect x={186} y={545} width={628} height={139} rx={6} fill="#0f1726" stroke="#2b3646" strokeWidth={2} />
          <rect x={240} y={546} width={60} height={9} rx={4} fill="#020617" />
          <rect x={530} y={546} width={70} height={9} rx={4} fill="#020617" />
          <text x={620} y={630} fontSize={14} fill="#334155" fontWeight={700} textAnchor="middle">
            PSU SHROUD
          </text>
        </g>
      )}
      {has('c-psu') && (
        <Drop>
          <rect x={198} y={578} width={226} height={98} rx={6} fill="#111827" stroke="#475569" strokeWidth={2} />
          <rect x={198} y={578} width={226} height={98} rx={6} fill="url(#mesh)" opacity={0.2} />
          <text x={311} y={622} fontSize={16} fill="#facc15" fontWeight={800} textAnchor="middle">
            850W
          </text>
          <text x={311} y={642} fontSize={11} fill="#94a3b8" textAnchor="middle">
            ATX 3.1 · 80+ GOLD
          </text>
          <rect x={176} y={598} width={10} height={30} rx={2} fill="#020617" />
          <rect x={176} y={636} width={10} height={14} rx={2} fill={powered ? '#16a34a' : '#7f1d1d'} />
        </Drop>
      )}
      {has('c-psuscrews') &&
        [588, 606, 650, 668].map((y, i) => (
          <Drop key={y} delay={i * 0.06}>
            <circle cx={179} cy={y} r={4} fill="#d1d5db" stroke="#475569" />
          </Drop>
        ))}

      {/* fans */}
      {has('c-fan-f1') && <SideFan x={790} y={76} h={150} powered={powered} dir="in" />}
      {has('c-fan-f2') && <SideFan x={790} y={246} h={150} powered={powered} dir="in" />}
      {has('c-fan-r') && <SideFan x={188} y={70} h={130} powered={powered} dir="out" />}
      {powered && has('c-fan-f1') && <AirArrows x1={780} x2={660} ys={[110, 160, 200, 280, 330, 370]} />}
      {powered && has('c-fan-r') && <AirArrows x1={186} x2={110} ys={[100, 140, 180]} color="#f97316" />}

      {/* motherboard in case */}
      {has('c-mobo') && (
        <Drop>
          <g transform={`translate(${t.x} ${t.y}) scale(${t.s})`}>
            <Motherboard has={has} powered={powered} />
          </g>
        </Drop>
      )}

      {/* cables behind GPU */}
      {has('w-24') && (
        <Drop>
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d={`M ${mx(240)} ${my(62 + i * 5.6)} C ${mx(246)} ${my(62 + i * 5.6)}, 612 ${118 + i * 7}, 626 ${118 + i * 7}`} stroke={i % 2 ? '#52525b' : '#71717a'} strokeWidth={4} fill="none" />
          ))}
        </Drop>
      )}
      {has('w-eps') && (
        <Drop>
          <path d={`M ${mx(57)} ${my(1)} L ${mx(57)} 40`} stroke="#52525b" strokeWidth={16} />
          <path d={`M ${mx(57)} ${my(1)} L ${mx(57)} 40`} stroke="#a1a1aa" strokeWidth={16} strokeDasharray="2 3" opacity={0.35} />
        </Drop>
      )}
      {has('w-usbc') && (
        <Drop>
          <path d={`M ${mx(240)} ${my(145)} C 610 ${my(145)}, 612 262, 626 262`} stroke="#71717a" strokeWidth={6} fill="none" />
        </Drop>
      )}
      {has('w-usb3') && (
        <Drop>
          <path d={`M ${mx(240)} ${my(175)} C 610 ${my(175)}, 612 300, 626 300`} stroke="#2563eb" strokeWidth={10} fill="none" />
        </Drop>
      )}
      {has('w-fpanel') && (
        <Drop>
          {['#ef4444', '#22c55e', '#3b82f6', '#facc15'].map((c, i) => (
            <path key={c} d={`M ${mx(202 + i * 5.5)} ${my(302)} C ${mx(202 + i * 5.5)} 530, ${545 + i * 6} 530, ${545 + i * 6} 550`} stroke={c} strokeWidth={2.2} fill="none" />
          ))}
        </Drop>
      )}
      {has('w-audio') && (
        <Drop>
          <path d={`M ${mx(16)} ${my(301)} C ${mx(16)} 530, 270 530, 270 550`} stroke="#71717a" strokeWidth={6} fill="none" />
        </Drop>
      )}

      {/* GPU */}
      {has('c-gpu') && (
        <Drop>
          <rect x={204} y={276} width={26} height={84} rx={2} fill="url(#brushed)" stroke="#94a3b8" />
          <rect x={228} y={282} width={532} height={74} rx={8} fill="#1f2937" stroke="#4b5563" strokeWidth={2} />
          <rect x={228} y={282} width={532} height={12} rx={6} fill="#374151" />
          <path d="M 260 356 L 300 300 H 700 L 740 356" fill="none" stroke="#111827" strokeWidth={3} />
          <rect x={232} y={294} width={524} height={4} fill="url(#rgb)" opacity={powered ? 1 : 0.25} className={powered ? 'rgb' : undefined} />
          <text x={500} y={336} fontSize={22} fontWeight={800} fill="#64748b" textAnchor="middle" letterSpacing={6}>
            GRAPHICS
          </text>
          <rect x={596} y={274} width={36} height={10} rx={2} fill="#0b111c" stroke="#64748b" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={186} y={298 + i * 18} width={18} height={10} rx={1} fill="#020617" />
          ))}
        </Drop>
      )}
      {has('c-gpuscrews') &&
        [286, 316].map((y, i) => (
          <Drop key={y} delay={i * 0.08}>
            <circle cx={198} cy={y} r={6} fill="#e5e7eb" stroke="#64748b" strokeWidth={1.5} />
            <path d={`M ${194} ${y} h 8 M ${198} ${y - 4} v 8`} stroke="#475569" strokeWidth={1.5} />
          </Drop>
        ))}
      {has('c-gpubracket') && (
        <Drop>
          <rect x={696} y={356} width={14} height={188} rx={3} fill="#94a3b8" />
          <rect x={682} y={532} width={42} height={12} rx={3} fill="#334155" />
          <rect x={686} y={352} width={34} height={8} rx={2} fill="#0f172a" stroke="#a78bfa" />
        </Drop>
      )}
      {has('w-gpu') && (
        <Drop>
          <path d="M 565 550 C 565 470, 660 440, 660 330 C 660 282, 640 268, 614 270" stroke="#52525b" strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M 565 550 C 565 470, 660 440, 660 330 C 660 282, 640 268, 614 270" stroke="#a1a1aa" strokeWidth={14} fill="none" strokeDasharray="2 3" opacity={0.35} />
          <rect x={594} y={262} width={40} height={16} rx={3} fill="#111827" stroke="#64748b" />
        </Drop>
      )}

      {/* Wi-Fi antenna */}
      {has('w-wifi') && (
        <Drop>
          <path d="M 196 90 C 180 90, 160 120, 150 140" stroke="#facc15" strokeWidth={2} fill="none" />
          <rect x={118} y={136} width={60} height={12} rx={6} fill="#111827" stroke="#334155" />
          <rect x={128} y={60} width={8} height={78} rx={4} fill="#1f2937" />
          <rect x={160} y={60} width={8} height={78} rx={4} fill="#1f2937" />
          {powered &&
            [0, 1, 2].map((i) => (
              <path key={i} d={`M ${132 - 10 - i * 8} ${54 - i * 6} q ${10 + i * 8} -12 ${20 + i * 16} 0`} stroke="#38bdf8" strokeWidth={2} fill="none" className="wave" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
        </Drop>
      )}

      {/* velcro straps */}
      {has('w-ties') &&
        [140, 180, 280, 320].map((y, i) => (
          <Drop key={y} delay={i * 0.07}>
            <rect x={604} y={y} width={40} height={10} rx={3} fill="#8b5cf6" stroke="#5b21b6" />
          </Drop>
        ))}

      {/* external cables */}
      {has('f-power') && (
        <Drop>
          <path d="M 150 615 C 90 615, 70 680, 20 700" stroke="#111827" strokeWidth={10} fill="none" />
          <rect x={140} y={598} width={40} height={32} rx={4} fill="#1f2937" stroke="#475569" />
          {powered && (
            <path d="M 60 650 l -8 16 h 7 l -5 12 l 14 -18 h -7 l 5 -10 z" fill="#facc15" className="pulse" />
          )}
        </Drop>
      )}
      {has('f-display') && (
        <Drop>
          <path d="M 150 304 C 90 304, 80 380, 20 400" stroke="#111827" strokeWidth={9} fill="none" />
          <rect x={140} y={292} width={44} height={24} rx={3} fill="#475569" stroke="#94a3b8" />
          <text x={162} y={308} fontSize={9} fill="#e2e8f0" textAnchor="middle" fontWeight={700}>
            DP
          </text>
        </Drop>
      )}

      {/* side panel */}
      {has('f-panel') && (
        <Drop>
          <rect x={176} y={26} width={648} height={668} rx={12} fill="#7dd3fc" opacity={0.07} stroke="#7dd3fc" strokeWidth={3} />
          <path d="M 220 40 L 330 40 L 200 400 L 200 140 Z" fill="#fff" opacity={0.06} />
          <path d="M 520 694 L 610 694 L 810 320 L 810 470 Z" fill="#fff" opacity={0.04} />
        </Drop>
      )}
    </g>
  );
}
