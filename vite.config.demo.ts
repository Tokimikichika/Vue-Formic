import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Configuration for demo application
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'demo-dist',
    rollupOptions: {
      input: resolve(__dirname, 'demo.html')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})