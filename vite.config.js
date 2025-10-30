import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    headers: {
      'ngrok-skip-browser-warning': 'true'
    },
    // 👇 Add this section
    allowedHosts: [
      'lintless-augusta-superexplicitly.ngrok-free.dev'
    ]
  },
  preview: {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  }
})
