import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true, // Prevents Vite from switching ports if 5173 is busy
    allowedHosts: [
      'raskamon.com', 
      'www.raskamon.com', 
      'nonblameful-deandrea-unrefractively.ngrok-free.dev'
    ],
    // ADD THIS HMR BLOCK
    hmr: {
      host: 'nonblameful-deandrea-unrefractively.ngrok-free.dev',
      protocol: 'wss',
      clientPort: 443,
    },
  }
})
