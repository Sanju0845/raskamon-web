import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['raskamon.com', 'www.raskamon.com', '127.0.0.1', 'localhost', 'nonblameful-deandrea-unrefractively.ngrok-free.dev'],
    origin: 'https://nonblameful-deandrea-unrefractively.ngrok-free.dev'
  }
})
