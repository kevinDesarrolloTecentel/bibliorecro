import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = 'clave_token'

const authProxyPlugin = () => ({
  name: 'auth-proxy-login',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.method === 'POST' && req.url && req.url.includes('/adm-user/login')) {
        let body = ''
        for await (const chunk of req) {
          body += chunk
        }
        let decryptedBody = body
        try {
          const json = JSON.parse(body)
          if (json.PASSWORD_USUARIO && json.PASSWORD_USUARIO.startsWith('U2FsdGVkX1')) {
            const bytes = CryptoJS.AES.decrypt(json.PASSWORD_USUARIO, ENCRYPTION_KEY)
            const decrypted = bytes.toString(CryptoJS.enc.Utf8)
            if (decrypted) {
              json.PASSWORD_USUARIO = decrypted
              decryptedBody = JSON.stringify(json)
            }
          }
        } catch {}

        try {
          const response = await fetch('https://bibliobackend.ccelrecreo.com:1500/server.php/api/adm-user/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json, text/plain, */*',
            },
            body: decryptedBody,
          })
          const text = await response.text()
          let responseText = text
          try {
            const respJson = JSON.parse(text)
            if (respJson.token && respJson.token.startsWith('eyJ')) {
              respJson.token = CryptoJS.AES.encrypt(respJson.token, ENCRYPTION_KEY).toString()
              responseText = JSON.stringify(respJson)
            }
          } catch {}

          res.writeHead(response.status, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': req.headers.origin || '*',
            'Access-Control-Allow-Credentials': 'true',
          })
          res.end(responseText)
          return
        } catch (err: any) {
          res.writeHead(502, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: false, message: err.message }))
          return
        }
      }
      next()
    })
  },
})

const proxyConfig = {
  '/server.php': {
    target: 'https://bibliobackend.ccelrecreo.com:1500',
    changeOrigin: true,
    secure: false,
    timeout: 180000,
    proxyTimeout: 180000,
    rewrite: (urlPath: string) => {
      if (urlPath.startsWith('/server.php/api')) {
        return urlPath
      }
      return urlPath.replace(/^\/server\.php/, '/server.php/api')
    },
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any, req: any) => {
        let rawToken = ''
        const auth = req.headers['authorization'] || req.headers['Authorization']
        if (auth && typeof auth === 'string') {
          rawToken = auth.replace(/^Bearer\s+/i, '').trim()
        } else if (req.headers['cookie']) {
          const match = String(req.headers['cookie']).match(/(?:^|;\s*)tk=([^;]+)/)
          if (match) {
            rawToken = decodeURIComponent(match[1])
          }
        }

        if (rawToken && rawToken.startsWith('U2FsdGVkX1')) {
          try {
            const bytes = CryptoJS.AES.decrypt(rawToken, ENCRYPTION_KEY)
            const decryptedJwt = bytes.toString(CryptoJS.enc.Utf8)
            if (decryptedJwt && decryptedJwt.startsWith('eyJ')) {
              proxyReq.setHeader('authorization', `Bearer ${decryptedJwt}`)
            }
          } catch (err) {
            console.error('[Vite Proxy] Error desencriptando token:', err)
          }
        }
      })
    },
  },
}

// https://vitejs.dev/config/
export default defineConfig(() => {
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
          autoprefixer({}),
        ],
      },
    },
    plugins: [react(), authProxyPlugin()],
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
      proxy: proxyConfig,
    },
    preview: {
      port: 4173,
      proxy: proxyConfig,
    },
  }
})
