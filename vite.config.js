// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path" // Ensure 'path' is imported

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This line tells Vite how to handle the '@/' alias
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})