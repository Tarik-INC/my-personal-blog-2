import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'

/* ============================================================
   Asteroids (1979) — animação autônoma em loop, Canvas 2D.
   - Nave triangular estilo vetor, com wrap nas bordas.
   - Piloto automático: mira no asteroide/UFO mais próximo, atira e desvia.
   - Asteroides se quebram em pedaços menores ao serem atingidos.
   - UFO (disco voador) aparece de tempos em tempos e também atira.
   - Reinicia sozinho quando todos os asteroides são destruídos.
   Sem dependências extras — só requestAnimationFrame + math.
   ============================================================ */

interface Vec {
  x: number
  y: number
}

interface Ship {
  pos: Vec
  vel: Vec
  angle: number
  thrusting: boolean
  cooldown: number
  invuln: number // invulnerabilidade após respawn
}

interface Asteroid {
  pos: Vec
  vel: Vec
  size: number // 3=grande, 2=médio, 1=pequeno
  radius: number
  angle: number
  spin: number
  shape: number[] // raios irregulares (visual "rocha")
}

interface Bullet {
  pos: Vec
  vel: Vec
  life: number
  fromShip: boolean
}

interface Ufo {
  pos: Vec
  vel: Vec
  cooldown: number
  radius: number
}

interface Particle {
  pos: Vec
  vel: Vec
  life: number
  max: number
}

const SHIP_R = 9
const THRUST = 160
const FRICTION = 0.7 // desaceleração (space-drag leve, ajuda o piloto)
const TURN_SPEED = 3.2
const BULLET_SPEED = 320
const BULLET_LIFE = 0.9
const FIRE_COOLDOWN = 0.35
const MAX_SPEED = 190

function len(v: Vec) {
  return Math.hypot(v.x, v.y)
}

