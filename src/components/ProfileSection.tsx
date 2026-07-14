import { motion } from 'framer-motion'
import { FiDownload } from 'react-icons/fi'
import { useDict } from '../hooks/useDict'

// Respeita o base do Vite (raiz em dev, /nome-do-repo/ no GitHub Pages).
// Currículo por idioma: português e inglês.
const resumeByLang = {
  pt: `${import.meta.env.BASE_URL}tarik_curriculo_resumido.pdf`,
  en: `${import.meta.env.BASE_URL}tarik_santiago_esmin_resume_v3.pdf`,
} as const

// Bloco de texto reutilizável com título + parágrafos.
function Block({
  title,
  children,
  delay = 0,
  action,
}: {
  title: string
  children: React.ReactNode
  delay?: number
  action?: React.ReactNode // conteúdo opcional à direita do título
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
      className="mb-10"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
          <span className="h-4 w-1 rounded-full bg-accent" />
          {title}
        </h2>
        {action}
      </div>
      <div className="space-y-3 text-[15px] leading-relaxed text-muted">
        {children}
      </div>
    </motion.section>
  )
}

// Coluna esquerda: sobre mim, projetos e visão de mundo.
export function ProfileSection() {
  const { t, lang } = useDict()
  const resumeUrl = resumeByLang[lang]

  return (
    <div>
      <Block title={t.about.title}>
        {t.about.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Block>

      <Block
        title={t.projects.title}
        delay={0.05}
        action={
          <a
            href={resumeUrl}
            download={lang === 'pt' ? 'tarik-curriculo.pdf' : 'tarik-resume.pdf'}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:border-accent hover:bg-accent-soft"
          >
            {t.projects.downloadResume}
            <FiDownload
              size={15}
              className="group-hover:animate-download-bounce"
            />
          </a>
        }
      >
        <ul className="space-y-4">
          {t.projects.items.map((proj) => (
            <li
              key={proj.name}
              className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent"
            >
              <h3 className="font-medium text-text">{proj.name}</h3>
              <p className="mt-1 text-sm text-muted">{proj.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {proj.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Block>

      <Block title={t.worldview.title} delay={0.1}>
        {t.worldview.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Block>
    </div>
  )
}
