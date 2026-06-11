import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    // Proxy all /api requests to the backend — eliminates CORS issues in development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Vite Proxy] ERROR — is the backend running on port 5000?', err.message)
          })
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('[Vite Proxy] →', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('[Vite Proxy] ←', proxyRes.statusCode, req.url)
          })
        },
      },
    },
  },
})
