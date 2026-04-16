import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: parseInt(process.env.PORT || '5175') },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-router'))             return 'vendor-react';
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'vendor-react';
          if (id.includes('@supabase'))                return 'vendor-supabase';
          if (id.includes('framer-motion'))            return 'vendor-motion';
          if (id.includes('@dnd-kit'))                 return 'vendor-dnd';
          if (id.includes('lucide-react'))             return 'vendor-icons';
          if (id.includes('date-fns'))                 return 'vendor-utils';
          return 'vendor';
        },
      },
    },
  },
})
