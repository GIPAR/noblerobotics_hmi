import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import os from 'os'
import fs from 'fs'

const certPath = path.join(os.homedir(), 'certs/config/live/noblegipar.duckdns.org')
const certFile = path.join(certPath, 'fullchain.pem')
const keyFile = path.join(certPath, 'privkey.pem')

const hasCert = fs.existsSync(certFile) && fs.existsSync(keyFile)

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    // port: 443, // needs permission
    ...(hasCert && {
      https: {
        cert: fs.readFileSync(path.join(certPath, 'fullchain.pem')),
        key: fs.readFileSync(path.join(certPath, 'privkey.pem')),
      },
    }),
  },
})