import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase split into its own cached chunk
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Animation library
          'vendor-motion': ['framer-motion'],
          // Icon library
          'vendor-icons': ['lucide-react'],
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
