import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'motion/react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BootScreen } from './components/BootScreen';
import { Inventory, type PartStatus } from './components/Inventory';
import { PartIcon } from './components/PartIcon';
import { PartModal } from './components/PartModal';
import { Scene } from './components/Scene';
import { StepPanel } from './components/StepPanel';
import { PARTS, PART_MAP, type PartId } from './data/parts';
import { ALL_TARGETS, PHASES, STEPS, TARGET_STEP, type Target } from './data/steps';

const Viewer3D = lazy(() => import('./components/Viewer3D'));

export interface SavedState {
  step: number;
  filled: string[];
  powered: boolean;
  finished: boolean;
}
const KEY = 'pc-build-academy-v2';
const initial: SavedState = { step: 0, filled: [], powered: false, finished: false };

export function load(): SavedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return initial;
}

interface Toast {
  id: number;
  kind: 'ok' | 'err' | 'info';
  text: string;
}

/** index of the first step that isn't finished yet (= the furthest step you may open) */
export function furthestStep(s: SavedState): number {
  const f = new Set(s.filled);
  const done = (i: number) => (STEPS[i].action === 'power' ? s.finished : STEPS[i].targets.every((t) => f.has(t.id)));
  const i = STEPS.findIndex((_, k) => !done(k));
  return i === -1 ? STEPS.length - 1 : i;
}

