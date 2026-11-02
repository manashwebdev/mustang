# Mustang: Cinematic 3D Website

A scroll-driven 3D showcase of a Ford Mustang, built with **Next.js** and **React Three Fiber**. The camera flies around a GLB model as you scroll, the paint can be recoloured live, and the lamps glow through bloom post-processing.

[![Next.js](https://img.shields.io/badge/Next.js-black?logo=nextdotjs)](https://nextjs.org/)
[![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-000?logo=threedotjs)](https://r3f.docs.pmnd.rs/)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=black)](https://gsap.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

![Hero](screenshots/hero.png)

## Preview

| Performance numbers | Design close-up |
| --- | --- |
| ![Numbers](screenshots/numbers.png) | ![Design](screenshots/design.png) |

![Finale](screenshots/finale.png)

## Features

- **Scroll-driven camera path** through seven scenes: hero, side, wheel, rear, interior, reveal and drive-away
- **Live paint configurator** that recolours the car body in real time
- **Bloom-lit headlamps and taillamps** via post-processing
- **Wheels that spin with scroll** for a sense of motion
- **Smooth scrolling** with Lenis, with GSAP-powered reveals
- **Horizontal gallery** section with a custom cursor hover ring
- **Optimised 3D model**: decimated to about 71k triangles, 1.7 MB
- **Responsive and accessible**: lighter rendering on mobile, and `prefers-reduced-motion` support

## Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js, React, TypeScript |
| 3D | Three.js, React Three Fiber, drei, postprocessing |
| Animation | GSAP, Lenis |
| Model | GLB (glTF binary) |

## Getting Started

**Prerequisites:** Node.js 18 or newer.

```bash
git clone https://github.com/manashwebdev/mustang.git
cd mustang
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

## Project Structure

```
mustang/
├── app/
│   └── globals.css        # UI styles and the --acc accent variable
├── components/
│   ├── Scene.tsx          # 3D scene, car, camera path (K array)
│   └── Site.tsx           # Page sections, UI and cursor
├── lib/
│   └── state.ts           # Shared state and ACC colour for 3D lights
├── public/
│   └── models/
│       └── car.glb        # Mustang model
└── screenshots/           # README images
```

## Using Your Own Model

`public/models/car.glb` is the decimated Mustang. To swap it, replace that file.

The scene looks for these names in your model:

| Name | Type | What it does |
| --- | --- | --- |
| `paint` | Material | Recoloured by the configurator |
| `lamp` | Material | Glows through bloom |
| `wheel0` to `wheel3` | Nodes | Spun by scroll |

Name yours the same, or edit `components/Scene.tsx`. If your model faces a different direction, rotate the `<primitive>` group inside `Car()`.

## Customisation

**Accent colour**
- Change `ACC` in `lib/state.ts` for the 3D lights.
- Change `--acc` in `app/globals.css` for the UI.
- The glow hex `#ff2a1a` also appears in `Site.tsx` (cursor hover ring) and the shadow utilities.

**Camera path**
Edit the `K` array in `Scene.tsx` to change the keyframes for hero, side, wheel, rear, interior, reveal and drive-away.

## Performance and Accessibility

- Below 768px, post-processing is turned off, the floor reflection is cheaper and the horizontal gallery stacks vertically.
- `prefers-reduced-motion` disables smooth scrolling and reveal animations.

## Notes

- Unofficial fan concept, not affiliated with Ford Motor Company.
- Lenis, GSAP and drei versions move fast. If a type or API differs from what the code expects, check that package's changelog.

## License

Released under the [MIT License](LICENSE).

## Author

**Manash** ([@manashwebdev](https://github.com/manashwebdev))
