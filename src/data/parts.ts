export type PartId =
  | 'wrist-strap'
  | 'screwdriver'
  | 'case'
  | 'motherboard'
  | 'cmos'
  | 'cpu'
  | 'ram'
  | 'ssd'
  | 'm2-screw'
  | 'thermal-paste'
  | 'cooler'
  | 'cpu-fan-cable'
  | 'standoffs'
  | 'io-shield'
  | 'mobo-screws'
  | 'psu'
  | 'psu-screws'
  | 'case-fan'
  | 'gpu'
  | 'pcie-screws'
  | 'gpu-bracket'
  | 'cable-24pin'
  | 'cable-eps'
  | 'cable-12v2x6'
  | 'cable-fpanel'
  | 'cable-usb3'
  | 'cable-usbc'
  | 'cable-audio'
  | 'wifi-antenna'
  | 'zip-ties'
  | 'side-panel'
  | 'power-cord'
  | 'display-cable';

export type Category = 'core' | 'cooling' | 'power' | 'cables' | 'small' | 'tools';

export const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'core', label: 'Core' },
  { id: 'cooling', label: 'Cooling' },
  { id: 'power', label: 'Power' },
  { id: 'cables', label: 'Cables' },
  { id: 'small', label: 'Small bits' },
  { id: 'tools', label: 'Tools' },
];

export interface Part {
  id: PartId;
  name: string;
  short: string;
  category: Category;
  qty: number;
  price: string;
  specs: string[];
  about: string;
  tip?: string;
}

