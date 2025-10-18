// vite.config.js

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Replace with your actual API Gateway Invoke URL (e.g., https://abcdefg123.execute-api.us-east-1.amazonaws.com)
const API_BASE_URL = 'https://5c0sbmte94.execute-api.eu-north-1.amazonaws.com';

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // --- ADD THIS DEVELOPMENT SERVER CONFIG ---
  server: {
    proxy: {
      '/api': {
        target: API_BASE_URL,
        changeOrigin: true,
        // Rewrite the path to include your stage name (e.g., /prod/search)
        // This is necessary because your Lambda expects the stage name in the path.
        rewrite: (path) => path.replace(/^\/api/, '/prod'),
      }
    }
  }
})

