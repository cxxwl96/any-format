import { fileURLToPath, URL } from 'node:url'

import { ConfigEnv, defineConfig, loadEnv, UserConfig, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig(({mode}: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_PORT } = env
  return {
    server: {
      port: Number.parseInt(VITE_PORT)
    },
    plugins: [
      vue(),
      vueJsx(),
      splitVendorChunkPlugin(), // 自动将 node_modules 拆分为 vendor chunk
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})
