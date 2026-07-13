import { useDict } from '../hooks/useDict'

// Rodapé: apenas trademark com o ano corrente.
export function Footer() {
  const { t } = useDict()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-6 text-center text-sm text-muted">
      © {year} {t.header.brandName}. {t.footer.rights}
    </footer>
  )
}
