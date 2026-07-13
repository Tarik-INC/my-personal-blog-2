import type { IconType } from 'react-icons'
import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiTailwindcss,
  SiPostgresql,
  SiDocker,
  SiGit,
  SiAngular,
  SiPython,
  SiIonic,
  SiMongodb,
} from 'react-icons/si'

// Cada tech tem: ícone, cor "de marca" (usada no hover) e descrição PT/EN.
// ⚠️ Adicione/edite suas stacks aqui. O ícone não mostra texto — só no popup.
export interface Tech {
  name: string
  icon: IconType
  brand: string // cor realçada no hover
  desc: { pt: string; en: string }
}

export const techs: Tech[] = [
  {
    name: 'React',
    icon: SiReact,
    brand: '#61DAFB',
    desc: {
      pt: 'Biblioteca para construir interfaces com componentes reutilizáveis.',
      en: 'Library for building UIs with reusable components.',
    },
  },
  {
    name: 'TypeScript',
    icon: SiTypescript,
    brand: '#3178C6',
    desc: {
      pt: 'JavaScript com tipagem estática — menos bugs, melhor autocomplete.',
      en: 'JavaScript with static typing — fewer bugs, better autocomplete.',
    },
  },
  {
    name: 'JavaScript',
    icon: SiJavascript,
    brand: '#F7DF1E',
    desc: {
      pt: 'A linguagem da web, base de todo o ecossistema front-end.',
      en: 'The language of the web, foundation of the whole front-end.',
    },
  },
  {
    name: 'Node.js',
    icon: SiNodedotjs,
    brand: '#5FA04E',
    desc: {
      pt: 'Runtime JavaScript no servidor para APIs e serviços.',
      en: 'Server-side JavaScript runtime for APIs and services.',
    },
  },
  {
    name: 'Angular',
    icon: SiAngular,
    brand: '#DD0031',
    desc: {
      pt: 'Framework completo para aplicações web em larga escala.',
      en: 'Full-featured framework for large-scale web applications.',
    },
  },
  {
    name: 'Tailwind CSS',
    icon: SiTailwindcss,
    brand: '#38BDF8',
    desc: {
      pt: 'CSS utilitário para estilizar rápido e de forma consistente.',
      en: 'Utility-first CSS for fast, consistent styling.',
    },
  },
  {
    name: 'PostgreSQL',
    icon: SiPostgresql,
    brand: '#4169E1',
    desc: {
      pt: 'Banco de dados relacional robusto e confiável.',
      en: 'Robust and reliable relational database.',
    },
  },
  {
    name: 'MongoDB',
    icon: SiMongodb,
    brand: '#47A248',
    desc: {
      pt: 'Banco de dados NoSQL orientado a documentos, flexível e escalável.',
      en: 'Document-oriented NoSQL database, flexible and scalable.',
    },
  },
  {
    name: 'Ionic',
    icon: SiIonic,
    brand: '#3880FF',
    desc: {
      pt: 'Framework para apps móveis híbridos com tecnologias web.',
      en: 'Framework for hybrid mobile apps using web technologies.',
    },
  },
  {
    name: 'Python',
    icon: SiPython,
    brand: '#3776AB',
    desc: {
      pt: 'Linguagem versátil para scripts, dados e back-end.',
      en: 'Versatile language for scripts, data and back-end.',
    },
  },
  {
    name: 'Docker',
    icon: SiDocker,
    brand: '#2496ED',
    desc: {
      pt: 'Containers para ambientes reproduzíveis do dev à produção.',
      en: 'Containers for reproducible environments from dev to prod.',
    },
  },
  {
    name: 'Git',
    icon: SiGit,
    brand: '#F05032',
    desc: {
      pt: 'Controle de versão distribuído para colaboração em código.',
      en: 'Distributed version control for code collaboration.',
    },
  },
]
