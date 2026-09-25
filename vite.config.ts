import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: https://vishalkumar1007.github.io/interviewprep/
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
