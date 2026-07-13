import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import type { Lang } from '../store/useAppStore'
import { useDict } from '../hooks/useDict'

const OPTIONS: Lang[] = ['pt', 'en']

// Switch PT/EN (canto direito do header) — segmented control animado.
export function LangSwitch() {
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)
  const { t } = useDict()

  return (
    <div
      role="group"
      aria-label={t.header.toggleLangLabel}
      className="relative flex items-center rounded-full border border-border bg-surface p-1 text-sm font-medium"
    >
      {OPTIONS.map((opt) => {
        const active = lang === opt
        return (
          <button
            key={opt}
            onClick={() => setLang(opt)}
            className="relative z-10 rounded-full px-3 py-1 uppercase tracking-wide transition-colors focus:outline-none"
            aria-pressed={active}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 -z-10 rounded-full bg-accent"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={active ? 'text-bg' : 'text-muted'}>{opt}</span>
          </button>
        )
      })}
    </div>
  )
}
