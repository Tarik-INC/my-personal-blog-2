# Dev · Cover Letter

Blog pessoal de uma página (SPA + PWA) como "cover letter" técnica.

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** — estilos (paletas distintas light/dark via CSS variables)
- **React Context API** — estado de tema e idioma (persistido no localStorage)
- **react-three-fiber + drei (Three.js)** — cubo mágico 3D resolvendo em loop
- **Framer Motion** — animações e popups
- **vite-plugin-pwa** — instalável / offline

## Rodar

> ⚠️ O ambiente atual usa um registry npm privado sem acesso à internet, então
> as dependências **não puderam ser instaladas aqui**. Rode numa rede liberada:

```bash
npm install
npm run dev      # abre em http://localhost:5173
```

Se o `npm install` falhar por causa do registry privado, aponte para o npmjs:

```bash
npm install --registry=https://registry.npmjs.org
```

## Build de produção

```bash
npm run build
npm run preview
```

## Deploy no GitHub Pages (grátis)

O deploy é automático via GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

1. Suba o projeto para um repositório **público** no GitHub:
   ```bash
   git init
   git add .
   git commit -m "Blog inicial"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
   git push -u origin main
   ```
2. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Pronto. A cada `git push` na `main`, o site publica em:
   `https://SEU-USUARIO.github.io/NOME-DO-REPO/`

> O `base` da aplicação é derivado **automaticamente** do nome do repositório
> (o workflow passa `BASE_PATH=/NOME-DO-REPO/`), então você não precisa editar
> nada mesmo se renomear o repo. Rodando localmente, o `base` é `/`.

## Onde editar o conteúdo

- **Textos (resumo, projetos, visão de mundo)**: `src/i18n/pt.ts` e `src/i18n/en.ts`
- **Tecnologias (ícones + descrições)**: `src/data/tech.ts`
- **Cores dos temas**: `src/index.css` (variáveis `--bg`, `--accent`, etc.)
- **Sequência do cubo**: `src/three/RubiksCube.tsx` (constante `SEQUENCE`)

## Ícones do PWA

`public/pwa-192x192.png` e `pwa-512x512.png` são placeholders sólidos.
Troque por um ícone real (ex.: exportando de `public/favicon.svg`) antes de publicar.
