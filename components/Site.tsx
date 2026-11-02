'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useProgress } from '@react-three/drei'
import { state, PAINTS } from '@/lib/state'

const Scene = dynamic(() => import('./Scene'), { ssr: false })

const H = ({ l, cls = 'h2', hero = false }: { l: string[]; cls?: string; hero?: boolean }) => {
  const Tag = hero ? 'h1' : 'h2'
  return <Tag className={`disp ${cls}`}>{l.map((t, i) => <span key={i} className="ln"><span {...(hero ? { 'data-hero': i } : { 'data-split': '' })}>{t}</span></span>)}</Tag>
}

function Mag({ href, children }: { href: string; children: React.ReactNode }) {
  const x = useMotionValue(0), y = useMotionValue(0), sx = useSpring(x, { stiffness: 200, damping: 15 }), sy = useSpring(y, { stiffness: 200, damping: 15 })
  return (
    <motion.a href={href} className="cta mt-9" data-hover style={{ x: sx, y: sy }}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * .3); y.set((e.clientY - r.top - r.height / 2) * .3) }}
      onMouseLeave={() => { x.set(0); y.set(0) }}>{children}</motion.a>
  )
}

const STATS: [string, number, number, string][] = [['4.0', 4, 1, 'seconds, 0–100 km/h'], ['480', 480, 0, 'horsepower, naturally aspirated V8'], ['250', 250, 0, 'km/h top speed']]
const SPECS: [string, string][] = [['Engine', '5.0 L V8'], ['Power', '480 hp'], ['Torque', '567 Nm'], ['Gearbox', '6-speed manual'], ['Drive', 'Rear-wheel'], ['Weight', '1,720 kg'], ['Brakes', 'Brembo, 4-piston'], ['Wheels', '19-inch forged']]
const PANELS: [string, string][] = [['Wheels', 'Forged, black, and wide enough to fill the arch.'], ['Haunches', 'Muscle you can see from the other side of the street.'], ['Grille', 'A single opening, and the lights set deep either side.'], ['Tail', 'Short deck, quad exhaust, no apology.']]