export function Asteroids() {
  const theme = useAppStore((s) => s.theme)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const themeRef = useRef(theme)
  themeRef.current = theme

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    const onVis = () => {
      running = document.visibilityState === 'visible'
      if (running) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    }
    document.addEventListener('visibilitychange', onVis)

    let W = 0
    let H = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // envolve coordenada nas bordas (espaço toroidal)
    const wrap = (p: Vec) => {
      if (p.x < 0) p.x += W
      else if (p.x > W) p.x -= W
      if (p.y < 0) p.y += H
      else if (p.y > H) p.y -= H
    }

    // distância considerando o wrap (menor caminho pela borda)
    const wrapDelta = (a: Vec, b: Vec): Vec => {
      let dx = b.x - a.x
      let dy = b.y - a.y
      if (dx > W / 2) dx -= W
      else if (dx < -W / 2) dx += W
      if (dy > H / 2) dy -= H
      else if (dy < -H / 2) dy += H
      return { x: dx, y: dy }
    }

    const makeAsteroid = (size: number, at?: Vec): Asteroid => {
      const radius = size === 3 ? 34 : size === 2 ? 20 : 11
      // gera contorno irregular
      const verts = 9
      const shape: number[] = []
      for (let i = 0; i < verts; i++) {
        shape.push(0.72 + Math.random() * 0.5)
      }
      // nasce numa borda (se não for fragmento) p/ não surgir em cima da nave
      const pos =
        at ?? {
          x: Math.random() < 0.5 ? 0 : W,
          y: Math.random() * H,
        }
      const sp = (size === 3 ? 26 : size === 2 ? 40 : 60) + Math.random() * 20
      const dir = Math.random() * Math.PI * 2
      return {
        pos: { ...pos },
        vel: { x: Math.cos(dir) * sp, y: Math.sin(dir) * sp },
        size,
        radius,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 1.5,
        shape,
      }
    }

    // ---- estado ----
    let ship: Ship
    const resetShip = () => {
      ship = {
        pos: { x: W / 2, y: H / 2 },
        vel: { x: 0, y: 0 },
        angle: -Math.PI / 2,
        thrusting: false,
        cooldown: 0,
        invuln: 1.2,
      }
    }
    let asteroids: Asteroid[] = []
    let bullets: Bullet[] = []
    let particles: Particle[] = []
    let ufo: Ufo | null = null
    let ufoTimer = 6 + Math.random() * 4

    const startWave = () => {
      asteroids = []
      const n = 4
      for (let i = 0; i < n; i++) asteroids.push(makeAsteroid(3))
    }
    resetShip()
    startWave()

    const boom = (p: Vec, n: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = Math.random() * 100 + 20
        particles.push({
          pos: { ...p },
          vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp },
          life: 0.7,
          max: 0.7,
        })
      }
    }

    const splitAsteroid = (a: Asteroid) => {
      boom(a.pos, a.size === 3 ? 14 : 8)
      if (a.size > 1) {
        asteroids.push(makeAsteroid(a.size - 1, a.pos))
        asteroids.push(makeAsteroid(a.size - 1, a.pos))
      }
    }

    // ---- piloto automático da nave ----
    const pilot = (dt: number) => {
      // alvo = ameaça mais próxima (asteroide ou UFO)
      let target: Vec | null = null
      let best = Infinity
      for (const a of asteroids) {
        const d = len(wrapDelta(ship.pos, a.pos))
        if (d < best) {
          best = d
          target = a.pos
        }
      }
      if (ufo) {
        const d = len(wrapDelta(ship.pos, ufo.pos))
        if (d < best) {
          best = d
          target = ufo.pos
        }
      }

      ship.thrusting = false
      if (target) {
        const to = wrapDelta(ship.pos, target)
        const desired = Math.atan2(to.y, to.x)
        // gira suavemente na direção do alvo
        let diff = desired - ship.angle
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        ship.angle += Math.sign(diff) * Math.min(Math.abs(diff), TURN_SPEED * dt)

        // se a ameaça está muito perto, dá um empurrão pra "orbitar"/fugir
        if (best < 90) {
          ship.thrusting = true
          ship.vel.x -= Math.cos(desired) * THRUST * 0.5 * dt
          ship.vel.y -= Math.sin(desired) * THRUST * 0.5 * dt
        } else if (best > 200) {
          // longe: acelera na direção pra caçar
          ship.thrusting = true
          ship.vel.x += Math.cos(ship.angle) * THRUST * dt
          ship.vel.y += Math.sin(ship.angle) * THRUST * dt
        }

        // atira quando estiver mais ou menos mirado
        ship.cooldown -= dt
        if (ship.cooldown <= 0 && Math.abs(diff) < 0.28) {
          bullets.push({
            pos: {
              x: ship.pos.x + Math.cos(ship.angle) * SHIP_R,
              y: ship.pos.y + Math.sin(ship.angle) * SHIP_R,
            },
            vel: {
              x: ship.vel.x + Math.cos(ship.angle) * BULLET_SPEED,
              y: ship.vel.y + Math.sin(ship.angle) * BULLET_SPEED,
            },
            life: BULLET_LIFE,
            fromShip: true,
          })
          ship.cooldown = FIRE_COOLDOWN
        }
      }
    }

    const palette = () => {
      const dark = themeRef.current === 'dark'
      return {
        bg: dark ? '#080b13' : '#0b1020',
        fg: dark ? '#e2e8f0' : '#dbe4f5',
        accent: dark ? '#f59e0b' : '#38bdf8',
        ufo: dark ? '#22c55e' : '#4ade80',
        bullet: dark ? '#f8fafc' : '#ffffff',
      }
    }

    let last = performance.now()

    const loop = (now: number) => {
      if (!running) return
      let dt = (now - last) / 1000
      last = now
      if (dt > 0.05) dt = 0.05
      const pal = palette()

      // fundo
      ctx.fillStyle = pal.bg
      ctx.fillRect(0, 0, W, H)

      // ---- update nave ----
      pilot(dt)
      // atrito leve
      ship.vel.x *= 1 - FRICTION * dt
      ship.vel.y *= 1 - FRICTION * dt
      const sp = len(ship.vel)
      if (sp > MAX_SPEED) {
        ship.vel.x = (ship.vel.x / sp) * MAX_SPEED
        ship.vel.y = (ship.vel.y / sp) * MAX_SPEED
      }
      ship.pos.x += ship.vel.x * dt
      ship.pos.y += ship.vel.y * dt
      wrap(ship.pos)
      if (ship.invuln > 0) ship.invuln -= dt

      // ---- update asteroides ----
      for (const a of asteroids) {
        a.pos.x += a.vel.x * dt
        a.pos.y += a.vel.y * dt
        a.angle += a.spin * dt
        wrap(a.pos)
      }

      // ---- UFO ----
      ufoTimer -= dt
      if (!ufo && ufoTimer <= 0) {
        const fromLeft = Math.random() < 0.5
        ufo = {
          pos: { x: fromLeft ? 0 : W, y: Math.random() * H * 0.7 + H * 0.15 },
          vel: { x: (fromLeft ? 1 : -1) * 55, y: 0 },
          cooldown: 1,
          radius: 11,
        }
      }
      if (ufo) {
        ufo.pos.x += ufo.vel.x * dt
        ufo.pos.y += Math.sin(now / 400) * 20 * dt
        ufo.cooldown -= dt
        if (ufo.cooldown <= 0) {
          // atira na direção da nave
          const to = wrapDelta(ufo.pos, ship.pos)
          const a = Math.atan2(to.y, to.x)
          bullets.push({
            pos: { ...ufo.pos },
            vel: { x: Math.cos(a) * 220, y: Math.sin(a) * 220 },
            life: 1.4,
            fromShip: false,
          })
          ufo.cooldown = 1.4
        }
        // saiu da tela
        if (ufo.pos.x < -20 || ufo.pos.x > W + 20) {
          ufo = null
          ufoTimer = 7 + Math.random() * 5
        }
      }

      // ---- balas ----
      bullets = bullets.filter((b) => b.life > 0)
      for (const b of bullets) {
        b.pos.x += b.vel.x * dt
        b.pos.y += b.vel.y * dt
        b.life -= dt
        wrap(b.pos)

        if (b.fromShip) {
          // acerta asteroide?
          for (let i = asteroids.length - 1; i >= 0; i--) {
            const a = asteroids[i]
            if (len(wrapDelta(b.pos, a.pos)) < a.radius) {
              splitAsteroid(a)
              asteroids.splice(i, 1)
              b.life = 0
              break
            }
          }
          // acerta UFO?
          if (b.life > 0 && ufo && len(wrapDelta(b.pos, ufo.pos)) < ufo.radius) {
            boom(ufo.pos, 16)
            ufo = null
            ufoTimer = 7 + Math.random() * 5
            b.life = 0
          }
        } else {
          // bala do UFO acerta a nave
          if (ship.invuln <= 0 && len(wrapDelta(b.pos, ship.pos)) < SHIP_R) {
            boom(ship.pos, 20)
            resetShip()
            b.life = 0
          }
        }
      }

      // ---- colisão nave x asteroide ----
      if (ship.invuln <= 0) {
        for (const a of asteroids) {
          if (len(wrapDelta(ship.pos, a.pos)) < a.radius + SHIP_R * 0.6) {
            boom(ship.pos, 20)
            resetShip()
            break
          }
        }
      }

      // wave limpa -> recomeça
      if (asteroids.length === 0) startWave()

      // ---- partículas ----
      particles = particles.filter((p) => p.life > 0)
      for (const p of particles) {
        p.pos.x += p.vel.x * dt
        p.pos.y += p.vel.y * dt
        p.life -= dt
      }

      // ===================== DESENHO =====================
      ctx.lineJoin = 'round'

      // asteroides (contorno irregular estilo vetor)
      ctx.strokeStyle = pal.fg
      ctx.lineWidth = 1.4
      for (const a of asteroids) {
        ctx.save()
        ctx.translate(a.pos.x, a.pos.y)
        ctx.rotate(a.angle)
        ctx.beginPath()
        const n = a.shape.length
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2
          const r = a.radius * a.shape[i]
          const x = Math.cos(ang) * r
          const y = Math.sin(ang) * r
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
      }

      // balas
      for (const b of bullets) {
        ctx.fillStyle = b.fromShip ? pal.bullet : pal.accent
        ctx.beginPath()
        ctx.arc(b.pos.x, b.pos.y, 1.8, 0, Math.PI * 2)
        ctx.fill()
      }

      // UFO
      if (ufo) {
        ctx.strokeStyle = pal.ufo
        ctx.lineWidth = 1.5
        const r = ufo.radius
        ctx.save()
        ctx.translate(ufo.pos.x, ufo.pos.y)
        ctx.beginPath()
        ctx.ellipse(0, 0, r, r * 0.42, 0, 0, Math.PI * 2)
        ctx.moveTo(-r * 0.5, -r * 0.2)
        ctx.lineTo(-r * 0.25, -r * 0.6)
        ctx.lineTo(r * 0.25, -r * 0.6)
        ctx.lineTo(r * 0.5, -r * 0.2)
        ctx.stroke()
        ctx.restore()
      }

      // partículas
      ctx.fillStyle = pal.fg
      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.max)
        ctx.fillRect(p.pos.x, p.pos.y, 2, 2)
      }
      ctx.globalAlpha = 1

      // nave (pisca durante invulnerabilidade)
      const blink = ship.invuln > 0 && Math.floor(now / 100) % 2 === 0
      if (!blink) {
        ctx.save()
        ctx.translate(ship.pos.x, ship.pos.y)
        ctx.rotate(ship.angle)
        ctx.strokeStyle = pal.accent
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(SHIP_R + 2, 0)
        ctx.lineTo(-SHIP_R, SHIP_R * 0.7)
        ctx.lineTo(-SHIP_R * 0.5, 0)
        ctx.lineTo(-SHIP_R, -SHIP_R * 0.7)
        ctx.closePath()
        ctx.stroke()
        // chama do motor ao acelerar
        if (ship.thrusting && Math.floor(now / 60) % 2 === 0) {
          ctx.beginPath()
          ctx.moveTo(-SHIP_R * 0.5, 0)
          ctx.lineTo(-SHIP_R - 5, 0)
          ctx.strokeStyle = '#f97316'
          ctx.stroke()
        }
        ctx.restore()
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border sm:h-44">
      <canvas ref={canvasRef} className="h-full w-full" />
      <span className="pointer-events-none absolute bottom-1.5 right-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
        Asteroids 1979
      </span>
    </div>
  )
}
