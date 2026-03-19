import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/geolingua/',
  resolve: {
    alias: {
      // In dev, resolve directly to source for HMR and smaller transforms
      geolingua: path.resolve(__dirname, '../../packages/geolingua/src/index.ts'),
    },
  },
});
