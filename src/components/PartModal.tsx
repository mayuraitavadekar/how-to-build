import { motion } from 'motion/react';
import { PART_MAP, type PartId } from '../data/parts';
import { STEPS } from '../data/steps';
import { PartIcon } from './PartIcon';

export function PartModal({ id, onClose }: { id: PartId; onClose: () => void }) {
  const part = PART_MAP[id];
  const usedIn = STEPS.map((s, i) => ({ s, i })).filter(({ s }) => s.targets.some((t) => t.part === id));
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="modal part-modal"
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={part.name}
      >
        <button className="close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="pm-hero">
          <motion.div
            className="pm-icon"
            initial={{ rotateY: -90, scale: 0.6 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12 }}
          >
            <PartIcon id={id} size={160} />
          </motion.div>
          <div>
            <span className="cat-chip">{part.category}</span>
            <h2>{part.name}</h2>
            <p className="muted">{part.short}</p>
            <div className="pm-facts">
              <span>
                Qty <b>{part.qty}</b>
              </span>
              <span>
                Typical price <b>{part.price}</b>
              </span>
            </div>
          </div>
        </div>
        <p>{part.about}</p>
        <h4>2026 typical specs</h4>
        <ul className="spec-list">
          {part.specs.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        {part.tip && (
          <div className="callout tip">
            <span>💡</span>
            <p>{part.tip}</p>
          </div>
        )}
        {usedIn.length > 0 && (
          <p className="muted small">
            Used in:{' '}
            {usedIn.map(({ s, i }) => (
              <span key={s.id} className="used-chip">
                Step {i + 1}: {s.title}
              </span>
            ))}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
