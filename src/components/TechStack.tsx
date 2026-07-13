import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { techs } from '../data/tech'
import type { Tech } from '../data/tech'
import { useDict } from '../hooks/useDict'

// Um ícone individual: cinza por padrão, cor de marca no hover + popup.
function TechIcon({ tech }: { tech: Tech }) {
  const [hovered, setHovered] = useState(false)
  const { lang } = useDict()
  const Icon = tech.icon

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <motion.button
        aria-label={tech.name}
        whileHover={{ scale: 1.15, y: -4 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Icon
          size={28}
          // Cinza quando inativo, cor de marca quando hover.
          color={hovered ? tech.brand : 'rgb(var(--muted))'}
          style={{ transition: 'color 0.2s ease' }}
        />
      </motion.button>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="pointer-events-none absolute bottom-full z-20 mb-3 w-52 -translate-x-1/2 left-1/2 rounded-lg border border-border bg-surface p-3 text-left shadow-xl"
          >
            <p
              className="mb-1 text-sm font-semibold"
              style={{ color: tech.brand }}
            >
              {tech.name}
            </p>
            <p className="text-xs leading-snug text-muted">
              {tech.desc[lang]}
            </p>
            {/* setinha do balão */}
            <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-border bg-surface" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Grid de tecnologias (parte inferior da coluna direita).
export function TechStack() {
  const { t } = useDict()

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
          <span className="h-4 w-1 rounded-full bg-accent" />
          {t.stack.title}
        </h2>
        <span className="text-xs text-muted">{t.stack.hint}</span>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6">
        {techs.map((tech) => (
          <TechIcon key={tech.name} tech={tech} />
        ))}
      </div>
    </div>
  )
}
