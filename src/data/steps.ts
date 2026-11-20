import type { PartId } from './parts';

/** Scene is 1000 x 720 units. Motherboard-local space is 244 x 305 (≈ ATX in mm). */
export const SCENE_W = 1000;
export const SCENE_H = 720;
export const MOBO_W = 244;
export const MOBO_H = 305;

export type SceneId = 'bench' | 'case';

export const MOBO_TRANSFORM: Record<SceneId, { x: number; y: number; s: number }> = {
  bench: { x: 238, y: 30, s: 2.15 },
  case: { x: 232, y: 48, s: 1.5 },
};

export interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
  /** 'mobo' = coordinates in motherboard-local space */
  space?: 'mobo' | 'scene';
}

export interface Target {
  id: string;
  part: PartId;
  label: string;
  zone: Zone;
  /** another target that must be filled first */
  requires?: string;
}

export type Phase = 'Prepare' | 'Motherboard' | 'Case' | 'Wiring' | 'Finish';
export const PHASES: Phase[] = ['Prepare', 'Motherboard', 'Case', 'Wiring', 'Finish'];

export interface Step {
  id: string;
  phase: Phase;
  scene: SceneId;
  title: string;
  instruction: string;
  details: string[];
  tip?: string;
  warning?: string;
  targets: Target[];
  action?: 'power';
}

const m = (x: number, y: number, w: number, h: number): Zone => ({ x, y, w, h, space: 'mobo' });
const s = (x: number, y: number, w: number, h: number): Zone => ({ x, y, w, h, space: 'scene' });

export function toScene(z: Zone, scene: SceneId): Zone {
  if (z.space !== 'mobo') return z;
  const t = MOBO_TRANSFORM[scene];
  return { x: t.x + z.x * t.s, y: t.y + z.y * t.s, w: z.w * t.s, h: z.h * t.s, space: 'scene' };
}

