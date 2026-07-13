import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

// Sincroniza a classe `dark` no <html> com o estado do store.
export function useTheme() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    // Atualiza a cor da barra do navegador (mobile).
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0a0e17' : '#f5f4f0')
    }
  }, [theme])

  return theme
}
