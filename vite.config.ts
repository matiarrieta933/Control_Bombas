import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/Control_Bombas/',
  plugins: [react()],
  server: {
    host: true, // Permite acceso desde IP y resuelve problemas de localhost
    port: 5173,
    watch: {
      usePolling: true // CRÍTICO: Necesario para que funcione bien dentro de OneDrive
    }
  }
})
