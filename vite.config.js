// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': 'https://twitterapp-backend-85c9.onrender.com' // <-- CORRECT: proxy /api to backend port 4000
    }
  }
})
