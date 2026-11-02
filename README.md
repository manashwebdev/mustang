# Mustang – cinematic 3D site (Next.js + R3F)

    npm install
    npm run dev      # http://localhost:3000

## Model
`public/models/car.glb` is the decimated Mustang (about 71k triangles, 1.7 MB). To swap it, replace that file.
The scene looks for material names: `paint` (recoloured by the configurator) and `lamp` (glows through bloom),
and nodes named `wheel0`–`wheel3` (spun by scroll). Name yours the same, or edit `components/Scene.tsx`.
If your model faces a different way, rotate the `<primitive>` group in `Car()`.

## Accent colour
Change `ACC` in `lib/state.ts` (3D lights) and `--acc` in `app/globals.css` (UI). The glow hex `#ff2a1a`
also appears in `Site.tsx` (cursor hover ring) and the shadow utilities.

## Notes
- Camera path: the `K` array in `Scene.tsx` (hero, side, wheel, rear, interior, reveal, drive-away).
- Below 768px, post-processing is off, the floor reflection is cheaper and the horizontal gallery stacks.
- prefers-reduced-motion disables smooth scroll and reveals.
- Lenis, GSAP and drei versions move fast; if a type or API differs, check the changelog for that package.
