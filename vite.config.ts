import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  // 开发环境不要设置 base，只在生产环境设置
  base: process.env.NODE_ENV === 'production' ? '/jupyter-code-extractor/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
