import { motion } from 'motion/react';
import { useMemo, useRef } from 'react';
import { load } from './App';
import { HeroArt } from './components/HeroArt';
import { PartIcon } from './components/PartIcon';
import { PARTS } from './data/parts';
import { ALL_TARGETS, PHASES, STEPS, type Phase } from './data/steps';
import type { PartId } from './data/parts';
import './home.css';


const PHASE_INFO: Record<Phase, { blurb: string; learn: string[]; icon: PartId; minutes: string }> = {
  Prepare: {
    blurb: 'Unbox your parts and set the motherboard on its box: the safest place to start.',
    learn: ['Avoiding static damage', 'Why you build outside the case first'],
    icon: 'motherboard',
    minutes: '1 min',
  },
  Motherboard: {
    blurb: 'Install the brains and memory while everything is easy to reach.',
    learn: ['Seating a CPU with zero force', 'Dual-channel RAM slots (A2 + B2)', 'M.2 SSDs and thermal paste'],
    icon: 'cpu',
    minutes: '6 min',
  },
  Case: {
    blurb: 'Move into the case and mount the big parts.',
    learn: ['Standoffs and the I/O shield', 'PSU orientation and airflow', 'Seating a heavy graphics card'],
    icon: 'case',
    minutes: '6 min',
  },
  Wiring: {
    blurb: 'Connect every power, front-panel, USB and audio cable, then tidy up.',
    learn: ['24-pin vs 8-pin CPU vs 12V-2x6', 'The fiddly front-panel pins', 'Cable management for airflow'],
    icon: 'cable-24pin',
    minutes: '5 min',
  },
  Finish: {
    blurb: 'Close it up, plug it in and watch it boot for the first time.',
    learn: ['Why the monitor goes into the GPU', 'First boot & memory training', 'Enabling EXPO/XMP in the BIOS'],
    icon: 'side-panel',
    minutes: '2 min',
  },
};

