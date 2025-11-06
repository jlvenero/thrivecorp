// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Permite usar 'describe', 'it', 'expect' sem importar
    environment: 'jsdom',
    setupFiles: './src/setupTests.js', // Arquivo de setup (vamos criar a seguir)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'], // Importante: 'lcov' para o SonarCloud
      reportsDirectory: './coverage' // Onde salvar os relatórios
    }
  }
})