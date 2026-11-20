# PC Build Academy 2026

An interactive web app that teaches you how to assemble a modern (2026) desktop PC.
You start with a "parts bin" of 33 components, from the case and GPU down to the
CMOS battery, M.2 screw and standoffs. Then you drag and drop each one into place
over 26 guided steps.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Stack

- **React + TypeScript + Vite**
- **@dnd-kit/core**: drag & drop (mouse, touch and keyboard), plus tap-to-select and tap-to-place
- **motion** (Framer Motion): drop-in, scene and modal animations
- **canvas-confetti**: celebration on first boot
- Every part and scene is hand-drawn **inline SVG** with CSS animations (spinning fans, RGB, blinking LEDs, airflow)

## Structure

| File | What it holds |
| --- | --- |
| `src/data/parts.ts` | Catalog of the 33 parts: specs, typical prices, explanations, tips |
| `src/data/steps.ts` | The 26 build steps, their drop targets and zone coordinates |
| `src/components/PartIcon.tsx` | Animated SVG illustration for every part |
| `src/components/Motherboard.tsx` | Motherboard drawing that shows each installed part |
| `src/components/Scene.tsx` | Workbench and case views, plus the drop zones |
| `src/components/StepPanel.tsx` | Step instructions, checklist, hints |
| `src/components/BootScreen.tsx` | POST / BIOS first-boot simulation |
| `src/App.tsx` | State (saved to localStorage), drag-and-drop handling, feedback |

To add or change a step, edit `steps.ts`. Zones can use motherboard-local
coordinates (`m(...)`, 244×305 ≈ ATX in mm) or scene coordinates (`s(...)`, 1000×720).