export function Home({ onStart }: { onStart: (step?: number) => void }) {
  const saved = useMemo(load, []);
  const filled = useMemo(() => new Set(saved.filled), [saved]);
  const pathRef = useRef<HTMLElement>(null);

  const stepDone = (i: number) => (STEPS[i].action === 'power' ? saved.finished : STEPS[i].targets.every((t) => filled.has(t.id)));
  const furthest = (() => {
    const i = STEPS.findIndex((_, idx) => !stepDone(idx));
    return i === -1 ? STEPS.length - 1 : i;
  })();
  const started = saved.filled.length > 0;
  const pct = Math.round(((saved.filled.length + (saved.finished ? 1 : 0)) / (ALL_TARGETS.length + 1)) * 100);

  const phases = PHASES.map((ph, n) => {
    const idx = STEPS.map((s, i) => (s.phase === ph ? i : -1)).filter((i) => i >= 0);
    const done = idx.every(stepDone);
    const first = idx[0];
    const status: 'done' | 'current' | 'locked' = done ? 'done' : first <= furthest ? 'current' : 'locked';
    return { ph, n, idx, first, status, info: PHASE_INFO[ph] };
  });

  return (
    <div className="home">
      {/* nav */}
      <header className="home-nav">
        <div className="brand">
          <div className="logo">
            <PartIcon id="case" size={34} />
          </div>
          <h1>PC Build Academy</h1>
        </div>
        <nav>
          <button className="link" onClick={() => pathRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            Learning path
          </button>
          <button className="btn primary" onClick={() => onStart()}>
            {started ? 'Continue building' : 'Start building'}
          </button>
        </nav>
      </header>

      {/* hero */}
      <section className="hero">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="eyebrow">Interactive guide · 2026 edition</span>
          <h2>
            Build your own PC,
            <br />
            <span className="grad">one part at a time.</span>
          </h2>
          <p className="lead">
            Drag real components into place, from the CPU and graphics card down to the smallest M.2 screw. Learn what each part does, where it goes and why,
            then watch your build come to life in 3D.
          </p>
          <div className="hero-cta">
            <button className="btn primary big" onClick={() => onStart()}>
              {started ? `Continue building · ${pct}% done →` : 'Start building →'}
            </button>
            <button className="btn ghost big" onClick={() => pathRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              See the learning path
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <b>{PARTS.length}</b>
              <span>real parts</span>
            </div>
            <div>
              <b>{STEPS.length}</b>
              <span>guided steps</span>
            </div>
            <div>
              <b>~20</b>
              <span>minutes</span>
            </div>
            <div>
              <b>0</b>
              <span>experience needed</span>
            </div>
          </div>
        </motion.div>
        <motion.div className="hero-visual art" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <HeroArt />
          <span className="hero-badge">● Every part labelled, from cooler to PSU</span>
        </motion.div>
      </section>

      {/* learning path */}
      <section className="path" ref={pathRef}>
        <div className="section-head">
          <span className="eyebrow">Your learning path</span>
          <h3>5 stages from a box of parts to a working PC</h3>
          <p className="muted">Each stage builds on the last. Finish one to unlock the next. Your progress is saved automatically.</p>
        </div>
        <ol className="path-list">
          {phases.map(({ ph, n, idx, first, status, info }, i) => (
            <motion.li
              key={ph}
              className={`path-item ${status}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="path-marker">
                <span>{status === 'done' ? '✓' : n + 1}</span>
              </div>
              <div className="path-card">
                <div className="path-icon">
                  <PartIcon id={info.icon} size={64} />
                </div>
                <div className="path-body">
                  <div className="path-top">
                    <h4>{ph}</h4>
                    <span className="muted small">
                      {idx.length} step{idx.length > 1 ? 's' : ''} · {info.minutes}
                    </span>
                    <span className={`path-status ${status}`}>{status === 'done' ? 'Completed' : status === 'current' ? (started ? 'In progress' : 'Start here') : 'Locked'}</span>
                  </div>
                  <p>{info.blurb}</p>
                  <ul className="path-learn">
                    {info.learn.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                  <div className="path-steps">
                    {idx.map((si) => (
                      <span key={si} className={stepDone(si) ? 'done' : ''} title={STEPS[si].title}>
                        {si + 1}. {STEPS[si].title}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  className={`btn ${status === 'locked' ? 'ghost' : 'primary'} path-go`}
                  disabled={status === 'locked'}
                  onClick={() => onStart(status === 'done' ? first : Math.max(first, Math.min(furthest, idx[idx.length - 1])))}
                >
                  {status === 'done' ? 'Review' : status === 'current' ? (started ? 'Continue →' : 'Start →') : '🔒 Locked'}
                </button>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* how it works */}
      <section className="how">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h3>Learn by doing, not by reading</h3>
        </div>
        <div className="how-grid">
          {[
            { icon: 'ram' as PartId, t: 'Read the step', d: 'Every step explains what to do, why it matters and the classic beginner mistakes to avoid.' },
            { icon: 'gpu' as PartId, t: 'Drag the part in', d: 'Pick the right component from the parts bin and drop it on the glowing spot. Wrong part? You’ll get a hint.' },
            { icon: 'case-fan' as PartId, t: 'See it in 3D', d: 'Switch to the live 3D view any time, with every component labelled where it sits in the case.' },
          ].map((c) => (
            <div key={c.t} className="how-card">
              <PartIcon id={c.icon} size={56} />
              <h4>{c.t}</h4>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* parts */}
      <section className="parts-show">
        <div className="section-head">
          <span className="eyebrow">What’s in the box</span>
          <h3>Every part, down to the smallest screw</h3>
        </div>
        <div className="parts-cloud">
          {PARTS.map((p, i) => (
            <motion.div
              key={p.id}
              className="cloud-item"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 12) * 0.03 }}
              title={p.short}
            >
              <PartIcon id={p.id} size={48} />
              <span>{p.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* final CTA */}
      <section className="cta-band">
        <h3>Ready to build?</h3>
        <p>No screwdriver needed. Just drag, drop and learn.</p>
        <button className="btn primary big" onClick={() => onStart()}>
          {started ? 'Continue building →' : 'Start the first step →'}
        </button>
      </section>

      <footer className="home-foot">PC Build Academy · an interactive guide to building a 2026 desktop PC</footer>
    </div>
  );
}
