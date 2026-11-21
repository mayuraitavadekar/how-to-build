import * as THREE from 'three';
import { MOBO_HOLES } from '../Motherboard';

/* Procedural textures drawn on <canvas>: no image files or downloads needed. */

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

function make(w: number, h: number, draw: Draw, opts: { color?: boolean; repeat?: [number, number] } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  if (opts.color !== false) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...opts.repeat);
  }
  return t;
}

const cache = new Map<string, THREE.Texture>();
function memo(key: string, f: () => THREE.Texture) {
  let t = cache.get(key);
  if (!t) {
    t = f();
    cache.set(key, t);
  }
  return t;
}

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const SANS = 'Inter, system-ui, sans-serif';

/** Motherboard top surface: traces, vias, SMD parts, mounting holes and silkscreen. 4 px per mm. */
export const pcbTexture = () =>
  memo('pcb', () =>
    make(976, 1220, (g, W, H) => {
      const S = 4;
      const r = rng(11);
      const grad = g.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#141b27');
      grad.addColorStop(1, '#0e131c');
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (let i = 0; i < 320; i++) {
        let x = r() * W;
        let y = r() * H;
        g.strokeStyle = `rgba(78,110,150,${0.14 + r() * 0.2})`;
        g.lineWidth = r() < 0.15 ? 3.2 : 1.4;
        g.beginPath();
        g.moveTo(x, y);
        for (let k = 0; k < 4; k++) {
          const d = 30 + r() * 150;
          const dir = (Math.floor(r() * 8) * Math.PI) / 4;
          x += Math.cos(dir) * d;
          y += Math.sin(dir) * d;
          g.lineTo(x, y);
        }
        g.stroke();
      }
      for (let i = 0; i < 700; i++) {
        g.fillStyle = 'rgba(160,178,196,0.35)';
        g.beginPath();
        g.arc(r() * W, r() * H, 1.6, 0, 7);
        g.fill();
      }
      for (let i = 0; i < 520; i++) {
        const x = r() * W;
        const y = r() * H;
        const a = 6 + r() * 7;
        const b = 3 + r() * 3;
        const vert = r() < 0.5;
        const [w, h] = vert ? [b, a] : [a, b];
        g.fillStyle = r() < 0.7 ? '#2a2c30' : '#6b4f2a';
        g.fillRect(x, y, w, h);
        g.fillStyle = '#c4c7cc';
        if (vert) {
          g.fillRect(x, y, w, 1.6);
          g.fillRect(x, y + h - 1.6, w, 1.6);
        } else {
          g.fillRect(x, y, 1.6, h);
          g.fillRect(x + w - 1.6, y, 1.6, h);
        }
      }
      for (const [mx, my] of MOBO_HOLES) {
        g.fillStyle = '#c9a45c';
        g.beginPath();
        g.arc(mx * S, my * S, 17, 0, 7);
        g.fill();
        g.fillStyle = '#07090c';
        g.beginPath();
        g.arc(mx * S, my * S, 8, 0, 7);
        g.fill();
      }
      g.fillStyle = 'rgba(228,234,242,0.88)';
      g.strokeStyle = 'rgba(228,234,242,0.75)';
      g.lineWidth = 2;
      const t = (s: string, mx: number, my: number, size = 16, rot = 0) => {
        g.save();
        g.translate(mx * S, my * S);
        g.rotate(rot);
        g.font = `600 ${size}px ${MONO}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(s, 0, 0);
        g.restore();
      };
      g.strokeRect(74 * S, 46 * S, 58 * S, 58 * S);
      g.strokeRect(36 * S, 152 * S, 166 * S, 16 * S);
      t('PCIEX16_1  PCIe 5.0', 118, 172.5, 15);
      t('PCIEX16_2', 118, 243, 15);
      t('PCIEX1_1', 118, 184, 13);
      t('M2_1', 100, 114, 15);
      t('A1   A2   B1   B2', 178, 160, 12);
      t('ATX_PWR', 221, 95, 14, -Math.PI / 2);
      t('CPU_PWR1', 84, 9, 13);
      t('CPU_FAN', 156, 17, 12);
      t('F_PANEL', 211, 287, 13);
      t('HD_AUDIO', 16, 287, 13);
      t('USB3_F', 221, 175, 12, -Math.PI / 2);
      t('USB_C', 221, 145, 11, -Math.PI / 2);
      t('BAT1', 210, 226, 13);
      t('SYS_FAN1', 105, 287, 12);
      t('ARGB', 131, 287, 12);
      t('LED_DEBUG', 208, 98, 10, -Math.PI / 2);
      g.font = `800 30px ${SANS}`;
      g.fillStyle = 'rgba(228,234,242,0.9)';
      g.fillText('PROTO B850-A', 22 * S, 268 * S);
      g.font = `500 15px ${SANS}`;
      g.fillText('WIFI 7 · DDR5 · PCIe 5.0', 22 * S, 276 * S);
    }),
  );

/** Round-hole perforation (white = solid, black = hole), used as an alpha map. */
export const perfTexture = (rx: number, ry: number, hole = 0.36) =>
  memo(`perf-${rx}-${ry}-${hole}`, () =>
    make(
      64,
      64,
      (g) => {
        g.fillStyle = '#fff';
        g.fillRect(0, 0, 64, 64);
        g.fillStyle = '#000';
        const R = 32 * hole * 1.6;
        for (const [x, y] of [
          [32, 32],
          [0, 0],
          [64, 0],
          [0, 64],
          [64, 64],
        ]) {
          g.beginPath();
          g.arc(x, y, R, 0, 7);
          g.fill();
        }
      },
      { color: false, repeat: [rx, ry] },
    ),
  );

/** Brushed-metal streaks (multiplied with the material colour). */
export const brushedTexture = () =>
  memo('brushed', () =>
    make(
      256,
      256,
      (g, W, H) => {
        const r = rng(3);
        g.fillStyle = '#d9d9d9';
        g.fillRect(0, 0, W, H);
        for (let i = 0; i < 900; i++) {
          const y = r() * H;
          const v = 190 + Math.floor(r() * 65);
          g.strokeStyle = `rgba(${v},${v},${v},0.55)`;
          g.lineWidth = 0.6 + r();
          g.beginPath();
          g.moveTo(0, y);
          g.lineTo(W, y + (r() - 0.5) * 2);
          g.stroke();
        }
      },
      { repeat: [1, 1] },
    ),
  );

/** Generic sticker / printed label. */
export function labelTexture(key: string, w: number, h: number, draw: Draw) {
  return memo(`label-${key}`, () => make(w, h, draw));
}

export const ssdLabel = () =>
  labelTexture('ssd', 512, 140, (g, W, H) => {
    g.fillStyle = '#0b0d12';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#0ea5e9';
    g.fillRect(0, 0, 14, H);
    g.fillStyle = '#f8fafc';
    g.font = `800 44px ${SANS}`;
    g.fillText('NVMe Gen5', 34, 58);
    g.font = `500 26px ${SANS}`;
    g.fillStyle = '#94a3b8';
    g.fillText('2 TB  ·  M.2 2280  ·  14 GB/s', 34, 100);
    g.fillStyle = '#f8fafc';
    for (let i = 0; i < 46; i++) g.fillRect(380 + i * 2.6, 112, i % 3 ? 1.2 : 2, 20);
  });

export const cpuLabel = () =>
  labelTexture('cpu', 256, 256, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, '#f1f5f9');
    gr.addColorStop(0.5, '#b8bcc4');
    gr.addColorStop(1, '#e2e8f0');
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(55,65,81,0.75)';
    g.font = `800 30px ${SANS}`;
    g.textAlign = 'center';
    g.fillText('DESKTOP CPU', W / 2, 104);
    g.font = `600 20px ${MONO}`;
    g.fillText('8C / 16T · 2026', W / 2, 140);
    g.font = `500 16px ${MONO}`;
    g.fillText('X9 26A0 · MADE FOR AM5', W / 2, 172);
    g.beginPath();
    g.moveTo(10, 10);
    g.lineTo(36, 10);
    g.lineTo(10, 36);
    g.fillStyle = '#ca8a04';
    g.fill();
  });

export const ramLabel = () =>
  labelTexture('ram', 512, 120, (g, W, H) => {
    g.fillStyle = '#1f2229';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#e5e7eb';
    g.font = `800 40px ${SANS}`;
    g.fillText('DDR5', 24, 56);
    g.font = `500 24px ${MONO}`;
    g.fillStyle = '#9ca3af';
    g.fillText('16GB · 6000 MT/s · CL30', 24, 94);
    g.strokeStyle = '#4b5563';
    g.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.moveTo(330 + i * 26, 20);
      g.lineTo(360 + i * 26, H - 20);
      g.stroke();
    }
  });

export const psuLabel = () =>
  labelTexture('psu', 512, 300, (g, W, H) => {
    g.fillStyle = '#111214';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#eab308';
    g.font = `900 96px ${SANS}`;
    g.fillText('850W', 30, 120);
    g.fillStyle = '#e5e7eb';
    g.font = `700 32px ${SANS}`;
    g.fillText('80 PLUS GOLD', 32, 175);
    g.font = `500 24px ${SANS}`;
    g.fillStyle = '#9ca3af';
    g.fillText('ATX 3.1 · FULLY MODULAR · 12V-2x6', 32, 220);
    g.strokeStyle = '#eab308';
    g.lineWidth = 6;
    g.strokeRect(14, 14, W - 28, H - 28);
  });

export const gpuEdgeLabel = () =>
  labelTexture('gpu-edge', 1024, 128, (g, W, H) => {
    g.fillStyle = '#1b1d22';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#d4d4d8';
    g.font = `900 64px ${SANS}`;
    g.fillText('GRAPHICS', 40, 86);
    g.font = `600 30px ${MONO}`;
    g.fillStyle = '#9ca3af';
    g.fillText('PCIe 5.0 · 16 GB GDDR7', 470, 80);
    g.strokeStyle = '#3f3f46';
    g.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.moveTo(880 + i * 22, 20);
      g.lineTo(900 + i * 22, H - 20);
      g.stroke();
    }
  });

export const hubLabel = (color: string) =>
  labelTexture(`hub-${color}`, 128, 128, (g, W) => {
    g.fillStyle = color;
    g.beginPath();
    g.arc(W / 2, W / 2, W / 2, 0, 7);
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.55)';
    g.lineWidth = 5;
    g.beginPath();
    g.arc(W / 2, W / 2, W / 2 - 14, 0, 7);
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.font = `900 34px ${SANS}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('P', W / 2, W / 2 + 2);
  });

export const brandLabel = (text: string, fg: string, bg: string) =>
  labelTexture(`brand-${text}-${fg}-${bg}`, 512, 128, (g, W, H) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    g.fillStyle = fg;
    g.font = `800 58px ${SANS}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, W / 2, H / 2 + 2);
  });

/** I/O shield on its own (before the board is installed): silver plate with port cut-outs. */
export const ioShieldTexture = () =>
  labelTexture('io-shield', 120, 400, (g, W, H) => {
    g.fillStyle = '#c7ccd3';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#16181d';
    const cut = (y: number, h: number, x = 10, w = 100) => g.fillRect(x, y, w, h);
    cut(20, 22, 18, 30);
    cut(20, 22, 72, 30);
    [70, 100, 130].forEach((y) => (cut(y, 18, 8, 46), cut(y, 18, 66, 46)));
    cut(165, 14, 14, 36);
    cut(165, 14, 70, 36);
    cut(195, 40, 16, 50);
    cut(250, 18, 10, 44);
    cut(250, 18, 66, 44);
    [300, 335].forEach((y) =>
      [22, 60, 98].forEach((x) => {
        g.beginPath();
        g.arc(x, y, 12, 0, 7);
        g.fill();
      }),
    );
  });

/** Shroud side: solid with a window over the PSU and a vent strip near the front. */
export const shroudAlpha = () =>
  memo('shroud-alpha', () =>
    make(
      440,
      100,
      (g, W, H) => {
        g.fillStyle = '#fff';
        g.fillRect(0, 0, W, H);
        g.fillStyle = '#000';
        g.beginPath();
        g.roundRect(20, 18, 150, 66, 10);
        g.fill();
        for (let x = 300; x < 420; x += 14)
          for (let y = 22; y < 80; y += 14) {
            g.beginPath();
            g.arc(x, y, 4.5, 0, 7);
            g.fill();
          }
      },
      { color: false },
    ),
  );
