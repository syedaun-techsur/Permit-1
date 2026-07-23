import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Allow the dev server to be reached through preview proxies (Daytona
    // proxy, pivota-ng preview host, and "Open in new tab"). Vite 5.4+ blocks
    // unknown Host headers by default via server.allowedHosts, which otherwise
    // returns "Blocked request. This host is not allowed." behind the proxy.
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