export const PARTS: Part[] = [
  {
    id: 'wrist-strap',
    name: 'Anti-static wrist strap',
    short: 'Keeps static electricity away from the parts',
    category: 'tools',
    qty: 1,
    price: '$5–10',
    specs: ['Elastic band with a 1 MΩ safety resistor', 'Crocodile clip for grounding', 'Coiled cord, ~1.8 m'],
    about:
      'Your body can build up thousands of volts of static. You won’t feel a small discharge, but it can quietly damage a CPU, RAM stick or SSD. The strap keeps you at the same potential as the bare metal of the case or another grounded point.',
    tip: 'No strap? Touch bare, unpainted case metal often and don’t build on carpet.',
  },
  {
    id: 'screwdriver',
    name: 'Phillips #2 screwdriver',
    short: 'The only tool you really need',
    category: 'tools',
    qty: 1,
    price: '$8–25',
    specs: ['Phillips #2 tip (fits most PC screws)', 'Magnetic tip helps hold tiny M.2 screws', 'Long shaft for reaching inside the case'],
    about:
      'Almost every screw in a desktop PC is a Phillips #2 head: motherboard, PSU, GPU bracket and fan screws. A magnetic tip saves you from dropping screws onto the motherboard.',
    tip: 'A small #0/#1 bit is handy for M.2 screws on some boards.',
  },
  {
    id: 'case',
    name: 'ATX mid-tower case',
    short: 'The chassis that holds everything',
    category: 'core',
    qty: 1,
    price: '$70–150',
    specs: ['Supports ATX / mATX / Mini-ITX boards', 'Mesh front panel for airflow', 'Tempered-glass side panel', 'Bottom PSU shroud + cable-routing grommets', 'Front I/O: USB-C, USB-A, audio jack'],
    about:
      'The case protects the parts, guides the airflow and hides the cables. In 2026 most cases have a mesh front, a PSU shroud and plenty of room behind the motherboard tray for cable management.',
    tip: 'Check GPU length and CPU cooler height limits before buying.',
  },
  {
    id: 'motherboard',
    name: 'ATX motherboard',
    short: 'Connects every component together',
    category: 'core',
    qty: 1,
    price: '$160–300',
    specs: ['AM5 (B850/X870-class) or LGA1851 (B860/Z890-class) socket', '4× DDR5 DIMM slots', '2–4× M.2 NVMe slots (PCIe 5.0/4.0)', 'PCIe 5.0 x16 graphics slot', 'Wi-Fi 7, 2.5/5 GbE, USB4 on many boards'],
    about:
      'The motherboard is the backbone of the PC. The CPU, memory, storage and graphics card plug into it, and it shares power and data between them. Its socket must match the CPU you picked.',
    tip: 'Do most of the motherboard assembly on top of its box, outside the case. It’s far easier.',
  },
  {
    id: 'cmos',
    name: 'CR2032 CMOS battery',
    short: 'Keeps BIOS settings and the clock running',
    category: 'small',
    qty: 1,
    price: '$1–3',
    specs: ['3 V lithium coin cell', '20 mm diameter, 3.2 mm thick', 'Lasts 3–10 years'],
    about:
      'This tiny battery powers the real-time clock and keeps your BIOS settings when the PC is unplugged. It usually comes pre-installed, but you should check that it’s seated firmly. The "+" side faces up.',
    tip: 'Taking it out for 1 minute (with the PC unplugged) resets the BIOS to defaults.',
  },
  {
    id: 'cpu',
    name: 'CPU (processor)',
    short: 'The brain of the computer',
    category: 'core',
    qty: 1,
    price: '$200–450',
    specs: ['6–16 cores, 12–32 threads', 'Socket AM5 or LGA1851 (must match the board)', 'Integrated graphics on most models', '65–125 W TDP'],
    about:
      'The CPU runs your operating system and programs. Modern desktop CPUs are LGA (Land Grid Array): the pins are in the motherboard socket, not on the chip, so the socket is the fragile part.',
    tip: 'Hold it by the edges only. Never touch the gold pads underneath.',
  },
  {
    id: 'ram',
    name: 'DDR5 memory (RAM)',
    short: 'Short-term working memory',
    category: 'core',
    qty: 2,
    price: '$90–160 (kit)',
    specs: ['2× 16 GB = 32 GB kit (a good 2026 sweet spot)', 'DDR5-6000 CL30 (AMD) / DDR5-6400+ (Intel)', 'EXPO / XMP profile for rated speed', 'Optional RGB light bar'],
    about:
      'RAM holds the data your CPU is actively working on. Two sticks run in dual-channel mode, which roughly doubles memory bandwidth compared to one stick, so always use a matched kit.',
    tip: 'With 2 sticks, use slots A2 and B2 (2nd and 4th from the CPU), as your manual says.',
  },
  {
    id: 'ssd',
    name: 'M.2 NVMe SSD',
    short: 'Fast storage for the OS, games and files',
    category: 'core',
    qty: 1,
    price: '$80–200',
    specs: ['M.2 2280 form factor (22 × 80 mm)', 'PCIe 4.0 (~7 GB/s) or 5.0 (~14 GB/s)', '1–2 TB capacity', 'No cables: it plugs straight into the board'],
    about:
      'NVMe SSDs are tiny boards that slot directly into the motherboard. They are 50–100× faster than an old hard drive. Use the top slot (M2_1), which is connected straight to the CPU, for your boot drive.',
    tip: 'Peel the plastic film off the motherboard’s M.2 heatsink thermal pad!',
  },
  {
    id: 'm2-screw',
    name: 'M.2 screw / latch',
    short: 'Tiny screw that holds the SSD down',
    category: 'small',
    qty: 1,
    price: 'Included with motherboard',
    specs: ['M2 × 3 mm screw, or a tool-less "Q-Latch" clip', 'Sits on an M.2 standoff at 2280 position'],
    about:
      'The SSD is inserted at a ~30° angle, pressed flat and then held down by this small screw or latch. It’s the smallest, easiest part to lose, so keep it in the motherboard box until you need it.',
  },
  {
    id: 'thermal-paste',
    name: 'Thermal paste',
    short: 'Fills air gaps between CPU and cooler',
    category: 'cooling',
    qty: 1,
    price: '$5–12',
    specs: ['Non-conductive compound (safe if it spills a bit)', '~0.3 ml per application', 'Often pre-applied on new coolers'],
    about:
      'Metal surfaces look flat but have microscopic gaps. Thermal paste fills them so heat can flow from the CPU into the cooler. A pea-sized dot in the centre spreads out evenly when the cooler is mounted.',
    tip: 'If your cooler has pre-applied paste (a grey square), skip this and just remove the plastic cover.',
  },
  {
    id: 'cooler',
    name: 'CPU air cooler',
    short: 'Draws heat away from the CPU',
    category: 'cooling',
    qty: 1,
    price: '$35–90',
    specs: ['Single-tower, 4–6 copper heat pipes', '120 mm PWM fan', 'AM5 + LGA1851 mounting kit', '~155 mm tall (check case clearance)'],
    about:
      'Heat pipes carry heat from the CPU up into aluminium fins, and a fan blows it away. Tower coolers are quiet, reliable and need no maintenance, which makes them a great choice for a general-purpose PC.',
    tip: 'Point the fan so air flows toward the rear exhaust fan.',
  },
  {
    id: 'cpu-fan-cable',
    name: 'CPU fan cable (4-pin PWM)',
    short: 'Powers and controls the cooler fan',
    category: 'cables',
    qty: 1,
    price: 'Attached to the cooler',
    specs: ['4-pin PWM connector: GND, 12 V, tach, PWM', 'Keyed so it only fits one way'],
    about:
      'The cooler fan must be plugged into the header marked CPU_FAN. If nothing is detected there, many motherboards refuse to boot or show a "CPU fan error" to protect the processor.',
  },
  {
    id: 'standoffs',
    name: 'Motherboard standoffs',
    short: 'Lift the board off the metal tray',
    category: 'small',
    qty: 1,
    price: 'Included with case',
    specs: ['Brass, #6-32 thread', 'Usually 9 for ATX', 'Often pre-installed in the case'],
    about:
      'Standoffs are little brass spacers that keep the back of the motherboard from touching the case. A short circuit there could kill the board. Only put them where your motherboard has a screw hole.',
    tip: 'Many cases ship with standoffs pre-installed, or with a centre "locator" stud to help you line up the board.',
  },
  {
    id: 'io-shield',
    name: 'Rear I/O shield',
    short: 'Covers the gap around the rear ports',
    category: 'small',
    qty: 1,
    price: 'Included with motherboard',
    specs: ['Thin metal plate with cut-outs for ports', 'Integrated (pre-attached) on most 2026 boards'],
    about:
      'The I/O shield covers the rectangular opening at the back of the case around the motherboard ports. If your board has a separate one, it snaps into the case from the inside before you install the motherboard.',
    tip: 'Forgetting this is the #1 classic beginner mistake: you’d have to remove the board again!',
  },
  {
    id: 'mobo-screws',
    name: 'Motherboard screws',
    short: 'Fix the board onto the standoffs',
    category: 'small',
    qty: 1,
    price: 'Included with case',
    specs: ['#6-32 × 5 mm, Phillips', 'Usually 9 for ATX'],
    about:
      'These screws go through the motherboard mounting holes into the standoffs. Tighten them until they are snug but not forced. Over-tightening can crack the PCB.',
    tip: 'Start all screws loosely, then tighten in a cross pattern.',
  },
  {
    id: 'psu',
    name: 'Power supply (PSU)',
    short: 'Turns wall AC into clean DC power',
    category: 'power',
    qty: 1,
    price: '$90–140',
    specs: ['750–850 W, 80 PLUS Gold', 'ATX 3.1 with native 12V-2x6 GPU cable', 'Fully modular (only attach the cables you need)', '10-year warranty on good units'],
    about:
      'The PSU converts 230/120 V AC from the wall into 12 V, 5 V and 3.3 V DC for the components. Don’t cheap out here: a quality unit protects every other part in the system.',
    tip: 'If the case has a bottom vent with a dust filter, mount the PSU fan facing down.',
  },
  {
    id: 'psu-screws',
    name: 'PSU screws',
    short: 'Fix the PSU to the rear panel',
    category: 'small',
    qty: 1,
    price: 'Included with PSU',
    specs: ['4× #6-32 coarse thread', 'Black, Phillips head'],
    about: 'Four screws through the back of the case hold the power supply in place.',
  },
  {
    id: 'case-fan',
    name: '120 mm case fan',
    short: 'Moves air through the case',
    category: 'cooling',
    qty: 3,
    price: 'Usually included with case',
    specs: ['120 mm, PWM, 4-pin', '500–1800 RPM', 'Often daisy-chained or on a fan hub'],
    about:
      'A good airflow path is front intake → rear exhaust. Cool air comes in through the mesh front, passes over the GPU and CPU cooler, and hot air leaves at the back.',
    tip: 'The side with the fan frame struts / label is the side air comes OUT of.',
  },
  {
    id: 'gpu',
    name: 'Graphics card (GPU)',
    short: 'Renders games, video and 3D',
    category: 'core',
    qty: 1,
    price: '$300–700',
    specs: ['PCIe 5.0 x16 interface', '12–16 GB GDDR7 VRAM', 'Triple-fan cooler, 2.5–3 slots thick', '12V-2x6 or 8-pin PCIe power'],
    about:
      'The GPU is usually the biggest and heaviest component. It goes in the top PCIe x16 slot (the one closest to the CPU) to get the full bandwidth.',
    tip: 'Remove the case’s PCIe slot covers first, and make sure the slot latch clicks.',
  },
  {
    id: 'pcie-screws',
    name: 'PCIe bracket screws',
    short: 'Secure the GPU bracket to the case',
    category: 'small',
    qty: 1,
    price: 'Included with case',
    specs: ['2–3× #6-32 thumbscrews', 'One per slot the GPU occupies'],
    about: 'These screws (re-used from the slot covers you removed) lock the graphics card’s metal bracket to the back of the case.',
  },
  {
    id: 'gpu-bracket',
    name: 'GPU support bracket',
    short: 'Stops a heavy GPU from sagging',
    category: 'small',
    qty: 1,
    price: 'Often included with GPU',
    specs: ['Adjustable-height stand or screw-in arm', 'Rests on the PSU shroud'],
    about:
      'Modern graphics cards can weigh 1.5 kg or more. Over time they can sag and stress the PCIe slot. A simple support stand under the far end of the card fixes that.',
  },
  {
    id: 'cable-24pin',
    name: '24-pin ATX power cable',
    short: 'Main motherboard power',
    category: 'cables',
    qty: 1,
    price: 'Included with PSU',
    specs: ['24 pins (20+4 on some PSUs)', 'Carries 3.3 V / 5 V / 12 V', 'Latch clip on one side'],
    about:
      'The widest connector in the PC. It powers the motherboard itself. Push it straight in until the latch clicks. It often needs a surprisingly firm push.',
  },
  {
    id: 'cable-eps',
    name: '8-pin EPS CPU power cable',
    short: 'Dedicated power for the CPU',
    category: 'cables',
    qty: 1,
    price: 'Included with PSU',
    specs: ['8-pin (4+4) EPS12V', 'Labelled "CPU" on the PSU end', 'NOT interchangeable with 8-pin PCIe'],
    about:
      'The CPU gets its own 12 V feed through this connector at the top-left of the board. Some boards have a second 4- or 8-pin socket. For a mid-range CPU it’s optional.',
    tip: 'Route this cable through the top grommet BEFORE installing the board in tight cases.',
  },
  {
    id: 'cable-12v2x6',
    name: '12V-2x6 GPU power cable',
    short: '16-pin high-power GPU connector',
    category: 'cables',
    qty: 1,
    price: 'Included with ATX 3.1 PSU',
    specs: ['12 power pins + 4 sense pins', 'Up to 600 W', 'Successor to 12VHPWR (shorter sense pins = safer)'],
    about:
      'Modern graphics cards use this compact 16-pin connector. It must be pushed in completely, with no visible gap. A partly inserted plug is the main cause of melted connectors.',
    tip: 'Don’t bend the cable sharply within ~35 mm of the plug.',
  },
  {
    id: 'cable-fpanel',
    name: 'Front-panel connectors',
    short: 'Power button, reset button & LEDs',
    category: 'cables',
    qty: 1,
    price: 'Attached to the case',
    specs: ['POWER SW, RESET SW, POWER LED +/−, HDD LED +/−', 'Tiny 1- or 2-pin plugs, or a single combined block'],
    about:
      'These little wires connect the case’s power button and LEDs to the F_PANEL header at the bottom-right of the board. They are the fiddliest part of any build, so check the pin diagram in your manual.',
    tip: 'Power/reset switches have no polarity; LEDs do (coloured wire = +).',
  },
  {
    id: 'cable-usb3',
    name: 'USB 3.x 19-pin header cable',
    short: 'Front USB-A ports',
    category: 'cables',
    qty: 1,
    price: 'Attached to the case',
    specs: ['Chunky blue 19-pin plug', 'Keyed: notch on one side', 'Pins bend easily: push gently and straight'],
    about: 'This thick cable powers the USB-A ports on the front of the case.',
  },
  {
    id: 'cable-usbc',
    name: 'USB-C front header cable',
    short: 'Front USB-C port',
    category: 'cables',
    qty: 1,
    price: 'Attached to the case',
    specs: ['Small "Key-A" connector', 'USB 3.2 Gen 2 (10 Gb/s) or Gen 2x2 (20 Gb/s)', 'Screws or clips in'],
    about: 'Powers the front USB-C port. The header is small and fragile, so push it in straight.',
  },
  {
    id: 'cable-audio',
    name: 'HD Audio cable',
    short: 'Front headphone & mic jack',
    category: 'cables',
    qty: 1,
    price: 'Attached to the case',
    specs: ['9-pin "HD AUDIO" plug (one pin blocked)', 'Header usually at the bottom-left of the board'],
    about: 'Connects the case’s headphone/mic jack to the motherboard’s audio chip.',
    tip: 'It’s easy to confuse with USB 2.0 headers: check the label on the plug.',
  },
  {
    id: 'wifi-antenna',
    name: 'Wi-Fi 7 antenna',
    short: 'Wireless network + Bluetooth',
    category: 'small',
    qty: 1,
    price: 'Included with motherboard',
    specs: ['Dual-band magnetic antenna base', 'Screws or snaps onto rear I/O connectors'],
    about: 'Without the antenna, built-in Wi-Fi and Bluetooth will have a very weak signal. It attaches to the two gold connectors on the rear I/O panel.',
  },
  {
    id: 'zip-ties',
    name: 'Velcro straps / zip ties',
    short: 'Tidy up the cables',
    category: 'tools',
    qty: 1,
    price: '$3–8',
    specs: ['Reusable velcro straps recommended', 'Use tie-down points behind the tray'],
    about: 'Neat cables aren’t just for looks: they keep airflow clear and make future upgrades easier. Bundle cables along the tie-down points behind the motherboard tray.',
    tip: 'Use velcro so you can re-route later; snip zip-tie tails flush.',
  },
  {
    id: 'side-panel',
    name: 'Tempered-glass side panel',
    short: 'Closes up the case',
    category: 'core',
    qty: 1,
    price: 'Included with case',
    specs: ['4 mm tempered glass', 'Hinged, tool-less clips or thumbscrews'],
    about: 'The final piece of the chassis. Peel the protective film off both sides first. Handle it carefully, because tempered glass shatters if its edges are knocked.',
  },
  {
    id: 'power-cord',
    name: 'AC power cord (C13)',
    short: 'From the wall socket to the PSU',
    category: 'power',
    qty: 1,
    price: 'Included with PSU',
    specs: ['IEC C13 kettle-style plug', '10 A rated'],
    about: 'Plugs into the back of the PSU. Leave the PSU switch OFF (O) until everything is connected.',
  },
  {
    id: 'display-cable',
    name: 'DisplayPort 2.1 / HDMI 2.1 cable',
    short: 'Connects the PC to your monitor',
    category: 'cables',
    qty: 1,
    price: '$10–25',
    specs: ['DP 2.1 (UHBR) or HDMI 2.1 (48 Gb/s)', 'Supports 4K high-refresh monitors'],
    about: 'Plug it into the GRAPHICS CARD’s ports, not the motherboard’s. This is the most common reason for "no display" on a brand-new build.',
  },
];

export const PART_MAP: Record<PartId, Part> = Object.fromEntries(PARTS.map((p) => [p.id, p])) as Record<PartId, Part>;
