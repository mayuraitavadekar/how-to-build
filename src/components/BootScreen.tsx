import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

const POST_LINES = [
  'PC Build Academy UEFI BIOS · v2026.11',
  'CPU   : 8-Core / 16-Thread desktop processor ........ OK',
  'Memory: 32 GB DDR5 (2 × 16 GB) dual-channel ........ OK',
  '        Training memory... (first boot can take 1–3 min)',
  '        Running at 4800 MT/s · EXPO/XMP profile available: 6000 MT/s',
  'Storage: NVMe PCIe 5.0 SSD 2 TB on M2_1 ........... OK',
  'Graphics: PCIe 5.0 x16 GPU, link x16 ............. OK',
  'CPU fan: 820 RPM · CPU temp 36 °C ................ OK',
  'USB: front USB-C, 2× USB-A, HD Audio .............. OK',
  'No bootable device found. Press DEL to enter setup.',
];

const BIOS_TASKS = [
  { id: 'expo', label: 'Enable EXPO / XMP memory profile (run RAM at 6000 MT/s)' },
  { id: 'temps', label: 'Check CPU temperature at idle (30–45 °C is normal)' },
  { id: 'fans', label: 'Verify all fans are detected (CPU_FAN, SYS_FAN)' },
  { id: 'boot', label: 'Set your USB installer as the first boot device' },
];

export function BootScreen({ onFinish }: { onFinish: () => void }) {
  const [lines, setLines] = useState(0);
  const [bios, setBios] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (lines >= POST_LINES.length) {
      const t = setTimeout(() => setBios(true), 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLines((l) => l + 1), lines === 3 ? 1300 : 420);
    return () => clearTimeout(t);
  }, [lines]);

  const allDone = BIOS_TASKS.every((t) => done[t.id]);

  return (
    <motion.div className="modal-backdrop dark" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="monitor" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 140, damping: 16 }}>
        <div className="screen">
          <AnimatePresence mode="wait">
            {!bios ? (
              <motion.div key="post" className="post" exit={{ opacity: 0 }}>
                {POST_LINES.slice(0, lines).map((l, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={l.includes('OK') ? 'ok' : i === 0 ? 'hdr' : ''}>
                    {l}
                  </motion.div>
                ))}
                <span className="cursor">█</span>
              </motion.div>
            ) : (
              <motion.div key="bios" className="bios" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bios-head">
                  <b>UEFI SETUP</b>
                  <span>EZ Mode</span>
                </div>
                <div className="bios-grid">
                  <div>
                    <small>CPU Temp</small>
                    <b>36 °C</b>
                  </div>
                  <div>
                    <small>Memory</small>
                    <b>{done.expo ? '6000 MT/s' : '4800 MT/s'}</b>
                  </div>
                  <div>
                    <small>Storage</small>
                    <b>NVMe 2 TB</b>
                  </div>
                  <div>
                    <small>CPU Fan</small>
                    <b>820 RPM</b>
                  </div>
                </div>
                <p className="bios-sub">Click each task to complete your first-boot checklist:</p>
                <ul className="bios-tasks">
                  {BIOS_TASKS.map((t) => (
                    <li key={t.id} className={done[t.id] ? 'done' : ''} onClick={() => setDone((d) => ({ ...d, [t.id]: true }))}>
                      <span>{done[t.id] ? '✔' : '○'}</span> {t.label}
                    </li>
                  ))}
                </ul>
                <button className="btn primary" disabled={!allDone} onClick={onFinish}>
                  Save & Exit (F10) → install your OS
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="monitor-stand" />
      </motion.div>
    </motion.div>
  );
}
