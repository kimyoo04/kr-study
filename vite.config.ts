/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves this repo under /kr-study/.
// Every PWA path (base, SW scope, manifest start_url/scope) must carry that prefix.
const BASE = '/kr-study/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      // 'prompt': the new SW waits; the app applies it from the Home banner
      // (autoUpdate would reload the page mid-lesson and lose quiz state).
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'かんこくご Pocket',
        short_name: 'かんこくご',
        description: 'スマホでできる韓国語の独学 — ハングルから',
        lang: 'ja',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        background_color: '#0f1020',
        theme_color: '#0f1020',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3}'],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
