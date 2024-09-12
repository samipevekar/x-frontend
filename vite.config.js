import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer'; // Optional for bundle analysis
import viteImagemin from 'vite-plugin-imagemin'; // Image optimization plugin
import PurgeCSS from 'vite-plugin-purgecss'; // PurgeCSS for unused CSS

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: true,
    }),
    viteImagemin({
      // Optimization settings for different image types
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.7, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          }
        ]
      }
    }),
    PurgeCSS({
      content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'], // Specify the paths to scan for used classes
      safelist: ['some-safe-class', /^safe-class-regex/] // Keep certain classes if needed
    }),
  ],
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
