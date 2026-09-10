import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Todo lo que empiece con /api se reenvía al backend de Express.
    // Así el frontend no necesita saber la URL completa de la API en desarrollo.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
