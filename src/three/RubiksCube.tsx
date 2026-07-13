import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store/useAppStore'

/* ============================================================
   Cubo mágico 3D que "resolve" em loop.
   - 27 cubies (3x3x3).
   - A cada ciclo, giramos uma face 90° suavemente e "snapamos".
   - Sequência fixa de movimentos que roda infinitamente.
   Isso mostra domínio de 3D/matemática sem depender de solver real.
   ============================================================ */

type Axis = 'x' | 'y' | 'z'
interface Move {
  axis: Axis
  layer: -1 | 0 | 1 // qual camada (posição no eixo)
  dir: 1 | -1 // sentido do giro
}

// Sequência de movimentos que se repete (dá a sensação de embaralhar/resolver).
const SEQUENCE: Move[] = [
  { axis: 'x', layer: 1, dir: 1 },
  { axis: 'y', layer: 1, dir: -1 },
  { axis: 'z', layer: -1, dir: 1 },
  { axis: 'x', layer: -1, dir: -1 },
  { axis: 'y', layer: -1, dir: 1 },
  { axis: 'z', layer: 1, dir: -1 },
  { axis: 'y', layer: 1, dir: 1 },
  { axis: 'x', layer: 1, dir: -1 },
]

// Cores clássicas do cubo por direção da face.
const FACE_COLORS = {
  px: '#e11d48', // direita  - vermelho
  nx: '#f97316', // esquerda - laranja
  py: '#f8fafc', // cima     - branco
  ny: '#facc15', // baixo    - amarelo
  pz: '#22c55e', // frente   - verde
  nz: '#3b82f6', // trás     - azul
}

const GAP = 1.06 // espaçamento entre cubies
const TURN_DURATION = 0.55 // segundos por giro
const PAUSE = 0.15 // pausa entre giros

interface Cubie {
  id: number
  // posição lógica em grid (-1,0,1)
  gx: number
  gy: number
  gz: number
}

function makeCubies(): Cubie[] {
  const list: Cubie[] = []
  let id = 0
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++)
        list.push({ id: id++, gx: x, gy: y, gz: z })
  return list
}

// Materiais por cubie: cada uma das 6 faces recebe cor só se estiver
// na borda externa; faces internas ficam escuras.
function cubieMaterials(c: Cubie) {
  const dark = '#0b0f1a'
  // Ordem do BoxGeometry: +x, -x, +y, -y, +z, -z
  return [
    c.gx === 1 ? FACE_COLORS.px : dark,
    c.gx === -1 ? FACE_COLORS.nx : dark,
    c.gy === 1 ? FACE_COLORS.py : dark,
    c.gy === -1 ? FACE_COLORS.ny : dark,
    c.gz === 1 ? FACE_COLORS.pz : dark,
    c.gz === -1 ? FACE_COLORS.nz : dark,
  ].map(
    (color) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.1,
      }),
  )
}

