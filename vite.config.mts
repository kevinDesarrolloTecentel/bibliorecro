import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import type { DeprecationOrId } from 'sass'
import CryptoJS from 'crypto-js'

const decryptCookieToken = (cookieHeader: string | undefined, secret: string): string | null => {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/(?:^|;\s*)(?:tk|token)=([^;]+)/)
  if (!match) return null
  const rawCookieVal = decodeURIComponent(match[1].trim())
  if (!rawCookieVal) return null
  if (!rawCookieVal.startsWith('U2FsdGVkX1')) {
    return rawCookieVal
  }
  try {
    const bytes = CryptoJS.AES.decrypt(rawCookieVal, secret)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return decrypted || null
  } catch {
    return null
  }
}

const getBackendProxy = (targetApi: string, encryptionKey: string) => ({
  '/api': {
    target: targetApi,
    changeOrigin: true,
    secure: false,
    rewrite: (path: string) => path.replace(/^\/api/, '/server.php/api'),
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any, req: any) => {
        // 1. Desencriptar token de la cookie cifrada (tk=U2FsdGVk...)
        const cookieHeader = req.headers['cookie']
        let rawToken = decryptCookieToken(cookieHeader, encryptionKey)

        // 2. Si vino cabecera authorization (fallback)
        if (!rawToken && req.headers['authorization']) {
          const auth = req.headers['authorization']
          if (typeof auth === 'string') {
            rawToken = auth.replace(/^Bearer\s+/i, '').trim()
          }
        }

        // 3. Inyectar hacia Laravel en el backend de forma 100% invisible para el navegador
        if (rawToken) {
          proxyReq.setHeader('authorization', `Bearer ${rawToken}`)
          const separator = proxyReq.path.includes('?') ? '&' : '?'
          proxyReq.path += `${separator}token=${rawToken}`
        }
      })
    },
  },
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const targetApi = env.VITE_API_URL || 'https://bibliobackend.ccelrecreo.com:1500'
  const encryptionKey = env.VITE_ENCRYPTION_KEY || 'clave_token'
  const backendProxy = getBackendProxy(targetApi, encryptionKey)

  return {
    base: './',
    build: {
      outDir: 'build',
      sourcemap: false,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[hash].js',
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer({}), // add options if needed
        ],
      },
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src'),
        },
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.mts', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      host: true,
      port: 3000,
      proxy: backendProxy,
    },
    preview: {
      port: 4173,
      proxy: backendProxy,
    },
  }
})
