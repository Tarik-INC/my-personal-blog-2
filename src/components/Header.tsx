import { ThemeToggle } from './ThemeToggle'
import { LangSwitch } from './LangSwitch'
import { useDict } from '../hooks/useDict'

// Cabeçalho: toggle de tema à esquerda, troca de idioma à direita.
export function Header() {
  const { t } = useDict()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <ThemeToggle />

        <div className="text-center">
          <p className="font-semibold leading-tight text-text">
            {t.header.brandName}
          </p>
          <p className="text-xs text-muted">{t.header.brandRole}</p>
        </div>

        <LangSwitch />
      </div>
    </header>
  )
}
