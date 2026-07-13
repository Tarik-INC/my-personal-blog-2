import { pt } from './pt'
import { en } from './en'
import type { Lang } from '../store/useAppStore'

export const dictionaries = { pt, en }

export type Dictionary = typeof pt

export function getDict(lang: Lang): Dictionary {
  return dictionaries[lang]
}
