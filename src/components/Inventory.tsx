import { useDraggable } from '@dnd-kit/core';
import { motion } from 'motion/react';
import { useState } from 'react';
import { CATEGORIES, PARTS, type Category, type Part, type PartId } from '../data/parts';
import { PartIcon } from './PartIcon';

export type PartStatus = 'now' | 'later' | 'done';

interface Props {
  status: (id: PartId) => { state: PartStatus; remaining: number; step?: number };
  selectedPart: PartId | null;
  hintPart: PartId | null;
  onSelect: (id: PartId) => void;
  onInfo: (id: PartId) => void;
}

export function Inventory({ status, selectedPart, hintPart, onSelect, onInfo }: Props) {
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [hideDone, setHideDone] = useState(false);

  const now = PARTS.filter((p) => status(p.id).state === 'now');
  const rest = PARTS.filter((p) => status(p.id).state !== 'now')
    .filter((p) => cat === 'all' || p.category === cat)
    .filter((p) => !hideDone || status(p.id).state !== 'done');

  const doneCount = PARTS.filter((p) => status(p.id).state === 'done').length;

  return (
    <aside className="panel inventory">
      <div className="panel-head">
        <h2>Parts bin</h2>
        <span className="muted">
          {doneCount}/{PARTS.length} used
        </span>
      </div>

      {now.length > 0 && (
        <section className="needed">
          <h3>
            <span className="dot-live" /> Needed for this step
          </h3>
          <div className="part-grid">
            {now.map((p) => (
              <PartCard key={p.id} part={p} st={status(p.id)} selected={selectedPart === p.id} hint={hintPart === p.id} onSelect={onSelect} onInfo={onInfo} />
            ))}
          </div>
        </section>
      )}

      <div className="cat-tabs">
        {CATEGORIES.map((c) => (
          <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <label className="toggle">
        <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> Hide installed parts
      </label>
      <div className="part-grid scroll">
        {rest.map((p) => (
          <PartCard key={p.id} part={p} st={status(p.id)} selected={selectedPart === p.id} hint={false} onSelect={onSelect} onInfo={onInfo} />
        ))}
      </div>
    </aside>
  );
}

function PartCard({
  part,
  st,
  selected,
  hint,
  onSelect,
  onInfo,
}: {
  part: Part;
  st: { state: PartStatus; remaining: number; step?: number };
  selected: boolean;
  hint: boolean;
  onSelect: (id: PartId) => void;
  onInfo: (id: PartId) => void;
}) {
  const disabled = st.state === 'done';
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: part.id, disabled });
  const cls = ['part-card', st.state, selected && 'selected', hint && 'hint', isDragging && 'dragging'].filter(Boolean).join(' ');

  return (
    <motion.div
      layout
      ref={setNodeRef}
      className={cls}
      {...listeners}
      {...attributes}
      onClick={() => !disabled && onSelect(part.id)}
      whileHover={disabled ? undefined : { y: -3 }}
      title={disabled ? `${part.name}: installed` : `Drag ${part.name} into the build`}
    >
      <div className="icon-wrap">
        <PartIcon id={part.id} size={58} animated={!disabled} />
      </div>
      <div className="part-name">{part.name}</div>
      <div className="part-meta">
        {disabled ? (
          <span className="badge ok">✓ Installed</span>
        ) : st.state === 'now' ? (
          <span className="badge now">Use now{st.remaining > 1 ? ` ×${st.remaining}` : ''}</span>
        ) : (
          <span className="badge later">Step {(st.step ?? 0) + 1}{st.remaining > 1 ? ` · ×${st.remaining}` : ''}</span>
        )}
      </div>
      <button
        className="info-btn"
        aria-label={`About ${part.name}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onInfo(part.id);
        }}
      >
        i
      </button>
    </motion.div>
  );
}
