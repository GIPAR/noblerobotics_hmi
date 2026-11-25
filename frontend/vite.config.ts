import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isProxy = process.env.VITE_PROXY === 'true'

export default defineConfig({
  plugins: [react()],

  server: {
    allowedHosts: ['noblegipar.duckdns.org'],
    hmr: isProxy ? { clientPort: 443 } : true,
    // watch: {
    //   usePolling: true,
    // },
  }
})