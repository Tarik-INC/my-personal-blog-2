import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark'
export type Lang = 'pt' | 'en'

export interface AppState {
  theme: Theme
  lang: Lang
  toggleTheme: () => void
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

// Context com o estado global (tema + idioma). Populado pelo AppProvider.
export const AppContext = createContext<AppState | null>(null)

// Hook com a MESMA assinatura de antes: aceita um seletor.
// Ex.: const theme = useAppStore((s) => s.theme)
export function useAppStore<T>(selector: (state: AppState) => T): T {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useAppStore precisa estar dentro de <AppProvider>')
  }
  return selector(ctx)
}