export default function App({ startStep, onHome }: { startStep?: number; onHome: () => void }) {
  // a step picked on the home page is applied up front (only if it's already unlocked)
  const [state, setState] = useState<SavedState>(() => {
    const s = load();
    return startStep !== undefined && startStep >= 0 && startStep <= furthestStep(s) ? { ...s, step: startStep } : s;
  });
  const [dragPart, setDragPart] = useState<PartId | null>(null);
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [infoPart, setInfoPart] = useState<PartId | null>(null);
  const [hint, setHint] = useState<{ part: PartId; target: string } | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showBoot, setShowBoot] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [view, setView] = useState<'2d' | '3d'>('2d');
  const [pip, setPip] = useState(true);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const filled = useMemo(() => new Set(state.filled), [state.filled]);
  const has = useCallback((id: string) => filled.has(id), [filled]);

  const step = STEPS[state.step];
  const stepComplete = (i: number) => {
    const s = STEPS[i];
    if (s.action === 'power') return state.finished;
    return s.targets.every((t) => filled.has(t.id));
  };
  const complete = stepComplete(state.step);
  const furthest = (() => {
    const i = STEPS.findIndex((_, idx) => !stepComplete(idx));
    return i === -1 ? STEPS.length - 1 : i;
  })();

  const activeTargets = step.targets.filter((t) => !filled.has(t.id) && (!t.requires || filled.has(t.requires)));

  const status = useCallback(
    (id: PartId): { state: PartStatus; remaining: number; step?: number } => {
      const open = ALL_TARGETS.filter((t) => t.part === id && !filled.has(t.id));
      const remaining = Math.min(PART_MAP[id].qty, open.length);
      if (open.length === 0) return { state: 'done', remaining: 0 };
      if (activeTargets.some((t) => t.part === id)) return { state: 'now', remaining: activeTargets.filter((t) => t.part === id).length };
      return { state: 'later', remaining, step: TARGET_STEP[open[0].id] };
    },
    [filled, activeTargets],
  );

  const toast = (kind: Toast['kind'], text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'err' ? 4200 : 2600);
  };

  const fill = (t: Target) => {
    setState((s) => ({ ...s, filled: [...s.filled, t.id] }));
    setHint(null);
    setSelectedPart(null);
    toast('ok', `✓ ${PART_MAP[t.part].name} → ${t.label}`);
  };

  const explainWhere = (part: PartId) => {
    const st = status(part);
    if (st.state === 'done') return `${PART_MAP[part].name} is already installed.`;
    if (st.state === 'now') {
      const t = activeTargets.find((x) => x.part === part)!;
      return `Try ${t.label} instead.`;
    }
    const idx = st.step ?? 0;
    return `Not yet: you’ll need it in step ${idx + 1} (“${STEPS[idx].title}”).`;
  };

  const attempt = (part: PartId, targetId: string | null) => {
    if (!targetId) {
      if (status(part).state !== 'now') toast('info', explainWhere(part));
      return;
    }
    const target = activeTargets.find((t) => t.id === targetId);
    if (!target) return;
    if (target.part === part) {
      fill(target);
    } else {
      setWrong(targetId);
      setTimeout(() => setWrong(null), 650);
      toast('err', `✗ ${PART_MAP[part].name} doesn’t go in “${target.label}”. ${explainWhere(part)}`);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const onDragStart = (e: DragStartEvent) => {
    setDragPart(e.active.id as PartId);
    setSelectedPart(null);
  };
  const onDragEnd = (e: DragEndEvent) => {
    const part = e.active.id as PartId;
    setDragPart(null);
    attempt(part, (e.over?.id as string) ?? null);
  };

  const onSelectPart = (id: PartId) => {
    if (selectedPart === id) {
      setSelectedPart(null);
      return;
    }
    setSelectedPart(id);
    if (status(id).state === 'now') toast('info', `Selected ${PART_MAP[id].name}: now tap where it goes (or drag it).`);
    else toast('info', explainWhere(id));
  };

  const onZoneClick = (t: Target) => {
    if (selectedPart) attempt(selectedPart, t.id);
    else toast('info', `This spot needs: ${PART_MAP[t.part].name}. Drag it from the parts bin.`);
  };

  const goto = (i: number) => {
    setHint(null);
    setSelectedPart(null);
    setState((s) => ({ ...s, step: Math.max(0, Math.min(STEPS.length - 1, i)) }));
  };

  // jump to a step chosen on the home page (only if it's already unlocked)
  useEffect(() => {
    if (startStep !== undefined) history.replaceState(null, '', '#/build');
  }, [startStep]);

  const onHint = () => {
    const t = activeTargets[0];
    if (!t) return;
    setHint({ part: t.part, target: t.id });
    toast('info', `Hint: drag the ${PART_MAP[t.part].name} to “${t.label}” (glowing).`);
  };
  const onShowMe = () => {
    const t = activeTargets[0];
    if (t) fill(t);
  };

  const onPower = () => {
    setState((s) => ({ ...s, powered: true }));
    setTimeout(() => setShowBoot(true), 1800);
  };

  const onFinish = () => {
    setShowBoot(false);
    setState((s) => ({ ...s, finished: true }));
    const end = Date.now() + 1800;
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0 } });
      confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const reset = () => {
    if (!confirm('Start the build over from scratch?')) return;
    setState(initial);
    setShowBoot(false);
  };

  const totalTargets = ALL_TARGETS.length + 1;
  const progress = (state.filled.length + (state.finished ? 1 : 0)) / totalTargets;

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragPart(null)}>

      <div className="app">
        <header className="topbar">
          <div className="brand clickable" onClick={onHome} title="Back to home">
            <div className="logo">
              <PartIcon id="case" size={34} />
            </div>
            <div>
              <h1>PC Build Academy</h1>
              <p>Build a 2026 desktop PC, one part at a time</p>
            </div>
          </div>
          <nav className="phases">
            {PHASES.map((ph) => {
              const idxs = STEPS.map((s, i) => (s.phase === ph ? i : -1)).filter((i) => i >= 0);
              const done = idxs.every((i) => stepComplete(i));
              const cur = step.phase === ph;
              const first = idxs[0];
              return (
                <button key={ph} className={`phase ${cur ? 'cur' : ''} ${done ? 'done' : ''}`} disabled={first > furthest} onClick={() => goto(first)}>
                  <span className="pdot">{done ? '✓' : PHASES.indexOf(ph) + 1}</span>
                  {ph}
                </button>
              );
            })}
          </nav>
          <div className="top-right">
            <div className="progress" title={`${Math.round(progress * 100)}% complete`}>
              <motion.div className="bar" animate={{ width: `${progress * 100}%` }} />
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <button className="btn ghost small" onClick={onHome}>
              ← Home
            </button>
            <button className="btn ghost small" onClick={() => setShowIntro(true)}>
              How to play
            </button>
            <button className="btn ghost small" onClick={reset}>
              Reset
            </button>
          </div>
        </header>

        <div className="step-strip">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`chip ${i === state.step ? 'cur' : ''} ${stepComplete(i) ? 'done' : ''}`}
              disabled={i > furthest}
              onClick={() => goto(i)}
              title={`${i + 1}. ${s.title}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <main className="layout">
          <Inventory status={status} selectedPart={selectedPart} hintPart={hint?.part ?? null} onSelect={onSelectPart} onInfo={setInfoPart} />

          <section className="stage">
            <div className="stage-bar">
              <div className="seg" role="tablist" aria-label="View mode">
                <button role="tab" aria-selected={view === '2d'} className={view === '2d' ? 'on' : ''} onClick={() => setView('2d')}>
                  2D build
                </button>
                <button role="tab" aria-selected={view === '3d'} className={view === '3d' ? 'on' : ''} onClick={() => setView('3d')}>
                  3D view
                </button>
              </div>
              {view === '2d' && (
                <label className="toggle inline">
                  <input type="checkbox" checked={pip} onChange={(e) => setPip(e.target.checked)} /> Live 3D preview
                </label>
              )}
            </div>
            {view === '2d' ? (
              <Scene
                scene={step.scene}
                has={has}
                powered={state.powered}
                activeTargets={activeTargets}
                draggingPart={dragPart}
                selectedPart={selectedPart}
                hintTarget={hint?.target ?? null}
                wrongTarget={wrong}
                onZoneClick={onZoneClick}
                overlay={
                  pip ? (
                    <div className="pip" onClick={() => setView('3d')} title="Open the full 3D view">
                      <Suspense fallback={<div className="viewer-loading">Loading 3D…</div>}>
                        <Viewer3D has={has} powered={state.powered} compact />
                      </Suspense>
                      <span className="pip-label">3D · click to expand</span>
                    </div>
                  ) : null
                }
              />
            ) : (
              <div className="scene">
                <Suspense fallback={<div className="viewer-loading">Loading 3D…</div>}>
                  <Viewer3D has={has} powered={state.powered} fresh={step.targets.map((t) => t.id)} />
                </Suspense>
              </div>
            )}
            <div className="stage-foot">
              {view === '3d' ? (
                <span>Drag to rotate · scroll to zoom · right-drag to pan. Switch to <b>2D build</b> to place parts.</span>
              ) : selectedPart ? (
                <span>
                  <b>{PART_MAP[selectedPart].name}</b> selected. Tap a glowing spot to place it, or tap the card again to cancel.
                </span>
              ) : (
                <span>Drag a part from the bin onto a dashed outline · or tap a part, then tap where it goes.</span>
              )}
            </div>
          </section>

          <StepPanel
            step={step}
            index={state.step}
            total={STEPS.length}
            has={has}
            complete={complete}
            powered={state.powered}
            canNext={state.step < STEPS.length - 1}
            onBack={() => goto(state.step - 1)}
            onNext={() => goto(state.step + 1)}
            onHint={onHint}
            onShowMe={onShowMe}
            onPower={onPower}
          />
        </main>
      </div>

      <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }}>
        {dragPart ? (
          <div className="drag-ghost">
            <PartIcon id={dragPart} size={84} />
            <span>{PART_MAP[dragPart].name}</span>
          </div>
        ) : null}
      </DragOverlay>

      <div className="toasts">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} className={`toast ${t.kind}`} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} layout>
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>{infoPart && <PartModal id={infoPart} onClose={() => setInfoPart(null)} />}</AnimatePresence>
      <AnimatePresence>{showBoot && <BootScreen onFinish={onFinish} />}</AnimatePresence>
      <AnimatePresence>{state.finished && !showBoot && <FinishCard onReset={() => setState(initial)} onClose={() => goto(state.step)} />}</AnimatePresence>
      <AnimatePresence>{showIntro && <Intro onClose={() => setShowIntro(false)} />}</AnimatePresence>
    </DndContext>
  );
}

function Intro({ onClose }: { onClose: () => void }) {
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="modal intro" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
        <h2>Welcome to PC Build Academy 🛠️</h2>
        <p>
          You’ve got a pile of {PARTS.length} parts, from the case and graphics card down to the tiniest M.2 screw and CMOS battery. Let’s turn them into a working 2026 desktop
          PC in {STEPS.length} guided steps.
        </p>
        <div className="intro-grid">
          <div>
            <b>1 · Read the step</b>
            <span>The right panel tells you what to do and why.</span>
          </div>
          <div>
            <b>2 · Drag the part</b>
            <span>Grab it from the parts bin and drop it on the glowing outline.</span>
          </div>
          <div>
            <b>3 · Learn as you go</b>
            <span>Tap ⓘ on any part for specs, prices and pro tips.</span>
          </div>
        </div>
        <div className="intro-parts">
          {PARTS.slice(0, 14).map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
              <PartIcon id={p.id} size={44} />
            </motion.div>
          ))}
        </div>
        <p className="muted small">Stuck? Use <b>Hint</b> or <b>Show me</b>. Your progress is saved automatically in this browser.</p>
        <button className="btn primary big" onClick={onClose}>
          Let’s build →
        </button>
      </motion.div>
    </motion.div>
  );
}

function FinishCard({ onReset, onClose }: { onReset: () => void; onClose: () => void }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="modal finish" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h2>🎉 Your PC is alive!</h2>
        <p>You assembled a complete 2026 desktop from {PARTS.length} parts. Next: install your OS from a USB stick, then update the BIOS and drivers.</p>
        <div className="finish-grid">
          {PARTS.map((p) => (
            <div key={p.id} title={p.name}>
              <PartIcon id={p.id} size={40} />
              <span>{p.name}</span>
            </div>
          ))}
        </div>
        <div className="row">
          <button
            className="btn ghost"
            onClick={() => {
              setHidden(true);
              onClose();
            }}
          >
            Admire my build
          </button>
          <button className="btn primary" onClick={onReset}>
            Build another one
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** gradients shared by every SVG on the page */
export function GlobalDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="ihs" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1f5f9" />
          <stop offset="0.5" stopColor="#a1a1aa" />
          <stop offset="1" stopColor="#e4e4e7" />
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rgb" x1="0" x2="1">
          <stop offset="0" stopColor="#f43f5e" />
          <stop offset="0.33" stopColor="#a855f7" />
          <stop offset="0.66" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="rgbv" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f43f5e" />
          <stop offset="0.33" stopColor="#a855f7" />
          <stop offset="0.66" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="brushed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e5e7eb" />
          <stop offset="0.45" stopColor="#9ca3af" />
          <stop offset="0.55" stopColor="#d1d5db" />
          <stop offset="1" stopColor="#6b7280" />
        </linearGradient>
        <linearGradient id="desk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset="1" stopColor="#e9eef4" />
        </linearGradient>
        <linearGradient id="bag" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cbd5e1" />
          <stop offset="0.5" stopColor="#475569" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
        <pattern id="cardboard" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 0 5 h 10" stroke="#8a6440" strokeWidth="1" opacity="0.5" />
        </pattern>
        <pattern id="mesh" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.4" fill="#020617" />
          <rect width="6" height="6" fill="#334155" opacity="0.3" />
        </pattern>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 H 0 V 40" fill="none" stroke="#d5dde7" strokeWidth="1" opacity="0.8" />
        </pattern>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
        </marker>
      </defs>
    </svg>
  );
}
