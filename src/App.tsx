import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ProfileSection } from './components/ProfileSection'
import { TechStack } from './components/TechStack'
import { RubiksCube } from './three/RubiksCube'
import { Asteroids } from './components/Asteroids'
import { useTheme } from './hooks/useTheme'

export default function App() {
  // Ativa a sincronização da classe dark no <html>.
  useTheme()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Coluna esquerda: resumo, projetos, visão de mundo */}
          <ProfileSection />

          {/* Coluna direita: cubo, spacewar e techs — 3 cards com espaço igual */}
          <div className="flex flex-col gap-10 lg:sticky lg:top-24 lg:self-start">
            {/* Card 1: cubo mágico 3D */}
            <div className="rounded-2xl border border-border bg-surface/50 p-4">
              <RubiksCube />
            </div>

            {/* Card 2: Asteroids clássico em loop */}
            <div className="rounded-2xl border border-border bg-surface/50 p-4">
              <Asteroids />
            </div>

            {/* Card 3: tecnologias */}
            <TechStack />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
