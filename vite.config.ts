import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files larger than 10kb
      deleteOriginFile: false, // Keep the original files
      verbose: true, // Log compression results
      filter: (file) => /\.(js|css|html|svg)$/i.test(file), // Only compress certain file types
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
        // Ensure proper formatting of JavaScript files
        format: 'es',
      },
    },
    assetsDir: 'assets', // Ensure assets are in the correct directory
    // Ensure proper handling of JavaScript files
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
  },
  css: {
    postcss: './postcss.config.js', // Point to the updated PostCSS config
  },
  publicDir: 'public', // Ensure public directory is copied to dist
}); 