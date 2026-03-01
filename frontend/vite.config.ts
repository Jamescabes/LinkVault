import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api/v1/auth': 'http://localhost:8080',
      '/api/v1/users': 'http://localhost:8080',
      '/api/v1/links': 'http://localhost:8081',
    },
  },
})
