import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  server: {
    port: 5177,
    open: true,
    host: true, // Enable network access
  },
  build: {
    minify: 'terser', // Minify code
    sourcemap: false, // Disable source maps in production
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  css: {
    postcss: './postcss.config.js', // Point to the updated PostCSS config
  },
}); 