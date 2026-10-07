import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },

  /*
   * Vitest 配置。
   * Vitest 与 Vite 共用一套配置，所以放在这里而不是另建 vitest.config.js。
   * `npm run build` 时 Vite 会忽略这一段，两者互不影响。
   *
   * - environment: 'jsdom'
   *     被测代码用到了 localStorage / document / window（登录态持久化、切换 <html lang>），
   *     这些在 Node 里没有，必须跑在 jsdom 这个"假浏览器"里。
   * - setupFiles
   *     跑用例前统一替换掉 jsdom 里只读的 window.location（见 src/test/setup.js）。
   * - globals: false
   *     刻意不注入全局 describe/it/expect，让每个测试文件显式 import。
   *     好处是 ESLint 不需要额外配置就知道这些名字从哪来，代码也更清楚。
   */
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
})
