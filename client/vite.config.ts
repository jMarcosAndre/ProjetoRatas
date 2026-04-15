import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth':     'http://localhost:3000',
      '/users':    'http://localhost:3000',
      '/projects': 'http://localhost:3000',
      '/ratas':    'http://localhost:3000',
      '/fetos':    'http://localhost:3000',
      '/dados-gerais': 'http://localhost:3000',
    },
  },
  build: {
    outDir: '../public',
    emptyOutDir: true,
  },
})
