import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves a project site from /<repo>/, so production builds are
// mounted there. Dev keeps the root so local URLs stay short.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/le.seo/' : '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react')) return 'vendor-react'
        },
      },
    },
  },
}))