function CubeGroup() {
  const cubies = useMemo(makeCubies, [])
  const materials = useMemo(
    () => cubies.map((c) => cubieMaterials(c)),
    [cubies],
  )

  // refs para cada mesh
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  // `world` contém os cubies + o pivô; é ele que "flutua".
  const world = useRef<THREE.Group>(null)
  // `pivot` é o eixo da camada em giro; recebe os cubies temporariamente.
  const pivot = useRef<THREE.Group>(null)

  // estado da animação
  const state = useRef({
    moveIndex: 0,
    elapsed: 0,
    phase: 'turning' as 'turning' | 'pausing',
    started: false, // true quando os cubies já foram anexados ao pivô neste giro
    // snapshot das posições lógicas (mutável)
    grid: cubies.map((c) => ({ ...c })),
  })

  useFrame((_, delta) => {
    const s = state.current
    const w = world.current
    const p = pivot.current
    if (!w || !p) return

    const move = SEQUENCE[s.moveIndex]
    const axisVec = new THREE.Vector3(
      move.axis === 'x' ? 1 : 0,
      move.axis === 'y' ? 1 : 0,
      move.axis === 'z' ? 1 : 0,
    )

    if (s.phase === 'turning') {
      // Início do giro: anexa os cubies da camada ao pivô.
      // `attach` PRESERVA o transform no mundo (diferente de `add`),
      // então nada "pula" ao reparentar.
      if (!s.started) {
        p.rotation.set(0, 0, 0)
        w.updateMatrixWorld(true)
        cubies.forEach((_, i) => {
          const g = s.grid[i]
          const coord = move.axis === 'x' ? g.gx : move.axis === 'y' ? g.gy : g.gz
          if (coord === move.layer) {
            const m = meshRefs.current[i]
            if (m) p.attach(m) // mantém posição/rotação mundiais
          }
        })
        s.started = true
      }

      s.elapsed += delta
      const t = Math.min(s.elapsed / TURN_DURATION, 1)
      // easing suave (easeInOutCubic)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const angle = (Math.PI / 2) * move.dir * eased
      p.setRotationFromAxisAngle(axisVec, angle)

      if (t >= 1) {
        // SNAP: fixa exatamente 90°, devolve os cubies ao `world` (attach
        // preserva a rotação acumulada — por isso as cores continuam certas),
        // e atualiza só as coordenadas lógicas.
        p.setRotationFromAxisAngle(axisVec, (Math.PI / 2) * move.dir)
        w.updateMatrixWorld(true)
        cubies.forEach((_, i) => {
          const m = meshRefs.current[i]
          if (m && m.parent === p) w.attach(m)
        })
        applyMoveToGrid(s.grid, move)
        s.elapsed = 0
        s.started = false
        s.phase = 'pausing'
      }
    } else {
      // pausa curta entre movimentos
      s.elapsed += delta
      if (s.elapsed >= PAUSE) {
        s.elapsed = 0
        s.phase = 'turning'
        s.moveIndex = (s.moveIndex + 1) % SEQUENCE.length
      }
    }

    // leve rotação global pro cubo "flutuar" (afeta cubies E pivô juntos)
    w.rotation.y += delta * 0.15
  })

  return (
    <group ref={world}>
      {cubies.map((c, i) => (
        <mesh
          key={c.id}
          ref={(el) => (meshRefs.current[i] = el)}
          position={[c.gx * GAP, c.gy * GAP, c.gz * GAP]}
          material={materials[i]}
        >
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}
      <group ref={pivot} />
    </group>
  )
}

// Atualiza as coordenadas lógicas após um giro de 90°.
function applyMoveToGrid(
  grid: { gx: number; gy: number; gz: number }[],
  move: Move,
) {
  const d = move.dir
  for (const c of grid) {
    const coord = move.axis === 'x' ? c.gx : move.axis === 'y' ? c.gy : c.gz
    if (coord !== move.layer) continue
    // rotação de 90° no plano perpendicular ao eixo
    if (move.axis === 'x') {
      const { gy, gz } = c
      c.gy = -d * gz
      c.gz = d * gy
    } else if (move.axis === 'y') {
      const { gx, gz } = c
      c.gx = d * gz
      c.gz = -d * gx
    } else {
      const { gx, gy } = c
      c.gx = -d * gy
      c.gy = d * gx
    }
  }
}

export function RubiksCube() {
  const theme = useAppStore((s) => s.theme)
  const [ready, setReady] = useState(false)

  return (
    <div className="relative h-64 w-full sm:h-72">
      <Canvas
        camera={{ position: [4.5, 4, 5.5], fov: 42 }}
        dpr={[1, 2]}
        onCreated={() => setReady(true)}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.1} />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} />
        <CubeGroup />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={false}
        />
      </Canvas>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
          …
        </div>
      )}
      {/* brilho de fundo temático */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-40 blur-2xl"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(circle at 50% 40%, rgba(245,158,11,0.25), transparent 70%)'
              : 'radial-gradient(circle at 50% 40%, rgba(13,148,136,0.2), transparent 70%)',
        }}
      />
    </div>
  )
}
