import { AnimatePresence, motion } from 'motion/react';
import { PART_MAP } from '../data/parts';
import type { Step } from '../data/steps';
import { PartIcon } from './PartIcon';

interface Props {
  step: Step;
  index: number;
  total: number;
  has: (id: string) => boolean;
  complete: boolean;
  powered: boolean;
  canNext: boolean;
  onBack: () => void;
  onNext: () => void;
  onHint: () => void;
  onShowMe: () => void;
  onPower: () => void;
}

export function StepPanel(p: Props) {
  const { step } = p;
  return (
    <aside className="panel steps">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
          className="step-body"
        >
          <div className="step-kicker">
            <span className={`phase-tag ph-${step.phase.toLowerCase()}`}>{step.phase}</span>
            <span className="muted">
              Step {p.index + 1} of {p.total}
            </span>
          </div>
          <h2 className="step-title">{step.title}</h2>
          <p className="step-instruction">{step.instruction}</p>

          {step.targets.length > 0 && (
            <ul className="checklist">
              {step.targets.map((t) => {
                const done = p.has(t.id);
                const locked = !!t.requires && !p.has(t.requires);
                return (
                  <motion.li key={t.id} className={done ? 'done' : locked ? 'locked' : ''} layout>
                    <span className="check">{done ? '✓' : locked ? '🔒' : ''}</span>
                    <PartIcon id={t.part} size={26} animated={false} />
                    <span>
                      <b>{PART_MAP[t.part].name}</b> → {t.label}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          )}

          <ol className="details">
            {step.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ol>

          {step.tip && (
            <div className="callout tip">
              <span>💡</span>
              <p>{step.tip}</p>
            </div>
          )}
          {step.warning && (
            <div className="callout warn">
              <span>⚠️</span>
              <p>{step.warning}</p>
            </div>
          )}

          {step.action === 'power' && (
            <motion.button className="btn power" onClick={p.onPower} disabled={p.powered} whileTap={{ scale: 0.95 }}>
              <span className="power-icon">⏻</span> {p.powered ? 'Booting…' : 'Flip PSU switch & press Power'}
            </motion.button>
          )}

          <AnimatePresence>
            {p.complete && step.targets.length > 0 && (
              <motion.div className="complete-banner" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                ✅ Step complete!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="step-actions">
        <button className="btn ghost" onClick={p.onBack} disabled={p.index === 0}>
          ← Back
        </button>
        {!p.complete && step.targets.length > 0 && (
          <>
            <button className="btn ghost" onClick={p.onHint}>
              Hint
            </button>
            <button className="btn ghost" onClick={p.onShowMe} title="Install the next part automatically">
              Show me
            </button>
          </>
        )}
        <button className={`btn primary ${p.complete && p.canNext ? 'pulse-btn' : ''}`} onClick={p.onNext} disabled={!p.complete || !p.canNext}>
          Next →
        </button>
      </div>
    </aside>
  );
}
