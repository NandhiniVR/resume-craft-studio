import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Prevent Vite from trying to bundle the pdfjs worker (it uses dynamic imports)
    exclude: ['pdfjs-dist'],
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-charts': ['recharts'],
          'vendor-pdf': ['@react-pdf/renderer'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-ai': ['@google/generative-ai'],
          'vendor-form': ['react-hook-form', 'zod', '@hookform/resolvers'],
          'vendor-utils': ['zustand', 'clsx', 'tailwind-merge', 'lucide-react'],
        },
      },
    },
  },
})
