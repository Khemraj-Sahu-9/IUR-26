import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'ASHA Saathi | आशा साथी',
        short_name: 'ASHA Saathi',
        description: 'Offline-First Digital Companion for Community Health Workers (ASHA)',
        theme_color: '#059669',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'hi-IN',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['health', 'medical', 'productivity'],
      },
      workbox: {
        // Cache the app shell (HTML, JS, CSS) with StaleWhileRevalidate
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // DO NOT cache Supabase API responses — data freshness handled by IndexedDB
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/rest\/v1\//,    // Supabase REST
          /^\/auth\/v1\//,   // Supabase Auth
          /^\/storage\/v1\//, // Supabase Storage
        ],
        runtimeCaching: [
          {
            // Cache app shell navigation
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'asha-saathi-html',
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
