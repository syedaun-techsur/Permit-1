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
      // The app calls `/api/*` (same-origin); forward to the backend and strip
      // the `/api` prefix, since the backend mounts routes at the root
      // (`/auth`, `/permits`, `/admin`, …) with no global prefix.
      '/api': {
        // In docker-compose the backend is a separate service, reachable as
        // `backend:3000` (VITE_PROXY_TARGET); native dev falls back to localhost.
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
