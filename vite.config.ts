import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// No GitHub Pages o site é servido em /nome-do-repo/, não na raiz.
// O workflow de deploy passa BASE_PATH="/nome-do-repo/" automaticamente
// (derivado do nome do repositório). Em dev/local, cai no '/'.
const base = process.env.BASE_PATH || '/'

// SPA + PWA. O service worker é gerado automaticamente pelo Workbox.
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Dev Cover Letter',
        short_name: 'DevCV',
        description: 'Blog pessoal como cover letter técnica',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        // Relativos ao `base` — funcionam tanto na raiz quanto em subpasta.
        scope: base,
        start_url: base,
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
