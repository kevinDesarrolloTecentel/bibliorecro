import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import type { DeprecationOrId } from 'sass'

const backendProxy = {
  '/api': {
    target: 'https://bibliobackend.ccelrecreo.com:1500',
    changeOrigin: true,
    secure: false,
    rewrite: (path: string) => {
      if (/^\/api\/v1(\/|$)/.test(path)) {
        return path.replace(/^\/api\/v1/, '/server.php/api/api/v1')
      }
      return path.replace(/^\/api/, '/server.php/api')
    },
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any, req: any) => {
        const auth = req.headers['authorization']
        if (auth && typeof auth === 'string') {
          const rawToken = auth.replace(/^Bearer\s+/i, '').trim()
          if (rawToken) {
            const separator = proxyReq.path.includes('?') ? '&' : '?'
            proxyReq.path += `${separator}token=${rawToken}`
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
      port: 3000,
      proxy: backendProxy,
    },
    preview: {
      port: 4173,
      proxy: backendProxy,
    },
  }
})
