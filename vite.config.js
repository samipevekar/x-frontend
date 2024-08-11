import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist' // Ensure that this is set to 'dist'
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://x-backend-ujvu.onrender.com",
        // target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  }
})
