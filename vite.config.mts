import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

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
    },
    preview: {
      port: 4173,
    },
  }
})
