import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppContext } from './useAppStore'
import type { AppState, Theme, Lang } from './useAppStore'

const STORAGE_KEY = 'dev-cv-prefs'

interface Persisted {
  theme?: Theme
  lang?: Lang
}

// Lê as preferências salvas no localStorage (com defaults).
function loadPrefs(): { theme: Theme; lang: Lang } {
  const fallback = { theme: 'dark' as Theme, lang: 'pt' as Lang }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Persisted
    return {
      theme: parsed.theme ?? fallback.theme,
      lang: parsed.lang ?? fallback.lang,
    }
  } catch {
    return fallback
  }
}

// Provider que substitui o Zustand: mantém tema + idioma e persiste.
export function AppProvider({ children }: { children: React.ReactNode }) {
  const initial = loadPrefs()
  const [theme, setTheme] = useState<Theme>(initial.theme)
  const [lang, setLang] = useState<Lang>(initial.lang)

  // Persiste sempre que theme/lang mudarem.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, lang }))
  }, [theme, lang])

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  )
  const toggleLang = useCallback(
    () => setLang((l) => (l === 'pt' ? 'en' : 'pt')),
    [],
  )

  const value = useMemo<AppState>(
    () => ({ theme, lang, toggleTheme, setLang, toggleLang }),
    [theme, lang, toggleTheme, toggleLang],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