export const STEPS: Step[] = [
  // ───────────────────────── PREPARE ─────────────────────────
  {
    id: 'prep-tools',
    phase: 'Prepare',
    scene: 'bench',
    title: 'Set up a safe workspace',
    instruction: 'Drag the anti-static wrist strap onto your wrist and the screwdriver into the tool tray.',
    details: [
      'Work on a large, hard table. Avoid building on carpet.',
      'Put the strap on your wrist and clip it to bare metal (e.g. the case frame).',
      'Have a small bowl for screws, and keep all manuals handy.',
      'Good lighting (or a phone flashlight) helps a lot.',
    ],
    tip: 'Unbox everything first and check you have every part before you start.',
    targets: [
      { id: 'p-wrist', part: 'wrist-strap', label: 'Your wrist', zone: s(30, 70, 180, 170) },
      { id: 'p-tray', part: 'screwdriver', label: 'Tool tray', zone: s(30, 300, 180, 170) },
    ],
  },
  {
    id: 'prep-mobo',
    phase: 'Prepare',
    scene: 'bench',
    title: 'Place the motherboard on its box',
    instruction: 'Drag the motherboard onto the empty motherboard box in the middle of the bench.',
    details: [
      'Take the board out of its anti-static bag. Hold it by the edges.',
      'Put it on top of its cardboard box. That’s a perfect, non-conductive work surface.',
      'Don’t place it ON the anti-static bag: the outside of the bag can be conductive.',
    ],
    tip: 'Building the CPU, RAM, SSD and cooler outside the case is much easier.',
    targets: [{ id: 'p-mobo', part: 'motherboard', label: 'Motherboard box', zone: m(0, 0, MOBO_W, MOBO_H) }],
  },

  // ───────────────────────── MOTHERBOARD ─────────────────────────
  {
    id: 'mb-cmos',
    phase: 'Motherboard',
    scene: 'bench',
    title: 'Check the CMOS battery',
    instruction: 'Drag the CR2032 coin cell into the round battery holder near the chipset.',
    details: [
      'Usually pre-installed. Just check it’s seated firmly.',
      'The "+" side (with the writing) faces UP.',
      'Slide it under the holder’s lip, then press down until the clip snaps.',
    ],
    tip: 'This tiny 3 V cell keeps your BIOS settings and clock alive when unplugged.',
    targets: [{ id: 'm-cmos', part: 'cmos', label: 'Battery holder', zone: m(196, 196, 28, 28) }],
  },
  {
    id: 'mb-cpu',
    phase: 'Motherboard',
    scene: 'bench',
    title: 'Install the CPU',
    instruction: 'Drag the CPU into the socket. Line up the gold triangle with the socket’s corner marker.',
    details: [
      'Press the retention lever down and out, then lift it to open the load plate.',
      'Find the small gold triangle on one corner of the CPU and the matching mark on the socket.',
      'Lower the CPU straight down. It should drop in with ZERO force.',
      'Close the load plate and lock the lever. The plastic cap pops off by itself (keep it for warranty returns).',
    ],
    warning: 'Never touch the socket pins. One bent pin can stop the board from working.',
    targets: [{ id: 'm-cpu', part: 'cpu', label: 'CPU socket', zone: m(74, 46, 58, 58) }],
  },
  {
    id: 'mb-ssd',
    phase: 'Motherboard',
    scene: 'bench',
    title: 'Install the M.2 NVMe SSD',
    instruction: 'Drag the SSD into the M2_1 slot, then drag the M.2 screw to hold it down.',
    details: [
      'Remove the M.2 heatsink if your board has one (and peel the film off its thermal pad!).',
      'Insert the SSD into the slot at about a 30° angle, gold contacts first.',
      'Press the far end down flat onto the standoff.',
      'Fix it with the tiny M.2 screw or tool-less latch.',
    ],
    tip: 'M2_1 (closest to the CPU) is wired directly to the CPU. Use it for the boot drive.',
    targets: [
      { id: 'm-ssd', part: 'ssd', label: 'M2_1 slot', zone: m(54, 116, 88, 28) },
      { id: 'm-m2screw', part: 'm2-screw', label: 'M.2 standoff', zone: m(136, 120, 20, 20), requires: 'm-ssd' },
    ],
  },
  {
    id: 'mb-ram',
    phase: 'Motherboard',
    scene: 'bench',
    title: 'Install the RAM',
    instruction: 'Drag a RAM stick into slot A2, and the second stick into slot B2.',
    details: [
      'Open the latch(es) at the end of the DIMM slots.',
      'Line up the notch on the stick with the key in the slot. It only fits one way.',
      'Press firmly on both ends until the latch CLICKS. It needs more force than you’d expect.',
      'With two sticks, use A2 + B2 (2nd and 4th slot from the CPU) for dual-channel.',
    ],
    warning: 'A half-seated stick is the #1 cause of a PC that won’t boot.',
    targets: [
      { id: 'm-ram-a2', part: 'ram', label: 'Slot A2', zone: m(166, 18, 14, 138) },
      { id: 'm-ram-b2', part: 'ram', label: 'Slot B2', zone: m(186, 18, 14, 138) },
    ],
  },
  {
    id: 'mb-paste',
    phase: 'Motherboard',
    scene: 'bench',
    title: 'Apply thermal paste',
    instruction: 'Drag the thermal paste onto the centre of the CPU.',
    details: [
      'A single pea-sized dot (≈ 4–5 mm) in the centre is enough.',
      'Don’t spread it. The cooler’s mounting pressure spreads it evenly.',
      'Too much is messy; too little leaves dry spots. Pea-size is the sweet spot.',
    ],
    tip: 'Pre-applied paste on the cooler? Skip this step and just remove the plastic cover.',
    targets: [{ id: 'm-paste', part: 'thermal-paste', label: 'CPU centre', zone: m(88, 60, 30, 30) }],
  },
  {
    id: 'mb-cooler',
    phase: 'Motherboard',
    scene: 'bench',
    title: 'Mount the CPU cooler',
    instruction: 'Drag the cooler onto the CPU, then plug its fan cable into the CPU_FAN header.',
    details: [
      'Install the mounting brackets that match your socket (AM5 or LGA1851).',
      'Remove the protective film from the cooler base!',
      'Lower the cooler straight onto the CPU and tighten the screws diagonally, a few turns at a time.',
      'Orient the fan so air blows toward the rear (I/O side) of the board.',
      'Connect the fan lead to the 4-pin header labelled CPU_FAN.',
    ],
    warning: 'Forgot to peel the plastic film off the cooler base? Your CPU will overheat within seconds.',
    targets: [
      { id: 'm-cooler', part: 'cooler', label: 'Cooler mount', zone: m(62, 30, 92, 92) },
      { id: 'm-cpufan', part: 'cpu-fan-cable', label: 'CPU_FAN header', zone: m(146, 1, 22, 16), requires: 'm-cooler' },
    ],
  },

  // ───────────────────────── CASE ─────────────────────────
  {
    id: 'case-prep',
    phase: 'Case',
    scene: 'case',
    title: 'Prepare the case',
    instruction: 'Drag the case onto the workspace. Lay it on its side with the side panel removed.',
    details: [
      'Remove both side panels and put the glass somewhere safe.',
      'Take out the accessory box (screws, standoffs, zip ties) from inside.',
      'Lay the case flat so you can work from above.',
    ],
    targets: [{ id: 'c-case', part: 'case', label: 'Workspace', zone: s(170, 20, 660, 680) }],
  },
  {
    id: 'case-io',
    phase: 'Case',
    scene: 'case',
    title: 'Fit the I/O shield',
    instruction: 'Drag the I/O shield into the rectangular opening at the rear of the case.',
    details: [
      'Many 2026 boards have the shield pre-attached. If yours does, you can skip this.',
      'Otherwise, push it in from INSIDE the case until all four corners snap in.',
      'Check the orientation by matching it to the ports on the board.',
    ],
    warning: 'Forget it and you’ll have to take the whole motherboard back out.',
    targets: [{ id: 'c-io', part: 'io-shield', label: 'Rear I/O opening', zone: s(196, 52, 46, 232) }],
  },
  {
    id: 'case-standoffs',
    phase: 'Case',
    scene: 'case',
    title: 'Check the standoffs',
    instruction: 'Drag the standoffs onto the motherboard tray.',
    details: [
      'Match the standoff positions to the holes in your motherboard (ATX = 9).',
      'Many cases have them pre-installed; just count and verify.',
      'Remove any standoff that does NOT line up with a hole. It could short the board.',
    ],
    targets: [{ id: 'c-standoffs', part: 'standoffs', label: 'Motherboard tray', zone: m(0, 0, MOBO_W, MOBO_H) }],
  },
  {
    id: 'case-mobo',
    phase: 'Case',
    scene: 'case',
    title: 'Install the motherboard',
    instruction: 'Drag your assembled motherboard into the case and line it up with the standoffs and I/O shield.',
    details: [
      'Hold it by the cooler and the edges. Lower it in at an angle, ports first.',
      'Slide the ports into the I/O shield, then lay the board flat on the standoffs.',
      'Watch the I/O shield’s springy tabs. They must not poke into the USB/LAN ports.',
    ],
    tip: 'In tight cases, route the 8-pin CPU cable through the top grommet before this step.',
    targets: [{ id: 'c-mobo', part: 'motherboard', label: 'Motherboard tray', zone: m(0, 0, MOBO_W, MOBO_H) }],
  },
  {
    id: 'case-screws',
    phase: 'Case',
    scene: 'case',
    title: 'Screw in the motherboard',
    instruction: 'Drag the motherboard screws onto the board to fix it to the standoffs.',
    details: [
      'Start with the centre screw, then the corners.',
      'Thread all screws in loosely first, then tighten in a cross pattern.',
      'Snug is enough. Don’t crank them down.',
    ],
    targets: [{ id: 'c-screws', part: 'mobo-screws', label: 'Mounting holes', zone: m(0, 0, MOBO_W, MOBO_H) }],
  },
  {
    id: 'case-psu',
    phase: 'Case',
    scene: 'case',
    title: 'Install the power supply',
    instruction: 'Drag the PSU into the bottom shroud, then fix it with the PSU screws at the rear.',
    details: [
      'Attach the modular cables you’ll need first (24-pin, CPU 8-pin, GPU 12V-2x6).',
      'Slide the PSU into its bay. Fan facing DOWN if there is a filtered bottom vent.',
      'Secure it with 4 screws through the rear of the case.',
      'Make sure the PSU’s rear switch is OFF (O).',
    ],
    targets: [
      { id: 'c-psu', part: 'psu', label: 'PSU bay', zone: s(196, 574, 230, 106) },
      { id: 'c-psuscrews', part: 'psu-screws', label: 'PSU rear mount', zone: s(172, 574, 40, 106), requires: 'c-psu' },
    ],
  },
  {
    id: 'case-fans',
    phase: 'Case',
    scene: 'case',
    title: 'Install the case fans',
    instruction: 'Drag fans to the two front intake positions and the rear exhaust position.',
    details: [
      'Front fans pull cool air IN; the rear fan pushes hot air OUT.',
      'Air exits from the side with the frame struts / sticker.',
      'Aim for slightly positive pressure (more intake than exhaust) to keep dust out.',
      'Plug fans into SYS_FAN / CHA_FAN headers or the case’s fan hub.',
    ],
    targets: [
      { id: 'c-fan-f1', part: 'case-fan', label: 'Front intake 1', zone: s(780, 70, 46, 160) },
      { id: 'c-fan-f2', part: 'case-fan', label: 'Front intake 2', zone: s(780, 240, 46, 160) },
      { id: 'c-fan-r', part: 'case-fan', label: 'Rear exhaust', zone: s(176, 64, 46, 140) },
    ],
  },
  {
    id: 'case-gpu',
    phase: 'Case',
    scene: 'case',
    title: 'Install the graphics card',
    instruction: 'Drag the GPU into the top PCIe x16 slot, then add the bracket screws and the support bracket.',
    details: [
      'Remove 2–3 PCIe slot covers at the back of the case.',
      'Open the latch at the end of the top x16 slot (many boards have a quick-release button).',
      'Line up the card and press down evenly until the latch clicks.',
      'Screw the bracket to the case, then set the support stand under the far end of the card.',
    ],
    warning: 'Use the TOP x16 slot. The lower slots usually only run at x4 speed.',
    targets: [
      { id: 'c-gpu', part: 'gpu', label: 'PCIe x16 slot', zone: s(222, 272, 540, 86) },
      { id: 'c-gpuscrews', part: 'pcie-screws', label: 'Bracket screws', zone: s(178, 262, 44, 96), requires: 'c-gpu' },
      { id: 'c-gpubracket', part: 'gpu-bracket', label: 'Support point', zone: s(676, 360, 56, 182), requires: 'c-gpu' },
    ],
  },

  // ───────────────────────── WIRING ─────────────────────────
  {
    id: 'w-24pin',
    phase: 'Wiring',
    scene: 'case',
    title: 'Connect the 24-pin ATX power',
    instruction: 'Drag the 24-pin cable to the long connector on the right edge of the motherboard.',
    details: [
      'Route it from the PSU, behind the tray, out through the right-side grommet.',
      'Line up the clip with the latch on the socket.',
      'Push firmly until it clicks. It often takes more force than you’d think.',
    ],
    targets: [{ id: 'w-24', part: 'cable-24pin', label: '24-pin ATX', zone: m(220, 56, 24, 78) }],
  },
  {
    id: 'w-eps',
    phase: 'Wiring',
    scene: 'case',
    title: 'Connect CPU power (EPS 8-pin)',
    instruction: 'Drag the 8-pin EPS cable to the CPU power socket at the top-left of the board.',
    details: [
      'Use the cable labelled "CPU", NOT the "PCIe/VGA" one. They look similar but are wired differently.',
      'Route it through the top-left grommet behind the board.',
      'A second CPU socket (4 or 8-pin) is optional for mid-range CPUs.',
    ],
    warning: 'Forcing a PCIe cable into the CPU socket can short the PSU.',
    targets: [{ id: 'w-eps', part: 'cable-eps', label: 'CPU_PWR (EPS)', zone: m(40, -4, 34, 20) }],
  },
  {
    id: 'w-gpu',
    phase: 'Wiring',
    scene: 'case',
    title: 'Connect GPU power (12V-2x6)',
    instruction: 'Drag the 12V-2x6 cable to the power socket on top of the graphics card.',
    details: [
      'Route it up from the PSU shroud.',
      'Push it in until fully seated: no gap, and the latch clicks.',
      'Avoid sharp bends within ~35 mm of the connector.',
      'Older cards may use 2–3 separate 8-pin PCIe cables. Never use a daisy-chain splitter on high-power cards.',
    ],
    warning: 'A partially-inserted 16-pin connector can overheat. Double-check it!',
    targets: [{ id: 'w-gpu', part: 'cable-12v2x6', label: 'GPU power', zone: s(590, 252, 52, 34) }],
  },
  {
    id: 'w-fpanel',
    phase: 'Wiring',
    scene: 'case',
    title: 'Connect the front-panel pins',
    instruction: 'Drag the front-panel connectors to the F_PANEL header at the bottom-right of the board.',
    details: [
      'Check the pin layout printed on the board or in the manual.',
      'POWER SW and RESET SW have no polarity.',
      'POWER LED and HDD LED do: coloured wire is +, white/black is −.',
      'Some boards include a "Q-Connector" adapter that makes this much easier.',
    ],
    tip: 'If the PC doesn’t turn on later, this is the first thing to re-check.',
    targets: [{ id: 'w-fpanel', part: 'cable-fpanel', label: 'F_PANEL', zone: m(196, 286, 32, 19) }],
  },
  {
    id: 'w-usb-audio',
    phase: 'Wiring',
    scene: 'case',
    title: 'Connect front USB & audio',
    instruction: 'Drag the USB 3 cable, the USB-C cable and the HD Audio cable to their headers.',
    details: [
      'USB 3 (blue 19-pin) and USB-C (small Key-A) sit on the right edge.',
      'HD_AUDIO sits on the bottom-left edge, near the audio chip.',
      'Push all of them in straight. These pins bend easily.',
    ],
    targets: [
      { id: 'w-usb3', part: 'cable-usb3', label: 'USB 3 header', zone: m(222, 158, 22, 36) },
      { id: 'w-usbc', part: 'cable-usbc', label: 'USB-C header', zone: m(222, 137, 22, 18) },
      { id: 'w-audio', part: 'cable-audio', label: 'HD_AUDIO', zone: m(2, 286, 30, 19) },
    ],
  },
  {
    id: 'w-wifi',
    phase: 'Wiring',
    scene: 'case',
    title: 'Attach the Wi-Fi antenna',
    instruction: 'Drag the Wi-Fi antenna onto the rear I/O antenna connectors.',
    details: [
      'Screw or snap the antenna onto the two gold connectors on the rear I/O.',
      'Place the magnetic base on top of the case for the best signal.',
    ],
    targets: [{ id: 'w-wifi', part: 'wifi-antenna', label: 'Antenna ports', zone: s(110, 40, 80, 110) }],
  },
  {
    id: 'w-ties',
    phase: 'Wiring',
    scene: 'case',
    title: 'Manage the cables',
    instruction: 'Drag the velcro straps onto the cable bundle by the grommets.',
    details: [
      'Bundle cables along the tie-down points behind the motherboard tray.',
      'Keep cables out of fan blades and away from the front intake airflow.',
      'Check that every fan is plugged in and nothing touches the CPU fan.',
    ],
    tip: 'Velcro is reusable. Zip ties are tidier but must be cut to re-route.',
    targets: [{ id: 'w-ties', part: 'zip-ties', label: 'Cable bundle', zone: s(606, 90, 70, 280) }],
  },

  // ───────────────────────── FINISH ─────────────────────────
  {
    id: 'f-panel',
    phase: 'Finish',
    scene: 'case',
    title: 'Close the side panel',
    instruction: 'Drag the tempered-glass side panel onto the case.',
    details: [
      'Do a final check: RAM latched, GPU latched, every power cable clicked in.',
      'Peel the protective film off both sides of the glass.',
      'Hang the panel on its hinges/clips and secure it.',
    ],
    tip: 'Some builders leave the panel off for the first boot so they can check fans and LEDs.',
    targets: [{ id: 'f-panel', part: 'side-panel', label: 'Side panel', zone: s(250, 60, 500, 600) }],
  },
  {
    id: 'f-connect',
    phase: 'Finish',
    scene: 'case',
    title: 'Connect power & display',
    instruction: 'Drag the power cord to the PSU and the display cable to the GRAPHICS CARD outputs.',
    details: [
      'The power cord goes into the C14 socket on the back of the PSU.',
      'Plug the monitor cable into the GPU ports (horizontal ones lower down), NOT the motherboard’s video ports.',
      'Plug in a keyboard and mouse to the rear USB ports.',
    ],
    warning: 'Monitor plugged into the motherboard = "no display" on most dedicated-GPU builds.',
    targets: [
      { id: 'f-power', part: 'power-cord', label: 'PSU power inlet', zone: s(100, 586, 90, 70) },
      { id: 'f-display', part: 'display-cable', label: 'GPU outputs', zone: s(100, 282, 90, 72) },
    ],
  },
  {
    id: 'f-boot',
    phase: 'Finish',
    scene: 'case',
    title: 'First boot!',
    instruction: 'Flip the PSU switch to ON ( I ) and press the power button.',
    details: [
      'The first boot can take 1–3 minutes of "memory training" on DDR5. Be patient!',
      'Enter the BIOS (usually DEL or F2) and check the CPU, RAM and SSD are detected.',
      'Enable EXPO / XMP so your RAM runs at its rated speed.',
      'Install your OS from a USB stick, then install GPU and chipset drivers.',
    ],
    targets: [],
    action: 'power',
  },
];


export const ALL_TARGETS: Target[] = STEPS.flatMap((st) => st.targets);
export const TARGET_STEP: Record<string, number> = Object.fromEntries(
  STEPS.flatMap((st, i) => st.targets.map((t) => [t.id, i])),
);
