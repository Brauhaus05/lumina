import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  resolve: {
    alias: {
      // Preact compat replaces React — critical for hitting <50KB gzip budget
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Lumina',
      formats: ['iife'],
      fileName: 'lumina',
    },
    rollupOptions: {
      // NO externals — SDK must be fully self-contained as a single script
      plugins: [
        visualizer({ filename: 'dist/stats.html', gzipSize: true }),
      ],
    },
    minify: 'terser',
    terserOptions: {
      compress: { passes: 3 },
    },
  },
});
