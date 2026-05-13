import { defineConfig } from 'vite'
import { resolve }      from 'path'

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        menu:    resolve(__dirname, 'menu/index.html'),
        about:   resolve(__dirname, 'about/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
      }
    }
  }
})
