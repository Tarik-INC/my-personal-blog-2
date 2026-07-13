import { useAppStore } from '../store/useAppStore'
import { getDict } from '../i18n'

// Atalho: retorna o dicionário do idioma atual + o idioma em si.
export function useDict() {
  const lang = useAppStore((s) => s.lang)
  return { t: getDict(lang), lang }
}
