import { motion, AnimatePresence } from 'framer-motion'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import { useDict } from '../hooks/useDict'

// Toggle sol/lua (canto esquerdo do header). Ícones, sem texto.
export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const { t } = useDict()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={t.header.toggleThemeLabel}
      title={t.header.toggleThemeLabel}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-accent transition-colors hover:bg-surface-alt focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ y: -14, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 14, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.25 }}
          className="absolute"
        >
          {isDark ? <FiMoon size={20} /> : <FiSun size={20} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