export default function Site() {
  const { progress } = useProgress()
  const [pct, setPct] = useState(0), [ready, setReady] = useState(false), [paint, setPaint] = useState(PAINTS[0][0])
  const dot = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null), drag = useRef<HTMLDivElement>(null)

  // loader counter
  useEffect(() => {
    const o = { v: pct }
    const t = gsap.to(o, { v: progress, duration: .6, onUpdate: () => setPct(Math.round(o.v)), onComplete: () => { if (progress >= 100) setReady(true) } })
    return () => { t.kill() }
  }, [progress])
  useEffect(() => { const t = setTimeout(() => setReady(true), 12000); return () => clearTimeout(t) }, [])

  // smooth scroll + scroll timelines
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let lenis: Lenis | null = null
    if (!reduce) { lenis = new Lenis({ lerp: .09 }); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((t) => lenis!.raf(t * 1000)); gsap.ticker.lagSmoothing(0) }
    const onS = () => { state.p = Math.min(1, Math.max(0, scrollY / (document.documentElement.scrollHeight - innerHeight))) }
    addEventListener('scroll', onS, { passive: true })
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        if (reduce) return
        gsap.set(el, { yPercent: 110 })
        ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(el, { yPercent: 0, duration: 1.3, ease: 'expo.out' }) })
      })
      gsap.utils.toArray<HTMLElement>('[data-n]').forEach((el) => {
        const n = +el.dataset.n!, d = +el.dataset.d!, o = { v: 0 }
        ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: n, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = o.v.toFixed(d) } }) })
      })
      ScrollTrigger.create({ trigger: '#perf', start: 'top top', end: '+=120%', pin: true })
      gsap.to('#ghost', { xPercent: -70, opacity: 0, ease: 'none', scrollTrigger: { start: 0, end: '+=1200', scrub: true } })
      const tr = document.querySelector<HTMLElement>('#track')!
      if (!reduce && innerWidth >= 768) gsap.to(tr, { x: () => -(tr.scrollWidth - innerWidth), ease: 'none', scrollTrigger: { trigger: '#design', pin: true, scrub: 1, end: () => '+=' + tr.scrollWidth, invalidateOnRefresh: true } })
      gsap.from('[data-call]', { opacity: 0, x: -30, stagger: .15, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#tech', start: 'top 60%' } })
    })
    return () => { ctx.revert(); removeEventListener('scroll', onS); lenis?.destroy() }
  }, [])

  // hero reveal after loader
  useEffect(() => {
    if (!ready) return
    gsap.fromTo('[data-hero]', { yPercent: 110 }, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: .12, delay: .3 })
    gsap.fromTo('[data-intro]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', stagger: .15, delay: .8 })
  }, [ready])

  // custom cursor + configurator drag
  useEffect(() => {
    const xd = gsap.quickTo(dot.current, 'x', { duration: .1 }), yd = gsap.quickTo(dot.current, 'y', { duration: .1 })
    const xr = gsap.quickTo(ring.current, 'x', { duration: .5, ease: 'power3' }), yr = gsap.quickTo(ring.current, 'y', { duration: .5, ease: 'power3' })
    const mv = (e: PointerEvent) => { xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY); const h = !!(e.target as HTMLElement).closest('a,button,[data-hover]'); gsap.to(ring.current, { scale: h ? 1.9 : 1, borderColor: h ? '#ff2a1a' : 'rgba(255,255,255,.4)', duration: .3 }) }
    addEventListener('pointermove', mv)
    const el = drag.current!; let last: number | null = null
    const d = (e: PointerEvent) => { last = e.clientX; el.setPointerCapture(e.pointerId) }, m = (e: PointerEvent) => { if (last !== null) { state.drag += (e.clientX - last) * .01; last = e.clientX } }, u = () => { last = null }
    el.addEventListener('pointerdown', d); el.addEventListener('pointermove', m); el.addEventListener('pointerup', u); el.addEventListener('pointercancel', u)
    return () => { removeEventListener('pointermove', mv) }
  }, [])

  return (
    <>
      <div className="grain" /><div className="vig" />
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[70] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[var(--acc)] max-md:hidden" />
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[70] -ml-[17px] -mt-[17px] h-[34px] w-[34px] rounded-full border border-white/40 max-md:hidden" />
      <div className={`fixed inset-0 z-[80] grid place-items-center bg-[var(--bg)] transition-opacity duration-1000 ${ready ? 'pointer-events-none opacity-0' : ''}`} aria-hidden>
        <div className="text-center"><b className="disp text-[clamp(4rem,12vw,10rem)]">{pct}</b><p className="text-sm text-[var(--mute)]">Loading the car</p></div>
      </div>
      <div id="ghost" aria-hidden className="disp stroke pointer-events-none fixed left-[6vw] top-[22%] z-0 whitespace-nowrap text-[clamp(5rem,22vw,22rem)]">Mustang</div>
      <Scene />
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-[clamp(20px,4vw,56px)] py-6">
        <span className="disp text-lg"><i className="mr-2.5 inline-block h-2 w-2 rounded-full bg-[var(--acc)] shadow-[0_0_14px_var(--acc)]" />Mustang</span>
        <nav className="flex gap-8 text-[15px] text-[var(--mute)] max-md:hidden">{['perf', 'design', 'paint', 'tech', 'specs'].map((s) => <a key={s} href={`#${s}`} data-hover className="transition-colors hover:text-white">{s === 'perf' ? 'Power' : s[0].toUpperCase() + s.slice(1)}</a>)}</nav>
      </header>

      <main className="relative z-20">
        <section id="hero" className="flex min-h-screen items-end px-[6vw] pb-[10vh]">
          <div>
            <H hero cls="h1" l={['Loud by', 'design.']} />
            <p data-intro className="mt-6 max-w-[40ch] text-[var(--mute)]">Long hood, wide stance, one job: make you want the long way home.</p>
            <div data-intro><Mag href="#final">Book a test drive</Mag></div>
          </div>
          <div data-intro className="absolute bottom-8 right-[6vw] flex items-center gap-3 text-sm text-[var(--mute)] max-md:hidden">Scroll<span className="block h-12 w-px bg-[var(--acc)]" /></div>
        </section>

        <section id="perf" className="flex h-screen items-center justify-end px-[6vw]">
          <div className="w-full max-w-[560px]">
            <H l={['Numbers you', 'can feel.']} />
            <div className="mt-9 grid gap-4">{STATS.map(([t, n, d, label]) => (
              <div key={label} className="glass px-6 py-4"><b className="disp block text-[clamp(2.5rem,5vw,4.5rem)]" data-n={n} data-d={d}>{t === '4.0' ? '0.0' : '0'}</b><span className="text-sm text-[var(--mute)]">{label}</span></div>))}</div>
          </div>
        </section>

        <section id="design" className="h-screen overflow-hidden">
          <div className="px-[6vw] pt-[16vh]"><H l={['Cut from', 'one idea.']} /></div>
          <div id="track" className="mt-10 flex gap-10 px-[6vw] max-md:flex-col md:w-max">{PANELS.map(([w, c], i) => (
            <div key={w} className={`glass flex h-[44vh] w-[72vw] shrink-0 flex-col justify-between p-8 max-md:h-auto max-md:w-full ${i % 2 ? 'md:mt-16' : ''}`} data-hover>
              <span className="disp stroke text-[clamp(3rem,9vw,9rem)]">{w}</span><p className="max-w-[30ch] text-[var(--mute)]">{c}</p></div>))}</div>
        </section>

        <section id="paint" className="flex min-h-screen items-center px-[6vw]">
          <div ref={drag} className="max-w-[520px] cursor-grab touch-pan-y select-none">
            <H l={['Pick your', 'paint.']} />
            <div className="mt-8 flex flex-wrap gap-3.5" role="group" aria-label="Paint colour">{PAINTS.map(([n, c]) => (
              <button key={n} className="sw" aria-label={n} aria-pressed={paint === n} style={{ ['--c' as string]: c }} data-hover onClick={() => { state.color = c; setPaint(n) }} />))}</div>
            <p className="disp mt-5 text-sm">{paint}</p><p className="mt-1 text-sm text-[var(--mute)]">Drag here to turn the car.</p>
          </div>
        </section>

        <section id="tech" className="relative flex min-h-screen items-center justify-end px-[6vw]">
          <div className="max-w-[520px]">
            <H l={['Under the', 'long hood.']} />
            {[['Front-mounted V8', 'Sits behind the axle line for balance.'], ['Quad exhaust', 'Tuned for the sound, not the sticker.'], ['Brembo brakes', 'Four pistons per front wheel.']].map(([a, b]) => (
              <div key={a} data-call className="mt-6 flex items-start gap-4"><span className="mt-3 block h-px w-16 shrink-0 bg-[var(--acc)] shadow-[0_0_10px_var(--acc)]" /><div><b className="disp text-sm">{a}</b><p className="text-sm text-[var(--mute)]">{b}</p></div></div>))}
          </div>
        </section>

        <section id="specs" className="min-h-screen px-[6vw] py-[14vh]">
          <H l={['The', 'spec sheet.']} />
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">{SPECS.map(([k, v], i) => (
            <div key={k} className={`glass p-6 ${i % 3 === 0 ? 'md:col-span-2' : ''}`} data-hover><p className="text-sm text-[var(--mute)]">{k}</p><b className="disp mt-3 block text-[clamp(1.3rem,2.6vw,2.4rem)]">{v}</b></div>))}</div>
        </section>

        <section id="final" className="flex h-screen items-end justify-end px-[6vw] pb-[12vh]">
          <div className="text-right"><H cls="h1" l={['Take the', 'long way.']} /><Mag href="#hero">Back to the start</Mag></div>
        </section>
        <footer className="flex flex-wrap justify-between gap-4 px-[6vw] py-8 text-sm text-[var(--mute)]"><span>Unofficial fan concept. Not affiliated with Ford Motor Company.</span><span>Next.js · React Three Fiber · GSAP</span></footer>
      </main>
    </>
  )
}
