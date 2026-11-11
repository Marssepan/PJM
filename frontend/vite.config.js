import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serwuje projekt pod /<nazwa-repo>/ — VITE_BASE ustawia workflow.
// Lokalnie (npm run dev) zostaje '/'.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
});
